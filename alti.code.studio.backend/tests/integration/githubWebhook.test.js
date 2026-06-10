import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GithubWebhookController } from '../../src/app/modules/github/githubWebhook.controller.js';
import { GithubAutopilotService } from '../../src/app/modules/github/githubAutopilot.service.js';
import { GithubReviewAgentService } from '../../src/app/modules/github/githubReviewAgent.service.js';
import { exec } from 'child_process';

// Mock octokit library
vi.mock('octokit', () => {
    const mockPullsGet = vi.fn().mockResolvedValue({
        data: {
            head: {
                ref: 'test-branch-name'
            }
        }
    });

    const mockCreateComment = vi.fn().mockResolvedValue({
        data: { id: 123 }
    });

    const mockListJobsForWorkflowRun = vi.fn().mockResolvedValue({
        data: {
            jobs: [
                {
                    id: 999,
                    conclusion: 'failure',
                    steps: [
                        { name: 'Build Step', conclusion: 'failure' }
                    ]
                }
            ]
        }
    });

    const mockCreateCommitComment = vi.fn().mockResolvedValue({
        data: { id: 456 }
    });

    const mockRequest = vi.fn().mockImplementation(async (route) => {
        if (route && route.includes('/logs')) {
            return { data: 'npm test failed with exit code 1' };
        }
        return { data: {} };
    });

    globalThis.__mockOctokit = {
        mockPullsGet,
        mockCreateComment,
        mockListJobsForWorkflowRun,
        mockCreateCommitComment,
        mockRequest
    };

    return {
        Octokit: class {
            constructor() {
                this.rest = {
                    pulls: {
                        get: mockPullsGet
                    },
                    issues: {
                        createComment: mockCreateComment
                    },
                    actions: {
                        listJobsForWorkflowRun: mockListJobsForWorkflowRun
                    },
                    repos: {
                        createCommitComment: mockCreateCommitComment
                    }
                };
                this.request = mockRequest;
            }
        }
    };
});

const {
    mockPullsGet,
    mockCreateComment,
    mockListJobsForWorkflowRun,
    mockCreateCommitComment,
    mockRequest
} = globalThis.__mockOctokit;

// Mock child_process exec
vi.mock('child_process', () => {
    return {
        exec: vi.fn().mockImplementation((cmd, options, callback) => {
            if (cmd.includes('rev-parse')) {
                callback(null, 'main-branch', '');
            } else {
                callback(null, 'success', '');
            }
        }),
        spawn: vi.fn()
    };
});

// Mock swarm brain execution
vi.mock('../../src/app/modules/agents/swarm_brain.js', () => ({
    swarmBrain: {
        executeTask: vi.fn().mockResolvedValue('Mocked Swarm Brain Execution Result')
    }
}));

// Mock LLM Gateway Completion
vi.mock('../../src/app/modules/llmGateway/llmGateway.service.js', () => ({
    LlmGatewayService: {
        routeCompletion: vi.fn().mockResolvedValue('Mocked summary content')
    }
}));

// Mock Tri-Brain Synthesis
vi.mock('../../src/app/modules/llmGateway/triBrainSynthesis.service.js', () => ({
    TriBrainSynthesisService: {
        synthesize: vi.fn().mockResolvedValue('Mocked review comment content')
    }
}));

// Helper mocks for Express Request/Response
const makeMockReq = (headers, body) => ({
    headers: headers || {},
    body: body || {}
});

const makeMockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('GitHub Bot & Webhook Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('1. Webhook Routing Interception', () => {
        it('should route push events to GithubAutopilotService.ingestRepository', async () => {
            const req = makeMockReq(
                { 'x-github-event': 'push' },
                {
                    repository: { owner: { login: 'test-owner' }, name: 'test-repo', default_branch: 'main', full_name: 'test-owner/test-repo' },
                    commits: [{ id: '123', message: 'feat: add login page' }]
                }
            );
            const res = makeMockRes();

            const ingestSpy = vi.spyOn(GithubAutopilotService, 'ingestRepository').mockResolvedValue({ success: true });

            await GithubWebhookController.handleWebhook(req, res);

            expect(ingestSpy).toHaveBeenCalledWith('test-owner', 'test-repo', 'main');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should route pull_request opened/synchronize events to GithubReviewAgentService.autoReviewPR', async () => {
            const req = makeMockReq(
                { 'x-github-event': 'pull_request' },
                {
                    action: 'opened',
                    pull_request: { number: 42 },
                    repository: { owner: { login: 'test-owner' }, name: 'test-repo', full_name: 'test-owner/test-repo' }
                }
            );
            const res = makeMockRes();

            const reviewSpy = vi.spyOn(GithubReviewAgentService, 'autoReviewPR').mockResolvedValue({ success: true });

            await GithubWebhookController.handleWebhook(req, res);

            expect(reviewSpy).toHaveBeenCalledWith('system', 'webhook', 'test-owner', 'test-repo', 42);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should route issue_comment with @insocode to GithubAutopilotService.handleMentionComment', async () => {
            const req = makeMockReq(
                { 'x-github-event': 'issue_comment' },
                {
                    action: 'created',
                    comment: { body: 'Hey @insocode implement a login endpoint' },
                    repository: { owner: { login: 'test-owner' }, name: 'test-repo', full_name: 'test-owner/test-repo' },
                    issue: { number: 10 }
                }
            );
            const res = makeMockRes();

            const mentionSpy = vi.spyOn(GithubAutopilotService, 'handleMentionComment').mockResolvedValue({ success: true });

            await GithubWebhookController.handleWebhook(req, res);

            expect(mentionSpy).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should route workflow_run failures to GithubAutopilotService.handleFailedWorkflow', async () => {
            const req = makeMockReq(
                { 'x-github-event': 'workflow_run' },
                {
                    action: 'completed',
                    workflow_run: { conclusion: 'failure', head_branch: 'bugfix-login' },
                    repository: { owner: { login: 'test-owner' }, name: 'test-repo', full_name: 'test-owner/test-repo' }
                }
            );
            const res = makeMockRes();

            const failureSpy = vi.spyOn(GithubAutopilotService, 'handleFailedWorkflow').mockResolvedValue({ success: true });

            await GithubWebhookController.handleWebhook(req, res);

            expect(failureSpy).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('2. Autopilot Service: handleMentionComment', () => {
        it('should process a PR comment mention, execute the agent, and reply to GitHub', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                comment: { body: 'Hey @insocode fix validation' },
                pull_request: { number: 42 }
            };

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development'; // temporarily bypass 'test' read-only mode

            try {
                const result = await GithubAutopilotService.handleMentionComment(payload);
                expect(result.success).toBe(true);

                // Verify git commands executed
                expect(exec).toHaveBeenCalled();
                const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
                expect(execCalls).toContainEqual(expect.stringContaining('git rev-parse'));
                expect(execCalls).toContainEqual(expect.stringContaining('git checkout test-branch-name'));
                expect(execCalls).toContainEqual(expect.stringContaining('git commit -am'));
                expect(execCalls).toContainEqual(expect.stringContaining('git checkout main-branch'));
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should execute in read-only consultant mode for non-PR issue comments', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                comment: { body: 'Hey @insocode answer a question' },
                issue: { number: 50 }
            };

            const result = await GithubAutopilotService.handleMentionComment(payload);
            expect(result.success).toBe(true);

            // Git command execution should not occur as it is not a PR
            const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
            const containsGitCheckout = execCalls.some(c => c.includes('git checkout'));
            expect(containsGitCheckout).toBe(false);
        });

        it('should block commits and reject if a potential secret is detected in the generated diff', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                comment: { body: 'Hey @insocode add key' },
                pull_request: { number: 42 }
            };

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            // Mock exec to return a diff containing a secret key
            vi.mocked(exec).mockImplementation((cmd, options, callback) => {
                if (cmd.includes('diff')) {
                    callback(null, '+++ b/config.js\n+ const key = "AIzaSyFakeGoogleKey123456789012345678901234567890"', '');
                } else if (cmd.includes('rev-parse')) {
                    callback(null, 'main-branch', '');
                } else {
                    callback(null, 'success', '');
                }
            });

            try {
                await expect(GithubAutopilotService.handleMentionComment(payload)).rejects.toThrow(
                    /Security Alert/
                );
                
                // Assert that git commit was NOT called
                const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
                const hasCommit = execCalls.some(c => c.includes('git commit'));
                expect(hasCommit).toBe(false);

                // Assert that reset and clean were still called in finally block
                expect(execCalls).toContainEqual(expect.stringContaining('git reset --hard HEAD && git clean -fd'));
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should clean up the workspace and checkout the original branch if SwarmBrain fails', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                comment: { body: 'Hey @insocode fail' },
                pull_request: { number: 42 }
            };

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            // Spy on SwarmBrain to throw an error
            const { swarmBrain } = await import('../../src/app/modules/agents/swarm_brain.js');
            const taskSpy = vi.spyOn(swarmBrain, 'executeTask').mockRejectedValue(new Error('Swarm execution crashed'));

            // Mock exec
            vi.mocked(exec).mockImplementation((cmd, options, callback) => {
                if (cmd.includes('rev-parse')) {
                    callback(null, 'main-branch', '');
                } else {
                    callback(null, 'success', '');
                }
            });

            try {
                await expect(GithubAutopilotService.handleMentionComment(payload)).rejects.toThrow(
                    'Swarm execution crashed'
                );

                const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
                
                // Assert that workspace cleanup was run
                expect(execCalls).toContainEqual(expect.stringContaining('git reset --hard HEAD && git clean -fd'));
                
                // Assert that original branch was restored
                expect(execCalls).toContainEqual(expect.stringContaining('git checkout main-branch'));
            } finally {
                process.env.NODE_ENV = originalEnv;
                taskSpy.mockRestore();
            }
        });
    });

    describe('3. Autopilot Service: handleFailedWorkflow (Self-Healing)', () => {
        it('should return mocked success instantly when NODE_ENV is "test"', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                workflow_run: { id: 777, head_branch: 'bugfix-branch', head_sha: 'sha123' }
            };

            const result = await GithubAutopilotService.handleFailedWorkflow(payload);
            expect(result).toEqual({ success: true, message: 'Workflow failure self-healed (Mocked).' });
        });

        it('should fetch logs, run SwarmBrain to repair code, and push the fix back when NODE_ENV is not "test"', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                workflow_run: { id: 777, head_branch: 'bugfix-branch', head_sha: 'sha123' }
            };

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development'; // temporarily bypass 'test' mode

            try {
                const result = await GithubAutopilotService.handleFailedWorkflow(payload);
                expect(result.success).toBe(true);

                // Verify git commands executed
                expect(exec).toHaveBeenCalled();
                const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
                expect(execCalls).toContainEqual(expect.stringContaining('git checkout bugfix-branch'));
                expect(execCalls).toContainEqual(expect.stringContaining('git commit -am "fix(agent): auto-heal CI/CD build failure"'));

                // Verify git restore command executed
                expect(execCalls).toContainEqual(expect.stringContaining('git checkout main-branch'));
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should block self-healing commits and reject if a potential secret is detected in the generated diff', async () => {
            const payload = {
                repository: { owner: { login: 'test-owner' }, name: 'test-repo' },
                workflow_run: { id: 777, head_branch: 'bugfix-branch', head_sha: 'sha123' }
            };

            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            // Mock exec to return a diff containing a secret key
            vi.mocked(exec).mockImplementation((cmd, options, callback) => {
                if (cmd.includes('diff')) {
                    callback(null, '+++ b/config.js\n+ const key = "AIzaSyFakeGoogleKey123456789012345678901234567890"', '');
                } else if (cmd.includes('rev-parse')) {
                    callback(null, 'main-branch', '');
                } else {
                    callback(null, 'success', '');
                }
            });

            try {
                await expect(GithubAutopilotService.handleFailedWorkflow(payload)).rejects.toThrow(
                    /Security Alert/
                );

                // Assert that git commit was NOT called
                const execCalls = vi.mocked(exec).mock.calls.map(call => call[0]);
                const hasCommit = execCalls.some(c => c.includes('git commit'));
                expect(hasCommit).toBe(false);

                // Assert that reset and clean were still called in finally block
                expect(execCalls).toContainEqual(expect.stringContaining('git reset --hard HEAD && git clean -fd'));
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });
    });
});

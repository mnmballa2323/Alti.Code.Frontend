import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubAutopilotService } from '../../src/app/modules/githubDocs/githubAutopilot.service.js';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

describe('GitHub Swarm Phase 8: Autopilot & Stateful Conversational Memory Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        githubAutopilotService.sessions.clear();
    });

    describe('1. Autonomous Repository Autopilot Loop', () => {
        it('should successfully launch the autopilot loop, coordinate the Swarm DAG, and open a Pull Request', async () => {
            const userIntent = 'Add email validation checks to registration form and run tests';

            // Spy on Swarm DAG Planner orchestration
            const orchestrateSpy = vi.spyOn(githubDocsService, 'orchestrateSwarmWorkflow').mockResolvedValue({
                success: true,
                tasks: [{ id: 't1', agentId: 'githubExpert', task: 'Check registration file', dependencies: [] }],
                executionFlow: [{ id: 't1', agentId: 'githubExpert', output: 'Validated form successfully' }],
                synthesis: 'Autopilot changes implemented.'
            });

            const result = await githubAutopilotService.createPullRequestAutopilot(userIntent);

            expect(result.success).toBe(true);
            expect(result.branchName).toContain('autopilot-patch-');
            expect(result.testOutput).toBe('Tests passed successfully. Zero regressions.');
            expect(result.pullRequestUrl).toBe('https://github.com/owner/repo/pull/456');
            expect(result.summary).toContain('Autopilot successfully completed');
            
            expect(result.executedSteps).toContainEqual({ step: 'create-branch', details: expect.any(String) });
            expect(result.executedSteps).toContainEqual({ step: 'swarm-plan', details: expect.any(String) });
            expect(result.executedSteps).toContainEqual({ step: 'baseline-test', details: expect.any(String) });
            expect(result.executedSteps).toContainEqual({ step: 'push-changes', details: expect.any(String) });
            expect(result.executedSteps).toContainEqual({ step: 'create-pr', details: expect.any(String) });

            expect(orchestrateSpy).toHaveBeenCalledWith(expect.stringContaining(userIntent));
        });
    });

    describe('2. Stateful Session Memory', () => {
        it('should persist conversation history context across multiple turns of consultation', async () => {
            const sessionId = 'session-12345';
            
            // Mock Swarm Dispatch Gateway consultations
            const dispatchSpy = vi.spyOn(githubDocsService, 'dispatchQueryToSwarm').mockImplementation(async (query) => {
                return {
                    agent: 'githubExpert',
                    response: `Synthesized response for query: ${query.substring(query.indexOf('User Query:') !== -1 ? query.indexOf('User Query:') : 0)}`
                };
            });

            // Turn 1
            const result1 = await githubAutopilotService.consultStatefulSession(sessionId, 'Step 1: Check build errors');
            expect(result1.success).toBe(true);
            expect(result1.sessionId).toBe(sessionId);
            expect(result1.history.length).toBe(2);
            expect(result1.history[0]).toEqual({ role: 'user', content: 'Step 1: Check build errors' });
            expect(result1.history[1].role).toBe('assistant');

            // Turn 2: Should enrich the query with Turn 1 context
            const result2 = await githubAutopilotService.consultStatefulSession(sessionId, 'Step 2: Clean dependabot alerts');
            expect(result2.success).toBe(true);
            expect(result2.history.length).toBe(4);
            
            // Verify that the query passed to the swarm registry router contains the previous conversation history context
            const enrichedQuerySent = dispatchSpy.mock.calls[1][0];
            expect(enrichedQuerySent).toContain('Conversation History:');
            expect(enrichedQuerySent).toContain('Step 1: Check build errors');
            expect(enrichedQuerySent).toContain('Step 2: Clean dependabot alerts');

            // Teardown session
            const cleared = githubAutopilotService.clearSession(sessionId);
            expect(cleared).toBe(true);
            expect(githubAutopilotService.sessions.has(sessionId)).toBe(false);
        });
    });
});

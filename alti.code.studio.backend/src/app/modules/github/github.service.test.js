import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the mock inside the hoisted block to avoid ReferenceError on hoisting
vi.mock('octokit', () => {
    const mockOctokitInstance = {
        rest: {
            users: {
                getAuthenticated: vi.fn()
            },
            repos: {
                listForAuthenticatedUser: vi.fn(),
                createForAuthenticatedUser: vi.fn(),
                get: vi.fn(),
                delete: vi.fn(),
                listBranches: vi.fn()
            },
            issues: {
                listForRepo: vi.fn(),
                create: vi.fn(),
                get: vi.fn(),
                update: vi.fn()
            },
            pulls: {
                list: vi.fn(),
                create: vi.fn(),
                get: vi.fn(),
                merge: vi.fn()
            },
            actions: {
                listRepoWorkflows: vi.fn(),
                createWorkflowDispatch: vi.fn(),
                listWorkflowRunsForRepo: vi.fn()
            },
            gists: {
                list: vi.fn(),
                create: vi.fn(),
                delete: vi.fn()
            },
            projects: {
                listForRepo: vi.fn(),
                createForRepo: vi.fn()
            }
        }
    };
    globalThis.__mockOctokit = mockOctokitInstance;
    return {
        Octokit: class {
            constructor() {
                return mockOctokitInstance;
            }
        }
    };
});

// Import service after mock setup
import { GithubService } from './github.service.js';

describe('GithubService - Direct GitHub API Wrapper', () => {
    let mockOctokit;

    beforeEach(() => {
        mockOctokit = globalThis.__mockOctokit;
        vi.clearAllMocks();
    });

    // 1. User
    it('should fetch authenticated user details', async () => {
        const mockUser = { login: 'octocat', id: 1 };
        mockOctokit.rest.users.getAuthenticated.mockResolvedValue({ data: mockUser });

        const result = await GithubService.getAuthenticatedUser();
        expect(result).toEqual(mockUser);
        expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
    });

    // 2. Repositories
    it('should list repositories for authenticated user', async () => {
        const mockRepos = [{ id: 1, name: 'repo-1' }];
        mockOctokit.rest.repos.listForAuthenticatedUser.mockResolvedValue({ data: mockRepos });

        const result = await GithubService.listRepositories({ visibility: 'public' });
        expect(result).toEqual(mockRepos);
        expect(mockOctokit.rest.repos.listForAuthenticatedUser).toHaveBeenCalledWith({
            sort: 'updated',
            per_page: 30,
            page: 1,
            visibility: 'public'
        });
    });

    it('should create repository for authenticated user', async () => {
        const mockRepo = { id: 2, name: 'new-repo' };
        mockOctokit.rest.repos.createForAuthenticatedUser.mockResolvedValue({ data: mockRepo });

        const result = await GithubService.createRepository({ name: 'new-repo', private: true });
        expect(result).toEqual(mockRepo);
        expect(mockOctokit.rest.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
            name: 'new-repo',
            description: undefined,
            private: true,
            auto_init: true,
            gitignore_template: undefined,
            license_template: undefined
        });
    });

    it('should fetch repository details', async () => {
        const mockRepo = { id: 3, name: 'existing-repo' };
        mockOctokit.rest.repos.get.mockResolvedValue({ data: mockRepo });

        const result = await GithubService.getRepository('owner', 'repo');
        expect(result).toEqual(mockRepo);
        expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
    });

    it('should delete repository and return success status', async () => {
        mockOctokit.rest.repos.delete.mockResolvedValue({ status: 204 });

        const result = await GithubService.deleteRepository('owner', 'repo');
        expect(result).toBe(true);
        expect(mockOctokit.rest.repos.delete).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
    });

    // 3. Issues
    it('should create issue in repository', async () => {
        const mockIssue = { number: 42, title: 'Bug report' };
        mockOctokit.rest.issues.create.mockResolvedValue({ data: mockIssue });

        const result = await GithubService.createIssue('owner', 'repo', { title: 'Bug report', body: 'Error details' });
        expect(result).toEqual(mockIssue);
        expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            title: 'Bug report',
            body: 'Error details',
            labels: undefined,
            assignees: undefined
        });
    });

    // 4. Pull Requests
    it('should list pull requests', async () => {
        const mockPrs = [{ number: 1, title: 'Add feature' }];
        mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPrs });

        const result = await GithubService.listPullRequests('owner', 'repo', { state: 'open' });
        expect(result).toEqual(mockPrs);
        expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            state: 'open',
            per_page: 30,
            page: 1
        });
    });

    // 5. Actions
    it('should trigger workflow dispatch', async () => {
        mockOctokit.rest.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });

        const result = await GithubService.triggerWorkflowDispatch('owner', 'repo', 'build.yml', 'main', { env: 'prod' });
        expect(result).toBe(true);
        expect(mockOctokit.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            workflow_id: 'build.yml',
            ref: 'main',
            inputs: { env: 'prod' }
        });
    });

    // 6. Gists
    it('should create gist', async () => {
        const mockGist = { id: 'gist123' };
        mockOctokit.rest.gists.create.mockResolvedValue({ data: mockGist });

        const result = await GithubService.createGist({ description: 'test gist', files: { 'test.js': { content: 'test' } } });
        expect(result).toEqual(mockGist);
        expect(mockOctokit.rest.gists.create).toHaveBeenCalledWith({
            description: 'test gist',
            files: { 'test.js': { content: 'test' } },
            public: false
        });
    });
});

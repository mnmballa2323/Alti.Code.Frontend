import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the mock inside the hoisted block to avoid ReferenceError on hoisting
vi.mock('octokit', () => {
    const mockOctokitInstance = {
        graphql: vi.fn(),
        rest: {
            users: {
                getAuthenticated: vi.fn()
            },
            repos: {
                listForAuthenticatedUser: vi.fn(),
                createForAuthenticatedUser: vi.fn(),
                get: vi.fn(),
                delete: vi.fn(),
                listBranches: vi.fn(),
                getContent: vi.fn(),
                createOrUpdateFileContents: vi.fn(),
                deleteFile: vi.fn(),
                listCommits: vi.fn(),
                compareCommits: vi.fn(),
                listReleases: vi.fn(),
                createRelease: vi.fn(),
                getLatestRelease: vi.fn(),
                listCollaborators: vi.fn(),
                addCollaborator: vi.fn(),
                removeCollaborator: vi.fn()
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
            },
            search: {
                repos: vi.fn(),
                code: vi.fn(),
                issuesAndPullRequests: vi.fn(),
                users: vi.fn()
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

    // 7. Projects
    it('should list projects for a repository', async () => {
        const mockProjects = [{ id: 1, name: 'Project 1' }];
        mockOctokit.rest.projects.listForRepo.mockResolvedValue({ data: mockProjects });

        const result = await GithubService.listProjects('owner', 'repo', { state: 'open' });
        expect(result).toEqual(mockProjects);
        expect(mockOctokit.rest.projects.listForRepo).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            state: 'open',
            per_page: 30,
            page: 1
        });
    });

    it('should create a project in a repository', async () => {
        const mockProject = { id: 2, name: 'New Project' };
        mockOctokit.rest.projects.createForRepo.mockResolvedValue({ data: mockProject });

        const result = await GithubService.createProject('owner', 'repo', { name: 'New Project', body: 'Desc' });
        expect(result).toEqual(mockProject);
        expect(mockOctokit.rest.projects.createForRepo).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            name: 'New Project',
            body: 'Desc'
        });
    });

    // 8. GraphQL
    it('should execute GraphQL queries', async () => {
        const mockResponse = { repository: { name: 'test' } };
        mockOctokit.graphql.mockResolvedValue(mockResponse);

        const result = await GithubService.graphql('query { repo }', { var1: 'val' });
        expect(result).toEqual(mockResponse);
        expect(mockOctokit.graphql).toHaveBeenCalledWith('query { repo }', { var1: 'val' });
    });

    // 9. Search
    it('should search repositories', async () => {
        const mockRes = { items: [{ name: 'matched' }] };
        mockOctokit.rest.search.repos.mockResolvedValue({ data: mockRes });

        const result = await GithubService.searchRepositories('vitest', { page: 2 });
        expect(result).toEqual(mockRes);
        expect(mockOctokit.rest.search.repos).toHaveBeenCalledWith({
            q: 'vitest',
            sort: undefined,
            order: undefined,
            per_page: 30,
            page: 2
        });
    });

    it('should search code', async () => {
        const mockRes = { items: [{ path: 'matched.js' }] };
        mockOctokit.rest.search.code.mockResolvedValue({ data: mockRes });

        const result = await GithubService.searchCode('import x', { sort: 'indexed' });
        expect(result).toEqual(mockRes);
        expect(mockOctokit.rest.search.code).toHaveBeenCalledWith({
            q: 'import x',
            sort: 'indexed',
            order: undefined,
            per_page: 30,
            page: 1
        });
    });

    // 10. Git Data / Contents
    it('should fetch file content', async () => {
        const mockContent = { type: 'file', content: 'base64' };
        mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockContent });

        const result = await GithubService.getFileContent('owner', 'repo', 'src/index.js', 'main');
        expect(result).toEqual(mockContent);
        expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            path: 'src/index.js',
            ref: 'main'
        });
    });

    it('should commit or update a file', async () => {
        const mockCommit = { commit: { sha: 'commitsha' } };
        mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({ data: mockCommit });

        const fileData = { message: 'update', content: 'dGVzdA==', sha: 'oldsha', branch: 'main' };
        const result = await GithubService.createOrUpdateFile('owner', 'repo', 'src/index.js', fileData);
        expect(result).toEqual(mockCommit);
        expect(mockOctokit.rest.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            path: 'src/index.js',
            message: 'update',
            content: 'dGVzdA==',
            sha: 'oldsha',
            branch: 'main',
            committer: undefined,
            author: undefined
        });
    });

    it('should list commits for a repository', async () => {
        const mockCommits = [{ sha: 'sha1' }];
        mockOctokit.rest.repos.listCommits.mockResolvedValue({ data: mockCommits });

        const result = await GithubService.listCommits('owner', 'repo', { path: 'src/index.js' });
        expect(result).toEqual(mockCommits);
        expect(mockOctokit.rest.repos.listCommits).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            sha: undefined,
            path: 'src/index.js',
            author: undefined,
            since: undefined,
            until: undefined,
            per_page: 30,
            page: 1
        });
    });

    // 11. Releases
    it('should list releases', async () => {
        const mockReleases = [{ tag_name: 'v1.0.0' }];
        mockOctokit.rest.repos.listReleases.mockResolvedValue({ data: mockReleases });

        const result = await GithubService.listReleases('owner', 'repo', { page: 3 });
        expect(result).toEqual(mockReleases);
        expect(mockOctokit.rest.repos.listReleases).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            per_page: 30,
            page: 3
        });
    });

    it('should fetch the latest release', async () => {
        const mockRelease = { tag_name: 'v2.0.0' };
        mockOctokit.rest.repos.getLatestRelease.mockResolvedValue({ data: mockRelease });

        const result = await GithubService.getLatestRelease('owner', 'repo');
        expect(result).toEqual(mockRelease);
        expect(mockOctokit.rest.repos.getLatestRelease).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
    });

    // 12. Collaborators
    it('should add a collaborator', async () => {
        const mockRes = { invite_id: 123 };
        mockOctokit.rest.repos.addCollaborator.mockResolvedValue({ data: mockRes });

        const result = await GithubService.addCollaborator('owner', 'repo', 'user1', 'admin');
        expect(result).toEqual(mockRes);
        expect(mockOctokit.rest.repos.addCollaborator).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            username: 'user1',
            permission: 'admin'
        });
    });

    it('should remove a collaborator', async () => {
        mockOctokit.rest.repos.removeCollaborator.mockResolvedValue({ status: 204 });

        const result = await GithubService.removeCollaborator('owner', 'repo', 'user1');
        expect(result).toBe(true);
        expect(mockOctokit.rest.repos.removeCollaborator).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'repo',
            username: 'user1'
        });
    });
});

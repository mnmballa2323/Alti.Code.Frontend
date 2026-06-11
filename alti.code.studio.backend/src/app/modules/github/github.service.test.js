import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the mock inside the hoisted block to avoid ReferenceError on hoisting
vi.mock('octokit', () => {
  const mockOctokitInstance = {
    graphql: vi.fn(),
    rest: {
      users: {
        getAuthenticated: vi.fn(),
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
        removeCollaborator: vi.fn(),
        listWebhooks: vi.fn(),
        createWebhook: vi.fn(),
        deleteWebhook: vi.fn(),
      },
      issues: {
        listForRepo: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
      },
      pulls: {
        list: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        merge: vi.fn(),
      },
      actions: {
        listRepoWorkflows: vi.fn(),
        createWorkflowDispatch: vi.fn(),
        listWorkflowRunsForRepo: vi.fn(),
        getRepoPublicKey: vi.fn(),
        createOrUpdateRepoSecret: vi.fn(),
        listRepoVariables: vi.fn(),
        createRepoVariable: vi.fn(),
        updateRepoVariable: vi.fn()
      },
      gists: {
        list: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      projects: {
        listForRepo: vi.fn(),
        createForRepo: vi.fn(),
      },
      search: {
        repos: vi.fn(),
        code: vi.fn(),
        issuesAndPullRequests: vi.fn(),
        users: vi.fn(),
      },
      git: {
        getRef: vi.fn(),
        createRef: vi.fn(),
        updateRef: vi.fn(),
        createBlob: vi.fn(),
        createTree: vi.fn(),
        createCommit: vi.fn()
      },
      orgs: {
        listForAuthenticatedUser: vi.fn()
      },
      teams: {
        list: vi.fn(),
        listMembersInOrg: vi.fn()
      },
      codespaces: {
        listForAuthenticatedUser: vi.fn(),
        createWithRepoForAuthenticatedUser: vi.fn(),
        deleteForAuthenticatedUser: vi.fn()
      },
      dependabot: {
        listAlertsForRepo: vi.fn()
      },
      copilot: {
        getBillingDetailsForUser: vi.fn()
      },
    },
  };
  globalThis.__mockOctokit = mockOctokitInstance;
  return {
    Octokit: class {
      constructor() {
        return mockOctokitInstance;
      }
    },
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
    mockOctokit.rest.users.getAuthenticated.mockResolvedValue({
      data: mockUser,
    });

    const result = await GithubService.getAuthenticatedUser();
    expect(result).toEqual(mockUser);
    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
  });

  // 2. Repositories
  it('should list repositories for authenticated user', async () => {
    const mockRepos = [{ id: 1, name: 'repo-1' }];
    mockOctokit.rest.repos.listForAuthenticatedUser.mockResolvedValue({
      data: mockRepos,
    });

    const result = await GithubService.listRepositories({
      visibility: 'public',
    });
    expect(result).toEqual(mockRepos);
    expect(
      mockOctokit.rest.repos.listForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      sort: 'updated',
      per_page: 30,
      page: 1,
      visibility: 'public',
    });
  });

  it('should create repository for authenticated user', async () => {
    const mockRepo = { id: 2, name: 'new-repo' };
    mockOctokit.rest.repos.createForAuthenticatedUser.mockResolvedValue({
      data: mockRepo,
    });

    const result = await GithubService.createRepository({
      name: 'new-repo',
      private: true,
    });
    expect(result).toEqual(mockRepo);
    expect(
      mockOctokit.rest.repos.createForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      name: 'new-repo',
      description: undefined,
      private: true,
      auto_init: true,
      gitignore_template: undefined,
      license_template: undefined,
    });
  });

  it('should fetch repository details', async () => {
    const mockRepo = { id: 3, name: 'existing-repo' };
    mockOctokit.rest.repos.get.mockResolvedValue({ data: mockRepo });

    const result = await GithubService.getRepository('owner', 'repo');
    expect(result).toEqual(mockRepo);
    expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should delete repository and return success status', async () => {
    mockOctokit.rest.repos.delete.mockResolvedValue({ status: 204 });

    const result = await GithubService.deleteRepository('owner', 'repo');
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.delete).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 3. Issues
  it('should create issue in repository', async () => {
    const mockIssue = { number: 42, title: 'Bug report' };
    mockOctokit.rest.issues.create.mockResolvedValue({ data: mockIssue });

    const result = await GithubService.createIssue('owner', 'repo', {
      title: 'Bug report',
      body: 'Error details',
    });
    expect(result).toEqual(mockIssue);
    expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'Bug report',
      body: 'Error details',
      labels: undefined,
      assignees: undefined,
    });
  });

  // 4. Pull Requests
  it('should list pull requests', async () => {
    const mockPrs = [{ number: 1, title: 'Add feature' }];
    mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPrs });

    const result = await GithubService.listPullRequests('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockPrs);
    expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      per_page: 30,
      page: 1,
    });
  });

  // 5. Actions
  it('should trigger workflow dispatch', async () => {
    mockOctokit.rest.actions.createWorkflowDispatch.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.triggerWorkflowDispatch(
      'owner',
      'repo',
      'build.yml',
      'main',
      { env: 'prod' },
    );
    expect(result).toBe(true);
    expect(
      mockOctokit.rest.actions.createWorkflowDispatch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      workflow_id: 'build.yml',
      ref: 'main',
      inputs: { env: 'prod' },
    });
  });

  // 6. Gists
  it('should create gist', async () => {
    const mockGist = { id: 'gist123' };
    mockOctokit.rest.gists.create.mockResolvedValue({ data: mockGist });

    const result = await GithubService.createGist({
      description: 'test gist',
      files: { 'test.js': { content: 'test' } },
    });
    expect(result).toEqual(mockGist);
    expect(mockOctokit.rest.gists.create).toHaveBeenCalledWith({
      description: 'test gist',
      files: { 'test.js': { content: 'test' } },
      public: false,
    });
  });

  // 7. Projects
  it('should list projects for a repository', async () => {
    const mockProjects = [{ id: 1, name: 'Project 1' }];
    mockOctokit.rest.projects.listForRepo.mockResolvedValue({
      data: mockProjects,
    });

    const result = await GithubService.listProjects('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockProjects);
    expect(mockOctokit.rest.projects.listForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      per_page: 30,
      page: 1,
    });
  });

  it('should create a project in a repository', async () => {
    const mockProject = { id: 2, name: 'New Project' };
    mockOctokit.rest.projects.createForRepo.mockResolvedValue({
      data: mockProject,
    });

    const result = await GithubService.createProject('owner', 'repo', {
      name: 'New Project',
      body: 'Desc',
    });
    expect(result).toEqual(mockProject);
    expect(mockOctokit.rest.projects.createForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'New Project',
      body: 'Desc',
    });
  });

  // 8. GraphQL
  it('should execute GraphQL queries', async () => {
    const mockResponse = { repository: { name: 'test' } };
    mockOctokit.graphql.mockResolvedValue(mockResponse);

    const result = await GithubService.graphql('query { repo }', {
      var1: 'val',
    });
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.graphql).toHaveBeenCalledWith('query { repo }', {
      var1: 'val',
    });
  });

  // 9. Search
  it('should search repositories', async () => {
    const mockRes = { items: [{ name: 'matched' }] };
    mockOctokit.rest.search.repos.mockResolvedValue({ data: mockRes });

    const result = await GithubService.searchRepositories('vitest', {
      page: 2,
    });
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.search.repos).toHaveBeenCalledWith({
      q: 'vitest',
      sort: undefined,
      order: undefined,
      per_page: 30,
      page: 2,
    });
  });

  it('should search code', async () => {
    const mockRes = { items: [{ path: 'matched.js' }] };
    mockOctokit.rest.search.code.mockResolvedValue({ data: mockRes });

    const result = await GithubService.searchCode('import x', {
      sort: 'indexed',
    });
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.search.code).toHaveBeenCalledWith({
      q: 'import x',
      sort: 'indexed',
      order: undefined,
      per_page: 30,
      page: 1,
    });
  });

  // 10. Git Data / Contents
  it('should fetch file content', async () => {
    const mockContent = { type: 'file', content: 'base64' };
    mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockContent });

    const result = await GithubService.getFileContent(
      'owner',
      'repo',
      'src/index.js',
      'main',
    );
    expect(result).toEqual(mockContent);
    expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'src/index.js',
      ref: 'main',
    });
  });

  it('should commit or update a file', async () => {
    const mockCommit = { commit: { sha: 'commitsha' } };
    mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({
      data: mockCommit,
    });

    const fileData = {
      message: 'update',
      content: 'dGVzdA==',
      sha: 'oldsha',
      branch: 'main',
    };
    const result = await GithubService.createOrUpdateFile(
      'owner',
      'repo',
      'src/index.js',
      fileData,
    );
    expect(result).toEqual(mockCommit);
    expect(
      mockOctokit.rest.repos.createOrUpdateFileContents,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'src/index.js',
      message: 'update',
      content: 'dGVzdA==',
      sha: 'oldsha',
      branch: 'main',
      committer: undefined,
      author: undefined,
    });
  });

  it('should list commits for a repository', async () => {
    const mockCommits = [{ sha: 'sha1' }];
    mockOctokit.rest.repos.listCommits.mockResolvedValue({ data: mockCommits });

    const result = await GithubService.listCommits('owner', 'repo', {
      path: 'src/index.js',
    });
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
      page: 1,
    });
  });

  // 11. Releases
  it('should list releases', async () => {
    const mockReleases = [{ tag_name: 'v1.0.0' }];
    mockOctokit.rest.repos.listReleases.mockResolvedValue({
      data: mockReleases,
    });

    const result = await GithubService.listReleases('owner', 'repo', {
      page: 3,
    });
    expect(result).toEqual(mockReleases);
    expect(mockOctokit.rest.repos.listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 30,
      page: 3,
    });
  });

  it('should fetch the latest release', async () => {
    const mockRelease = { tag_name: 'v2.0.0' };
    mockOctokit.rest.repos.getLatestRelease.mockResolvedValue({
      data: mockRelease,
    });

    const result = await GithubService.getLatestRelease('owner', 'repo');
    expect(result).toEqual(mockRelease);
    expect(mockOctokit.rest.repos.getLatestRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 12. Collaborators
  it('should add a collaborator', async () => {
    const mockRes = { invite_id: 123 };
    mockOctokit.rest.repos.addCollaborator.mockResolvedValue({ data: mockRes });

    const result = await GithubService.addCollaborator(
      'owner',
      'repo',
      'user1',
      'admin',
    );
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.repos.addCollaborator).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      username: 'user1',
      permission: 'admin',
    });
  });

  it('should remove a collaborator', async () => {
    mockOctokit.rest.repos.removeCollaborator.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.removeCollaborator(
      'owner',
      'repo',
      'user1',
    );
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.removeCollaborator).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      username: 'user1',
    });
  });

  // 13. Git Database Plumbing
  it('should get git reference', async () => {
    const mockRef = { ref: 'refs/heads/main', object: { sha: 'sha123' } };
    mockOctokit.rest.git.getRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.getRef('owner', 'repo', 'heads/main');
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.getRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'heads/main',
    });
  });

  it('should create git reference', async () => {
    const mockRef = { ref: 'refs/heads/new-feature', object: { sha: 'sha123' } };
    mockOctokit.rest.git.createRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.createRef('owner', 'repo', { ref: 'refs/heads/new-feature', sha: 'sha123' });
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'refs/heads/new-feature',
      sha: 'sha123',
    });
  });

  it('should update git reference', async () => {
    const mockRef = { ref: 'refs/heads/main', object: { sha: 'sha456' } };
    mockOctokit.rest.git.updateRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.updateRef('owner', 'repo', 'heads/main', { sha: 'sha456', force: true });
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'heads/main',
      sha: 'sha456',
      force: true,
    });
  });

  it('should create git blob', async () => {
    const mockBlob = { sha: 'blobsha123', url: 'http://...' };
    mockOctokit.rest.git.createBlob.mockResolvedValue({ data: mockBlob });

    const result = await GithubService.createBlob('owner', 'repo', { content: 'content', encoding: 'utf-8' });
    expect(result).toEqual(mockBlob);
    expect(mockOctokit.rest.git.createBlob).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      content: 'content',
      encoding: 'utf-8',
    });
  });

  it('should create git tree', async () => {
    const mockTree = { sha: 'treesha123', tree: [] };
    mockOctokit.rest.git.createTree.mockResolvedValue({ data: mockTree });

    const treeData = {
      tree: [{ path: 'file.js', mode: '100644', type: 'blob', sha: 'blobsha123' }],
      base_tree: 'basesha',
    };
    const result = await GithubService.createTree('owner', 'repo', treeData);
    expect(result).toEqual(mockTree);
    expect(mockOctokit.rest.git.createTree).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tree: treeData.tree,
      base_tree: 'basesha',
    });
  });

  it('should create git commit', async () => {
    const mockCommit = { sha: 'commitsha123', message: 'test commit' };
    mockOctokit.rest.git.createCommit.mockResolvedValue({ data: mockCommit });

    const commitData = {
      message: 'test commit',
      tree: 'treesha123',
      parents: ['parentsha'],
      author: { name: 'Author', email: 'author@test.com' },
      committer: { name: 'Committer', email: 'committer@test.com' },
      signature: 'sig',
    };
    const result = await GithubService.createCommit('owner', 'repo', commitData);
    expect(result).toEqual(mockCommit);
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      message: 'test commit',
      tree: 'treesha123',
      parents: ['parentsha'],
      author: commitData.author,
      committer: commitData.committer,
      signature: 'sig',
    });
  });

  // 14. Organizations & Teams API
  it('should list organizations for the authenticated user', async () => {
    const mockOrgs = [{ login: 'org1', id: 10 }];
    mockOctokit.rest.orgs.listForAuthenticatedUser.mockResolvedValue({ data: mockOrgs });

    const result = await GithubService.listOrganizations({ per_page: 10, page: 2 });
    expect(result).toEqual(mockOrgs);
    expect(mockOctokit.rest.orgs.listForAuthenticatedUser).toHaveBeenCalledWith({
      per_page: 10,
      page: 2,
    });
  });

  it('should list teams in an organization', async () => {
    const mockTeams = [{ name: 'team1', slug: 'team-1' }];
    mockOctokit.rest.teams.list.mockResolvedValue({ data: mockTeams });

    const result = await GithubService.listTeams('org1', { per_page: 15 });
    expect(result).toEqual(mockTeams);
    expect(mockOctokit.rest.teams.list).toHaveBeenCalledWith({
      org: 'org1',
      per_page: 15,
      page: 1,
    });
  });

  it('should list team members in an organization', async () => {
    const mockMembers = [{ login: 'member1' }];
    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({ data: mockMembers });

    const result = await GithubService.listTeamMembers('org1', 'team-1');
    expect(result).toEqual(mockMembers);
    expect(mockOctokit.rest.teams.listMembersInOrg).toHaveBeenCalledWith({
      org: 'org1',
      team_slug: 'team-1',
    });
  });

  // 15. Repository Webhooks API
  it('should list webhooks in a repository', async () => {
    const mockHooks = [{ id: 1, name: 'web' }];
    mockOctokit.rest.repos.listWebhooks.mockResolvedValue({ data: mockHooks });

    const result = await GithubService.listWebhooks('owner', 'repo', { page: 3 });
    expect(result).toEqual(mockHooks);
    expect(mockOctokit.rest.repos.listWebhooks).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 30,
      page: 3,
    });
  });

  it('should create a webhook in a repository', async () => {
    const mockHook = { id: 2, active: true };
    mockOctokit.rest.repos.createWebhook.mockResolvedValue({ data: mockHook });

    const hookData = {
      config: { url: 'https://webhook.com' },
      events: ['push'],
      active: true,
    };
    const result = await GithubService.createWebhook('owner', 'repo', hookData);
    expect(result).toEqual(mockHook);
    expect(mockOctokit.rest.repos.createWebhook).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'web',
      config: hookData.config,
      events: hookData.events,
      active: true,
    });
  });

  it('should delete a webhook in a repository', async () => {
    mockOctokit.rest.repos.deleteWebhook.mockResolvedValue({ status: 204 });

    const result = await GithubService.deleteWebhook('owner', 'repo', 123);
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.deleteWebhook).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      hook_id: 123,
    });
  });

  // 16. Actions Secrets & Variables API
  it('should fetch actions public key for a repository', async () => {
    const mockKey = { key_id: 'key123', key: 'base64key' };
    mockOctokit.rest.actions.getRepoPublicKey.mockResolvedValue({ data: mockKey });

    const result = await GithubService.getActionsPublicKey('owner', 'repo');
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.actions.getRepoPublicKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should create or update a repository secret', async () => {
    const mockSecret = { status: 201 };
    mockOctokit.rest.actions.createOrUpdateRepoSecret.mockResolvedValue({ data: mockSecret });

    const secretData = { encrypted_value: 'encval', key_id: 'key123' };
    const result = await GithubService.createOrUpdateRepoSecret('owner', 'repo', 'MY_SECRET', secretData);
    expect(result).toEqual(mockSecret);
    expect(mockOctokit.rest.actions.createOrUpdateRepoSecret).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      secret_name: 'MY_SECRET',
      encrypted_value: 'encval',
      key_id: 'key123',
    });
  });

  it('should list repository variables', async () => {
    const mockVars = [{ name: 'VAR1', value: 'val1' }];
    mockOctokit.rest.actions.listRepoVariables.mockResolvedValue({ data: mockVars });

    const result = await GithubService.listRepoVariables('owner', 'repo', { per_page: 10 });
    expect(result).toEqual(mockVars);
    expect(mockOctokit.rest.actions.listRepoVariables).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 10,
      page: 1,
    });
  });

  it('should create a repository variable', async () => {
    const mockVar = { name: 'VAR1' };
    mockOctokit.rest.actions.createRepoVariable.mockResolvedValue({ data: mockVar });

    const result = await GithubService.createRepoVariable('owner', 'repo', 'VAR1', 'val1');
    expect(result).toEqual(mockVar);
    expect(mockOctokit.rest.actions.createRepoVariable).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'VAR1',
      value: 'val1',
    });
  });

  it('should update a repository variable', async () => {
    const mockVar = { name: 'VAR1' };
    mockOctokit.rest.actions.updateRepoVariable.mockResolvedValue({ data: mockVar });

    const result = await GithubService.updateRepoVariable('owner', 'repo', 'VAR1', 'val2');
    expect(result).toEqual(mockVar);
    expect(mockOctokit.rest.actions.updateRepoVariable).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'VAR1',
      value: 'val2',
    });
  });

  // 17. Codespaces API
  it('should list codespaces for authenticated user', async () => {
    const mockCodespaces = [{ id: 1, name: 'codespace-1' }];
    mockOctokit.rest.codespaces.listForAuthenticatedUser.mockResolvedValue({ data: mockCodespaces });

    const result = await GithubService.listCodespaces({ per_page: 5 });
    expect(result).toEqual(mockCodespaces);
    expect(mockOctokit.rest.codespaces.listForAuthenticatedUser).toHaveBeenCalledWith({
      per_page: 5,
      page: 1,
    });
  });

  it('should create a codespace for a repository', async () => {
    const mockCodespace = { id: 2, name: 'codespace-2' };
    mockOctokit.rest.codespaces.createWithRepoForAuthenticatedUser.mockResolvedValue({ data: mockCodespace });

    const codespaceData = { ref: 'main', machine: 'standardLinux32gb' };
    const result = await GithubService.createCodespace('owner', 'repo', codespaceData);
    expect(result).toEqual(mockCodespace);
    expect(mockOctokit.rest.codespaces.createWithRepoForAuthenticatedUser).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
      machine: 'standardLinux32gb',
      devcontainer_path: undefined,
      multi_repo_permissions_opt_out: undefined,
    });
  });

  it('should delete a codespace', async () => {
    mockOctokit.rest.codespaces.deleteForAuthenticatedUser.mockResolvedValue({ status: 204 });

    const result = await GithubService.deleteCodespace('codespace-2');
    expect(result).toBe(true);
    expect(mockOctokit.rest.codespaces.deleteForAuthenticatedUser).toHaveBeenCalledWith({
      codespace_name: 'codespace-2',
    });
  });

  // 18. Dependabot Alerts API
  it('should list dependabot alerts for repository', async () => {
    const mockAlerts = [{ number: 1, security_advisory: {} }];
    mockOctokit.rest.dependabot.listAlertsForRepo.mockResolvedValue({ data: mockAlerts });

    const result = await GithubService.listDependabotAlerts('owner', 'repo', { state: 'open', severity: 'high' });
    expect(result).toEqual(mockAlerts);
    expect(mockOctokit.rest.dependabot.listAlertsForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      severity: 'high',
      per_page: 30,
      page: 1,
    });
  });

  // 19. Copilot API
  it('should get copilot billing details for a user', async () => {
    const mockBilling = { seat_breakdown: {} };
    mockOctokit.rest.copilot.getBillingDetailsForUser.mockResolvedValue({ data: mockBilling });

    const result = await GithubService.getCopilotBillingForUser('user1');
    expect(result).toEqual(mockBilling);
    expect(mockOctokit.rest.copilot.getBillingDetailsForUser).toHaveBeenCalledWith({
      username: 'user1',
    });
  });
});

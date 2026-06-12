import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { GitlabService } from './gitlab.service.js';

// Retrieve the mocked client instance
const mockClient = axios.create();

// Hoisted axios mock
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GitlabService', () => {
  // ==========================================
  // 1. User & Keys Endpoints
  // ==========================================
  describe('1. User & Keys Endpoints', () => {
    it('getAuthenticatedUser should fetch user data', async () => {
      const mockData = { id: 1, username: 'testuser' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getAuthenticatedUser();
      expect(mockClient.get).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockData);
    });

    it('listSSHKeys should retrieve all keys', async () => {
      const mockData = [{ id: 1, key: 'ssh-rsa...' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listSSHKeys();
      expect(mockClient.get).toHaveBeenCalledWith('/user/keys');
      expect(result).toEqual(mockData);
    });

    it('addSSHKey should send title and key to post endpoint', async () => {
      const mockData = { id: 1, title: 'MyKey', key: 'ssh-rsa...' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addSSHKey('MyKey', 'ssh-rsa...');
      expect(mockClient.post).toHaveBeenCalledWith('/user/keys', {
        title: 'MyKey',
        key: 'ssh-rsa...',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteSSHKey should call delete endpoint with keyId', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteSSHKey(123);
      expect(mockClient.delete).toHaveBeenCalledWith('/user/keys/123');
      expect(result).toEqual({ success: true });
    });

    it('listGPGKeys should retrieve all GPG keys', async () => {
      const mockData = [{ id: 1, key: 'gpg-key...' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGPGKeys();
      expect(mockClient.get).toHaveBeenCalledWith('/user/gpg_keys');
      expect(result).toEqual(mockData);
    });

    it('addGPGKey should send GPG key block', async () => {
      const mockData = { id: 1, key: 'gpg-key...' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addGPGKey('gpg-key...');
      expect(mockClient.post).toHaveBeenCalledWith('/user/gpg_keys', {
        key: 'gpg-key...',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGPGKey should call delete endpoint with keyId', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGPGKey(456);
      expect(mockClient.delete).toHaveBeenCalledWith('/user/gpg_keys/456');
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 2. Projects & Branches Endpoints
  // ==========================================
  describe('2. Projects & Branches Endpoints', () => {
    it('listProjects should call get with correct params', async () => {
      const mockData = [{ id: 1, name: 'Project' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjects({
        perPage: 10,
        page: 2,
        search: 'test',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects', {
        params: {
          simple: true,
          membership: true,
          order_by: 'last_activity_at',
          per_page: 10,
          page: 2,
          search: 'test',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('createProject should call post with payload', async () => {
      const mockData = { id: 1, name: 'NewProj' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProject({
        name: 'NewProj',
        description: 'desc',
        visibility: 'public',
        initializeWithReadme: false,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/projects', {
        name: 'NewProj',
        description: 'desc',
        visibility: 'public',
        initialize_with_readme: false,
      });
      expect(result).toEqual(mockData);
    });

    it('getProject should fetch a specific project', async () => {
      const mockData = { id: 123, name: 'Proj' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProject('group/project');
      expect(mockClient.get).toHaveBeenCalledWith('/projects/group%2Fproject');
      expect(result).toEqual(mockData);
    });

    it('deleteProject should call delete for specific project', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProject('group/project');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/group%2Fproject',
      );
      expect(result).toEqual({ success: true });
    });

    it('listBranches should get all branches for project', async () => {
      const mockData = [{ name: 'main' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listBranches('123');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/branches',
      );
      expect(result).toEqual(mockData);
    });

    it('getBranch should return branch details on success', async () => {
      const mockData = { name: 'main', protected: true };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getBranch('123', 'main');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/branches/main',
      );
      expect(result).toEqual(mockData);
    });

    it('getBranch should return fallback object on 404', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };
      mockClient.get.mockRejectedValueOnce(error);
      const result = await GitlabService.getBranch('123', 'missing');
      expect(result).toEqual({
        name: 'missing',
        protected: false,
        exists: false,
      });
    });

    it('createBranch should call post with branch and ref', async () => {
      const mockData = { name: 'feature', commit: {} };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createBranch('123', 'feature', 'main');
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/branches',
        { branch: 'feature', ref: 'main' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteBranch should call delete with branch name', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteBranch('123', 'feature');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/repository/branches/feature',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 3. Repository Files Endpoints
  // ==========================================
  describe('3. Repository Files Endpoints', () => {
    it('getFileContent should get raw content with ref', async () => {
      const mockData = 'file content';
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getFileContent(
        '123',
        'src/index.js',
        'dev',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/files/src%2Findex.js/raw',
        { params: { ref: 'dev' } },
      );
      expect(result).toEqual(mockData);
    });

    it('createFile should post file details', async () => {
      const mockData = { file_path: 'src/index.js', branch: 'main' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createFile(
        '123',
        'src/index.js',
        'content',
        'msg',
        'main',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/files/src%2Findex.js',
        {
          branch: 'main',
          commit_message: 'msg',
          content: 'content',
          encoding: 'text',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateFile should put file details', async () => {
      const mockData = { file_path: 'src/index.js', branch: 'main' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateFile(
        '123',
        'src/index.js',
        'new content',
        'update msg',
        'main',
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/repository/files/src%2Findex.js',
        {
          branch: 'main',
          commit_message: 'update msg',
          content: 'new content',
          encoding: 'text',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteFile should send delete request with body data', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteFile(
        '123',
        'src/index.js',
        'delete msg',
        'main',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/repository/files/src%2Findex.js',
        {
          data: {
            branch: 'main',
            commit_message: 'delete msg',
          },
        },
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 4. Merge Requests Endpoints
  // ==========================================
  describe('4. Merge Requests Endpoints', () => {
    it('listMergeRequests should retrieve MR list', async () => {
      const mockData = [{ id: 1, title: 'MR1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequests('123', {
        state: 'merged',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/merge_requests',
        {
          params: {
            state: 'merged',
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getMergeRequest should retrieve specific MR', async () => {
      const mockData = { id: 1, title: 'MR1' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getMergeRequest('123', 5);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5',
      );
      expect(result).toEqual(mockData);
    });

    it('createMergeRequest should post MR info', async () => {
      const mockData = { id: 1, title: 'MR1' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMergeRequest(
        '123',
        'source',
        'target',
        'MR Title',
        {
          description: 'desc',
          removeSourceBranch: false,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/merge_requests',
        {
          source_branch: 'source',
          target_branch: 'target',
          title: 'MR Title',
          description: 'desc',
          remove_source_branch: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateMergeRequest should put updated MR details', async () => {
      const mockData = { id: 1, title: 'Updated Title' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateMergeRequest('123', 5, {
        title: 'Updated Title',
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5',
        { title: 'Updated Title' },
      );
      expect(result).toEqual(mockData);
    });

    it('mergeMergeRequest should put merge execution details', async () => {
      const mockData = { id: 1, state: 'merged' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.mergeMergeRequest('123', 5, {
        mergeCommitMessage: 'merge msg',
        shouldRemoveSourceBranch: true,
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/merge',
        {
          merge_commit_message: 'merge msg',
          should_remove_source_branch: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('listMergeRequestComments should get notes', async () => {
      const mockData = [{ id: 1, body: 'Note' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequestComments('123', 5, {
        page: 2,
        perPage: 15,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/notes',
        {
          params: {
            page: 2,
            per_page: 15,
            sort: 'asc',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createMergeRequestComment should post a note', async () => {
      const mockData = { id: 1, body: 'Note' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMergeRequestComment(
        '123',
        5,
        'Comment Body',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/notes',
        { body: 'Comment Body' },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 5. Issues & Milestones Endpoints
  // ==========================================
  describe('5. Issues & Milestones Endpoints', () => {
    it('listIssues should fetch issues', async () => {
      const mockData = [{ id: 1, title: 'Issue' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssues('123', {
        state: 'closed',
        page: 3,
        perPage: 20,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/issues', {
        params: {
          state: 'closed',
          page: 3,
          per_page: 20,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getIssue should get specific issue', async () => {
      const mockData = { id: 1, title: 'Issue' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getIssue('123', 4);
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/issues/4');
      expect(result).toEqual(mockData);
    });

    it('createIssue should post issue details', async () => {
      const mockData = { id: 1, title: 'New Issue' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createIssue('123', {
        title: 'New Issue',
        description: 'desc',
        labels: 'bug',
        assigneeIds: [2],
      });
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/issues', {
        title: 'New Issue',
        description: 'desc',
        labels: 'bug',
        assignee_ids: [2],
      });
      expect(result).toEqual(mockData);
    });

    it('updateIssue should put updated issue data', async () => {
      const mockData = { id: 1, state: 'closed' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateIssue('123', 4, {
        state_event: 'close',
      });
      expect(mockClient.put).toHaveBeenCalledWith('/projects/123/issues/4', {
        state_event: 'close',
      });
      expect(result).toEqual(mockData);
    });

    it('listIssueComments should fetch issue notes', async () => {
      const mockData = [{ id: 1, body: 'Note' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssueComments('123', 4, {
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/issues/4/notes',
        {
          params: {
            page: 2,
            per_page: 10,
            sort: 'asc',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createIssueComment should post a note to issue', async () => {
      const mockData = { id: 1, body: 'Note' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createIssueComment(
        '123',
        4,
        'Comment Body',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/issues/4/notes',
        { body: 'Comment Body' },
      );
      expect(result).toEqual(mockData);
    });

    it('listMilestones should retrieve milestones', async () => {
      const mockData = [{ id: 1, title: 'Milestone' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMilestones('123', {
        state: 'active',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/milestones', {
        params: {
          state: 'active',
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('createMilestone should post milestone title and description', async () => {
      const mockData = { id: 1, title: 'Milestone' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMilestone(
        '123',
        'Milestone',
        'desc',
      );
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/milestones', {
        title: 'Milestone',
        description: 'desc',
      });
      expect(result).toEqual(mockData);
    });

    it('updateMilestone should put updated details', async () => {
      const mockData = { id: 1, title: 'Updated Milestone' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateMilestone('123', 5, {
        description: 'new desc',
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/milestones/5',
        { description: 'new desc' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteMilestone should delete the specific milestone', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteMilestone('123', 5);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/milestones/5',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 6. CI/CD Pipelines & Jobs Endpoints
  // ==========================================
  describe('6. CI/CD Pipelines & Jobs Endpoints', () => {
    it('listPipelines should fetch pipeline runs', async () => {
      const mockData = [{ id: 1, status: 'success' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listPipelines('123', {
        ref: 'main',
        status: 'success',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/pipelines', {
        params: {
          ref: 'main',
          status: 'success',
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getPipeline should fetch specific pipeline details', async () => {
      const mockData = { id: 99, status: 'running' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getPipeline('123', 99);
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/pipelines/99');
      expect(result).toEqual(mockData);
    });

    it('createPipeline should post details to pipeline endpoint', async () => {
      const mockData = { id: 100, ref: 'main' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createPipeline('123', 'main', [
        { key: 'ENV', value: 'production' },
      ]);
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/pipeline', {
        ref: 'main',
        variables: [{ key: 'ENV', value: 'production' }],
      });
      expect(result).toEqual(mockData);
    });

    it('cancelPipeline should trigger cancel endpoint', async () => {
      const mockData = { id: 100, status: 'canceled' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.cancelPipeline('123', 100);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/pipelines/100/cancel',
      );
      expect(result).toEqual(mockData);
    });

    it('retryPipeline should trigger retry endpoint', async () => {
      const mockData = { id: 100, status: 'running' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.retryPipeline('123', 100);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/pipelines/100/retry',
      );
      expect(result).toEqual(mockData);
    });

    it('listPipelineJobs should fetch jobs lists', async () => {
      const mockData = [{ id: 1, name: 'build' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listPipelineJobs('123', 100, {
        scope: 'failed',
        page: 2,
        perPage: 15,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/pipelines/100/jobs',
        {
          params: {
            scope: 'failed',
            page: 2,
            per_page: 15,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getJobLog should fetch raw job traces', async () => {
      const mockData = 'job log trace content';
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getJobLog('123', 200);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/jobs/200/trace',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 7. CI/CD Variables Endpoints
  // ==========================================
  describe('7. CI/CD Variables Endpoints', () => {
    it('listProjectVariables should retrieve variable settings', async () => {
      const mockData = [{ key: 'API_KEY' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectVariables('123', {
        page: 2,
        perPage: 20,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/variables', {
        params: {
          page: 2,
          per_page: 20,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getProjectVariable should retrieve specific variable info', async () => {
      const mockData = { key: 'API_KEY', value: 'secret' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectVariable('123', 'API_KEY');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/variables/API_KEY',
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectVariable should post environment variable config', async () => {
      const mockData = { key: 'API_KEY' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectVariable(
        '123',
        'API_KEY',
        'secret',
        {
          variableType: 'env_var',
          protected: true,
          masked: true,
          raw: false,
          environmentScope: 'production',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/variables', {
        key: 'API_KEY',
        value: 'secret',
        variable_type: 'env_var',
        protected: true,
        masked: true,
        raw: false,
        environment_scope: 'production',
      });
      expect(result).toEqual(mockData);
    });

    it('updateProjectVariable should put updated variable configs', async () => {
      const mockData = { key: 'API_KEY' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectVariable(
        '123',
        'API_KEY',
        'new-secret',
        {
          variableType: 'env_var',
          protected: false,
          masked: true,
          raw: true,
          environmentScope: '*',
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/variables/API_KEY',
        {
          value: 'new-secret',
          variable_type: 'env_var',
          protected: false,
          masked: true,
          raw: true,
          environment_scope: '*',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectVariable should remove variable settings', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectVariable(
        '123',
        'API_KEY',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/variables/API_KEY',
      );
      expect(result).toEqual({ success: true });
    });

    it('listGroupVariables should fetch group vars list', async () => {
      const mockData = [{ key: 'GLOBAL_VAR' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupVariables('99', {
        page: 3,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/groups/99/variables', {
        params: {
          page: 3,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getGroupVariable should retrieve specific group variable', async () => {
      const mockData = { key: 'GLOBAL_VAR', value: 'val' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupVariable('99', 'GLOBAL_VAR');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/99/variables/GLOBAL_VAR',
      );
      expect(result).toEqual(mockData);
    });

    it('createGroupVariable should post group variable data', async () => {
      const mockData = { key: 'GLOBAL_VAR' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupVariable(
        '99',
        'GLOBAL_VAR',
        'val',
        {
          variableType: 'file',
          protected: true,
          masked: false,
          raw: true,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith('/groups/99/variables', {
        key: 'GLOBAL_VAR',
        value: 'val',
        variable_type: 'file',
        protected: true,
        masked: false,
        raw: true,
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupVariable should put group variable data', async () => {
      const mockData = { key: 'GLOBAL_VAR' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupVariable(
        '99',
        'GLOBAL_VAR',
        'new-val',
        {
          variableType: 'env_var',
          protected: false,
          masked: true,
          raw: false,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/99/variables/GLOBAL_VAR',
        {
          value: 'new-val',
          variable_type: 'env_var',
          protected: false,
          masked: true,
          raw: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupVariable should delete group settings variable', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupVariable(
        '99',
        'GLOBAL_VAR',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/99/variables/GLOBAL_VAR',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 8. Groups & Members Endpoints
  // ==========================================
  describe('8. Groups & Members Endpoints', () => {
    it('listGroups should get groups lists', async () => {
      const mockData = [{ id: 1, name: 'Group' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroups({
        page: 2,
        perPage: 15,
        search: 'inso',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/groups', {
        params: {
          page: 2,
          per_page: 15,
          search: 'inso',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getGroup should fetch specific group profile', async () => {
      const mockData = { id: 99, name: 'Group' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroup('my-group');
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group');
      expect(result).toEqual(mockData);
    });

    it('listProjectMembers should get project membership', async () => {
      const mockData = [{ id: 2, username: 'user2' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectMembers('123', {
        page: 2,
        perPage: 10,
        query: 'alex',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/members', {
        params: {
          page: 2,
          per_page: 10,
          query: 'alex',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('addProjectMember should post user id and access level to project members', async () => {
      const mockData = { id: 2, access_level: 40 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addProjectMember('123', 2, 40);
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/members', {
        user_id: 2,
        access_level: 40,
      });
      expect(result).toEqual(mockData);
    });

    it('removeProjectMember should call delete endpoint for user', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.removeProjectMember('123', 2);
      expect(mockClient.delete).toHaveBeenCalledWith('/projects/123/members/2');
      expect(result).toEqual({ success: true });
    });

    it('listGroupMembers should get group membership list', async () => {
      const mockData = [{ id: 5, username: 'user5' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupMembers('99', {
        page: 1,
        perPage: 20,
        query: 'bob',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/groups/99/members', {
        params: {
          page: 1,
          per_page: 20,
          query: 'bob',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('addGroupMember should post user id and access to group members', async () => {
      const mockData = { id: 5, access_level: 30 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addGroupMember('99', 5, 30);
      expect(mockClient.post).toHaveBeenCalledWith('/groups/99/members', {
        user_id: 5,
        access_level: 30,
      });
      expect(result).toEqual(mockData);
    });

    it('removeGroupMember should delete member from group', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.removeGroupMember('99', 5);
      expect(mockClient.delete).toHaveBeenCalledWith('/groups/99/members/5');
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 9. Project Webhooks Endpoints
  // ==========================================
  describe('9. Project Webhooks Endpoints', () => {
    it('listProjectHooks should get hook configs', async () => {
      const mockData = [{ id: 1, url: 'http://webhook' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectHooks('123', {
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/hooks', {
        params: {
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getProjectHook should fetch specific hook info', async () => {
      const mockData = { id: 1, url: 'http://webhook' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectHook('123', 1);
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/hooks/1');
      expect(result).toEqual(mockData);
    });

    it('createProjectHook should post webhook configs', async () => {
      const mockData = { id: 1, url: 'http://webhook' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectHook(
        '123',
        'http://webhook',
        {
          pushEvents: true,
          issuesEvents: true,
          mergeRequestsEvents: false,
          tagPushEvents: true,
          noteEvents: false,
          pipelineEvents: true,
          jobEvents: false,
          token: 'secret-token',
          enableSslVerification: false,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/hooks', {
        url: 'http://webhook',
        push_events: true,
        issues_events: true,
        merge_requests_events: false,
        tag_push_events: true,
        note_events: false,
        pipeline_events: true,
        job_events: false,
        token: 'secret-token',
        enable_ssl_verification: false,
      });
      expect(result).toEqual(mockData);
    });

    it('updateProjectHook should put updated webhook configs', async () => {
      const mockData = { id: 1, url: 'http://newwebhook' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectHook(
        '123',
        1,
        'http://newwebhook',
        {
          pushEvents: false,
          issuesEvents: false,
          mergeRequestsEvents: true,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith('/projects/123/hooks/1', {
        url: 'http://newwebhook',
        push_events: false,
        issues_events: false,
        merge_requests_events: true,
        tag_push_events: undefined,
        note_events: undefined,
        pipeline_events: undefined,
        job_events: undefined,
        token: undefined,
        enable_ssl_verification: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('deleteProjectHook should delete webhook configuration', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectHook('123', 1);
      expect(mockClient.delete).toHaveBeenCalledWith('/projects/123/hooks/1');
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 10. Access Tokens Endpoints
  // ==========================================
  describe('10. Access Tokens Endpoints', () => {
    it('listProjectAccessTokens should fetch tokens lists', async () => {
      const mockData = [{ id: 1, name: 'Token' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectAccessTokens('123', {
        page: 2,
        perPage: 15,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/access_tokens',
        {
          params: {
            page: 2,
            per_page: 15,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectAccessToken should post token settings', async () => {
      const mockData = { id: 1, name: 'NewToken', token: 'glpat-...' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectAccessToken(
        '123',
        'NewToken',
        ['read_repository'],
        '2026-12-31',
        40,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/access_tokens',
        {
          name: 'NewToken',
          scopes: ['read_repository'],
          expires_at: '2026-12-31',
          access_level: 40,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('revokeProjectAccessToken should call delete to revoke token', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.revokeProjectAccessToken('123', 10);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/access_tokens/10',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 11. Security Scanning Endpoints
  // ==========================================
  describe('11. Security Scanning Endpoints', () => {
    it('listVulnerabilityAlerts should fetch vulnerabilities list', async () => {
      const mockData = [{ id: 1, severity: 'high' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listVulnerabilityAlerts('123', {
        page: 2,
        perPage: 10,
        severity: 'critical',
        confidence: 'high',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/vulnerabilities',
        {
          params: {
            page: 2,
            per_page: 10,
            severity: 'critical',
            confidence: 'high',
          },
        },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 12. Commits, Diff & Comments Endpoints
  // ==========================================
  describe('12. Commits, Diff & Comments Endpoints', () => {
    it('listCommits should fetch commit list with query params', async () => {
      const mockData = [{ sha: 'abc123' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listCommits('123', {
        refName: 'main',
        since: '2026-01-01',
        until: '2026-06-01',
        path: 'src/',
        all: true,
        withStats: true,
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits',
        {
          params: {
            ref_name: 'main',
            since: '2026-01-01',
            until: '2026-06-01',
            path: 'src/',
            all: true,
            with_stats: true,
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getCommit should fetch commit details by SHA', async () => {
      const mockData = { sha: 'abc123', message: 'commit msg' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getCommit('123', 'abc123');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits/abc123',
      );
      expect(result).toEqual(mockData);
    });

    it('compareCommits should fetch comparison of two commits', async () => {
      const mockData = { diffs: [] };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.compareCommits(
        '123',
        'main',
        'feature',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/compare',
        {
          params: { from: 'main', to: 'feature' },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getCommitDiff should fetch commit diff by SHA', async () => {
      const mockData = [{ diff: 'diff text' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getCommitDiff('123', 'abc123');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits/abc123/diff',
      );
      expect(result).toEqual(mockData);
    });

    it('getCommitComments should fetch commit comments', async () => {
      const mockData = [{ note: 'nice work' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getCommitComments('123', 'abc123');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits/abc123/comments',
      );
      expect(result).toEqual(mockData);
    });

    it('createCommitComment should post commit comment', async () => {
      const mockData = { note: 'nice work' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createCommitComment(
        '123',
        'abc123',
        'nice work',
        {
          path: 'src/main.js',
          line: 10,
          lineType: 'new',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/commits/abc123/comments',
        {
          note: 'nice work',
          path: 'src/main.js',
          line: 10,
          line_type: 'new',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createCommitStatus should post commit status', async () => {
      const mockData = { state: 'success' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createCommitStatus(
        '123',
        'abc123',
        'success',
        {
          ref: 'main',
          name: 'test-build',
          targetUrl: 'http://ci.build',
          description: 'tests passed',
          coverage: 90,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/statuses/abc123',
        {
          state: 'success',
          ref: 'main',
          name: 'test-build',
          target_url: 'http://ci.build',
          description: 'tests passed',
          coverage: 90,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('listCommitStatuses should fetch statuses for a commit', async () => {
      const mockData = [{ state: 'success' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listCommitStatuses('123', 'abc123', {
        ref: 'main',
        stage: 'test',
        name: 'test-build',
        all: true,
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits/abc123/statuses',
        {
          params: {
            ref: 'main',
            stage: 'test',
            name: 'test-build',
            all: true,
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 13. Releases & Tags Endpoints
  // ==========================================
  describe('13. Releases & Tags Endpoints', () => {
    it('listReleases should fetch project releases list', async () => {
      const mockData = [{ name: 'v1.0.0' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listReleases('123', {
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/releases', {
        params: { page: 2, per_page: 10 },
      });
      expect(result).toEqual(mockData);
    });

    it('getRelease should fetch project release by tagName', async () => {
      const mockData = { name: 'v1.0.0', tag_name: 'v1.0.0' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getRelease('123', 'v1.0.0');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/releases/v1.0.0',
      );
      expect(result).toEqual(mockData);
    });

    it('createRelease should post release configurations', async () => {
      const mockData = { name: 'v1.0.0', tag_name: 'v1.0.0' };
      const releaseData = {
        name: 'v1.0.0',
        tagName: 'v1.0.0',
        tagMessage: 'Initial tag',
        description: 'Release notes',
        ref: 'main',
        assets: {},
        milestones: ['m1'],
        releasedAt: '2026-06-11T12:00:00Z',
      };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createRelease('123', releaseData);
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/releases', {
        name: 'v1.0.0',
        tag_name: 'v1.0.0',
        tag_message: 'Initial tag',
        description: 'Release notes',
        ref: 'main',
        assets: {},
        milestones: ['m1'],
        released_at: '2026-06-11T12:00:00Z',
      });
      expect(result).toEqual(mockData);
    });

    it('updateRelease should put updated release configuration', async () => {
      const mockData = { name: 'v1.0.0-patched' };
      const releaseData = {
        name: 'v1.0.0-patched',
        description: 'Patched release notes',
        milestones: ['m2'],
        releasedAt: '2026-06-11T13:00:00Z',
      };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateRelease(
        '123',
        'v1.0.0',
        releaseData,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/releases/v1.0.0',
        {
          name: 'v1.0.0-patched',
          description: 'Patched release notes',
          milestones: ['m2'],
          released_at: '2026-06-11T13:00:00Z',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteRelease should delete project release and return success object', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteRelease('123', 'v1.0.0');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/releases/v1.0.0',
      );
      expect(result).toEqual({ success: true });
    });

    it('listTags should fetch project tags list', async () => {
      const mockData = [{ name: 'v1.0.0' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listTags('123', {
        search: 'v1',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/tags',
        {
          params: { search: 'v1', page: 2, per_page: 10 },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getTag should fetch project tag by name', async () => {
      const mockData = { name: 'v1.0.0' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getTag('123', 'v1.0.0');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/tags/v1.0.0',
      );
      expect(result).toEqual(mockData);
    });

    it('createTag should post tag configs', async () => {
      const mockData = { name: 'v1.0.0' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createTag('123', 'v1.0.0', 'main', {
        message: 'v1.0.0 tag',
        releaseDescription: 'Initial release',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/tags',
        {
          tag_name: 'v1.0.0',
          ref: 'main',
          message: 'v1.0.0 tag',
          release_description: 'Initial release',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteTag should delete tag by name', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteTag('123', 'v1.0.0');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/repository/tags/v1.0.0',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 14. Deployments & Environments Endpoints
  // ==========================================
  describe('14. Deployments & Environments Endpoints', () => {
    it('listEnvironments should fetch project environments list', async () => {
      const mockData = [{ id: 1, name: 'production' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listEnvironments('123', {
        name: 'prod',
        search: 'production',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/environments',
        {
          params: {
            name: 'prod',
            search: 'production',
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getEnvironment should fetch specific project environment details', async () => {
      const mockData = { id: 1, name: 'production' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getEnvironment('123', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/environments/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createEnvironment should post new environment configuration', async () => {
      const mockData = { id: 1, name: 'production' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createEnvironment(
        '123',
        'production',
        {
          externalUrl: 'https://prod.example.com',
          tier: 'production',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/environments',
        {
          name: 'production',
          external_url: 'https://prod.example.com',
          tier: 'production',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateEnvironment should put updated environment configurations', async () => {
      const mockData = { id: 1, name: 'production' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateEnvironment('123', 1, {
        externalUrl: 'https://prod-new.example.com',
        tier: 'production',
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/environments/1',
        {
          external_url: 'https://prod-new.example.com',
          tier: 'production',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteEnvironment should call delete on specific environment and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteEnvironment('123', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/environments/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('listDeployments should fetch project deployments list', async () => {
      const mockData = [{ id: 1, environment: {} }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listDeployments('123', {
        environment: 'production',
        status: 'success',
        orderBy: 'created_at',
        sort: 'desc',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/deployments', {
        params: {
          environment: 'production',
          status: 'success',
          order_by: 'created_at',
          sort: 'desc',
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getDeployment should fetch specific project deployment details', async () => {
      const mockData = { id: 1, ref: 'main' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getDeployment('123', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/deployments/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createDeployment should post new deployment run logging', async () => {
      const mockData = { id: 1, ref: 'main' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createDeployment(
        '123',
        'production',
        'main',
        'v1.0.0',
        {
          status: 'running',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/deployments',
        {
          environment: 'production',
          ref: 'main',
          tag: 'v1.0.0',
          status: 'running',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateDeployment should put updated deployment run state', async () => {
      const mockData = { id: 1, status: 'success' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateDeployment('123', 1, 'success');
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/deployments/1',
        { status: 'success' },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 15. Snippets Endpoints
  // ==========================================
  describe('15. Snippets Endpoints', () => {
    it('listSnippets should fetch personal snippets list', async () => {
      const mockData = [{ id: 1, title: 'snippet' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listSnippets({ page: 2, perPage: 10 });
      expect(mockClient.get).toHaveBeenCalledWith('/snippets', {
        params: { page: 2, per_page: 10 },
      });
      expect(result).toEqual(mockData);
    });

    it('listProjectSnippets should fetch project snippets list', async () => {
      const mockData = [{ id: 1, title: 'snippet' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectSnippets('123', {
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/snippets', {
        params: { page: 2, per_page: 10 },
      });
      expect(result).toEqual(mockData);
    });

    it('getSnippet should fetch personal snippet details by ID', async () => {
      const mockData = { id: 1, title: 'snippet' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getSnippet(1);
      expect(mockClient.get).toHaveBeenCalledWith('/snippets/1');
      expect(result).toEqual(mockData);
    });

    it('getProjectSnippet should fetch project snippet details by ID', async () => {
      const mockData = { id: 1, title: 'snippet' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectSnippet('123', 1);
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/snippets/1');
      expect(result).toEqual(mockData);
    });

    it('createSnippet should post personal snippet', async () => {
      const mockData = { id: 1, title: 'snippet' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createSnippet(
        'mysnippet',
        'file.txt',
        'hello',
        'public',
        'desc',
      );
      expect(mockClient.post).toHaveBeenCalledWith('/snippets', {
        title: 'mysnippet',
        description: 'desc',
        visibility: 'public',
        files: [
          {
            file_path: 'file.txt',
            content: 'hello',
          },
        ],
      });
      expect(result).toEqual(mockData);
    });

    it('createProjectSnippet should post project snippet', async () => {
      const mockData = { id: 1, title: 'snippet' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectSnippet(
        '123',
        'mysnippet',
        'file.txt',
        'hello',
        'public',
        'desc',
      );
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/snippets', {
        title: 'mysnippet',
        description: 'desc',
        visibility: 'public',
        files: [
          {
            file_path: 'file.txt',
            content: 'hello',
          },
        ],
      });
      expect(result).toEqual(mockData);
    });

    it('updateSnippet should put updated personal snippet details', async () => {
      const mockData = { id: 1, title: 'snippet-updated' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateSnippet(1, {
        title: 'snippet-updated',
        description: 'updated desc',
        visibility: 'private',
        files: [],
      });
      expect(mockClient.put).toHaveBeenCalledWith('/snippets/1', {
        title: 'snippet-updated',
        description: 'updated desc',
        visibility: 'private',
        files: [],
      });
      expect(result).toEqual(mockData);
    });

    it('updateProjectSnippet should put updated project snippet details', async () => {
      const mockData = { id: 1, title: 'snippet-updated' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectSnippet('123', 1, {
        title: 'snippet-updated',
        description: 'updated desc',
        visibility: 'private',
        files: [],
      });
      expect(mockClient.put).toHaveBeenCalledWith('/projects/123/snippets/1', {
        title: 'snippet-updated',
        description: 'updated desc',
        visibility: 'private',
        files: [],
      });
      expect(result).toEqual(mockData);
    });

    it('deleteSnippet should delete personal snippet and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteSnippet(1);
      expect(mockClient.delete).toHaveBeenCalledWith('/snippets/1');
      expect(result).toEqual({ success: true });
    });

    it('deleteProjectSnippet should delete project snippet and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectSnippet('123', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/snippets/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('getSnippetContent should fetch personal snippet raw contents', async () => {
      const mockData = 'raw content';
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getSnippetContent(1);
      expect(mockClient.get).toHaveBeenCalledWith('/snippets/1/raw');
      expect(result).toEqual(mockData);
    });

    it('getProjectSnippetContent should fetch project snippet raw contents', async () => {
      const mockData = 'raw content';
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectSnippetContent('123', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/snippets/1/raw',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 16. Self-Hosted Runners Endpoints
  // ==========================================
  describe('16. Self-Hosted Runners Endpoints', () => {
    it('listRunners should fetch all self-hosted runners', async () => {
      const mockData = [{ id: 1, description: 'runner1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listRunners({
        type: 'instance_type',
        status: 'online',
        tagList: 'tag1,tag2',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/runners', {
        params: {
          type: 'instance_type',
          status: 'online',
          tag_list: 'tag1,tag2',
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('listProjectRunners should fetch project runners', async () => {
      const mockData = [{ id: 1, description: 'runner1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectRunners('123', {
        type: 'project_type',
        status: 'online',
        tagList: 'tag1',
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/runners', {
        params: {
          type: 'project_type',
          status: 'online',
          tag_list: 'tag1',
          page: 2,
          per_page: 10,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getRunner should fetch specific runner details', async () => {
      const mockData = { id: 1, description: 'runner1' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getRunner(1);
      expect(mockClient.get).toHaveBeenCalledWith('/runners/1');
      expect(result).toEqual(mockData);
    });

    it('updateRunner should put updated configurations on runner', async () => {
      const mockData = { id: 1, description: 'runner-updated' };
      const runnerData = {
        description: 'runner-updated',
        active: true,
        tagList: 'newtag',
        runUntagged: false,
        locked: true,
        accessLevel: 'ref_protected',
      };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateRunner(1, runnerData);
      expect(mockClient.put).toHaveBeenCalledWith('/runners/1', {
        description: 'runner-updated',
        active: true,
        tag_list: 'newtag',
        run_untagged: false,
        locked: true,
        access_level: 'ref_protected',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteRunner should unregister/delete runner by ID and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteRunner(1);
      expect(mockClient.delete).toHaveBeenCalledWith('/runners/1');
      expect(result).toEqual({ success: true });
    });

    it('registerRunner should post runner registration details', async () => {
      const mockData = { id: 1, token: 'glrt-...' };
      const registerData = {
        description: 'new runner',
        active: true,
        tagList: 'tag',
        runUntagged: true,
        locked: false,
        accessLevel: 'not_protected',
      };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.registerRunner(
        'registration-token',
        registerData,
      );
      expect(mockClient.post).toHaveBeenCalledWith('/runners', {
        token: 'registration-token',
        description: 'new runner',
        active: true,
        tag_list: 'tag',
        run_untagged: true,
        locked: false,
        access_level: 'not_protected',
      });
      expect(result).toEqual(mockData);
    });

    it('verifyRunner should post verification token and return success', async () => {
      mockClient.post.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.verifyRunner('runner-token');
      expect(mockClient.post).toHaveBeenCalledWith('/runners/verify', {
        token: 'runner-token',
      });
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 17. Epics & Epic Boards Endpoints
  // ==========================================
  describe('17. Epics & Epic Boards Endpoints', () => {
    it('listGroupEpics should fetch epics for a group', async () => {
      const mockData = [{ id: 1, title: 'Epic 1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupEpics('my-group', {
        page: 2,
        perPage: 15,
        search: 'keyword',
        state: 'opened',
      });
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/epics', {
        params: {
          page: 2,
          per_page: 15,
          search: 'keyword',
          state: 'opened',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('getGroupEpic should retrieve epic details', async () => {
      const mockData = { id: 1, title: 'Epic 1' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupEpic('my-group', 1);
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/epics/1');
      expect(result).toEqual(mockData);
    });

    it('createGroupEpic should create an epic', async () => {
      const mockData = { id: 1, title: 'New Epic' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupEpic('my-group', {
        title: 'New Epic',
        description: 'desc',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/my-group/epics', {
        title: 'New Epic',
        description: 'desc',
        start_date: '2026-06-01',
        end_date: '2026-06-30',
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupEpic should update epic details', async () => {
      const mockData = { id: 1, title: 'Updated Epic' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupEpic('my-group', 1, {
        title: 'Updated Epic',
        description: 'updated desc',
        startDate: '2026-06-02',
        endDate: '2026-06-29',
        stateEvent: 'close',
      });
      expect(mockClient.put).toHaveBeenCalledWith('/groups/my-group/epics/1', {
        title: 'Updated Epic',
        description: 'updated desc',
        start_date: '2026-06-02',
        end_date: '2026-06-29',
        state_event: 'close',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGroupEpic should delete an epic and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupEpic('my-group', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/epics/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('listEpicIssues should retrieve issues linked to epic', async () => {
      const mockData = [{ id: 10, title: 'Issue 10' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listEpicIssues('my-group', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/epics/1/issues',
      );
      expect(result).toEqual(mockData);
    });

    it('linkEpicIssue should link an issue to epic', async () => {
      const mockData = { id: 10, epic: { id: 1 } };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.linkEpicIssue('my-group', 1, 10);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/epics/1/issues/10',
      );
      expect(result).toEqual(mockData);
    });

    it('unlinkEpicIssue should unlink an issue from epic', async () => {
      const mockData = { id: 10, epic: null };
      mockClient.delete.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.unlinkEpicIssue('my-group', 1, 10);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/epics/1/issues/10',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 18. Packages & Registries Endpoints
  // ==========================================
  describe('18. Packages & Registries Endpoints', () => {
    it('listProjectPackages should list packages for a project', async () => {
      const mockData = [{ id: 1, name: 'my-pkg' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectPackages('my-project', {
        page: 2,
        perPage: 15,
        packageName: 'pkg',
        packageType: 'npm',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/packages',
        {
          params: {
            page: 2,
            per_page: 15,
            package_name: 'pkg',
            package_type: 'npm',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectPackage should fetch package info', async () => {
      const mockData = { id: 1, name: 'my-pkg' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectPackage('my-project', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/packages/1',
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectPackage should delete package and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectPackage('my-project', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/packages/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('listPackageVersions should list versions/files for a package', async () => {
      const mockData = [{ id: 100, file_name: 'v1.0.0' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listPackageVersions('my-project', 1, {
        page: 3,
        perPage: 25,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/packages/1/package_files',
        {
          params: {
            page: 3,
            per_page: 25,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('listContainerRepositories should list Docker registries', async () => {
      const mockData = [{ id: 5, name: 'docker-image' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listContainerRepositories(
        'my-project',
        {
          page: 2,
          perPage: 10,
        },
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/registry/repositories',
        {
          params: {
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteContainerRepository should delete registry repository and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteContainerRepository(
        'my-project',
        5,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/registry/repositories/5',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 19. Project & Group Badges Endpoints
  // ==========================================
  describe('19. Project & Group Badges Endpoints', () => {
    it('listProjectBadges should list project badges', async () => {
      const mockData = [{ id: 1, name: 'coverage' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectBadges('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/badges',
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectBadge should get badge details', async () => {
      const mockData = { id: 1, name: 'coverage' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectBadge('my-project', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/badges/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectBadge should create a project badge', async () => {
      const mockData = { id: 1, name: 'coverage' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectBadge('my-project', {
        linkUrl: 'http://link',
        imageUrl: 'http://img',
        name: 'coverage',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/badges',
        {
          link_url: 'http://link',
          image_url: 'http://img',
          name: 'coverage',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectBadge should update a project badge', async () => {
      const mockData = { id: 1, name: 'coverage-updated' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectBadge('my-project', 1, {
        linkUrl: 'http://link-new',
        imageUrl: 'http://img-new',
        name: 'coverage-updated',
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/badges/1',
        {
          link_url: 'http://link-new',
          image_url: 'http://img-new',
          name: 'coverage-updated',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectBadge should delete project badge and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectBadge('my-project', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/badges/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('listGroupBadges should list group badges', async () => {
      const mockData = [{ id: 2, name: 'build' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupBadges('my-group');
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/badges');
      expect(result).toEqual(mockData);
    });

    it('getGroupBadge should get group badge details', async () => {
      const mockData = { id: 2, name: 'build' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupBadge('my-group', 2);
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/badges/2');
      expect(result).toEqual(mockData);
    });

    it('createGroupBadge should create a group badge', async () => {
      const mockData = { id: 2, name: 'build' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupBadge('my-group', {
        linkUrl: 'http://link',
        imageUrl: 'http://img',
        name: 'build',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/my-group/badges', {
        link_url: 'http://link',
        image_url: 'http://img',
        name: 'build',
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupBadge should update a group badge', async () => {
      const mockData = { id: 2, name: 'build-updated' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupBadge('my-group', 2, {
        linkUrl: 'http://link-new',
        imageUrl: 'http://img-new',
        name: 'build-updated',
      });
      expect(mockClient.put).toHaveBeenCalledWith('/groups/my-group/badges/2', {
        link_url: 'http://link-new',
        image_url: 'http://img-new',
        name: 'build-updated',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGroupBadge should delete group badge and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupBadge('my-group', 2);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/badges/2',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 20. Pages & Pages Domains Endpoints
  // ==========================================
  describe('20. Pages & Pages Domains Endpoints', () => {
    it('getProjectPages should retrieve Pages status', async () => {
      const mockData = { url: 'https://pages.example.com' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectPages('my-project');
      expect(mockClient.get).toHaveBeenCalledWith('/projects/my-project/pages');
      expect(result).toEqual(mockData);
    });

    it('deleteProjectPages should delete Pages config and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectPages('my-project');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/pages',
      );
      expect(result).toEqual({ success: true });
    });

    it('listPagesDomains should list Pages domains', async () => {
      const mockData = [{ domain: 'example.com' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listPagesDomains('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/pages/domains',
      );
      expect(result).toEqual(mockData);
    });

    it('getPagesDomain should retrieve specific Pages domain config', async () => {
      const mockData = { domain: 'example.com' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getPagesDomain(
        'my-project',
        'example.com',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/pages/domains/example.com',
      );
      expect(result).toEqual(mockData);
    });

    it('createPagesDomain should create a new Pages domain mapping', async () => {
      const mockData = { domain: 'example.com' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createPagesDomain(
        'my-project',
        'example.com',
        {
          certificate: 'cert-content',
          key: 'key-content',
          autoSslEnabled: true,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/pages/domains',
        {
          domain: 'example.com',
          certificate: 'cert-content',
          key: 'key-content',
          auto_ssl_enabled: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updatePagesDomain should update pages domain details', async () => {
      const mockData = { domain: 'example.com' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updatePagesDomain(
        'my-project',
        'example.com',
        {
          certificate: 'cert-content-new',
          key: 'key-content-new',
          autoSslEnabled: false,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/pages/domains/example.com',
        {
          certificate: 'cert-content-new',
          key: 'key-content-new',
          auto_ssl_enabled: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deletePagesDomain should delete Pages domain mapping and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deletePagesDomain(
        'my-project',
        'example.com',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/pages/domains/example.com',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 21. Audit Events Endpoints
  // ==========================================
  describe('21. Audit Events Endpoints', () => {
    it('listProjectAuditEvents should fetch project audit logs', async () => {
      const mockData = [{ id: 1, entity_type: 'Project' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectAuditEvents('my-project', {
        page: 2,
        perPage: 20,
        createdAfter: '2026-06-01T00:00:00Z',
        createdBefore: '2026-06-10T00:00:00Z',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/audit_events',
        {
          params: {
            page: 2,
            per_page: 20,
            created_after: '2026-06-01T00:00:00Z',
            created_before: '2026-06-10T00:00:00Z',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('listGroupAuditEvents should fetch group audit logs', async () => {
      const mockData = [{ id: 1, entity_type: 'Group' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupAuditEvents('my-group', {
        page: 3,
        perPage: 30,
        createdAfter: '2026-06-02T00:00:00Z',
        createdBefore: '2026-06-09T00:00:00Z',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/audit_events',
        {
          params: {
            page: 3,
            per_page: 30,
            created_after: '2026-06-02T00:00:00Z',
            created_before: '2026-06-09T00:00:00Z',
          },
        },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 22. Award Emoji (Reactions) Endpoints
  // ==========================================
  describe('22. Award Emoji (Reactions) Endpoints', () => {
    it('listAwardEmojisOnIssue should fetch issue emoji reactions', async () => {
      const mockData = [{ id: 1, name: 'thumbsup' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnIssue(
        'my-project',
        45,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/award_emoji',
      );
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnIssue should create an emoji reaction on issue', async () => {
      const mockData = { id: 1, name: 'thumbsup' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnIssue(
        'my-project',
        45,
        'thumbsup',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/award_emoji',
        { name: 'thumbsup' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnIssue should delete reaction and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnIssue(
        'my-project',
        45,
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/award_emoji/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('listAwardEmojisOnMergeRequest should fetch MR emoji reactions', async () => {
      const mockData = [{ id: 2, name: 'clap' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnMergeRequest(
        'my-project',
        12,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/award_emoji',
      );
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnMergeRequest should create reaction on MR', async () => {
      const mockData = { id: 2, name: 'clap' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnMergeRequest(
        'my-project',
        12,
        'clap',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/award_emoji',
        { name: 'clap' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnMergeRequest should delete reaction on MR', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnMergeRequest(
        'my-project',
        12,
        2,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/award_emoji/2',
      );
      expect(result).toEqual({ success: true });
    });

    it('listAwardEmojisOnSnippet should fetch personal snippet reactions', async () => {
      const mockData = [{ id: 3, name: 'heart' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnSnippet(9);
      expect(mockClient.get).toHaveBeenCalledWith('/snippets/9/award_emoji');
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnSnippet should create reaction on personal snippet', async () => {
      const mockData = { id: 3, name: 'heart' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnSnippet(9, 'heart');
      expect(mockClient.post).toHaveBeenCalledWith('/snippets/9/award_emoji', {
        name: 'heart',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnSnippet should delete reaction on personal snippet', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnSnippet(9, 3);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/snippets/9/award_emoji/3',
      );
      expect(result).toEqual({ success: true });
    });

    it('listAwardEmojisOnProjectSnippet should fetch project snippet reactions', async () => {
      const mockData = [{ id: 4, name: 'smile' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnProjectSnippet(
        'my-project',
        8,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/snippets/8/award_emoji',
      );
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnProjectSnippet should create reaction on project snippet', async () => {
      const mockData = { id: 4, name: 'smile' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnProjectSnippet(
        'my-project',
        8,
        'smile',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/snippets/8/award_emoji',
        { name: 'smile' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnProjectSnippet should delete reaction on project snippet', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnProjectSnippet(
        'my-project',
        8,
        4,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/snippets/8/award_emoji/4',
      );
      expect(result).toEqual({ success: true });
    });

    it('listAwardEmojisOnIssueNote should fetch issue comment reactions', async () => {
      const mockData = [{ id: 5, name: 'laughing' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnIssueNote(
        'my-project',
        45,
        100,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/notes/100/award_emoji',
      );
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnIssueNote should create reaction on issue comment', async () => {
      const mockData = { id: 5, name: 'laughing' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnIssueNote(
        'my-project',
        45,
        100,
        'laughing',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/notes/100/award_emoji',
        { name: 'laughing' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnIssueNote should delete reaction on issue comment', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnIssueNote(
        'my-project',
        45,
        100,
        5,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/issues/45/notes/100/award_emoji/5',
      );
      expect(result).toEqual({ success: true });
    });

    it('listAwardEmojisOnMergeRequestNote should fetch MR comment reactions', async () => {
      const mockData = [{ id: 6, name: 'thinking' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listAwardEmojisOnMergeRequestNote(
        'my-project',
        12,
        200,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/notes/200/award_emoji',
      );
      expect(result).toEqual(mockData);
    });

    it('createAwardEmojiOnMergeRequestNote should create reaction on MR comment', async () => {
      const mockData = { id: 6, name: 'thinking' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createAwardEmojiOnMergeRequestNote(
        'my-project',
        12,
        200,
        'thinking',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/notes/200/award_emoji',
        { name: 'thinking' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteAwardEmojiOnMergeRequestNote should delete reaction on MR comment', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteAwardEmojiOnMergeRequestNote(
        'my-project',
        12,
        200,
        5,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/notes/200/award_emoji/5',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 23. Pipeline Schedules Endpoints
  // ==========================================
  describe('23. Pipeline Schedules Endpoints', () => {
    it('listProjectPipelineSchedules should list schedules', async () => {
      const mockData = [{ id: 1, description: 'Daily' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectPipelineSchedules(
        'my-project',
        {
          page: 2,
          perPage: 10,
        },
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules',
        {
          params: { page: 2, per_page: 10 },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectPipelineSchedule should retrieve schedule details', async () => {
      const mockData = { id: 1, description: 'Daily' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectPipelineSchedule(
        'my-project',
        1,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectPipelineSchedule should post schedule config', async () => {
      const mockData = { id: 1, ref: 'main' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectPipelineSchedule(
        'my-project',
        {
          description: 'Daily',
          ref: 'main',
          cron: '0 0 * * *',
          cronTimezone: 'UTC',
          active: true,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules',
        {
          description: 'Daily',
          ref: 'main',
          cron: '0 0 * * *',
          cron_timezone: 'UTC',
          active: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectPipelineSchedule should put updated schedule config', async () => {
      const mockData = { id: 1, ref: 'main' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectPipelineSchedule(
        'my-project',
        1,
        {
          description: 'Daily-new',
          ref: 'main',
          cron: '0 1 * * *',
          cronTimezone: 'EST',
          active: false,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules/1',
        {
          description: 'Daily-new',
          ref: 'main',
          cron: '0 1 * * *',
          cron_timezone: 'EST',
          active: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectPipelineSchedule should delete schedule and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectPipelineSchedule(
        'my-project',
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('playProjectPipelineSchedule should trigger manual run of schedule', async () => {
      const mockData = { message: '201 Created' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.playProjectPipelineSchedule(
        'my-project',
        1,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/pipeline_schedules/1/play',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 24. Job Artifacts Endpoints
  // ==========================================
  describe('24. Job Artifacts Endpoints', () => {
    it('downloadJobArtifacts should download zip and return buffer data', async () => {
      const mockBuffer = new ArrayBuffer(8);
      mockClient.get.mockResolvedValueOnce({ data: mockBuffer });
      const result = await GitlabService.downloadJobArtifacts(
        'my-project',
        123,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/jobs/123/artifacts',
        {
          responseType: 'arraybuffer',
        },
      );
      expect(result).toEqual(mockBuffer);
    });

    it('downloadJobArtifactFile should download file and return buffer data', async () => {
      const mockBuffer = new ArrayBuffer(8);
      mockClient.get.mockResolvedValueOnce({ data: mockBuffer });
      const result = await GitlabService.downloadJobArtifactFile(
        'my-project',
        123,
        'docs/index.html',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/jobs/123/artifacts/docs/index.html',
        {
          responseType: 'arraybuffer',
        },
      );
      expect(result).toEqual(mockBuffer);
    });

    it('deleteJobArtifacts should delete job artifacts and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteJobArtifacts('my-project', 123);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/jobs/123/artifacts',
      );
      expect(result).toEqual({ success: true });
    });

    it('keepJobArtifacts should prevent expiration of job artifacts', async () => {
      const mockData = { success: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.keepJobArtifacts('my-project', 123);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/jobs/123/artifacts/keep',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 25. Merge Request Approval Rules Endpoints
  // ==========================================
  describe('25. Merge Request Approval Rules Endpoints', () => {
    it('listMergeRequestApprovalRules should list MR approval rules', async () => {
      const mockData = [{ id: 1, name: 'QA' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequestApprovalRules(
        'my-project',
        5,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/5/approval_rules',
      );
      expect(result).toEqual(mockData);
    });

    it('createMergeRequestApprovalRule should create MR approval rule', async () => {
      const mockData = { id: 1, name: 'QA' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMergeRequestApprovalRule(
        'my-project',
        5,
        {
          name: 'QA',
          approvalsRequired: 2,
          userIds: [10],
          groupIds: [20],
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/5/approval_rules',
        {
          name: 'QA',
          approvals_required: 2,
          user_ids: [10],
          group_ids: [20],
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateMergeRequestApprovalRule should update MR approval rule', async () => {
      const mockData = { id: 1, name: 'QA-new' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateMergeRequestApprovalRule(
        'my-project',
        5,
        1,
        {
          name: 'QA-new',
          approvalsRequired: 3,
          userIds: [11],
          groupIds: [21],
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/5/approval_rules/1',
        {
          name: 'QA-new',
          approvals_required: 3,
          user_ids: [11],
          group_ids: [21],
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteMergeRequestApprovalRule should delete rule and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteMergeRequestApprovalRule(
        'my-project',
        5,
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/5/approval_rules/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('getProjectApprovalSettings should retrieve project approvals settings', async () => {
      const mockData = { approvals_before_merge: 1 };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.getProjectApprovalSettings('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/approvals',
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectApprovalSettings should post updated approvals settings', async () => {
      const mockData = { approvals_before_merge: 2 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectApprovalSettings(
        'my-project',
        {
          approvalsBeforeMerge: 2,
          resetApprovalsOnPush: true,
          disableOverridingApproversPerMergeRequest: true,
          mergeRequestsAuthorApproval: false,
          mergeRequestsDisableCommittersApproval: true,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/approvals',
        {
          approvals_before_merge: 2,
          reset_approvals_on_push: true,
          disable_overriding_approvers_per_merge_request: true,
          merge_requests_author_approval: false,
          merge_requests_disable_committers_approval: true,
        },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 26. Wikis & Wiki Pages Endpoints
  // ==========================================
  describe('26. Wikis & Wiki Pages Endpoints', () => {
    it('listProjectWikis should fetch wiki pages list', async () => {
      const mockData = [{ title: 'Home', slug: 'home' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectWikis('my-project', {
        withContent: true,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/wikis',
        {
          params: { with_content: true },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectWikiPage should retrieve page contents', async () => {
      const mockData = { title: 'Home', content: 'welcome' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectWikiPage(
        'my-project',
        'home',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/wikis/home',
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectWikiPage should post wiki page configuration', async () => {
      const mockData = { title: 'NewPage', slug: 'newpage' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectWikiPage('my-project', {
        title: 'NewPage',
        content: 'content',
        format: 'markdown',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/wikis',
        {
          title: 'NewPage',
          content: 'content',
          format: 'markdown',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectWikiPage should put updated wiki configurations', async () => {
      const mockData = { title: 'Home', slug: 'home' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectWikiPage(
        'my-project',
        'home',
        {
          title: 'Home',
          content: 'new content',
          format: 'rdoc',
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/wikis/home',
        {
          title: 'Home',
          content: 'new content',
          format: 'rdoc',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectWikiPage should delete wiki page and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectWikiPage(
        'my-project',
        'home',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/wikis/home',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 27. Vulnerability State Management Endpoints
  // ==========================================
  describe('27. Vulnerability State Management Endpoints', () => {
    it('getVulnerabilityDetails should fetch vulnerability object', async () => {
      const mockData = { id: 10, title: 'SQL Injection' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getVulnerabilityDetails(
        'my-project',
        10,
      );
      expect(mockClient.get).toHaveBeenCalledWith('/vulnerabilities/10');
      expect(result).toEqual(mockData);
    });

    it('dismissVulnerability should trigger dismiss and post comment', async () => {
      const mockData = { id: 10, state: 'dismissed' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.dismissVulnerability(
        'my-project',
        10,
        'False Positive',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/vulnerabilities/10/dismiss',
        {
          comment: 'False Positive',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('confirmVulnerability should trigger confirm endpoint', async () => {
      const mockData = { id: 10, state: 'confirmed' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.confirmVulnerability('my-project', 10);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/vulnerabilities/10/confirm',
      );
      expect(result).toEqual(mockData);
    });

    it('resolveVulnerability should trigger resolve endpoint', async () => {
      const mockData = { id: 10, state: 'resolved' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.resolveVulnerability('my-project', 10);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/vulnerabilities/10/resolve',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 28. Group & Project Access Requests Endpoints
  // ==========================================
  describe('28. Group & Project Access Requests Endpoints', () => {
    it('listProjectAccessRequests should list requests for a project', async () => {
      const mockData = [{ id: 1, user: {} }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.listProjectAccessRequests('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/access_requests',
      );
      expect(result).toEqual(mockData);
    });

    it('requestProjectAccess should submit a join request', async () => {
      const mockData = { id: 1, state: 'requested' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.requestProjectAccess('my-project');
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/access_requests',
      );
      expect(result).toEqual(mockData);
    });

    it('approveProjectAccessRequest should approve request and set access level', async () => {
      const mockData = { id: 1, access_level: 30 };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.approveProjectAccessRequest(
        'my-project',
        99,
        30,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/access_requests/99/approve',
        {
          access_level: 30,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('denyProjectAccessRequest should delete requested join record', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.denyProjectAccessRequest(
        'my-project',
        99,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/access_requests/99',
      );
      expect(result).toEqual({ success: true });
    });

    it('listGroupAccessRequests should list requests for a group', async () => {
      const mockData = [{ id: 2, user: {} }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupAccessRequests('my-group');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/access_requests',
      );
      expect(result).toEqual(mockData);
    });

    it('requestGroupAccess should submit a group join request', async () => {
      const mockData = { id: 2, state: 'requested' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.requestGroupAccess('my-group');
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/access_requests',
      );
      expect(result).toEqual(mockData);
    });

    it('approveGroupAccessRequest should approve request and set access level', async () => {
      const mockData = { id: 2, access_level: 40 };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.approveGroupAccessRequest(
        'my-group',
        99,
        40,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/my-group/access_requests/99/approve',
        {
          access_level: 40,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('denyGroupAccessRequest should delete requested group join record', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.denyGroupAccessRequest('my-group', 99);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/access_requests/99',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 29. Protected Branches Endpoints
  // ==========================================
  describe('29. Protected Branches Endpoints', () => {
    it('listProtectedBranches should list protected branches for a project', async () => {
      const mockData = [{ name: 'main', push_access_levels: [] }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProtectedBranches('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/protected_branches',
      );
      expect(result).toEqual(mockData);
    });

    it('getProtectedBranch should retrieve details of a protected branch', async () => {
      const mockData = { name: 'main', push_access_levels: [] };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProtectedBranch(
        'my-project',
        'main',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/protected_branches/main',
      );
      expect(result).toEqual(mockData);
    });

    it('protectBranch should submit branch protection configurations', async () => {
      const mockData = { name: 'main', allow_force_push: false };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.protectBranch('my-project', {
        name: 'main',
        pushAccessLevel: 40,
        mergeAccessLevel: 40,
        unprotectAccessLevel: 40,
        allowForcePush: false,
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/protected_branches',
        {
          name: 'main',
          push_access_level: 40,
          merge_access_level: 40,
          unprotect_access_level: 40,
          allow_force_push: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProtectedBranch should patch branch protection settings', async () => {
      const mockData = { name: 'main', allow_force_push: true };
      mockClient.patch.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProtectedBranch(
        'my-project',
        'main',
        {
          pushAccessLevel: 40,
          mergeAccessLevel: 40,
          unprotectAccessLevel: 40,
          allowForcePush: true,
        },
      );
      expect(mockClient.patch).toHaveBeenCalledWith(
        '/projects/my-project/protected_branches/main',
        {
          push_access_level: 40,
          merge_access_level: 40,
          unprotect_access_level: 40,
          allow_force_push: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('unprotectBranch should delete branch protection and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.unprotectBranch('my-project', 'main');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/protected_branches/main',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 30. Deploy Keys Endpoints
  // ==========================================
  describe('30. Deploy Keys Endpoints', () => {
    it('listProjectDeployKeys should fetch deploy keys list', async () => {
      const mockData = [{ id: 1, title: 'Key' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectDeployKeys('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys',
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectDeployKey should fetch details of a deploy key', async () => {
      const mockData = { id: 1, title: 'Key', key: 'ssh-rsa...' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectDeployKey('my-project', 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys/1',
      );
      expect(result).toEqual(mockData);
    });

    it('addProjectDeployKey should post deploy key configuration', async () => {
      const mockData = { id: 1, title: 'Key', can_push: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addProjectDeployKey('my-project', {
        title: 'Key',
        key: 'ssh-rsa...',
        canPush: true,
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys',
        {
          title: 'Key',
          key: 'ssh-rsa...',
          can_push: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('enableProjectDeployKey should trigger enable endpoint', async () => {
      const mockData = { id: 1, title: 'Key', enabled: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.enableProjectDeployKey(
        'my-project',
        1,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys/1/enable',
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectDeployKey should put updated deploy key configurations', async () => {
      const mockData = { id: 1, title: 'Updated Key', can_push: false };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectDeployKey(
        'my-project',
        1,
        {
          title: 'Updated Key',
          canPush: false,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys/1',
        {
          title: 'Updated Key',
          can_push: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectDeployKey should delete deploy key and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectDeployKey(
        'my-project',
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/deploy_keys/1',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 31. Labels Endpoints
  // ==========================================
  describe('31. Labels Endpoints', () => {
    it('listProjectLabels should fetch project labels list', async () => {
      const mockData = [{ id: 1, name: 'bug' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectLabels('my-project', {
        search: 'bug',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/labels',
        {
          params: {
            page: 1,
            per_page: 30,
            with_counts: undefined,
            include_ancestor_groups: undefined,
            search: 'bug',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectLabel should post project label details', async () => {
      const mockData = { id: 1, name: 'bug', color: '#ff0000' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectLabel('my-project', {
        name: 'bug',
        color: '#ff0000',
        description: 'a bug',
        priority: 1,
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/labels',
        {
          name: 'bug',
          color: '#ff0000',
          description: 'a bug',
          priority: 1,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectLabel should put updated project label configurations', async () => {
      const mockData = { id: 1, name: 'critical', color: '#ff0000' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectLabel(
        'my-project',
        'bug',
        {
          newName: 'critical',
          color: '#ff0000',
          description: 'critical issue',
          priority: 2,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/labels/bug',
        {
          new_name: 'critical',
          color: '#ff0000',
          description: 'critical issue',
          priority: 2,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectLabel should delete project label and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectLabel(
        'my-project',
        'bug',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/labels/bug',
      );
      expect(result).toEqual({ success: true });
    });

    it('listGroupLabels should fetch group labels list', async () => {
      const mockData = [{ id: 2, name: 'feature' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupLabels('my-group', {
        onlyGroupLabels: true,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/labels', {
        params: {
          page: 1,
          per_page: 30,
          with_counts: undefined,
          only_group_labels: true,
          search: undefined,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('createGroupLabel should post group label details', async () => {
      const mockData = { id: 2, name: 'feature', color: '#00ff00' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupLabel('my-group', {
        name: 'feature',
        color: '#00ff00',
        description: 'a feature',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/my-group/labels', {
        name: 'feature',
        color: '#00ff00',
        description: 'a feature',
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupLabel should put updated group label configurations', async () => {
      const mockData = { id: 2, name: 'enhancement', color: '#00ff00' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupLabel(
        'my-group',
        'feature',
        {
          newName: 'enhancement',
          color: '#00ff00',
          description: 'enhancement feature',
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/my-group/labels/feature',
        {
          new_name: 'enhancement',
          color: '#00ff00',
          description: 'enhancement feature',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupLabel should delete group label and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupLabel(
        'my-group',
        'feature',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/labels/feature',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 32. Todos Endpoints
  // ==========================================
  describe('32. Todos Endpoints', () => {
    it('listUserTodos should fetch user todos list', async () => {
      const mockData = [{ id: 1, action_name: 'assigned' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listUserTodos({ state: 'pending' });
      expect(mockClient.get).toHaveBeenCalledWith('/todos', {
        params: {
          page: 1,
          per_page: 30,
          action: undefined,
          author_id: undefined,
          project_id: undefined,
          group_id: undefined,
          state: 'pending',
          type: undefined,
        },
      });
      expect(result).toEqual(mockData);
    });

    it('createTodoOnIssue should post todo for an issue', async () => {
      const mockData = { id: 1, state: 'pending' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createTodoOnIssue('my-project', 5);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/todo',
      );
      expect(result).toEqual(mockData);
    });

    it('createTodoOnMergeRequest should post todo for an MR', async () => {
      const mockData = { id: 2, state: 'pending' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createTodoOnMergeRequest(
        'my-project',
        12,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/todo',
      );
      expect(result).toEqual(mockData);
    });

    it('markTodoAsDone should trigger mark as done for a specific todo', async () => {
      const mockData = { id: 1, state: 'done' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.markTodoAsDone(1);
      expect(mockClient.post).toHaveBeenCalledWith('/todos/1/mark_as_done');
      expect(result).toEqual(mockData);
    });

    it('markAllTodosAsDone should trigger mark all as done and return success', async () => {
      mockClient.post.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.markAllTodosAsDone();
      expect(mockClient.post).toHaveBeenCalledWith('/todos/mark_as_done');
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 33. Project Integrations Endpoints
  // ==========================================
  describe('33. Project Integrations Endpoints', () => {
    it('listProjectIntegrations should fetch integrations list', async () => {
      const mockData = [{ slug: 'jira', active: true }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectIntegrations('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/integrations',
      );
      expect(result).toEqual(mockData);
    });

    it('getProjectIntegration should retrieve settings of a specific integration', async () => {
      const mockData = { slug: 'jira', properties: {} };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectIntegration(
        'my-project',
        'jira',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/integrations/jira',
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectIntegration should put integration configurations', async () => {
      const mockData = { slug: 'jira', active: true };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectIntegration(
        'my-project',
        'jira',
        {
          url: 'https://jira.example.com',
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/integrations/jira',
        {
          url: 'https://jira.example.com',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectIntegration should delete integration and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectIntegration(
        'my-project',
        'jira',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/integrations/jira',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 34. Repository Extras Endpoints
  // ==========================================
  describe('34. Repository Extras Endpoints', () => {
    it('getFileBlame should fetch file blame list', async () => {
      const mockData = [{ commit: {}, lines: [] }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getFileBlame(
        'my-project',
        'src/app.js',
        { ref: 'dev' },
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/repository/files/src%2Fapp.js/blame',
        {
          params: {
            ref: 'dev',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('downloadRepositoryArchive should fetch repository archive data', async () => {
      const mockData = new ArrayBuffer(8);
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.downloadRepositoryArchive(
        'my-project',
        { format: 'tar.gz', sha: 'abcd' },
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/repository/archive',
        {
          responseType: 'arraybuffer',
          params: {
            sha: 'abcd',
            format: 'tar.gz',
          },
        },
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 35. Group Webhooks Endpoints
  // ==========================================
  describe('35. Group Webhooks Endpoints', () => {
    it('listGroupHooks should fetch webhooks list', async () => {
      const mockData = [{ id: 1, url: 'https://example.com/hook' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupHooks('my-group');
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/hooks');
      expect(result).toEqual(mockData);
    });

    it('getGroupHook should retrieve specific webhook configuration', async () => {
      const mockData = { id: 1, url: 'https://example.com/hook' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupHook('my-group', 1);
      expect(mockClient.get).toHaveBeenCalledWith('/groups/my-group/hooks/1');
      expect(result).toEqual(mockData);
    });

    it('addGroupHook should post webhook configuration', async () => {
      const mockData = { id: 1, url: 'https://example.com/hook' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addGroupHook('my-group', {
        url: 'https://example.com/hook',
        pushEvents: true,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/my-group/hooks', {
        url: 'https://example.com/hook',
        push_events: true,
        issues_events: undefined,
        confidential_issues_events: undefined,
        merge_requests_events: undefined,
        tag_push_events: undefined,
        note_events: undefined,
        confidential_note_events: undefined,
        job_events: undefined,
        pipeline_events: undefined,
        wiki_page_events: undefined,
        token: undefined,
        enable_ssl_verification: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupHook should put updated webhook configuration', async () => {
      const mockData = {
        id: 1,
        url: 'https://example.com/hook',
        push_events: false,
      };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupHook('my-group', 1, {
        url: 'https://example.com/hook',
        pushEvents: false,
      });
      expect(mockClient.put).toHaveBeenCalledWith('/groups/my-group/hooks/1', {
        url: 'https://example.com/hook',
        push_events: false,
        issues_events: undefined,
        confidential_issues_events: undefined,
        merge_requests_events: undefined,
        tag_push_events: undefined,
        note_events: undefined,
        confidential_note_events: undefined,
        job_events: undefined,
        pipeline_events: undefined,
        wiki_page_events: undefined,
        token: undefined,
        enable_ssl_verification: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGroupHook should delete webhook and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupHook('my-group', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/hooks/1',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 36. Issue Links Endpoints
  // ==========================================
  describe('36. Issue Links Endpoints', () => {
    it('listIssueLinks should fetch linked issues list', async () => {
      const mockData = [{ id: 1, issue_link_id: 12 }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssueLinks('my-project', 5);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/links',
      );
      expect(result).toEqual(mockData);
    });

    it('createIssueLink should post issue link configuration', async () => {
      const mockData = { issue_link_id: 12 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createIssueLink(
        'my-project',
        5,
        'target-project',
        10,
        'blocks',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/links',
        {
          target_project_id: 'target-project',
          target_issue_iid: 10,
          link_type: 'blocks',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteIssueLink should delete issue link and return success', async () => {
      const mockData = { issue_link_id: 12 };
      mockClient.delete.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.deleteIssueLink('my-project', 5, 12);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/links/12',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 37. Time Tracking Endpoints
  // ==========================================
  describe('37. Time Tracking Endpoints', () => {
    it('addIssueTimeSpent should post spent time log', async () => {
      const mockData = { time_estimate: 0, total_time_spent: 3600 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addIssueTimeSpent(
        'my-project',
        5,
        '1h',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/add_spent_time',
        {
          duration: '1h',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('addMergeRequestTimeSpent should post spent time log', async () => {
      const mockData = { time_estimate: 0, total_time_spent: 7200 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addMergeRequestTimeSpent(
        'my-project',
        12,
        '2h',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/add_spent_time',
        {
          duration: '2h',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getIssueTimeTracking should retrieve stats', async () => {
      const mockData = { time_estimate: 3600, total_time_spent: 1800 };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getIssueTimeTracking('my-project', 5);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/time_stats',
      );
      expect(result).toEqual(mockData);
    });

    it('getMergeRequestTimeTracking should retrieve stats', async () => {
      const mockData = { time_estimate: 7200, total_time_spent: 3600 };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getMergeRequestTimeTracking(
        'my-project',
        12,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/time_stats',
      );
      expect(result).toEqual(mockData);
    });

    it('resetIssueTimeTracking should post reset spent time', async () => {
      const mockData = { total_time_spent: 0 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.resetIssueTimeTracking(
        'my-project',
        5,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/5/reset_spent_time',
      );
      expect(result).toEqual(mockData);
    });

    it('resetMergeRequestTimeTracking should post reset spent time', async () => {
      const mockData = { total_time_spent: 0 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.resetMergeRequestTimeTracking(
        'my-project',
        12,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/12/reset_spent_time',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 38. Group Iterations Endpoints
  // ==========================================
  describe('38. Group Iterations Endpoints', () => {
    it('listGroupIterations should fetch group iterations list', async () => {
      const mockData = [{ id: 1, title: 'Sprint 1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupIterations('my-group');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/iterations',
      );
      expect(result).toEqual(mockData);
    });

    it('listProjectIterations should fetch project iterations list', async () => {
      const mockData = [{ id: 1, title: 'Sprint 1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectIterations('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/iterations',
      );
      expect(result).toEqual(mockData);
    });

    it('createGroupIteration should post iteration config', async () => {
      const mockData = { id: 1, title: 'Sprint 1' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupIteration('my-group', {
        title: 'Sprint 1',
        description: 'First sprint',
        startDate: '2026-06-01',
        dueDate: '2026-06-14',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/iterations',
        {
          title: 'Sprint 1',
          description: 'First sprint',
          start_date: '2026-06-01',
          due_date: '2026-06-14',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateGroupIteration should put updated configurations', async () => {
      const mockData = { id: 1, title: 'Sprint 1 (Updated)' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupIteration('my-group', 1, {
        title: 'Sprint 1 (Updated)',
        stateEvent: 'close',
      });
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/my-group/iterations/1',
        {
          title: 'Sprint 1 (Updated)',
          description: undefined,
          start_date: undefined,
          due_date: undefined,
          state_event: 'close',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupIteration should delete iteration and return success', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupIteration('my-group', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/iterations/1',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 39. Release Links Endpoints
  // ==========================================
  describe('39. Release Links Endpoints', () => {
    it('listReleaseLinks should fetch release assets links', async () => {
      const mockData = [{ id: 1, name: 'binary' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listReleaseLinks(
        'my-project',
        'v1.0.0',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/releases/v1.0.0/assets/links',
      );
      expect(result).toEqual(mockData);
    });

    it('getReleaseLink should retrieve link details', async () => {
      const mockData = { id: 1, name: 'binary', url: 'https://example.com' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getReleaseLink(
        'my-project',
        'v1.0.0',
        1,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/releases/v1.0.0/assets/links/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createReleaseLink should post link configuration', async () => {
      const mockData = { id: 1, name: 'binary' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createReleaseLink(
        'my-project',
        'v1.0.0',
        {
          name: 'binary',
          url: 'https://example.com',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/releases/v1.0.0/assets/links',
        {
          name: 'binary',
          url: 'https://example.com',
          direct_asset_path: undefined,
          link_type: undefined,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateReleaseLink should put updated configurations', async () => {
      const mockData = { id: 1, name: 'binary-v2' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateReleaseLink(
        'my-project',
        'v1.0.0',
        1,
        {
          name: 'binary-v2',
          url: 'https://example.com/v2',
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/releases/v1.0.0/assets/links/1',
        {
          name: 'binary-v2',
          url: 'https://example.com/v2',
          direct_asset_path: undefined,
          link_type: undefined,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteReleaseLink should delete release link', async () => {
      const mockData = { id: 1 };
      mockClient.delete.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.deleteReleaseLink(
        'my-project',
        'v1.0.0',
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/releases/v1.0.0/assets/links/1',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 40. Repository File Locks Endpoints
  // ==========================================
  describe('40. Repository File Locks Endpoints', () => {
    it('listProjectFileLocks should fetch file locks list', async () => {
      const mockData = [{ id: 1, path: 'src/main.js' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectFileLocks('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/infrastructure/file_locks',
      );
      expect(result).toEqual(mockData);
    });

    it('lockProjectFile should post path to lock file', async () => {
      const mockData = { id: 1, path: 'src/main.js' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.lockProjectFile(
        'my-project',
        'src/main.js',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/infrastructure/file_locks',
        {
          path: 'src/main.js',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('unlockProjectFile should delete file lock', async () => {
      const mockData = { id: 1, path: 'src/main.js' };
      mockClient.delete.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.unlockProjectFile('my-project', 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/infrastructure/file_locks/1',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 41. Phase 7 Endpoints
  // ==========================================
  describe('41. Phase 7 Endpoints', () => {
    // 1. Repository Traversal (Trees)
    it('listRepositoryTree should retrieve repository tree with parameters', async () => {
      const mockData = [{ id: '1', name: 'src', type: 'tree' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listRepositoryTree('my-project', {
        path: 'src',
        ref: 'dev',
        recursive: true,
        page: 2,
        perPage: 10,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/repository/tree',
        {
          params: {
            path: 'src',
            ref: 'dev',
            recursive: true,
            page: 2,
            per_page: 10,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    // 2. Threaded Discussions - Issues
    it('listIssueDiscussions should get discussions list for issue', async () => {
      const mockData = [{ id: 'd1', notes: [] }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssueDiscussions('my-project', 42);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/discussions',
      );
      expect(result).toEqual(mockData);
    });

    it('getIssueDiscussion should fetch issue discussion details', async () => {
      const mockData = { id: 'd1', notes: [] };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getIssueDiscussion(
        'my-project',
        42,
        'd1',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/discussions/d1',
      );
      expect(result).toEqual(mockData);
    });

    it('createIssueDiscussion should start an issue thread', async () => {
      const mockData = { id: 'd1', notes: [] };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createIssueDiscussion(
        'my-project',
        42,
        'Thread body',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/discussions',
        { body: 'Thread body' },
      );
      expect(result).toEqual(mockData);
    });

    it('resolveIssueDiscussion should put resolve/unresolve state', async () => {
      const mockData = { id: 'd1', resolved: true };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.resolveIssueDiscussion(
        'my-project',
        42,
        'd1',
        true,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/discussions/d1',
        { resolved: true },
      );
      expect(result).toEqual(mockData);
    });

    // Threaded Discussions - Merge Requests
    it('listMergeRequestDiscussions should get discussions list for MR', async () => {
      const mockData = [{ id: 'd2', notes: [] }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequestDiscussions(
        'my-project',
        101,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions',
      );
      expect(result).toEqual(mockData);
    });

    it('getMergeRequestDiscussion should fetch MR discussion details', async () => {
      const mockData = { id: 'd2', notes: [] };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getMergeRequestDiscussion(
        'my-project',
        101,
        'd2',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions/d2',
      );
      expect(result).toEqual(mockData);
    });

    it('createMergeRequestDiscussion should start an MR thread', async () => {
      const mockData = { id: 'd2', notes: [] };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMergeRequestDiscussion(
        'my-project',
        101,
        'MR Thread body',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions',
        { body: 'MR Thread body' },
      );
      expect(result).toEqual(mockData);
    });

    it('resolveMergeRequestDiscussion should put resolve/unresolve state for MR', async () => {
      const mockData = { id: 'd2', resolved: false };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.resolveMergeRequestDiscussion(
        'my-project',
        101,
        'd2',
        false,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions/d2',
        { resolved: false },
      );
      expect(result).toEqual(mockData);
    });

    it('addMergeRequestDiscussionNote should reply to MR discussion', async () => {
      const mockData = { id: 501, body: 'Reply' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.addMergeRequestDiscussionNote(
        'my-project',
        101,
        'd2',
        'Reply content',
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions/d2/notes',
        { body: 'Reply content' },
      );
      expect(result).toEqual(mockData);
    });

    it('updateMergeRequestDiscussionNote should update replies', async () => {
      const mockData = { id: 501, body: 'Updated Reply' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateMergeRequestDiscussionNote(
        'my-project',
        101,
        'd2',
        501,
        'Updated Reply',
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions/d2/notes/501',
        { body: 'Updated Reply' },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteMergeRequestDiscussionNote should call delete endpoint', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteMergeRequestDiscussionNote(
        'my-project',
        101,
        'd2',
        501,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/discussions/d2/notes/501',
      );
      expect(result).toEqual({ success: true });
    });

    // 3. Project & Group Share Links
    it('shareProjectWithGroup should post share configuration', async () => {
      const mockData = { id: 1, project_id: 123, group_id: 456 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.shareProjectWithGroup('my-project', {
        groupId: 456,
        groupAccess: 30,
        expiresAt: '2026-12-31',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/share',
        {
          group_id: 456,
          group_access: 30,
          expires_at: '2026-12-31',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('unshareProjectFromGroup should delete project share link', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.unshareProjectFromGroup(
        'my-project',
        456,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/share/456',
      );
      expect(result).toEqual({ success: true });
    });

    it('shareGroupWithGroup should post group sharing configurations', async () => {
      const mockData = { id: 1, group_id: 123, shared_group_id: 789 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.shareGroupWithGroup('my-group', {
        sharedGroupId: 789,
        sharedGroupAccess: 20,
        expiresAt: '2026-12-31',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/my-group/share', {
        shared_group_id: 789,
        shared_group_access: 20,
        expires_at: '2026-12-31',
      });
      expect(result).toEqual(mockData);
    });

    it('unshareGroupFromGroup should delete group share link', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.unshareGroupFromGroup('my-group', 789);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/share/789',
      );
      expect(result).toEqual({ success: true });
    });

    // 4. Vulnerability Exports
    it('createVulnerabilityExport should trigger vulnerability report export', async () => {
      const mockData = { id: 10, status: 'created' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createVulnerabilityExport({
        projectId: 123,
        format: 'csv',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/vulnerability_exports',
        {},
        {
          params: {
            project_id: 123,
            group_id: undefined,
            format: 'csv',
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getVulnerabilityExportStatus should check export job status', async () => {
      const mockData = { id: 10, status: 'finished' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getVulnerabilityExportStatus(10);
      expect(mockClient.get).toHaveBeenCalledWith('/vulnerability_exports/10');
      expect(result).toEqual(mockData);
    });

    it('downloadVulnerabilityExport should fetch csv file data', async () => {
      const mockData = 'vulnerability1,vulnerability2';
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.downloadVulnerabilityExport(10);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/vulnerability_exports/10/download',
      );
      expect(result).toEqual(mockData);
    });

    // 5. Instance Metadata
    it('getGitlabVersion should retrieve system version details', async () => {
      const mockData = { version: '15.0.0', revision: 'abcdef' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGitlabVersion();
      expect(mockClient.get).toHaveBeenCalledWith('/version');
      expect(result).toEqual(mockData);
    });

    it('getGitlabMetadata should retrieve system metadata flags', async () => {
      const mockData = { kas: { enabled: true } };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGitlabMetadata();
      expect(mockClient.get).toHaveBeenCalledWith('/metadata');
      expect(result).toEqual(mockData);
    });

    // 6. Resource State Events
    it('listIssueResourceLabelEvents should fetch label audit events', async () => {
      const mockData = [{ id: 1, action: 'add' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssueResourceLabelEvents(
        'my-project',
        42,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/resource_label_events',
      );
      expect(result).toEqual(mockData);
    });

    it('listMergeRequestResourceLabelEvents should fetch MR label audit events', async () => {
      const mockData = [{ id: 2, action: 'remove' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequestResourceLabelEvents(
        'my-project',
        101,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/resource_label_events',
      );
      expect(result).toEqual(mockData);
    });

    it('listIssueResourceMilestoneEvents should fetch milestone audit events', async () => {
      const mockData = [{ id: 3, action: 'add' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listIssueResourceMilestoneEvents(
        'my-project',
        42,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/issues/42/resource_milestone_events',
      );
      expect(result).toEqual(mockData);
    });

    it('listMergeRequestResourceMilestoneEvents should fetch MR milestone audit events', async () => {
      const mockData = [{ id: 4, action: 'remove' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.listMergeRequestResourceMilestoneEvents(
          'my-project',
          101,
        );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/merge_requests/101/resource_milestone_events',
      );
      expect(result).toEqual(mockData);
    });
  });

  // ==========================================
  // 42. Phase 8: Compliance & Security Endpoints
  // ==========================================
  describe('42. Phase 8: Compliance & Security Endpoints', () => {
    // 1. Dependency List
    it('listProjectDependencies should retrieve project dependencies list', async () => {
      const mockData = [{ name: 'lodash', version: '4.17.21' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectDependencies('my-project', {
        page: 2,
        perPage: 15,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/dependencies',
        {
          params: {
            page: 2,
            per_page: 15,
          },
        },
      );
      expect(result).toEqual(mockData);
    });

    // 2. Compliance Frameworks
    it('listGroupComplianceFrameworks should fetch compliance frameworks for group', async () => {
      const mockData = [{ id: 1, name: 'SOC2' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.listGroupComplianceFrameworks('my-group');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/compliance_frameworks',
      );
      expect(result).toEqual(mockData);
    });

    it('getGroupComplianceFramework should fetch specific framework details', async () => {
      const mockData = { id: 1, name: 'SOC2' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupComplianceFramework(
        'my-group',
        1,
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/compliance_frameworks/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createGroupComplianceFramework should post configuration', async () => {
      const mockData = { id: 1, name: 'SOC2' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupComplianceFramework(
        'my-group',
        {
          name: 'SOC2',
          description: 'desc',
          color: '#ff0000',
          default: true,
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/compliance_frameworks',
        {
          name: 'SOC2',
          description: 'desc',
          color: '#ff0000',
          default: true,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateGroupComplianceFramework should put updated configurations', async () => {
      const mockData = { id: 1, name: 'SOC2-v2' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupComplianceFramework(
        'my-group',
        1,
        {
          name: 'SOC2-v2',
          description: 'new desc',
          color: '#00ff00',
          default: false,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/my-group/compliance_frameworks/1',
        {
          name: 'SOC2-v2',
          description: 'new desc',
          color: '#00ff00',
          default: false,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupComplianceFramework should delete group framework', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupComplianceFramework(
        'my-group',
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/compliance_frameworks/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('getProjectComplianceFramework should fetch framework settings for project', async () => {
      const mockData = [{ id: 1, name: 'SOC2' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.getProjectComplianceFramework('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/compliance_frameworks',
      );
      expect(result).toEqual(mockData);
    });

    // 3. License Compliance
    it('listProjectManagedLicenses should fetch managed licenses for project', async () => {
      const mockData = [{ id: 1, name: 'MIT', approval_status: 'approved' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.listProjectManagedLicenses('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/managed_licenses',
      );
      expect(result).toEqual(mockData);
    });

    it('createProjectManagedLicense should post license configuration', async () => {
      const mockData = { id: 1, name: 'GPL', approval_status: 'blacklisted' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectManagedLicense(
        'my-project',
        {
          name: 'GPL',
          approvalStatus: 'blacklisted',
        },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/managed_licenses',
        {
          name: 'GPL',
          approval_status: 'blacklisted',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProjectManagedLicense should patch updated approval status', async () => {
      const mockData = { id: 1, approval_status: 'approved' };
      mockClient.patch.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectManagedLicense(
        'my-project',
        1,
        {
          approvalStatus: 'approved',
        },
      );
      expect(mockClient.patch).toHaveBeenCalledWith(
        '/projects/my-project/managed_licenses/1',
        {
          approval_status: 'approved',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteProjectManagedLicense should delete managed license', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectManagedLicense(
        'my-project',
        1,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/managed_licenses/1',
      );
      expect(result).toEqual({ success: true });
    });

    // 4. Protected Environments
    it('listProtectedEnvironments should fetch protected environments list', async () => {
      const mockData = [{ environment: 'production' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result =
        await GitlabService.listProtectedEnvironments('my-project');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/protected_environments',
      );
      expect(result).toEqual(mockData);
    });

    it('getProtectedEnvironment should fetch environment protection settings', async () => {
      const mockData = { environment: 'production', deploy_access_levels: [] };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProtectedEnvironment(
        'my-project',
        'production',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/my-project/protected_environments/production',
      );
      expect(result).toEqual(mockData);
    });

    it('protectEnvironment should post protect environment configuration', async () => {
      const mockData = { environment: 'production' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.protectEnvironment('my-project', {
        name: 'production',
        deployAccessLevels: [{ access_level: 40 }],
        requiredApprovalCount: 2,
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/my-project/protected_environments',
        {
          name: 'production',
          deploy_access_levels: [{ access_level: 40 }],
          required_approval_count: 2,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateProtectedEnvironment should put updated protection parameters', async () => {
      const mockData = { environment: 'production' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProtectedEnvironment(
        'my-project',
        'production',
        {
          deployAccessLevels: [{ access_level: 30 }],
          requiredApprovalCount: 1,
        },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/my-project/protected_environments/production',
        {
          deploy_access_levels: [{ access_level: 30 }],
          required_approval_count: 1,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('unprotectEnvironment should delete protected environment configuration', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.unprotectEnvironment(
        'my-project',
        'production',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/my-project/protected_environments/production',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 43. Phase 9: SAML, SCIM & Tokens Endpoints
  // ==========================================
  describe('43. Phase 9: SAML, SCIM & Tokens Endpoints', () => {
    // 1. SAML Group Links
    it('listGroupSamlGroupLinks should fetch SAML group links list', async () => {
      const mockData = [{ saml_group_name: 'SAML-Group-1', access_level: 30 }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupSamlGroupLinks('my-group');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/saml_group_links',
      );
      expect(result).toEqual(mockData);
    });

    it('getGroupSamlGroupLink should fetch specific SAML group link details', async () => {
      const mockData = { saml_group_name: 'SAML-Group-1', access_level: 30 };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupSamlGroupLink(
        'my-group',
        'SAML-Group-1',
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/saml_group_links/SAML-Group-1',
      );
      expect(result).toEqual(mockData);
    });

    it('createGroupSamlGroupLink should post SAML group link configuration', async () => {
      const mockData = { saml_group_name: 'SAML-Group-1', access_level: 30 };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupSamlGroupLink('my-group', {
        samlGroupName: 'SAML-Group-1',
        accessLevel: 30,
        memberRoleId: 5,
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/saml_group_links',
        {
          saml_group_name: 'SAML-Group-1',
          access_level: 30,
          member_role_id: 5,
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupSamlGroupLink should delete SAML group link', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupSamlGroupLink(
        'my-group',
        'SAML-Group-1',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/saml_group_links/SAML-Group-1',
      );
      expect(result).toEqual({ success: true });
    });

    // 2. User Custom Attributes
    it('listUserCustomAttributes should fetch custom attributes for user', async () => {
      const mockData = [{ key: 'attr1', value: 'val1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listUserCustomAttributes(123);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/users/123/custom_attributes',
      );
      expect(result).toEqual(mockData);
    });

    it('getUserCustomAttribute should fetch specific custom attribute details', async () => {
      const mockData = { key: 'attr1', value: 'val1' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getUserCustomAttribute(123, 'attr1');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/users/123/custom_attributes/attr1',
      );
      expect(result).toEqual(mockData);
    });

    it('setUserCustomAttribute should put custom attribute configuration', async () => {
      const mockData = { key: 'attr1', value: 'val1' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.setUserCustomAttribute(
        123,
        'attr1',
        'val1',
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/users/123/custom_attributes/attr1',
        {
          value: 'val1',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteUserCustomAttribute should delete custom attribute', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteUserCustomAttribute(
        123,
        'attr1',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/users/123/custom_attributes/attr1',
      );
      expect(result).toEqual({ success: true });
    });

    // 3. User Impersonation Tokens
    it('listUserImpersonationTokens should fetch user impersonation tokens list', async () => {
      const mockData = [{ id: 1, name: 'token1', active: true }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listUserImpersonationTokens(123, {
        state: 'active',
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/users/123/impersonation_tokens',
        {
          params: { state: 'active' },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('getUserImpersonationToken should fetch specific impersonation token details', async () => {
      const mockData = { id: 1, name: 'token1', active: true };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getUserImpersonationToken(123, 1);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/users/123/impersonation_tokens/1',
      );
      expect(result).toEqual(mockData);
    });

    it('createUserImpersonationToken should post impersonation token configuration', async () => {
      const mockData = { id: 1, name: 'token1', token: 'token-secret' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createUserImpersonationToken(123, {
        name: 'token1',
        scopes: ['api'],
        expiresAt: '2026-12-31',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/users/123/impersonation_tokens',
        {
          name: 'token1',
          scopes: ['api'],
          expires_at: '2026-12-31',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('revokeUserImpersonationToken should revoke impersonation token', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.revokeUserImpersonationToken(123, 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/users/123/impersonation_tokens/1',
      );
      expect(result).toEqual({ success: true });
    });

    // 4. SCIM Group Provisioning
    it('listGroupScimUsers should fetch group SCIM users list', async () => {
      const mockData = [{ id: 'scim-1', userName: 'user1' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupScimUsers('my-group');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/scim/v2/users',
      );
      expect(result).toEqual(mockData);
    });

    it('getGroupScimUser should fetch specific group SCIM user details', async () => {
      const mockData = { id: 'scim-1', userName: 'user1' };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupScimUser('my-group', 'scim-1');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/groups/my-group/scim/v2/users/scim-1',
      );
      expect(result).toEqual(mockData);
    });

    it('createGroupScimUser should post group SCIM user configuration', async () => {
      const mockData = { id: 'scim-1', userName: 'user1' };
      const scimBody = { userName: 'user1', emails: [{ value: 'u1@ex.com' }] };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupScimUser(
        'my-group',
        scimBody,
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/groups/my-group/scim/v2/users',
        scimBody,
      );
      expect(result).toEqual(mockData);
    });

    it('updateGroupScimUser should put group SCIM user update', async () => {
      const mockData = { id: 'scim-1', userName: 'user1-updated' };
      const scimBody = { userName: 'user1-updated', active: false };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupScimUser(
        'my-group',
        'scim-1',
        scimBody,
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/groups/my-group/scim/v2/users/scim-1',
        scimBody,
      );
      expect(result).toEqual(mockData);
    });

    it('deleteGroupScimUser should delete group SCIM user', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupScimUser(
        'my-group',
        'scim-1',
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/groups/my-group/scim/v2/users/scim-1',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==========================================
  // 44. Phase 10: Commits, Forks, Push Rules, MR Draft Notes & Invitations
  // ==========================================
  describe('44. Phase 10: Commits, Forks, Push Rules, MR Draft Notes & Invitations', () => {
    // 1. Commit Comments
    it('listCommitComments should fetch commit comments', async () => {
      const mockData = [{ id: 1, note: 'Nice commit' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listCommitComments('123', 'sha123');
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/repository/commits/sha123/comments',
      );
      expect(result).toEqual(mockData);
    });

    it('createCommitComment should post commit comment with object structure', async () => {
      const mockData = { id: 1, note: 'Nice' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createCommitComment('123', 'sha123', {
        note: 'Nice',
        path: 'file.txt',
        line: 5,
        lineType: 'new',
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/commits/sha123/comments',
        {
          note: 'Nice',
          path: 'file.txt',
          line: 5,
          line_type: 'new',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('createCommitComment should post commit comment with legacy arguments', async () => {
      const mockData = { id: 1, note: 'Nice legacy' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createCommitComment(
        '123',
        'sha123',
        'Nice legacy',
        { path: 'file.txt', line: 5, lineType: 'new' },
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/repository/commits/sha123/comments',
        {
          note: 'Nice legacy',
          path: 'file.txt',
          line: 5,
          line_type: 'new',
        },
      );
      expect(result).toEqual(mockData);
    });

    // 2. Project Forks
    it('listProjectForks should retrieve forks list', async () => {
      const mockData = [{ id: 456, name: 'forked-project' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectForks('123');
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/forks');
      expect(result).toEqual(mockData);
    });

    it('createProjectFork should post fork configuration', async () => {
      const mockData = { id: 456, name: 'forked-project' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectFork('123', {
        namespacePath: 'my-namespace',
        name: 'forked-project',
        path: 'forked-path',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/forks', {
        namespace_path: 'my-namespace',
        name: 'forked-project',
        path: 'forked-path',
      });
      expect(result).toEqual(mockData);
    });

    // 3. Project & Group Push Rules
    it('getProjectPushRules should fetch project push rules', async () => {
      const mockData = { id: 1, prevent_secrets: true };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getProjectPushRules('123');
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/push_rule');
      expect(result).toEqual(mockData);
    });

    it('createProjectPushRules should post project push rules configurations', async () => {
      const mockData = { id: 1, prevent_secrets: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createProjectPushRules('123', {
        preventSecrets: true,
        denyDeleteTag: false,
        memberCheck: true,
        commitMessageRegex: '.*',
        commitMessageNegativeRegex: 'bad',
        branchNameRegex: 'main',
        authorEmailRegex: '@ex.com',
        fileNameRegex: '.*',
        maxFileSize: 10,
        commitCommitterCheck: true,
        commitCommitterNameCheck: true,
        rejectUnsignedCommits: true,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/push_rule', {
        prevent_secrets: true,
        deny_delete_tag: false,
        member_check: true,
        commit_message_regex: '.*',
        commit_message_negative_regex: 'bad',
        branch_name_regex: 'main',
        author_email_regex: '@ex.com',
        file_name_regex: '.*',
        max_file_size: 10,
        commit_committer_check: true,
        commit_committer_name_check: true,
        reject_unsigned_commits: true,
      });
      expect(result).toEqual(mockData);
    });

    it('updateProjectPushRules should put updated project push rules', async () => {
      const mockData = { id: 1, prevent_secrets: false };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateProjectPushRules('123', {
        preventSecrets: false,
      });
      expect(mockClient.put).toHaveBeenCalledWith('/projects/123/push_rule', {
        prevent_secrets: false,
      });
      expect(result).toEqual(mockData);
    });

    it('deleteProjectPushRules should delete project push rules', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectPushRules('123');
      expect(mockClient.delete).toHaveBeenCalledWith('/projects/123/push_rule');
      expect(result).toEqual({ success: true });
    });

    it('getGroupPushRules should fetch group push rules', async () => {
      const mockData = { id: 2, prevent_secrets: true };
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.getGroupPushRules('99');
      expect(mockClient.get).toHaveBeenCalledWith('/groups/99/push_rule');
      expect(result).toEqual(mockData);
    });

    it('createGroupPushRules should post group push rules configurations', async () => {
      const mockData = { id: 2, prevent_secrets: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createGroupPushRules('99', {
        preventSecrets: true,
        denyDeleteTag: false,
        memberCheck: true,
        commitMessageRegex: '.*',
        commitMessageNegativeRegex: 'bad',
        branchNameRegex: 'main',
        authorEmailRegex: '@ex.com',
        fileNameRegex: '.*',
        maxFileSize: 10,
        commitCommitterCheck: true,
        commitCommitterNameCheck: true,
        rejectUnsignedCommits: true,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/99/push_rule', {
        prevent_secrets: true,
        deny_delete_tag: false,
        member_check: true,
        commit_message_regex: '.*',
        commit_message_negative_regex: 'bad',
        branch_name_regex: 'main',
        author_email_regex: '@ex.com',
        file_name_regex: '.*',
        max_file_size: 10,
        commit_committer_check: true,
        commit_committer_name_check: true,
        reject_unsigned_commits: true,
      });
      expect(result).toEqual(mockData);
    });

    it('updateGroupPushRules should put updated group push rules', async () => {
      const mockData = { id: 2, prevent_secrets: false };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateGroupPushRules('99', {
        preventSecrets: false,
      });
      expect(mockClient.put).toHaveBeenCalledWith('/groups/99/push_rule', {
        prevent_secrets: false,
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGroupPushRules should delete group push rules', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupPushRules('99');
      expect(mockClient.delete).toHaveBeenCalledWith('/groups/99/push_rule');
      expect(result).toEqual({ success: true });
    });

    // 4. Merge Request Draft Notes
    it('listMergeRequestDraftNotes should fetch MR draft notes', async () => {
      const mockData = [{ id: 1, note: 'Draft note' }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listMergeRequestDraftNotes('123', 5);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/draft_notes',
      );
      expect(result).toEqual(mockData);
    });

    it('createMergeRequestDraftNote should post draft note configuration', async () => {
      const mockData = { id: 1, note: 'Draft note' };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.createMergeRequestDraftNote('123', 5, {
        note: 'Draft note',
        commitId: 'sha123',
        path: 'file.txt',
        line: 10,
        position: {},
      });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/draft_notes',
        {
          note: 'Draft note',
          commit_id: 'sha123',
          path: 'file.txt',
          line: 10,
          position: {},
        },
      );
      expect(result).toEqual(mockData);
    });

    it('updateMergeRequestDraftNote should put updated draft note details', async () => {
      const mockData = { id: 1, note: 'Updated draft note' };
      mockClient.put.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.updateMergeRequestDraftNote(
        '123',
        5,
        1,
        { note: 'Updated draft note' },
      );
      expect(mockClient.put).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/draft_notes/1',
        {
          note: 'Updated draft note',
        },
      );
      expect(result).toEqual(mockData);
    });

    it('deleteMergeRequestDraftNote should delete draft note', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteMergeRequestDraftNote('123', 5, 1);
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/draft_notes/1',
      );
      expect(result).toEqual({ success: true });
    });

    it('publishMergeRequestDraftNotes should post to publish endpoint', async () => {
      const mockData = { success: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.publishMergeRequestDraftNotes('123', 5);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/projects/123/merge_requests/5/draft_notes/publish',
      );
      expect(result).toEqual(mockData);
    });

    // 5. Project & Group Invitations
    it('listGroupInvitations should fetch group invitations list', async () => {
      const mockData = [{ invite_email: 'user@ex.com', access_level: 30 }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listGroupInvitations('99');
      expect(mockClient.get).toHaveBeenCalledWith('/groups/99/invitations');
      expect(result).toEqual(mockData);
    });

    it('inviteGroupMembers should post group invitations configuration', async () => {
      const mockData = { success: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.inviteGroupMembers('99', {
        email: 'user@ex.com',
        accessLevel: 30,
        inviteeType: 'email',
        expiresAt: '2026-12-31',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/groups/99/invitations', {
        email: 'user@ex.com',
        access_level: 30,
        invitee_type: 'email',
        expires_at: '2026-12-31',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteGroupInvitation should delete group invitation', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteGroupInvitation('99', 'user@ex.com');
      expect(mockClient.delete).toHaveBeenCalledWith('/groups/99/invitations/user%40ex.com');
      expect(result).toEqual({ success: true });
    });

    it('listProjectInvitations should fetch project invitations list', async () => {
      const mockData = [{ invite_email: 'user@ex.com', access_level: 30 }];
      mockClient.get.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.listProjectInvitations('123');
      expect(mockClient.get).toHaveBeenCalledWith('/projects/123/invitations');
      expect(result).toEqual(mockData);
    });

    it('inviteProjectMembers should post project invitations configuration', async () => {
      const mockData = { success: true };
      mockClient.post.mockResolvedValueOnce({ data: mockData });
      const result = await GitlabService.inviteProjectMembers('123', {
        email: 'user@ex.com',
        accessLevel: 30,
        inviteeType: 'email',
        expiresAt: '2026-12-31',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/projects/123/invitations', {
        email: 'user@ex.com',
        access_level: 30,
        invitee_type: 'email',
        expires_at: '2026-12-31',
      });
      expect(result).toEqual(mockData);
    });

    it('deleteProjectInvitation should delete project invitation', async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await GitlabService.deleteProjectInvitation('123', 'user@ex.com');
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/projects/123/invitations/user%40ex.com',
      );
      expect(result).toEqual({ success: true });
    });
  });
});

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
});

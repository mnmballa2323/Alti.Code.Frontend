import axios from 'axios';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

// Initialize Axios client configured for GitLab API
const gitlabClient = axios.create({
  baseURL: config.gitlab_url || 'https://gitlab.com/api/v4',
  headers: {
    'Private-Token': config.gitlab_token || '',
  },
});

/**
 * Direct GitLab API Service Wrapper using Axios (No third-party SDK dependencies)
 */
export const GitlabService = {
  // ==========================================
  // 1. User & Keys Endpoints
  // ==========================================
  async getAuthenticatedUser() {
    logger.info('🦊 [GitLab Service] Fetching authenticated user info');
    try {
      const { data } = await gitlabClient.get('/user');
      return data;
    } catch (error) {
      logger.error('Failed to fetch authenticated user:', error);
      throw error;
    }
  },

  async listSSHKeys() {
    logger.info('🦊 [GitLab Service] Listing SSH keys');
    try {
      const { data } = await gitlabClient.get('/user/keys');
      return data;
    } catch (error) {
      logger.error('Failed to list SSH keys:', error);
      throw error;
    }
  },

  async addSSHKey(title, key) {
    logger.info('🦊 [GitLab Service] Adding SSH key:', title);
    try {
      const { data } = await gitlabClient.post('/user/keys', { title, key });
      return data;
    } catch (error) {
      logger.error('Failed to add SSH key:', error);
      throw error;
    }
  },

  async deleteSSHKey(keyId) {
    logger.info(`🦊 [GitLab Service] Deleting SSH key: ${keyId}`);
    try {
      await gitlabClient.delete(`/user/keys/${keyId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete SSH key ${keyId}:`, error);
      throw error;
    }
  },

  async listGPGKeys() {
    logger.info('🦊 [GitLab Service] Listing GPG keys');
    try {
      const { data } = await gitlabClient.get('/user/gpg_keys');
      return data;
    } catch (error) {
      logger.error('Failed to list GPG keys:', error);
      throw error;
    }
  },

  async addGPGKey(key) {
    logger.info('🦊 [GitLab Service] Adding GPG key');
    try {
      const { data } = await gitlabClient.post('/user/gpg_keys', { key });
      return data;
    } catch (error) {
      logger.error('Failed to add GPG key:', error);
      throw error;
    }
  },

  async deleteGPGKey(keyId) {
    logger.info(`🦊 [GitLab Service] Deleting GPG key: ${keyId}`);
    try {
      await gitlabClient.delete(`/user/gpg_keys/${keyId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete GPG key ${keyId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 2. Projects & Branches Endpoints
  // ==========================================
  async listProjects(params = {}) {
    logger.info('🦊 [GitLab Service] Listing projects', params);
    try {
      const { data } = await gitlabClient.get('/projects', {
        params: {
          simple: true,
          membership: true,
          order_by: 'last_activity_at',
          per_page: params.perPage || 30,
          page: params.page || 1,
          search: params.search,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list projects:', error);
      throw error;
    }
  },

  async createProject(projectData) {
    logger.info('🦊 [GitLab Service] Creating project:', projectData.name);
    try {
      const { data } = await gitlabClient.post('/projects', {
        name: projectData.name,
        description: projectData.description,
        visibility: projectData.visibility || 'private',
        initialize_with_readme: projectData.initializeWithReadme ?? true,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create project:', error);
      throw error;
    }
  },

  async getProject(projectId) {
    logger.info(`🦊 [GitLab Service] Fetching project: ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get project ${projectId}:`, error);
      throw error;
    }
  },

  async deleteProject(projectId) {
    logger.info(`🦊 [GitLab Service] Deleting project: ${projectId}`);
    try {
      await gitlabClient.delete(`/projects/${encodeURIComponent(projectId)}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete project ${projectId}:`, error);
      throw error;
    }
  },

  async listBranches(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing branches for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/branches`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list branches for ${projectId}:`, error);
      throw error;
    }
  },

  async getBranch(projectId, branch) {
    logger.info(
      `🦊 [GitLab Service] Fetching branch ${branch} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branch)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.warn(
          `Branch ${branch} not found in project ${projectId}, returning fallback.`,
        );
        return { name: branch, protected: false, exists: false };
      }
      logger.error(`Failed to get branch ${branch} for ${projectId}:`, error);
      throw error;
    }
  },

  async createBranch(projectId, branch, ref) {
    logger.info(
      `🦊 [GitLab Service] Creating branch ${branch} from ${ref} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/repository/branches`,
        { branch, ref },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create branch ${branch} for ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteBranch(projectId, branch) {
    logger.info(
      `🦊 [GitLab Service] Deleting branch ${branch} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branch)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete branch ${branch} for ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 3. Repository Files Endpoints
  // ==========================================
  async getFileContent(projectId, filePath, ref = 'main') {
    logger.info(
      `🦊 [GitLab Service] Fetching file: ${filePath} (ref: ${ref}) in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(
          projectId,
        )}/repository/files/${encodeURIComponent(filePath)}/raw`,
        { params: { ref } },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get file ${filePath} for ${projectId}:`, error);
      throw error;
    }
  },

  async createFile(
    projectId,
    filePath,
    content,
    commitMessage,
    branch = 'main',
  ) {
    logger.info(
      `🦊 [GitLab Service] Creating file: ${filePath} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(
          projectId,
        )}/repository/files/${encodeURIComponent(filePath)}`,
        {
          branch,
          commit_message: commitMessage,
          content,
          encoding: 'text',
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create file ${filePath} in ${projectId}:`, error);
      throw error;
    }
  },

  async updateFile(
    projectId,
    filePath,
    content,
    commitMessage,
    branch = 'main',
  ) {
    logger.info(
      `🦊 [GitLab Service] Updating file: ${filePath} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(
          projectId,
        )}/repository/files/${encodeURIComponent(filePath)}`,
        {
          branch,
          commit_message: commitMessage,
          content,
          encoding: 'text',
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update file ${filePath} in ${projectId}:`, error);
      throw error;
    }
  },

  async deleteFile(projectId, filePath, commitMessage, branch = 'main') {
    logger.info(
      `🦊 [GitLab Service] Deleting file: ${filePath} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(
          projectId,
        )}/repository/files/${encodeURIComponent(filePath)}`,
        {
          data: {
            branch,
            commit_message: commitMessage,
          },
        },
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete file ${filePath} in ${projectId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 4. Merge Requests Endpoints
  // ==========================================
  async listMergeRequests(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing merge requests for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests`,
        {
          params: {
            state: params.state || 'opened',
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list merge requests for ${projectId}:`, error);
      throw error;
    }
  },

  async getMergeRequest(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Fetching merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get merge request ${mrIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createMergeRequest(projectId, source, target, title, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating merge request from ${source} to ${target} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests`,
        {
          source_branch: source,
          target_branch: target,
          title,
          description: params.description,
          remove_source_branch: params.removeSourceBranch ?? true,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create merge request for ${projectId}:`, error);
      throw error;
    }
  },

  async updateMergeRequest(projectId, mrIid, updateData) {
    logger.info(
      `🦊 [GitLab Service] Updating merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`,
        updateData,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update merge request ${mrIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async mergeMergeRequest(projectId, mrIid, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Merging merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(
          projectId,
        )}/merge_requests/${mrIid}/merge`,
        {
          merge_commit_message: params.mergeCommitMessage,
          should_remove_source_branch: params.shouldRemoveSourceBranch,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to merge merge request ${mrIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listMergeRequestComments(projectId, mrIid, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing comments for merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(
          projectId,
        )}/merge_requests/${mrIid}/notes`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            sort: 'asc',
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list comments for MR ${mrIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createMergeRequestComment(projectId, mrIid, body) {
    logger.info(
      `🦊 [GitLab Service] Posting comment on merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(
          projectId,
        )}/merge_requests/${mrIid}/notes`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to post comment on MR ${mrIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 5. Issues & Milestones Endpoints
  // ==========================================
  async listIssues(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing issues for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues`,
        {
          params: {
            state: params.state || 'opened',
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list issues for ${projectId}:`, error);
      throw error;
    }
  },

  async getIssue(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Fetching issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get issue ${issueIid} in ${projectId}:`, error);
      throw error;
    }
  },

  async createIssue(projectId, issueData) {
    logger.info(`🦊 [GitLab Service] Creating issue in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues`,
        {
          title: issueData.title,
          description: issueData.description,
          labels: issueData.labels,
          assignee_ids: issueData.assigneeIds,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create issue in ${projectId}:`, error);
      throw error;
    }
  },

  async updateIssue(projectId, issueIid, updateData) {
    logger.info(
      `🦊 [GitLab Service] Updating issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`,
        updateData,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update issue ${issueIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listIssueComments(projectId, issueIid, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing comments for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            sort: 'asc',
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list comments for issue ${issueIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createIssueComment(projectId, issueIid, body) {
    logger.info(
      `🦊 [GitLab Service] Posting comment on issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to post comment on issue ${issueIid} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listMilestones(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing milestones in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/milestones`,
        {
          params: {
            state: params.state,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list milestones in ${projectId}:`, error);
      throw error;
    }
  },

  async createMilestone(projectId, title, description) {
    logger.info(
      `🦊 [GitLab Service] Creating milestone ${title} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/milestones`,
        { title, description },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create milestone in ${projectId}:`, error);
      throw error;
    }
  },

  async updateMilestone(projectId, milestoneId, updateData) {
    logger.info(
      `🦊 [GitLab Service] Updating milestone ${milestoneId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/milestones/${milestoneId}`,
        updateData,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update milestone ${milestoneId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteMilestone(projectId, milestoneId) {
    logger.info(
      `🦊 [GitLab Service] Deleting milestone ${milestoneId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/milestones/${milestoneId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete milestone ${milestoneId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 6. CI/CD Pipelines & Jobs Endpoints
  // ==========================================
  async listPipelines(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing pipelines for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pipelines`,
        {
          params: {
            ref: params.ref,
            status: params.status,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list pipelines for ${projectId}:`, error);
      throw error;
    }
  },

  async getPipeline(projectId, pipelineId) {
    logger.info(
      `🦊 [GitLab Service] Fetching pipeline ${pipelineId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get pipeline ${pipelineId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createPipeline(projectId, ref, variables = []) {
    logger.info(
      `🦊 [GitLab Service] Triggering pipeline for ref ${ref} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/pipeline`,
        {
          ref,
          variables,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create pipeline in ${projectId}:`, error);
      throw error;
    }
  },

  async cancelPipeline(projectId, pipelineId) {
    logger.info(
      `🦊 [GitLab Service] Canceling pipeline ${pipelineId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(
          projectId,
        )}/pipelines/${pipelineId}/cancel`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to cancel pipeline ${pipelineId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async retryPipeline(projectId, pipelineId) {
    logger.info(
      `🦊 [GitLab Service] Retrying pipeline ${pipelineId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(
          projectId,
        )}/pipelines/${pipelineId}/retry`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to retry pipeline ${pipelineId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listPipelineJobs(projectId, pipelineId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing jobs for pipeline ${pipelineId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(
          projectId,
        )}/pipelines/${pipelineId}/jobs`,
        {
          params: {
            scope: params.scope,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list jobs for pipeline ${pipelineId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getJobLog(projectId, jobId) {
    logger.info(
      `🦊 [GitLab Service] Fetching raw log trace for job ${jobId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/trace`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get trace log for job ${jobId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 7. CI/CD Variables Endpoints
  // ==========================================
  async listProjectVariables(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing variables for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/variables`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list variables for ${projectId}:`, error);
      throw error;
    }
  },

  async getProjectVariable(projectId, key) {
    logger.info(
      `🦊 [GitLab Service] Fetching variable ${key} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get variable ${key} in ${projectId}:`, error);
      throw error;
    }
  },

  async createProjectVariable(projectId, key, value, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating variable ${key} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/variables`,
        {
          key,
          value,
          variable_type: params.variableType || 'env_var',
          protected: params.protected ?? false,
          masked: params.masked ?? false,
          raw: params.raw ?? false,
          environment_scope: params.environmentScope || '*',
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create variable ${key} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateProjectVariable(projectId, key, value, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating variable ${key} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
        {
          value,
          variable_type: params.variableType,
          protected: params.protected,
          masked: params.masked,
          raw: params.raw,
          environment_scope: params.environmentScope,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update variable ${key} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectVariable(projectId, key) {
    logger.info(
      `🦊 [GitLab Service] Deleting variable ${key} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete variable ${key} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupVariables(groupId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing variables for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/variables`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list variables for group ${groupId}:`, error);
      throw error;
    }
  },

  async getGroupVariable(groupId, key) {
    logger.info(
      `🦊 [GitLab Service] Fetching variable ${key} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/variables/${key}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get variable ${key} in group ${groupId}:`, error);
      throw error;
    }
  },

  async createGroupVariable(groupId, key, value, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating variable ${key} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/variables`,
        {
          key,
          value,
          variable_type: params.variableType || 'env_var',
          protected: params.protected ?? false,
          masked: params.masked ?? false,
          raw: params.raw ?? false,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create variable ${key} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async updateGroupVariable(groupId, key, value, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating variable ${key} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/variables/${key}`,
        {
          value,
          variable_type: params.variableType,
          protected: params.protected,
          masked: params.masked,
          raw: params.raw,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update variable ${key} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupVariable(groupId, key) {
    logger.info(
      `🦊 [GitLab Service] Deleting variable ${key} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/variables/${key}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete variable ${key} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 8. Groups & Members Endpoints
  // ==========================================
  async listGroups(params = {}) {
    logger.info('🦊 [GitLab Service] Listing groups', params);
    try {
      const { data } = await gitlabClient.get('/groups', {
        params: {
          page: params.page || 1,
          per_page: params.perPage || 30,
          search: params.search,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list groups:', error);
      throw error;
    }
  },

  async getGroup(groupId) {
    logger.info(`🦊 [GitLab Service] Fetching group: ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get group ${groupId}:`, error);
      throw error;
    }
  },

  async listProjectMembers(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing members for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/members`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            query: params.query,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project members for ${projectId}:`, error);
      throw error;
    }
  },

  async addProjectMember(projectId, userId, accessLevel) {
    logger.info(
      `🦊 [GitLab Service] Adding member ${userId} with access ${accessLevel} to project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/members`,
        {
          user_id: userId,
          access_level: accessLevel,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to add member to project ${projectId}:`, error);
      throw error;
    }
  },

  async removeProjectMember(projectId, userId) {
    logger.info(
      `🦊 [GitLab Service] Removing member ${userId} from project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/members/${userId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to remove member from project ${projectId}:`, error);
      throw error;
    }
  },

  async listGroupMembers(groupId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing members for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/members`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            query: params.query,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list group members for ${groupId}:`, error);
      throw error;
    }
  },

  async addGroupMember(groupId, userId, accessLevel) {
    logger.info(
      `🦊 [GitLab Service] Adding member ${userId} with access ${accessLevel} to group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/members`,
        {
          user_id: userId,
          access_level: accessLevel,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to add member to group ${groupId}:`, error);
      throw error;
    }
  },

  async removeGroupMember(groupId, userId) {
    logger.info(
      `🦊 [GitLab Service] Removing member ${userId} from group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/members/${userId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to remove member from group ${groupId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 9. Project Webhooks Endpoints
  // ==========================================
  async listProjectHooks(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing hooks for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/hooks`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list webhooks for ${projectId}:`, error);
      throw error;
    }
  },

  async getProjectHook(projectId, hookId) {
    logger.info(
      `🦊 [GitLab Service] Fetching webhook ${hookId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/hooks/${hookId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get webhook ${hookId} in ${projectId}:`, error);
      throw error;
    }
  },

  async createProjectHook(projectId, url, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating webhook for ${url} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/hooks`,
        {
          url,
          push_events: params.pushEvents ?? true,
          issues_events: params.issuesEvents ?? false,
          merge_requests_events: params.mergeRequestsEvents ?? false,
          tag_push_events: params.tagPushEvents ?? false,
          note_events: params.noteEvents ?? false,
          pipeline_events: params.pipelineEvents ?? false,
          job_events: params.jobEvents ?? false,
          token: params.token,
          enable_ssl_verification: params.enableSslVerification ?? true,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create webhook in project ${projectId}:`, error);
      throw error;
    }
  },

  async updateProjectHook(projectId, hookId, url, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating webhook ${hookId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/hooks/${hookId}`,
        {
          url,
          push_events: params.pushEvents,
          issues_events: params.issuesEvents,
          merge_requests_events: params.mergeRequestsEvents,
          tag_push_events: params.tagPushEvents,
          note_events: params.noteEvents,
          pipeline_events: params.pipelineEvents,
          job_events: params.jobEvents,
          token: params.token,
          enable_ssl_verification: params.enableSslVerification,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update webhook ${hookId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectHook(projectId, hookId) {
    logger.info(
      `🦊 [GitLab Service] Deleting webhook ${hookId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/hooks/${hookId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete webhook ${hookId} in ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 10. Access Tokens Endpoints
  // ==========================================
  async listProjectAccessTokens(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing access tokens for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/access_tokens`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list access tokens for ${projectId}:`, error);
      throw error;
    }
  },

  async createProjectAccessToken(
    projectId,
    name,
    scopes,
    expiresAt = null,
    accessLevel = 30,
  ) {
    logger.info(
      `🦊 [GitLab Service] Creating access token ${name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/access_tokens`,
        {
          name,
          scopes,
          expires_at: expiresAt,
          access_level: accessLevel,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create access token ${name} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async revokeProjectAccessToken(projectId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Revoking access token ${tokenId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/access_tokens/${tokenId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to revoke access token ${tokenId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 12. Commits, Diff & Comments Endpoints
  // ==========================================
  async listCommits(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing commits for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits`,
        {
          params: {
            ref_name: params.refName || params.sha || params.branch,
            since: params.since,
            until: params.until,
            path: params.path,
            all: params.all,
            with_stats: params.withStats,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list commits for project ${projectId}:`, error);
      throw error;
    }
  },

  async getCommit(projectId, sha) {
    logger.info(
      `🦊 [GitLab Service] Fetching commit ${sha} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get commit ${sha} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async compareCommits(projectId, from, to) {
    logger.info(
      `🦊 [GitLab Service] Comparing commits from ${from} to ${to} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/compare`,
        {
          params: { from, to },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to compare commits in project ${projectId}:`, error);
      throw error;
    }
  },

  async getCommitDiff(projectId, sha) {
    logger.info(
      `🦊 [GitLab Service] Fetching diff for commit ${sha} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/diff`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get diff for commit ${sha} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getCommitComments(projectId, sha) {
    logger.info(
      `🦊 [GitLab Service] Fetching comments for commit ${sha} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/comments`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get comments for commit ${sha} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createCommitComment(projectId, sha, note, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Posting comment on commit ${sha} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/comments`,
        {
          note,
          path: params.path,
          line: params.line,
          line_type: params.lineType,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to post comment on commit ${sha} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createCommitStatus(projectId, sha, state, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Posting commit status ${state} for commit ${sha} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/statuses/${encodeURIComponent(sha)}`,
        {
          state,
          ref: params.ref,
          name: params.name || params.context,
          target_url: params.targetUrl,
          description: params.description,
          coverage: params.coverage,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to post status for commit ${sha} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listCommitStatuses(projectId, sha, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing statuses for commit ${sha} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/statuses`,
        {
          params: {
            ref: params.ref,
            stage: params.stage,
            name: params.name,
            all: params.all,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list statuses for commit ${sha} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 13. Releases & Tags Endpoints
  // ==========================================
  async listReleases(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing releases for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/releases`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list releases for project ${projectId}:`, error);
      throw error;
    }
  },

  async getRelease(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Fetching release for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get release for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createRelease(projectId, releaseData) {
    logger.info(
      `🦊 [GitLab Service] Creating release for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/releases`,
        {
          name: releaseData.name,
          tag_name: releaseData.tagName,
          tag_message: releaseData.tagMessage,
          description: releaseData.description,
          ref: releaseData.ref,
          assets: releaseData.assets,
          milestones: releaseData.milestones,
          released_at: releaseData.releasedAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create release for project ${projectId}:`, error);
      throw error;
    }
  },

  async updateRelease(projectId, tagName, releaseData) {
    logger.info(
      `🦊 [GitLab Service] Updating release for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}`,
        {
          name: releaseData.name,
          description: releaseData.description,
          milestones: releaseData.milestones,
          released_at: releaseData.releasedAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update release for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteRelease(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Deleting release for tag ${tagName} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete release for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listTags(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing tags for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/tags`,
        {
          params: {
            search: params.search,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list tags for project ${projectId}:`, error);
      throw error;
    }
  },

  async getTag(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Fetching tag ${tagName} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/tags/${encodeURIComponent(tagName)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get tag ${tagName} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createTag(projectId, tagName, ref, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating tag ${tagName} pointing to ${ref} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/repository/tags`,
        {
          tag_name: tagName,
          ref,
          message: params.message,
          release_description: params.releaseDescription,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteTag(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Deleting tag ${tagName} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/repository/tags/${encodeURIComponent(tagName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 14. Deployments & Environments Endpoints
  // ==========================================
  async listEnvironments(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing environments for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/environments`,
        {
          params: {
            name: params.name,
            search: params.search,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list environments for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getEnvironment(projectId, environmentId) {
    logger.info(
      `🦊 [GitLab Service] Fetching environment ${environmentId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get environment ${environmentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createEnvironment(projectId, name, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating environment ${name} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/environments`,
        {
          name,
          external_url: params.externalUrl,
          tier: params.tier,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create environment ${name} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateEnvironment(projectId, environmentId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating environment ${environmentId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
        {
          external_url: params.externalUrl,
          tier: params.tier,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update environment ${environmentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteEnvironment(projectId, environmentId) {
    logger.info(
      `🦊 [GitLab Service] Deleting environment ${environmentId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete environment ${environmentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listDeployments(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing deployments for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/deployments`,
        {
          params: {
            environment: params.environment,
            status: params.status,
            order_by: params.orderBy,
            sort: params.sort,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list deployments for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getDeployment(projectId, deploymentId) {
    logger.info(
      `🦊 [GitLab Service] Fetching deployment ${deploymentId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/deployments/${deploymentId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get deployment ${deploymentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createDeployment(projectId, environment, ref, tag, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating deployment for env ${environment} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/deployments`,
        {
          environment,
          ref,
          tag,
          status: params.status || 'running',
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create deployment for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateDeployment(projectId, deploymentId, status) {
    logger.info(
      `🦊 [GitLab Service] Updating deployment ${deploymentId} to status ${status} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/deployments/${deploymentId}`,
        { status },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update deployment ${deploymentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 15. Snippets Endpoints
  // ==========================================
  async listSnippets(params = {}) {
    logger.info('🦊 [GitLab Service] Listing personal snippets');
    try {
      const { data } = await gitlabClient.get('/snippets', {
        params: {
          page: params.page || 1,
          per_page: params.perPage || 30,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list personal snippets:', error);
      throw error;
    }
  },

  async listProjectSnippets(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing snippets for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list project snippets for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getSnippet(snippetId) {
    logger.info(`🦊 [GitLab Service] Fetching personal snippet ${snippetId}`);
    try {
      const { data } = await gitlabClient.get(`/snippets/${snippetId}`);
      return data;
    } catch (error) {
      logger.error(`Failed to get personal snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async getProjectSnippet(projectId, snippetId) {
    logger.info(
      `🦊 [GitLab Service] Fetching project snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get project snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createSnippet(
    title,
    fileName,
    content,
    visibility = 'private',
    description = '',
  ) {
    logger.info(`🦊 [GitLab Service] Creating personal snippet: ${title}`);
    try {
      const { data } = await gitlabClient.post('/snippets', {
        title,
        description,
        visibility,
        files: [
          {
            file_path: fileName,
            content,
          },
        ],
      });
      return data;
    } catch (error) {
      logger.error('Failed to create personal snippet:', error);
      throw error;
    }
  },

  async createProjectSnippet(
    projectId,
    title,
    fileName,
    content,
    visibility = 'private',
    description = '',
  ) {
    logger.info(
      `🦊 [GitLab Service] Creating project snippet: ${title} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/snippets`,
        {
          title,
          description,
          visibility,
          files: [
            {
              file_path: fileName,
              content,
            },
          ],
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create project snippet in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateSnippet(snippetId, snippetData) {
    logger.info(`🦊 [GitLab Service] Updating personal snippet ${snippetId}`);
    try {
      const { data } = await gitlabClient.put(`/snippets/${snippetId}`, {
        title: snippetData.title,
        description: snippetData.description,
        visibility: snippetData.visibility,
        files: snippetData.files,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update personal snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async updateProjectSnippet(projectId, snippetId, snippetData) {
    logger.info(
      `🦊 [GitLab Service] Updating project snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}`,
        {
          title: snippetData.title,
          description: snippetData.description,
          visibility: snippetData.visibility,
          files: snippetData.files,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update project snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteSnippet(snippetId) {
    logger.info(`🦊 [GitLab Service] Deleting personal snippet ${snippetId}`);
    try {
      await gitlabClient.delete(`/snippets/${snippetId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete personal snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async deleteProjectSnippet(projectId, snippetId) {
    logger.info(
      `🦊 [GitLab Service] Deleting project snippet ${snippetId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete project snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getSnippetContent(snippetId) {
    logger.info(
      `🦊 [GitLab Service] Fetching raw content for personal snippet ${snippetId}`,
    );
    try {
      const { data } = await gitlabClient.get(`/snippets/${snippetId}/raw`);
      return data;
    } catch (error) {
      logger.error(
        `Failed to get raw content for personal snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectSnippetContent(projectId, snippetId) {
    logger.info(
      `🦊 [GitLab Service] Fetching raw content for project snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/raw`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get raw content for project snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 16. Self-Hosted Runners Endpoints
  // ==========================================
  async listRunners(params = {}) {
    logger.info('🦊 [GitLab Service] Listing all self-hosted runners');
    try {
      const { data } = await gitlabClient.get('/runners', {
        params: {
          type: params.type,
          status: params.status,
          tag_list: params.tagList,
          page: params.page || 1,
          per_page: params.perPage || 30,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list runners:', error);
      throw error;
    }
  },

  async listProjectRunners(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing runners for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/runners`,
        {
          params: {
            type: params.type,
            status: params.status,
            tag_list: params.tagList,
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list runners for project ${projectId}:`, error);
      throw error;
    }
  },

  async getRunner(runnerId) {
    logger.info(`🦊 [GitLab Service] Fetching runner ${runnerId} details`);
    try {
      const { data } = await gitlabClient.get(`/runners/${runnerId}`);
      return data;
    } catch (error) {
      logger.error(`Failed to get details for runner ${runnerId}:`, error);
      throw error;
    }
  },

  async updateRunner(runnerId, runnerData) {
    logger.info(
      `🦊 [GitLab Service] Updating runner ${runnerId} configurations`,
    );
    try {
      const { data } = await gitlabClient.put(`/runners/${runnerId}`, {
        description: runnerData.description,
        active: runnerData.active,
        tag_list: runnerData.tagList,
        run_untagged: runnerData.runUntagged,
        locked: runnerData.locked,
        access_level: runnerData.accessLevel,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update runner ${runnerId}:`, error);
      throw error;
    }
  },

  async deleteRunner(runnerId) {
    logger.info(
      `🦊 [GitLab Service] Deleting/unregistering runner ${runnerId}`,
    );
    try {
      await gitlabClient.delete(`/runners/${runnerId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete runner ${runnerId}:`, error);
      throw error;
    }
  },

  async registerRunner(token, params = {}) {
    logger.info('🦊 [GitLab Service] Registering new runner');
    try {
      const { data } = await gitlabClient.post('/runners', {
        token,
        description: params.description,
        active: params.active,
        tag_list: params.tagList,
        run_untagged: params.runUntagged,
        locked: params.locked,
        access_level: params.accessLevel,
      });
      return data;
    } catch (error) {
      logger.error('Failed to register runner:', error);
      throw error;
    }
  },

  async verifyRunner(token) {
    logger.info('🦊 [GitLab Service] Verifying runner token');
    try {
      await gitlabClient.post('/runners/verify', { token });
      return { success: true };
    } catch (error) {
      logger.error('Failed to verify runner token:', error);
      throw error;
    }
  },

  // ==========================================
  // 17. Epics & Epic Boards Endpoints
  // ==========================================
  async listGroupEpics(groupId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing epics for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/epics`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            search: params.search,
            state: params.state,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list epics for group ${groupId}:`, error);
      throw error;
    }
  },

  async getGroupEpic(groupId, epicId) {
    logger.info(`🦊 [GitLab Service] Fetching epic ${epicId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get epic ${epicId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async createGroupEpic(groupId, epicData) {
    logger.info(`🦊 [GitLab Service] Creating epic: ${epicData.title} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/epics`,
        {
          title: epicData.title,
          description: epicData.description,
          start_date: epicData.startDate,
          end_date: epicData.endDate,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create epic in group ${groupId}:`, error);
      throw error;
    }
  },

  async updateGroupEpic(groupId, epicId, epicData) {
    logger.info(`🦊 [GitLab Service] Updating epic ${epicId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}`,
        {
          title: epicData.title,
          description: epicData.description,
          start_date: epicData.startDate,
          end_date: epicData.endDate,
          state_event: epicData.stateEvent,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update epic ${epicId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async deleteGroupEpic(groupId, epicId) {
    logger.info(`🦊 [GitLab Service] Deleting epic ${epicId} in group ${groupId}`);
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete epic ${epicId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async listEpicIssues(groupId, epicId) {
    logger.info(`🦊 [GitLab Service] Listing issues for epic ${epicId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}/issues`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list epic issues for epic ${epicId}:`, error);
      throw error;
    }
  },

  async linkEpicIssue(groupId, epicId, issueId) {
    logger.info(`🦊 [GitLab Service] Linking issue ${issueId} to epic ${epicId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}/issues/${issueId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to link issue ${issueId} to epic ${epicId}:`, error);
      throw error;
    }
  },

  async unlinkEpicIssue(groupId, epicId, issueId) {
    logger.info(`🦊 [GitLab Service] Unlinking issue ${issueId} from epic ${epicId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}/issues/${issueId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to unlink issue ${issueId} from epic ${epicId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 18. Packages & Registries Endpoints
  // ==========================================
  async listProjectPackages(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing packages for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/packages`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            package_name: params.packageName,
            package_type: params.packageType,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list packages for project ${projectId}:`, error);
      throw error;
    }
  },

  async getProjectPackage(projectId, packageId) {
    logger.info(`🦊 [GitLab Service] Fetching package ${packageId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/packages/${packageId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get package ${packageId} in project ${projectId}:`, error);
      throw error;
    }
  },

  async deleteProjectPackage(projectId, packageId) {
    logger.info(`🦊 [GitLab Service] Deleting package ${packageId} in project ${projectId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/packages/${packageId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete package ${packageId} in project ${projectId}:`, error);
      throw error;
    }
  },

  async listPackageVersions(projectId, packageId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing files/versions for package ${packageId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/packages/${packageId}/package_files`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list package files for package ${packageId}:`, error);
      throw error;
    }
  },

  async listContainerRepositories(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing container repositories for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list container repositories for project ${projectId}:`, error);
      throw error;
    }
  },

  async deleteContainerRepository(projectId, repositoryId) {
    logger.info(`🦊 [GitLab Service] Deleting container repository ${repositoryId} in project ${projectId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${repositoryId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete container repository ${repositoryId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 19. Project & Group Badges Endpoints
  // ==========================================
  async listProjectBadges(projectId) {
    logger.info(`🦊 [GitLab Service] Listing badges for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/badges`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list badges for project ${projectId}:`, error);
      throw error;
    }
  },

  async getProjectBadge(projectId, badgeId) {
    logger.info(`🦊 [GitLab Service] Fetching badge ${badgeId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/badges/${badgeId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get badge ${badgeId} in project ${projectId}:`, error);
      throw error;
    }
  },

  async createProjectBadge(projectId, badgeData) {
    logger.info(`🦊 [GitLab Service] Creating badge for project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/badges`,
        {
          link_url: badgeData.linkUrl,
          image_url: badgeData.imageUrl,
          name: badgeData.name,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create badge for project ${projectId}:`, error);
      throw error;
    }
  },

  async updateProjectBadge(projectId, badgeId, badgeData) {
    logger.info(`🦊 [GitLab Service] Updating badge ${badgeId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/badges/${badgeId}`,
        {
          link_url: badgeData.linkUrl,
          image_url: badgeData.imageUrl,
          name: badgeData.name,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update badge ${badgeId} in project ${projectId}:`, error);
      throw error;
    }
  },

  async deleteProjectBadge(projectId, badgeId) {
    logger.info(`🦊 [GitLab Service] Deleting badge ${badgeId} in project ${projectId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/badges/${badgeId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete badge ${badgeId} in project ${projectId}:`, error);
      throw error;
    }
  },

  async listGroupBadges(groupId) {
    logger.info(`🦊 [GitLab Service] Listing badges for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/badges`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list badges for group ${groupId}:`, error);
      throw error;
    }
  },

  async getGroupBadge(groupId, badgeId) {
    logger.info(`🦊 [GitLab Service] Fetching badge ${badgeId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/badges/${badgeId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get badge ${badgeId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async createGroupBadge(groupId, badgeData) {
    logger.info(`🦊 [GitLab Service] Creating badge for group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/badges`,
        {
          link_url: badgeData.linkUrl,
          image_url: badgeData.imageUrl,
          name: badgeData.name,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create badge for group ${groupId}:`, error);
      throw error;
    }
  },

  async updateGroupBadge(groupId, badgeId, badgeData) {
    logger.info(`🦊 [GitLab Service] Updating badge ${badgeId} in group ${groupId}`);
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/badges/${badgeId}`,
        {
          link_url: badgeData.linkUrl,
          image_url: badgeData.imageUrl,
          name: badgeData.name,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update badge ${badgeId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async deleteGroupBadge(groupId, badgeId) {
    logger.info(`🦊 [GitLab Service] Deleting badge ${badgeId} in group ${groupId}`);
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/badges/${badgeId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete badge ${badgeId} in group ${groupId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 20. Pages & Pages Domains Endpoints
  // ==========================================
  async getProjectPages(projectId) {
    logger.info(`🦊 [GitLab Service] Fetching pages config for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pages`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get pages settings for project ${projectId}:`, error);
      throw error;
    }
  },

  async deleteProjectPages(projectId) {
    logger.info(`🦊 [GitLab Service] Deleting/unpublishing pages site for project ${projectId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/pages`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete pages site for project ${projectId}:`, error);
      throw error;
    }
  },

  async listPagesDomains(projectId) {
    logger.info(`🦊 [GitLab Service] Listing pages domains for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pages/domains`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list pages domains for project ${projectId}:`, error);
      throw error;
    }
  },

  async getPagesDomain(projectId, domain) {
    logger.info(`🦊 [GitLab Service] Fetching pages domain ${domain} for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pages/domains/${encodeURIComponent(domain)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get pages domain ${domain}:`, error);
      throw error;
    }
  },

  async createPagesDomain(projectId, domain, params = {}) {
    logger.info(`🦊 [GitLab Service] Creating pages domain ${domain} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/pages/domains`,
        {
          domain,
          certificate: params.certificate,
          key: params.key,
          auto_ssl_enabled: params.autoSslEnabled,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create pages domain ${domain} in project ${projectId}:`, error);
      throw error;
    }
  },

  async updatePagesDomain(projectId, domain, params = {}) {
    logger.info(`🦊 [GitLab Service] Updating pages domain ${domain} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/pages/domains/${encodeURIComponent(domain)}`,
        {
          certificate: params.certificate,
          key: params.key,
          auto_ssl_enabled: params.autoSslEnabled,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update pages domain ${domain} in project ${projectId}:`, error);
      throw error;
    }
  },

  async deletePagesDomain(projectId, domain) {
    logger.info(`🦊 [GitLab Service] Deleting pages domain ${domain} in project ${projectId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/pages/domains/${encodeURIComponent(domain)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete pages domain ${domain} in project ${projectId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 21. Audit Events Endpoints
  // ==========================================
  async listProjectAuditEvents(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing audit events for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/audit_events`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            created_after: params.createdAfter,
            created_before: params.createdBefore,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project audit events for project ${projectId}:`, error);
      throw error;
    }
  },

  async listGroupAuditEvents(groupId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing audit events for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/audit_events`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            created_after: params.createdAfter,
            created_before: params.createdBefore,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list group audit events for group ${groupId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 22. Award Emoji (Reactions) Endpoints
  // ==========================================
  async listAwardEmojisOnIssue(projectId, issueIid) {
    logger.info(`🦊 [GitLab Service] Listing reactions on issue ${issueIid} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on issue ${issueIid}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnIssue(projectId, issueIid, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to issue ${issueIid} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on issue ${issueIid}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnIssue(projectId, issueIid, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from issue ${issueIid}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on issue ${issueIid}:`, error);
      throw error;
    }
  },

  async listAwardEmojisOnMergeRequest(projectId, mrIid) {
    logger.info(`🦊 [GitLab Service] Listing reactions on MR ${mrIid} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on MR ${mrIid}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnMergeRequest(projectId, mrIid, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to MR ${mrIid} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on MR ${mrIid}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnMergeRequest(projectId, mrIid, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from MR ${mrIid}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on MR ${mrIid}:`, error);
      throw error;
    }
  },

  async listAwardEmojisOnSnippet(snippetId) {
    logger.info(`🦊 [GitLab Service] Listing reactions on personal snippet ${snippetId}`);
    try {
      const { data } = await gitlabClient.get(
        `/snippets/${snippetId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnSnippet(snippetId, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to personal snippet ${snippetId}`);
    try {
      const { data } = await gitlabClient.post(
        `/snippets/${snippetId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnSnippet(snippetId, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from snippet ${snippetId}`);
    try {
      await gitlabClient.delete(
        `/snippets/${snippetId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async listAwardEmojisOnProjectSnippet(projectId, snippetId) {
    logger.info(`🦊 [GitLab Service] Listing reactions on snippet ${snippetId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on project snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnProjectSnippet(projectId, snippetId, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to project snippet ${snippetId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on project snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnProjectSnippet(projectId, snippetId, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from project snippet ${snippetId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on project snippet ${snippetId}:`, error);
      throw error;
    }
  },

  async listAwardEmojisOnIssueNote(projectId, issueIid, noteId) {
    logger.info(`🦊 [GitLab Service] Listing reactions on issue comment ${noteId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on issue note ${noteId}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnIssueNote(projectId, issueIid, noteId, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to issue comment ${noteId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on issue note ${noteId}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnIssueNote(projectId, issueIid, noteId, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from issue comment ${noteId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on issue note ${noteId}:`, error);
      throw error;
    }
  },

  async listAwardEmojisOnMergeRequestNote(projectId, mrIid, noteId) {
    logger.info(`🦊 [GitLab Service] Listing reactions on MR comment ${noteId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/notes/${noteId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list award emojis on MR note ${noteId}:`, error);
      throw error;
    }
  },

  async createAwardEmojiOnMergeRequestNote(projectId, mrIid, noteId, name) {
    logger.info(`🦊 [GitLab Service] Reacting ${name} to MR comment ${noteId} in project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/notes/${noteId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create award emoji on MR note ${noteId}:`, error);
      throw error;
    }
  },

  async deleteAwardEmojiOnMergeRequestNote(projectId, mrIid, noteId, emojiId) {
    logger.info(`🦊 [GitLab Service] Removing reaction ${emojiId} from MR comment ${noteId}`);
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/notes/${noteId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete award emoji ${emojiId} on MR note ${noteId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 11. Security Scanning Endpoints
  // ==========================================
  async listVulnerabilityAlerts(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing vulnerability alerts for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/vulnerabilities`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            severity: params.severity,
            confidence: params.confidence,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list vulnerability alerts for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },
};

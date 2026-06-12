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

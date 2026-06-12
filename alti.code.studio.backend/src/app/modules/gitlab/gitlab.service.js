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

  async createCommitComment(projectId, sha, noteOrCommentData, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating commit comment for project ${projectId} commit ${sha}`,
    );
    try {
      let payload = {};
      if (typeof noteOrCommentData === 'object' && noteOrCommentData !== null) {
        payload = {
          note: noteOrCommentData.note,
          path: noteOrCommentData.path,
          line: noteOrCommentData.line,
          line_type: noteOrCommentData.lineType,
        };
      } else {
        payload = {
          note: noteOrCommentData,
          path: params.path,
          line: params.line,
          line_type: params.lineType,
        };
      }
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/comments`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create commit comment:`, error);
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
    logger.info(
      `🦊 [GitLab Service] Fetching epic ${epicId} in group ${groupId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Creating epic: ${epicData.title} in group ${groupId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Updating epic ${epicId} in group ${groupId}`,
    );
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
      logger.error(
        `Failed to update epic ${epicId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupEpic(groupId, epicId) {
    logger.info(
      `🦊 [GitLab Service] Deleting epic ${epicId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete epic ${epicId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async listEpicIssues(groupId, epicId) {
    logger.info(
      `🦊 [GitLab Service] Listing issues for epic ${epicId} in group ${groupId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Linking issue ${issueId} to epic ${epicId} in group ${groupId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Unlinking issue ${issueId} from epic ${epicId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/epics/${epicId}/issues/${issueId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to unlink issue ${issueId} from epic ${epicId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 18. Packages & Registries Endpoints
  // ==========================================
  async listProjectPackages(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing packages for project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Fetching package ${packageId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/packages/${packageId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get package ${packageId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectPackage(projectId, packageId) {
    logger.info(
      `🦊 [GitLab Service] Deleting package ${packageId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/packages/${packageId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete package ${packageId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listPackageVersions(projectId, packageId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing files/versions for package ${packageId} in project ${projectId}`,
    );
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
      logger.error(
        `Failed to list package files for package ${packageId}:`,
        error,
      );
      throw error;
    }
  },

  async listContainerRepositories(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing container repositories for project ${projectId}`,
    );
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
      logger.error(
        `Failed to list container repositories for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteContainerRepository(projectId, repositoryId) {
    logger.info(
      `🦊 [GitLab Service] Deleting container repository ${repositoryId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${repositoryId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete container repository ${repositoryId}:`,
        error,
      );
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
    logger.info(
      `🦊 [GitLab Service] Fetching badge ${badgeId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/badges/${badgeId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get badge ${badgeId} in project ${projectId}:`,
        error,
      );
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
    logger.info(
      `🦊 [GitLab Service] Updating badge ${badgeId} in project ${projectId}`,
    );
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
      logger.error(
        `Failed to update badge ${badgeId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectBadge(projectId, badgeId) {
    logger.info(
      `🦊 [GitLab Service] Deleting badge ${badgeId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/badges/${badgeId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete badge ${badgeId} in project ${projectId}:`,
        error,
      );
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
    logger.info(
      `🦊 [GitLab Service] Fetching badge ${badgeId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/badges/${badgeId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get badge ${badgeId} in group ${groupId}:`,
        error,
      );
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
    logger.info(
      `🦊 [GitLab Service] Updating badge ${badgeId} in group ${groupId}`,
    );
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
      logger.error(
        `Failed to update badge ${badgeId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupBadge(groupId, badgeId) {
    logger.info(
      `🦊 [GitLab Service] Deleting badge ${badgeId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/badges/${badgeId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete badge ${badgeId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 20. Pages & Pages Domains Endpoints
  // ==========================================
  async getProjectPages(projectId) {
    logger.info(
      `🦊 [GitLab Service] Fetching pages config for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pages`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get pages settings for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectPages(projectId) {
    logger.info(
      `🦊 [GitLab Service] Deleting/unpublishing pages site for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/pages`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete pages site for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listPagesDomains(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing pages domains for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pages/domains`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list pages domains for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getPagesDomain(projectId, domain) {
    logger.info(
      `🦊 [GitLab Service] Fetching pages domain ${domain} for project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Creating pages domain ${domain} in project ${projectId}`,
    );
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
      logger.error(
        `Failed to create pages domain ${domain} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updatePagesDomain(projectId, domain, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating pages domain ${domain} in project ${projectId}`,
    );
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
      logger.error(
        `Failed to update pages domain ${domain} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deletePagesDomain(projectId, domain) {
    logger.info(
      `🦊 [GitLab Service] Deleting pages domain ${domain} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/pages/domains/${encodeURIComponent(domain)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete pages domain ${domain} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 21. Audit Events Endpoints
  // ==========================================
  async listProjectAuditEvents(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing audit events for project ${projectId}`,
    );
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
      logger.error(
        `Failed to list project audit events for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupAuditEvents(groupId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing audit events for group ${groupId}`,
    );
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
      logger.error(
        `Failed to list group audit events for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 22. Award Emoji (Reactions) Endpoints
  // ==========================================
  async listAwardEmojisOnIssue(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on issue ${issueIid} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to issue ${issueIid} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from issue ${issueIid}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async listAwardEmojisOnMergeRequest(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on MR ${mrIid} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to MR ${mrIid} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from MR ${mrIid}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on MR ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async listAwardEmojisOnSnippet(snippetId) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on personal snippet ${snippetId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/snippets/${snippetId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list award emojis on snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async createAwardEmojiOnSnippet(snippetId, name) {
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to personal snippet ${snippetId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/snippets/${snippetId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create award emoji on snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteAwardEmojiOnSnippet(snippetId, emojiId) {
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from snippet ${snippetId}`,
    );
    try {
      await gitlabClient.delete(
        `/snippets/${snippetId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async listAwardEmojisOnProjectSnippet(projectId, snippetId) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list award emojis on project snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async createAwardEmojiOnProjectSnippet(projectId, snippetId, name) {
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to project snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create award emoji on project snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteAwardEmojiOnProjectSnippet(projectId, snippetId, emojiId) {
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from project snippet ${snippetId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/snippets/${snippetId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on project snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async listAwardEmojisOnIssueNote(projectId, issueIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on issue comment ${noteId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list award emojis on issue note ${noteId}:`,
        error,
      );
      throw error;
    }
  },

  async createAwardEmojiOnIssueNote(projectId, issueIid, noteId, name) {
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to issue comment ${noteId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create award emoji on issue note ${noteId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteAwardEmojiOnIssueNote(projectId, issueIid, noteId, emojiId) {
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from issue comment ${noteId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/notes/${noteId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on issue note ${noteId}:`,
        error,
      );
      throw error;
    }
  },

  async listAwardEmojisOnMergeRequestNote(projectId, mrIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Listing reactions on MR comment ${noteId} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Reacting ${name} to MR comment ${noteId} in project ${projectId}`,
    );
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
    logger.info(
      `🦊 [GitLab Service] Removing reaction ${emojiId} from MR comment ${noteId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/notes/${noteId}/award_emoji/${emojiId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete award emoji ${emojiId} on MR note ${noteId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 23. Pipeline Schedules Endpoints
  // ==========================================
  async listProjectPipelineSchedules(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing pipeline schedules for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules`,
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
        `Failed to list pipeline schedules for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectPipelineSchedule(projectId, scheduleId) {
    logger.info(
      `🦊 [GitLab Service] Fetching pipeline schedule ${scheduleId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get pipeline schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  async createProjectPipelineSchedule(projectId, scheduleData) {
    logger.info(
      `🦊 [GitLab Service] Creating pipeline schedule in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules`,
        {
          description: scheduleData.description,
          ref: scheduleData.ref,
          cron: scheduleData.cron,
          cron_timezone: scheduleData.cronTimezone,
          active: scheduleData.active,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create pipeline schedule:`, error);
      throw error;
    }
  },

  async updateProjectPipelineSchedule(projectId, scheduleId, scheduleData) {
    logger.info(
      `🦊 [GitLab Service] Updating pipeline schedule ${scheduleId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
        {
          description: scheduleData.description,
          ref: scheduleData.ref,
          cron: scheduleData.cron,
          cron_timezone: scheduleData.cronTimezone,
          active: scheduleData.active,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update pipeline schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  async deleteProjectPipelineSchedule(projectId, scheduleId) {
    logger.info(
      `🦊 [GitLab Service] Deleting pipeline schedule ${scheduleId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete pipeline schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  async playProjectPipelineSchedule(projectId, scheduleId) {
    logger.info(
      `🦊 [GitLab Service] Triggering pipeline schedule ${scheduleId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}/play`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to trigger pipeline schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 24. Job Artifacts Endpoints
  // ==========================================
  async downloadJobArtifacts(projectId, jobId) {
    logger.info(
      `🦊 [GitLab Service] Downloading artifacts archive for job ${jobId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts`,
        { responseType: 'arraybuffer' },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to download artifacts for job ${jobId}:`, error);
      throw error;
    }
  },

  async downloadJobArtifactFile(projectId, jobId, artifactPath) {
    logger.info(
      `🦊 [GitLab Service] Downloading file ${artifactPath} from job ${jobId} artifacts`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts/${artifactPath}`,
        { responseType: 'arraybuffer' },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to download file ${artifactPath} from job ${jobId} artifacts:`,
        error,
      );
      throw error;
    }
  },

  async deleteJobArtifacts(projectId, jobId) {
    logger.info(
      `🦊 [GitLab Service] Deleting artifacts for job ${jobId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete artifacts for job ${jobId}:`, error);
      throw error;
    }
  },

  async keepJobArtifacts(projectId, jobId) {
    logger.info(
      `🦊 [GitLab Service] Keeping artifacts for job ${jobId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts/keep`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to keep artifacts for job ${jobId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 25. Merge Request Approval Rules Endpoints
  // ==========================================
  async listMergeRequestApprovalRules(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing approval rules for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/approval_rules`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list approval rules for MR ${mrIid}:`, error);
      throw error;
    }
  },

  async createMergeRequestApprovalRule(projectId, mrIid, ruleData) {
    logger.info(
      `🦊 [GitLab Service] Creating approval rule for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/approval_rules`,
        {
          name: ruleData.name,
          approvals_required: ruleData.approvalsRequired,
          user_ids: ruleData.userIds,
          group_ids: ruleData.groupIds,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create approval rule for MR ${mrIid}:`, error);
      throw error;
    }
  },

  async updateMergeRequestApprovalRule(projectId, mrIid, ruleId, ruleData) {
    logger.info(
      `🦊 [GitLab Service] Updating approval rule ${ruleId} for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/approval_rules/${ruleId}`,
        {
          name: ruleData.name,
          approvals_required: ruleData.approvalsRequired,
          user_ids: ruleData.userIds,
          group_ids: ruleData.groupIds,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update approval rule ${ruleId} for MR ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async deleteMergeRequestApprovalRule(projectId, mrIid, ruleId) {
    logger.info(
      `🦊 [GitLab Service] Deleting approval rule ${ruleId} for MR ${mrIid} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/approval_rules/${ruleId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete approval rule ${ruleId} for MR ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectApprovalSettings(projectId) {
    logger.info(
      `🦊 [GitLab Service] Fetching approval settings for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/approvals`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get approval settings for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateProjectApprovalSettings(projectId, settingsData) {
    logger.info(
      `🦊 [GitLab Service] Updating approval settings for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/approvals`,
        {
          approvals_before_merge: settingsData.approvalsBeforeMerge,
          reset_approvals_on_push: settingsData.resetApprovalsOnPush,
          disable_overriding_approvers_per_merge_request:
            settingsData.disableOverridingApproversPerMergeRequest,
          merge_requests_author_approval:
            settingsData.mergeRequestsAuthorApproval,
          merge_requests_disable_committers_approval:
            settingsData.mergeRequestsDisableCommittersApproval,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update approval settings for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 26. Wikis & Wiki Pages Endpoints
  // ==========================================
  async listProjectWikis(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing wiki pages for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/wikis`,
        {
          params: {
            with_content: params.withContent,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list wiki pages for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectWikiPage(projectId, slug) {
    logger.info(
      `🦊 [GitLab Service] Fetching wiki page ${slug} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/wikis/${encodeURIComponent(slug)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get wiki page ${slug}:`, error);
      throw error;
    }
  },

  async createProjectWikiPage(projectId, pageData) {
    logger.info(
      `🦊 [GitLab Service] Creating wiki page ${pageData.title} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/wikis`,
        {
          title: pageData.title,
          content: pageData.content,
          format: pageData.format,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create wiki page:`, error);
      throw error;
    }
  },

  async updateProjectWikiPage(projectId, slug, pageData) {
    logger.info(
      `🦊 [GitLab Service] Updating wiki page ${slug} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/wikis/${encodeURIComponent(slug)}`,
        {
          title: pageData.title,
          content: pageData.content,
          format: pageData.format,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update wiki page ${slug}:`, error);
      throw error;
    }
  },

  async deleteProjectWikiPage(projectId, slug) {
    logger.info(
      `🦊 [GitLab Service] Deleting wiki page ${slug} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/wikis/${encodeURIComponent(slug)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete wiki page ${slug}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 27. Vulnerability State Management Endpoints
  // ==========================================
  async getVulnerabilityDetails(projectId, vulnerabilityId) {
    logger.info(
      `🦊 [GitLab Service] Fetching vulnerability ${vulnerabilityId} details`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/vulnerabilities/${vulnerabilityId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get vulnerability ${vulnerabilityId}:`, error);
      throw error;
    }
  },

  async dismissVulnerability(projectId, vulnerabilityId, dismissalReason) {
    logger.info(
      `🦊 [GitLab Service] Dismissing vulnerability ${vulnerabilityId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/vulnerabilities/${vulnerabilityId}/dismiss`,
        { comment: dismissalReason },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to dismiss vulnerability ${vulnerabilityId}:`,
        error,
      );
      throw error;
    }
  },

  async confirmVulnerability(projectId, vulnerabilityId) {
    logger.info(
      `🦊 [GitLab Service] Confirming vulnerability ${vulnerabilityId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/vulnerabilities/${vulnerabilityId}/confirm`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to confirm vulnerability ${vulnerabilityId}:`,
        error,
      );
      throw error;
    }
  },

  async resolveVulnerability(projectId, vulnerabilityId) {
    logger.info(
      `🦊 [GitLab Service] Resolving vulnerability ${vulnerabilityId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/vulnerabilities/${vulnerabilityId}/resolve`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to resolve vulnerability ${vulnerabilityId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 28. Group & Project Access Requests Endpoints
  // ==========================================
  async listProjectAccessRequests(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing access requests for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/access_requests`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project access requests:`, error);
      throw error;
    }
  },

  async requestProjectAccess(projectId) {
    logger.info(
      `🦊 [GitLab Service] Requesting access to project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/access_requests`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to request project access:`, error);
      throw error;
    }
  },

  async approveProjectAccessRequest(projectId, userId, accessLevel) {
    logger.info(
      `🦊 [GitLab Service] Approving access request for user ${userId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/access_requests/${userId}/approve`,
        { access_level: accessLevel },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to approve project access request for user ${userId}:`,
        error,
      );
      throw error;
    }
  },

  async denyProjectAccessRequest(projectId, userId) {
    logger.info(
      `🦊 [GitLab Service] Denying access request for user ${userId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/access_requests/${userId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to deny project access request for user ${userId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupAccessRequests(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing access requests for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/access_requests`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list group access requests:`, error);
      throw error;
    }
  },

  async requestGroupAccess(groupId) {
    logger.info(`🦊 [GitLab Service] Requesting access to group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/access_requests`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to request group access:`, error);
      throw error;
    }
  },

  async approveGroupAccessRequest(groupId, userId, accessLevel) {
    logger.info(
      `🦊 [GitLab Service] Approving access request for user ${userId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/access_requests/${userId}/approve`,
        { access_level: accessLevel },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to approve group access request for user ${userId}:`,
        error,
      );
      throw error;
    }
  },

  async denyGroupAccessRequest(groupId, userId) {
    logger.info(
      `🦊 [GitLab Service] Denying access request for user ${userId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/access_requests/${userId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to deny group access request for user ${userId}:`,
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

  // ==========================================
  // 29. Protected Branches Endpoints
  // ==========================================
  async listProtectedBranches(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing protected branches for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_branches`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list protected branches for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProtectedBranch(projectId, name) {
    logger.info(
      `🦊 [GitLab Service] Fetching protected branch ${name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_branches/${encodeURIComponent(name)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get protected branch ${name} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async protectBranch(projectId, branchData) {
    logger.info(
      `🦊 [GitLab Service] Protecting branch ${branchData.name} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/protected_branches`,
        {
          name: branchData.name,
          push_access_level: branchData.pushAccessLevel,
          merge_access_level: branchData.mergeAccessLevel,
          unprotect_access_level: branchData.unprotectAccessLevel,
          allow_force_push: branchData.allowForcePush,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to protect branch ${branchData.name} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateProtectedBranch(projectId, name, branchData) {
    logger.info(
      `🦊 [GitLab Service] Updating protected branch ${name} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.patch(
        `/projects/${encodeURIComponent(projectId)}/protected_branches/${encodeURIComponent(name)}`,
        {
          push_access_level: branchData.pushAccessLevel,
          merge_access_level: branchData.mergeAccessLevel,
          unprotect_access_level: branchData.unprotectAccessLevel,
          allow_force_push: branchData.allowForcePush,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update protected branch ${name} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async unprotectBranch(projectId, name) {
    logger.info(
      `🦊 [GitLab Service] Unprotecting branch ${name} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/protected_branches/${encodeURIComponent(name)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to unprotect branch ${name} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 30. Deploy Keys Endpoints
  // ==========================================
  async listProjectDeployKeys(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing deploy keys for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list deploy keys for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectDeployKey(projectId, keyId) {
    logger.info(
      `🦊 [GitLab Service] Fetching deploy key ${keyId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys/${keyId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get deploy key ${keyId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async addProjectDeployKey(projectId, keyData) {
    logger.info(
      `🦊 [GitLab Service] Adding deploy key in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys`,
        {
          title: keyData.title,
          key: keyData.key,
          can_push: keyData.canPush,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to add deploy key in project ${projectId}:`, error);
      throw error;
    }
  },

  async enableProjectDeployKey(projectId, keyId) {
    logger.info(
      `🦊 [GitLab Service] Enabling deploy key ${keyId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys/${keyId}/enable`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to enable deploy key ${keyId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateProjectDeployKey(projectId, keyId, keyData) {
    logger.info(
      `🦊 [GitLab Service] Updating deploy key ${keyId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys/${keyId}`,
        {
          title: keyData.title,
          can_push: keyData.canPush,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update deploy key ${keyId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectDeployKey(projectId, keyId) {
    logger.info(
      `🦊 [GitLab Service] Deleting deploy key ${keyId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/deploy_keys/${keyId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete deploy key ${keyId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 31. Labels Endpoints
  // ==========================================
  async listProjectLabels(projectId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing labels for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/labels`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            with_counts: params.withCounts,
            include_ancestor_groups: params.includeAncestorGroups,
            search: params.search,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list labels for project ${projectId}:`, error);
      throw error;
    }
  },

  async createProjectLabel(projectId, labelData) {
    logger.info(
      `🦊 [GitLab Service] Creating project label ${labelData.name} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/labels`,
        {
          name: labelData.name,
          color: labelData.color,
          description: labelData.description,
          priority: labelData.priority,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create project label:`, error);
      throw error;
    }
  },

  async updateProjectLabel(projectId, labelIdOrName, labelData) {
    logger.info(
      `🦊 [GitLab Service] Updating project label ${labelIdOrName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/labels/${encodeURIComponent(labelIdOrName)}`,
        {
          new_name: labelData.newName || labelData.name,
          color: labelData.color,
          description: labelData.description,
          priority: labelData.priority,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update project label ${labelIdOrName}:`, error);
      throw error;
    }
  },

  async deleteProjectLabel(projectId, labelIdOrName) {
    logger.info(
      `🦊 [GitLab Service] Deleting project label ${labelIdOrName} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/labels/${encodeURIComponent(labelIdOrName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete project label ${labelIdOrName}:`, error);
      throw error;
    }
  },

  async listGroupLabels(groupId, params = {}) {
    logger.info(`🦊 [GitLab Service] Listing labels for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/labels`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            with_counts: params.withCounts,
            only_group_labels: params.onlyGroupLabels,
            search: params.search,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list labels for group ${groupId}:`, error);
      throw error;
    }
  },

  async createGroupLabel(groupId, labelData) {
    logger.info(
      `🦊 [GitLab Service] Creating group label ${labelData.name} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/labels`,
        {
          name: labelData.name,
          color: labelData.color,
          description: labelData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create group label:`, error);
      throw error;
    }
  },

  async updateGroupLabel(groupId, labelIdOrName, labelData) {
    logger.info(
      `🦊 [GitLab Service] Updating group label ${labelIdOrName} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/labels/${encodeURIComponent(labelIdOrName)}`,
        {
          new_name: labelData.newName || labelData.name,
          color: labelData.color,
          description: labelData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update group label ${labelIdOrName}:`, error);
      throw error;
    }
  },

  async deleteGroupLabel(groupId, labelIdOrName) {
    logger.info(
      `🦊 [GitLab Service] Deleting group label ${labelIdOrName} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/labels/${encodeURIComponent(labelIdOrName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete group label ${labelIdOrName}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 32. Todos Endpoints
  // ==========================================
  async listUserTodos(params = {}) {
    logger.info(`🦊 [GitLab Service] Listing pending user todos`);
    try {
      const { data } = await gitlabClient.get('/todos', {
        params: {
          page: params.page || 1,
          per_page: params.perPage || 30,
          action: params.action,
          author_id: params.authorId,
          project_id: params.projectId,
          group_id: params.groupId,
          state: params.state,
          type: params.type,
        },
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list user todos:`, error);
      throw error;
    }
  },

  async createTodoOnIssue(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Creating todo on issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/todo`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create todo on issue ${issueIid}:`, error);
      throw error;
    }
  },

  async createTodoOnMergeRequest(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Creating todo on MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/todo`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create todo on MR ${mrIid}:`, error);
      throw error;
    }
  },

  async markTodoAsDone(todoId) {
    logger.info(`🦊 [GitLab Service] Marking todo ${todoId} as done`);
    try {
      const { data } = await gitlabClient.post(`/todos/${todoId}/mark_as_done`);
      return data;
    } catch (error) {
      logger.error(`Failed to mark todo ${todoId} as done:`, error);
      throw error;
    }
  },

  async markAllTodosAsDone() {
    logger.info(`🦊 [GitLab Service] Marking all user todos as done`);
    try {
      await gitlabClient.post('/todos/mark_as_done');
      return { success: true };
    } catch (error) {
      logger.error(`Failed to mark all todos as done:`, error);
      throw error;
    }
  },

  // ==========================================
  // 33. Project Integrations Endpoints
  // ==========================================
  async listProjectIntegrations(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing integrations for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/integrations`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list integrations for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectIntegration(projectId, integrationSlug) {
    logger.info(
      `🦊 [GitLab Service] Fetching integration ${integrationSlug} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/integrations/${integrationSlug}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get integration ${integrationSlug} settings:`,
        error,
      );
      throw error;
    }
  },

  async updateProjectIntegration(projectId, integrationSlug, integrationData) {
    logger.info(
      `🦊 [GitLab Service] Configuring integration ${integrationSlug} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/integrations/${integrationSlug}`,
        integrationData,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to configure integration ${integrationSlug}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectIntegration(projectId, integrationSlug) {
    logger.info(
      `🦊 [GitLab Service] Disabling integration ${integrationSlug} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/integrations/${integrationSlug}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to disable integration ${integrationSlug}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 34. Repository Extras Endpoints
  // ==========================================
  async getFileBlame(projectId, filePath, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Fetching blame for file ${filePath} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(filePath)}/blame`,
        {
          params: {
            ref: params.ref || 'main',
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get blame for file ${filePath}:`, error);
      throw error;
    }
  },

  async downloadRepositoryArchive(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Downloading repository archive for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/archive`,
        {
          responseType: 'arraybuffer',
          params: {
            sha: params.sha,
            format: params.format || 'zip',
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to download repository archive for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 35. Group Webhooks Endpoints
  // ==========================================
  async listGroupHooks(groupId) {
    logger.info(`🦊 [GitLab Service] Listing webhooks for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/hooks`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list webhooks for group ${groupId}:`, error);
      throw error;
    }
  },

  async getGroupHook(groupId, hookId) {
    logger.info(
      `🦊 [GitLab Service] Fetching webhook ${hookId} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/hooks/${hookId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get webhook ${hookId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async addGroupHook(groupId, hookData) {
    logger.info(`🦊 [GitLab Service] Adding webhook to group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/hooks`,
        {
          url: hookData.url,
          push_events: hookData.pushEvents,
          issues_events: hookData.issuesEvents,
          confidential_issues_events: hookData.confidentialIssuesEvents,
          merge_requests_events: hookData.mergeRequestsEvents,
          tag_push_events: hookData.tagPushEvents,
          note_events: hookData.noteEvents,
          confidential_note_events: hookData.confidentialNoteEvents,
          job_events: hookData.jobEvents,
          pipeline_events: hookData.pipelineEvents,
          wiki_page_events: hookData.wikiPageEvents,
          token: hookData.token,
          enable_ssl_verification: hookData.enableSslVerification,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to add webhook to group ${groupId}:`, error);
      throw error;
    }
  },

  async updateGroupHook(groupId, hookId, hookData) {
    logger.info(
      `🦊 [GitLab Service] Updating webhook ${hookId} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/hooks/${hookId}`,
        {
          url: hookData.url,
          push_events: hookData.pushEvents,
          issues_events: hookData.issuesEvents,
          confidential_issues_events: hookData.confidentialIssuesEvents,
          merge_requests_events: hookData.mergeRequestsEvents,
          tag_push_events: hookData.tagPushEvents,
          note_events: hookData.noteEvents,
          confidential_note_events: hookData.confidentialNoteEvents,
          job_events: hookData.jobEvents,
          pipeline_events: hookData.pipelineEvents,
          wiki_page_events: hookData.wikiPageEvents,
          token: hookData.token,
          enable_ssl_verification: hookData.enableSslVerification,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update webhook ${hookId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupHook(groupId, hookId) {
    logger.info(
      `🦊 [GitLab Service] Deleting webhook ${hookId} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/hooks/${hookId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete webhook ${hookId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 36. Issue Links Endpoints
  // ==========================================
  async listIssueLinks(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Listing issue links for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/links`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list issue links for issue ${issueIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createIssueLink(
    projectId,
    issueIid,
    targetProjectId,
    targetIssueIid,
    linkType = 'relates_to',
  ) {
    logger.info(
      `🦊 [GitLab Service] Linking issue ${issueIid} in project ${projectId} to issue ${targetIssueIid} in project ${targetProjectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/links`,
        {
          target_project_id: targetProjectId,
          target_issue_iid: targetIssueIid,
          link_type: linkType,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to link issue ${issueIid} in project ${projectId} to issue ${targetIssueIid} in project ${targetProjectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteIssueLink(projectId, issueIid, issueLinkId) {
    logger.info(
      `🦊 [GitLab Service] Deleting issue link ${issueLinkId} from issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/links/${issueLinkId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to delete issue link ${issueLinkId} from issue ${issueIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 37. Time Tracking Endpoints
  // ==========================================
  async addIssueTimeSpent(projectId, issueIid, duration) {
    logger.info(
      `🦊 [GitLab Service] Logging ${duration} time spent on issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/add_spent_time`,
        {
          duration,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to log spent time on issue ${issueIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async addMergeRequestTimeSpent(projectId, mrIid, duration) {
    logger.info(
      `🦊 [GitLab Service] Logging ${duration} time spent on MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/add_spent_time`,
        {
          duration,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to log spent time on MR ${mrIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getIssueTimeTracking(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Fetching time tracking stats for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/time_stats`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get time stats for issue ${issueIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getMergeRequestTimeTracking(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Fetching time tracking stats for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/time_stats`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get time stats for MR ${mrIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async resetIssueTimeTracking(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Resetting time tracking stats for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/reset_spent_time`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to reset time stats for issue ${issueIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async resetMergeRequestTimeTracking(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Resetting time tracking stats for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/reset_spent_time`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to reset time stats for MR ${mrIid} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 38. Group Iterations Endpoints
  // ==========================================
  async listGroupIterations(groupId) {
    logger.info(`🦊 [GitLab Service] Listing iterations for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/iterations`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list iterations for group ${groupId}:`, error);
      throw error;
    }
  },

  async listProjectIterations(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing iterations for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/iterations`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list iterations for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createGroupIteration(groupId, iterationData) {
    logger.info(`🦊 [GitLab Service] Creating iteration in group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/iterations`,
        {
          title: iterationData.title,
          description: iterationData.description,
          start_date: iterationData.startDate,
          due_date: iterationData.dueDate,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create iteration in group ${groupId}:`, error);
      throw error;
    }
  },

  async updateGroupIteration(groupId, iterationId, iterationData) {
    logger.info(
      `🦊 [GitLab Service] Updating iteration ${iterationId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/iterations/${iterationId}`,
        {
          title: iterationData.title,
          description: iterationData.description,
          start_date: iterationData.startDate,
          due_date: iterationData.dueDate,
          state_event: iterationData.stateEvent,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update iteration ${iterationId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupIteration(groupId, iterationId) {
    logger.info(
      `🦊 [GitLab Service] Deleting iteration ${iterationId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/iterations/${iterationId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete iteration ${iterationId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 39. Release Links Endpoints
  // ==========================================
  async listReleaseLinks(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Listing release links for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}/assets/links`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list release links for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getReleaseLink(projectId, tagName, linkId) {
    logger.info(
      `🦊 [GitLab Service] Fetching release link ${linkId} for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}/assets/links/${linkId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get release link ${linkId} for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createReleaseLink(projectId, tagName, linkData) {
    logger.info(
      `🦊 [GitLab Service] Creating release link for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}/assets/links`,
        {
          name: linkData.name,
          url: linkData.url,
          direct_asset_path: linkData.directAssetPath,
          link_type: linkData.linkType,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create release link for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateReleaseLink(projectId, tagName, linkId, linkData) {
    logger.info(
      `🦊 [GitLab Service] Updating release link ${linkId} for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}/assets/links/${linkId}`,
        {
          name: linkData.name,
          url: linkData.url,
          direct_asset_path: linkData.directAssetPath,
          link_type: linkData.linkType,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update release link ${linkId} for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteReleaseLink(projectId, tagName, linkId) {
    logger.info(
      `🦊 [GitLab Service] Deleting release link ${linkId} for tag ${tagName} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tagName)}/assets/links/${linkId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to delete release link ${linkId} for tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 40. Repository File Locks Endpoints
  // ==========================================
  async listProjectFileLocks(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing file locks for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/infrastructure/file_locks`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list file locks for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async lockProjectFile(projectId, path) {
    logger.info(
      `🦊 [GitLab Service] Locking file ${path} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/infrastructure/file_locks`,
        {
          path,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to lock file ${path} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async unlockProjectFile(projectId, lockId) {
    logger.info(
      `🦊 [GitLab Service] Unlocking file lock ${lockId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/infrastructure/file_locks/${lockId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to unlock file lock ${lockId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 41. Repository Traversal (Trees) Endpoints
  // ==========================================
  async listRepositoryTree(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Fetching repository tree for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/tree`,
        {
          params: {
            path: params.path,
            ref: params.ref || 'main',
            recursive: params.recursive || false,
            page: params.page || 1,
            per_page: params.perPage || 20,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch repository tree for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 42. Threaded Discussions (Notes) Endpoints
  // ==========================================
  async listIssueDiscussions(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Listing issue discussions for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/discussions`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list issue discussions for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async getIssueDiscussion(projectId, issueIid, discussionId) {
    logger.info(
      `🦊 [GitLab Service] Fetching issue discussion ${discussionId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/discussions/${discussionId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get issue discussion ${discussionId}:`, error);
      throw error;
    }
  },

  async createIssueDiscussion(projectId, issueIid, body) {
    logger.info(
      `🦊 [GitLab Service] Creating issue discussion in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/discussions`,
        {
          body,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create issue discussion:`, error);
      throw error;
    }
  },

  async resolveIssueDiscussion(projectId, issueIid, discussionId, resolved) {
    logger.info(
      `🦊 [GitLab Service] Resolving issue discussion ${discussionId} in project ${projectId}: ${resolved}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/discussions/${discussionId}`,
        {
          resolved,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to resolve issue discussion ${discussionId}:`,
        error,
      );
      throw error;
    }
  },

  async listMergeRequestDiscussions(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing MR discussions for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list MR discussions for MR ${mrIid}:`, error);
      throw error;
    }
  },

  async getMergeRequestDiscussion(projectId, mrIid, discussionId) {
    logger.info(
      `🦊 [GitLab Service] Fetching MR discussion ${discussionId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions/${discussionId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get MR discussion ${discussionId}:`, error);
      throw error;
    }
  },

  async createMergeRequestDiscussion(projectId, mrIid, body) {
    logger.info(
      `🦊 [GitLab Service] Creating MR discussion in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions`,
        {
          body,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create MR discussion:`, error);
      throw error;
    }
  },

  async resolveMergeRequestDiscussion(
    projectId,
    mrIid,
    discussionId,
    resolved,
  ) {
    logger.info(
      `🦊 [GitLab Service] Resolving MR discussion ${discussionId} in project ${projectId}: ${resolved}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions/${discussionId}`,
        {
          resolved,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to resolve MR discussion ${discussionId}:`, error);
      throw error;
    }
  },

  async addMergeRequestDiscussionNote(projectId, mrIid, discussionId, body) {
    logger.info(
      `🦊 [GitLab Service] Replying to MR discussion ${discussionId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions/${discussionId}/notes`,
        {
          body,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to add note to MR discussion ${discussionId}:`,
        error,
      );
      throw error;
    }
  },

  async updateMergeRequestDiscussionNote(
    projectId,
    mrIid,
    discussionId,
    noteId,
    body,
  ) {
    logger.info(
      `🦊 [GitLab Service] Updating MR discussion note ${noteId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions/${discussionId}/notes/${noteId}`,
        {
          body,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update MR discussion note ${noteId}:`, error);
      throw error;
    }
  },

  async deleteMergeRequestDiscussionNote(
    projectId,
    mrIid,
    discussionId,
    noteId,
  ) {
    logger.info(
      `🦊 [GitLab Service] Deleting MR discussion note ${noteId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions/${discussionId}/notes/${noteId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete MR discussion note ${noteId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 43. Project & Group Share Links Endpoints
  // ==========================================
  async shareProjectWithGroup(projectId, shareData) {
    logger.info(
      `🦊 [GitLab Service] Sharing project ${projectId} with group ${shareData.groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/share`,
        {
          group_id: shareData.groupId,
          group_access: shareData.groupAccess,
          expires_at: shareData.expiresAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to share project ${projectId} with group:`, error);
      throw error;
    }
  },

  async unshareProjectFromGroup(projectId, groupId) {
    logger.info(
      `🦊 [GitLab Service] Unsharing project ${projectId} from group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/share/${groupId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to unshare project ${projectId} from group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async shareGroupWithGroup(groupId, shareData) {
    logger.info(
      `🦊 [GitLab Service] Sharing group ${groupId} with group ${shareData.sharedGroupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/share`,
        {
          shared_group_id: shareData.sharedGroupId,
          shared_group_access: shareData.sharedGroupAccess,
          expires_at: shareData.expiresAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to share group ${groupId} with group:`, error);
      throw error;
    }
  },

  async unshareGroupFromGroup(groupId, sharedGroupId) {
    logger.info(
      `🦊 [GitLab Service] Unsharing group ${groupId} from group ${sharedGroupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/share/${sharedGroupId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to unshare group ${groupId} from group ${sharedGroupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 44. Vulnerability Exports Endpoints
  // ==========================================
  async createVulnerabilityExport(params = {}) {
    logger.info('🦊 [GitLab Service] Triggering vulnerability export job');
    try {
      const { data } = await gitlabClient.post(
        '/vulnerability_exports',
        {},
        {
          params: {
            project_id: params.projectId,
            group_id: params.groupId,
            format: params.format || 'csv',
          },
        },
      );
      return data;
    } catch (error) {
      logger.error('Failed to trigger vulnerability export:', error);
      throw error;
    }
  },

  async getVulnerabilityExportStatus(exportId) {
    logger.info(
      `🦊 [GitLab Service] Checking status of vulnerability export ${exportId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/vulnerability_exports/${exportId}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to check status of vulnerability export ${exportId}:`,
        error,
      );
      throw error;
    }
  },

  async downloadVulnerabilityExport(exportId) {
    logger.info(
      `🦊 [GitLab Service] Downloading vulnerability export report ${exportId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/vulnerability_exports/${exportId}/download`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to download vulnerability export report ${exportId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 45. Instance Metadata Endpoints
  // ==========================================
  async getGitlabVersion() {
    logger.info('🦊 [GitLab Service] Fetching GitLab version metadata');
    try {
      const { data } = await gitlabClient.get('/version');
      return data;
    } catch (error) {
      logger.error('Failed to get GitLab version:', error);
      throw error;
    }
  },

  async getGitlabMetadata() {
    logger.info('🦊 [GitLab Service] Fetching GitLab system metadata');
    try {
      const { data } = await gitlabClient.get('/metadata');
      return data;
    } catch (error) {
      logger.error('Failed to get GitLab metadata:', error);
      throw error;
    }
  },

  // ==========================================
  // 46. Resource State Events Endpoints
  // ==========================================
  async listIssueResourceLabelEvents(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Listing issue label events for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/resource_label_events`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list issue label events for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async listMergeRequestResourceLabelEvents(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing MR label events for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/resource_label_events`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list MR label events for MR ${mrIid}:`, error);
      throw error;
    }
  },

  async listIssueResourceMilestoneEvents(projectId, issueIid) {
    logger.info(
      `🦊 [GitLab Service] Listing issue milestone events for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}/resource_milestone_events`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list issue milestone events for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async listMergeRequestResourceMilestoneEvents(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing MR milestone events for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/resource_milestone_events`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list MR milestone events for MR ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 47. Phase 8: Compliance & Security Endpoints
  // ==========================================
  async listProjectDependencies(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing dependencies for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/dependencies`,
        {
          params: {
            page: params.page || 1,
            per_page: params.perPage || 20,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project dependencies:`, error);
      throw error;
    }
  },

  async listGroupComplianceFrameworks(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing compliance frameworks for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/compliance_frameworks`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list group compliance frameworks:`, error);
      throw error;
    }
  },

  async getGroupComplianceFramework(groupId, frameworkId) {
    logger.info(
      `🦊 [GitLab Service] Fetching compliance framework ${frameworkId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/compliance_frameworks/${frameworkId}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get group compliance framework:`, error);
      throw error;
    }
  },

  async createGroupComplianceFramework(groupId, frameworkData) {
    logger.info(
      `🦊 [GitLab Service] Creating compliance framework in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/compliance_frameworks`,
        {
          name: frameworkData.name,
          description: frameworkData.description,
          color: frameworkData.color,
          default: frameworkData.default,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create group compliance framework:`, error);
      throw error;
    }
  },

  async updateGroupComplianceFramework(groupId, frameworkId, frameworkData) {
    logger.info(
      `🦊 [GitLab Service] Updating compliance framework ${frameworkId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/compliance_frameworks/${frameworkId}`,
        {
          name: frameworkData.name,
          description: frameworkData.description,
          color: frameworkData.color,
          default: frameworkData.default,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update group compliance framework:`, error);
      throw error;
    }
  },

  async deleteGroupComplianceFramework(groupId, frameworkId) {
    logger.info(
      `🦊 [GitLab Service] Deleting compliance framework ${frameworkId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/compliance_frameworks/${frameworkId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete group compliance framework:`, error);
      throw error;
    }
  },

  async getProjectComplianceFramework(projectId) {
    logger.info(
      `🦊 [GitLab Service] Fetching compliance framework for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/compliance_frameworks`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get project compliance framework:`, error);
      throw error;
    }
  },

  async listProjectManagedLicenses(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing managed licenses for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/managed_licenses`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project managed licenses:`, error);
      throw error;
    }
  },

  async createProjectManagedLicense(projectId, licenseData) {
    logger.info(
      `🦊 [GitLab Service] Creating managed license for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/managed_licenses`,
        {
          name: licenseData.name,
          approval_status: licenseData.approvalStatus,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create project managed license:`, error);
      throw error;
    }
  },

  async updateProjectManagedLicense(projectId, licenseId, licenseData) {
    logger.info(
      `🦊 [GitLab Service] Updating managed license ${licenseId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.patch(
        `/projects/${encodeURIComponent(projectId)}/managed_licenses/${licenseId}`,
        {
          approval_status: licenseData.approvalStatus,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update project managed license:`, error);
      throw error;
    }
  },

  async deleteProjectManagedLicense(projectId, licenseId) {
    logger.info(
      `🦊 [GitLab Service] Deleting managed license ${licenseId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/managed_licenses/${licenseId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete project managed license:`, error);
      throw error;
    }
  },

  async listProtectedEnvironments(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing protected environments for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_environments`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list protected environments:`, error);
      throw error;
    }
  },

  async getProtectedEnvironment(projectId, name) {
    logger.info(
      `🦊 [GitLab Service] Fetching protected environment ${name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_environments/${encodeURIComponent(name)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get protected environment ${name}:`, error);
      throw error;
    }
  },

  async protectEnvironment(projectId, environmentData) {
    logger.info(
      `🦊 [GitLab Service] Protecting environment ${environmentData.name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/protected_environments`,
        {
          name: environmentData.name,
          deploy_access_levels: environmentData.deployAccessLevels,
          required_approval_count: environmentData.requiredApprovalCount,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to protect environment:`, error);
      throw error;
    }
  },

  async updateProtectedEnvironment(projectId, name, environmentData) {
    logger.info(
      `🦊 [GitLab Service] Updating protected environment ${name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/protected_environments/${encodeURIComponent(name)}`,
        {
          deploy_access_levels: environmentData.deployAccessLevels,
          required_approval_count: environmentData.requiredApprovalCount,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update protected environment ${name}:`, error);
      throw error;
    }
  },

  async unprotectEnvironment(projectId, name) {
    logger.info(
      `🦊 [GitLab Service] Unprotecting environment ${name} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/protected_environments/${encodeURIComponent(name)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to unprotect environment ${name}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 43. Phase 9 Endpoints
  // ==========================================

  // 1. SAML Group Links
  async listGroupSamlGroupLinks(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing SAML group links for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/saml_group_links`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list SAML group links:`, error);
      throw error;
    }
  },

  async getGroupSamlGroupLink(groupId, samlGroupName) {
    logger.info(
      `🦊 [GitLab Service] Fetching SAML group link ${samlGroupName} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/saml_group_links/${encodeURIComponent(samlGroupName)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get SAML group link ${samlGroupName}:`, error);
      throw error;
    }
  },

  async createGroupSamlGroupLink(groupId, linkData) {
    logger.info(
      `🦊 [GitLab Service] Creating SAML group link for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/saml_group_links`,
        {
          saml_group_name: linkData.samlGroupName,
          access_level: linkData.accessLevel,
          member_role_id: linkData.memberRoleId,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create SAML group link:`, error);
      throw error;
    }
  },

  async deleteGroupSamlGroupLink(groupId, samlGroupName) {
    logger.info(
      `🦊 [GitLab Service] Deleting SAML group link ${samlGroupName} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/saml_group_links/${encodeURIComponent(samlGroupName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete SAML group link ${samlGroupName}:`, error);
      throw error;
    }
  },

  // 2. User Custom Attributes
  async listUserCustomAttributes(userId) {
    logger.info(
      `🦊 [GitLab Service] Listing custom attributes for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/users/${encodeURIComponent(userId)}/custom_attributes`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list user custom attributes:`, error);
      throw error;
    }
  },

  async getUserCustomAttribute(userId, key) {
    logger.info(
      `🦊 [GitLab Service] Fetching custom attribute ${key} for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/users/${encodeURIComponent(userId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get user custom attribute ${key}:`, error);
      throw error;
    }
  },

  async setUserCustomAttribute(userId, key, value) {
    logger.info(
      `🦊 [GitLab Service] Setting custom attribute ${key} for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/users/${encodeURIComponent(userId)}/custom_attributes/${encodeURIComponent(key)}`,
        { value },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to set user custom attribute ${key}:`, error);
      throw error;
    }
  },

  async deleteUserCustomAttribute(userId, key) {
    logger.info(
      `🦊 [GitLab Service] Deleting custom attribute ${key} for user ${userId}`,
    );
    try {
      await gitlabClient.delete(
        `/users/${encodeURIComponent(userId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete user custom attribute ${key}:`, error);
      throw error;
    }
  },

  // 3. User Impersonation Tokens
  async listUserImpersonationTokens(userId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing impersonation tokens for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/users/${encodeURIComponent(userId)}/impersonation_tokens`,
        { params },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list user impersonation tokens:`, error);
      throw error;
    }
  },

  async getUserImpersonationToken(userId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Fetching impersonation token ${tokenId} for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/users/${encodeURIComponent(userId)}/impersonation_tokens/${encodeURIComponent(tokenId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get user impersonation token ${tokenId}:`, error);
      throw error;
    }
  },

  async createUserImpersonationToken(userId, tokenData) {
    logger.info(
      `🦊 [GitLab Service] Creating impersonation token for user ${userId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/users/${encodeURIComponent(userId)}/impersonation_tokens`,
        {
          name: tokenData.name,
          scopes: tokenData.scopes,
          expires_at: tokenData.expiresAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create user impersonation token:`, error);
      throw error;
    }
  },

  async revokeUserImpersonationToken(userId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Revoking impersonation token ${tokenId} for user ${userId}`,
    );
    try {
      await gitlabClient.delete(
        `/users/${encodeURIComponent(userId)}/impersonation_tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to revoke user impersonation token ${tokenId}:`,
        error,
      );
      throw error;
    }
  },

  // 4. SCIM Group Provisioning
  async listGroupScimUsers(groupId) {
    logger.info(`🦊 [GitLab Service] Listing SCIM users for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/scim/v2/users`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list SCIM users:`, error);
      throw error;
    }
  },

  async getGroupScimUser(groupId, scimUserId) {
    logger.info(
      `🦊 [GitLab Service] Fetching SCIM user ${scimUserId} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/scim/v2/users/${encodeURIComponent(scimUserId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get SCIM user ${scimUserId}:`, error);
      throw error;
    }
  },

  async createGroupScimUser(groupId, scimUserData) {
    logger.info(`🦊 [GitLab Service] Creating SCIM user in group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/scim/v2/users`,
        scimUserData,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create SCIM user:`, error);
      throw error;
    }
  },

  async updateGroupScimUser(groupId, scimUserId, scimUserData) {
    logger.info(
      `🦊 [GitLab Service] Updating SCIM user ${scimUserId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/scim/v2/users/${encodeURIComponent(scimUserId)}`,
        scimUserData,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update SCIM user ${scimUserId}:`, error);
      throw error;
    }
  },

  async deleteGroupScimUser(groupId, scimUserId) {
    logger.info(
      `🦊 [GitLab Service] Deleting SCIM user ${scimUserId} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/scim/v2/users/${encodeURIComponent(scimUserId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete SCIM user ${scimUserId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 44. Phase 10 Endpoints
  // ==========================================

  // 1. Commit Comments
  async listCommitComments(projectId, sha) {
    logger.info(
      `🦊 [GitLab Service] Listing commit comments for project ${projectId} commit ${sha}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/repository/commits/${encodeURIComponent(sha)}/comments`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list commit comments:`, error);
      throw error;
    }
  },

  // 2. Project Forks
  async listProjectForks(projectId) {
    logger.info(`🦊 [GitLab Service] Listing forks for project ${projectId}`);
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/forks`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project forks:`, error);
      throw error;
    }
  },

  async createProjectFork(projectId, forkData = {}) {
    logger.info(`🦊 [GitLab Service] Forking project ${projectId}`);
    try {
      const payload = {};
      if (forkData.namespaceId !== undefined)
        payload.namespace_id = forkData.namespaceId;
      if (forkData.name !== undefined) payload.name = forkData.name;
      if (forkData.path !== undefined) payload.path = forkData.path;
      if (forkData.visibility !== undefined)
        payload.visibility = forkData.visibility;

      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/fork`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to fork project:`, error);
      throw error;
    }
  },

  // 3. Project & Group Push Rules
  async getProjectPushRules(projectId) {
    logger.info(
      `🦊 [GitLab Service] Fetching push rules for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/push_rule`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get project push rules:`, error);
      throw error;
    }
  },

  async createProjectPushRules(projectId, pushRuleData) {
    logger.info(
      `🦊 [GitLab Service] Creating push rules for project ${projectId}`,
    );
    try {
      const payload = {};
      if (pushRuleData.denyDeleteTag !== undefined)
        payload.deny_delete_tag = pushRuleData.denyDeleteTag;
      if (pushRuleData.memberCheck !== undefined)
        payload.member_check = pushRuleData.memberCheck;
      if (pushRuleData.preventSecrets !== undefined)
        payload.prevent_secrets = pushRuleData.preventSecrets;
      if (pushRuleData.commitMessageRegex !== undefined)
        payload.commit_message_regex = pushRuleData.commitMessageRegex;
      if (pushRuleData.commitMessageNegativeRegex !== undefined)
        payload.commit_message_negative_regex =
          pushRuleData.commitMessageNegativeRegex;
      if (pushRuleData.branchNameRegex !== undefined)
        payload.branch_name_regex = pushRuleData.branchNameRegex;
      if (pushRuleData.authorEmailRegex !== undefined)
        payload.author_email_regex = pushRuleData.authorEmailRegex;
      if (pushRuleData.fileNameRegex !== undefined)
        payload.file_name_regex = pushRuleData.fileNameRegex;
      if (pushRuleData.maxFileSize !== undefined)
        payload.max_file_size = pushRuleData.maxFileSize;
      if (pushRuleData.commitCommitterCheck !== undefined)
        payload.commit_committer_check = pushRuleData.commitCommitterCheck;
      if (pushRuleData.commitCommitterNameCheck !== undefined)
        payload.commit_committer_name_check =
          pushRuleData.commitCommitterNameCheck;
      if (pushRuleData.rejectUnsignedCommits !== undefined)
        payload.reject_unsigned_commits = pushRuleData.rejectUnsignedCommits;

      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/push_rule`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create project push rules:`, error);
      throw error;
    }
  },

  async updateProjectPushRules(projectId, pushRuleData) {
    logger.info(
      `🦊 [GitLab Service] Updating push rules for project ${projectId}`,
    );
    try {
      const payload = {};
      if (pushRuleData.denyDeleteTag !== undefined)
        payload.deny_delete_tag = pushRuleData.denyDeleteTag;
      if (pushRuleData.memberCheck !== undefined)
        payload.member_check = pushRuleData.memberCheck;
      if (pushRuleData.preventSecrets !== undefined)
        payload.prevent_secrets = pushRuleData.preventSecrets;
      if (pushRuleData.commitMessageRegex !== undefined)
        payload.commit_message_regex = pushRuleData.commitMessageRegex;
      if (pushRuleData.commitMessageNegativeRegex !== undefined)
        payload.commit_message_negative_regex =
          pushRuleData.commitMessageNegativeRegex;
      if (pushRuleData.branchNameRegex !== undefined)
        payload.branch_name_regex = pushRuleData.branchNameRegex;
      if (pushRuleData.authorEmailRegex !== undefined)
        payload.author_email_regex = pushRuleData.authorEmailRegex;
      if (pushRuleData.fileNameRegex !== undefined)
        payload.file_name_regex = pushRuleData.fileNameRegex;
      if (pushRuleData.maxFileSize !== undefined)
        payload.max_file_size = pushRuleData.maxFileSize;
      if (pushRuleData.commitCommitterCheck !== undefined)
        payload.commit_committer_check = pushRuleData.commitCommitterCheck;
      if (pushRuleData.commitCommitterNameCheck !== undefined)
        payload.commit_committer_name_check =
          pushRuleData.commitCommitterNameCheck;
      if (pushRuleData.rejectUnsignedCommits !== undefined)
        payload.reject_unsigned_commits = pushRuleData.rejectUnsignedCommits;

      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/push_rule`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update project push rules:`, error);
      throw error;
    }
  },

  async deleteProjectPushRules(projectId) {
    logger.info(
      `🦊 [GitLab Service] Deleting push rules for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/push_rule`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete project push rules:`, error);
      throw error;
    }
  },

  async getGroupPushRules(groupId) {
    logger.info(`🦊 [GitLab Service] Fetching push rules for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/push_rule`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get group push rules:`, error);
      throw error;
    }
  },

  async createGroupPushRules(groupId, pushRuleData) {
    logger.info(`🦊 [GitLab Service] Creating push rules for group ${groupId}`);
    try {
      const payload = {};
      if (pushRuleData.denyDeleteTag !== undefined)
        payload.deny_delete_tag = pushRuleData.denyDeleteTag;
      if (pushRuleData.memberCheck !== undefined)
        payload.member_check = pushRuleData.memberCheck;
      if (pushRuleData.preventSecrets !== undefined)
        payload.prevent_secrets = pushRuleData.preventSecrets;
      if (pushRuleData.commitMessageRegex !== undefined)
        payload.commit_message_regex = pushRuleData.commitMessageRegex;
      if (pushRuleData.commitMessageNegativeRegex !== undefined)
        payload.commit_message_negative_regex =
          pushRuleData.commitMessageNegativeRegex;
      if (pushRuleData.branchNameRegex !== undefined)
        payload.branch_name_regex = pushRuleData.branchNameRegex;
      if (pushRuleData.authorEmailRegex !== undefined)
        payload.author_email_regex = pushRuleData.authorEmailRegex;
      if (pushRuleData.fileNameRegex !== undefined)
        payload.file_name_regex = pushRuleData.fileNameRegex;
      if (pushRuleData.maxFileSize !== undefined)
        payload.max_file_size = pushRuleData.maxFileSize;
      if (pushRuleData.commitCommitterCheck !== undefined)
        payload.commit_committer_check = pushRuleData.commitCommitterCheck;
      if (pushRuleData.commitCommitterNameCheck !== undefined)
        payload.commit_committer_name_check =
          pushRuleData.commitCommitterNameCheck;
      if (pushRuleData.rejectUnsignedCommits !== undefined)
        payload.reject_unsigned_commits = pushRuleData.rejectUnsignedCommits;

      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/push_rule`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create group push rules:`, error);
      throw error;
    }
  },

  async updateGroupPushRules(groupId, pushRuleData) {
    logger.info(`🦊 [GitLab Service] Updating push rules for group ${groupId}`);
    try {
      const payload = {};
      if (pushRuleData.denyDeleteTag !== undefined)
        payload.deny_delete_tag = pushRuleData.denyDeleteTag;
      if (pushRuleData.memberCheck !== undefined)
        payload.member_check = pushRuleData.memberCheck;
      if (pushRuleData.preventSecrets !== undefined)
        payload.prevent_secrets = pushRuleData.preventSecrets;
      if (pushRuleData.commitMessageRegex !== undefined)
        payload.commit_message_regex = pushRuleData.commitMessageRegex;
      if (pushRuleData.commitMessageNegativeRegex !== undefined)
        payload.commit_message_negative_regex =
          pushRuleData.commitMessageNegativeRegex;
      if (pushRuleData.branchNameRegex !== undefined)
        payload.branch_name_regex = pushRuleData.branchNameRegex;
      if (pushRuleData.authorEmailRegex !== undefined)
        payload.author_email_regex = pushRuleData.authorEmailRegex;
      if (pushRuleData.fileNameRegex !== undefined)
        payload.file_name_regex = pushRuleData.fileNameRegex;
      if (pushRuleData.maxFileSize !== undefined)
        payload.max_file_size = pushRuleData.maxFileSize;
      if (pushRuleData.commitCommitterCheck !== undefined)
        payload.commit_committer_check = pushRuleData.commitCommitterCheck;
      if (pushRuleData.commitCommitterNameCheck !== undefined)
        payload.commit_committer_name_check =
          pushRuleData.commitCommitterNameCheck;
      if (pushRuleData.rejectUnsignedCommits !== undefined)
        payload.reject_unsigned_commits = pushRuleData.rejectUnsignedCommits;

      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/push_rule`,
        payload,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update group push rules:`, error);
      throw error;
    }
  },

  async deleteGroupPushRules(groupId) {
    logger.info(`🦊 [GitLab Service] Deleting push rules for group ${groupId}`);
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/push_rule`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete group push rules:`, error);
      throw error;
    }
  },

  // 4. Merge Request Draft Notes
  async listMergeRequestDraftNotes(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Listing draft notes for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/draft_notes`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list merge request draft notes:`, error);
      throw error;
    }
  },

  async createMergeRequestDraftNote(projectId, mrIid, noteData) {
    logger.info(
      `🦊 [GitLab Service] Creating draft note for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/draft_notes`,
        {
          note: noteData.note,
          commit_id: noteData.commitId,
          path: noteData.path,
          line: noteData.line,
          position: noteData.position,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to create merge request draft note:`, error);
      throw error;
    }
  },

  async updateMergeRequestDraftNote(projectId, mrIid, draftNoteId, noteData) {
    logger.info(
      `🦊 [GitLab Service] Updating draft note ${draftNoteId} for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/draft_notes/${draftNoteId}`,
        {
          note: noteData.note,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update merge request draft note:`, error);
      throw error;
    }
  },

  async deleteMergeRequestDraftNote(projectId, mrIid, draftNoteId) {
    logger.info(
      `🦊 [GitLab Service] Deleting draft note ${draftNoteId} for MR ${mrIid} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/draft_notes/${draftNoteId}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete merge request draft note:`, error);
      throw error;
    }
  },

  async publishMergeRequestDraftNotes(projectId, mrIid) {
    logger.info(
      `🦊 [GitLab Service] Publishing draft notes for MR ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/draft_notes/publish`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to publish merge request draft notes:`, error);
      throw error;
    }
  },

  // 5. Project & Group Invitations
  async listGroupInvitations(groupId) {
    logger.info(`🦊 [GitLab Service] Listing invitations for group ${groupId}`);
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/invitations`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list group invitations:`, error);
      throw error;
    }
  },

  async inviteGroupMembers(groupId, invitationData) {
    logger.info(`🦊 [GitLab Service] Inviting members to group ${groupId}`);
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/invitations`,
        {
          email: invitationData.email,
          access_level: invitationData.accessLevel,
          invitee_type: invitationData.inviteeType,
          expires_at: invitationData.expiresAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to invite group members:`, error);
      throw error;
    }
  },

  async deleteGroupInvitation(groupId, email) {
    logger.info(
      `🦊 [GitLab Service] Revoking group invitation for ${email} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/invitations/${encodeURIComponent(email)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete group invitation:`, error);
      throw error;
    }
  },

  async listProjectInvitations(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing invitations for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/invitations`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to list project invitations:`, error);
      throw error;
    }
  },

  async inviteProjectMembers(projectId, invitationData) {
    logger.info(`🦊 [GitLab Service] Inviting members to project ${projectId}`);
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/invitations`,
        {
          email: invitationData.email,
          access_level: invitationData.accessLevel,
          invitee_type: invitationData.inviteeType,
          expires_at: invitationData.expiresAt,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to invite project members:`, error);
      throw error;
    }
  },

  async deleteProjectInvitation(projectId, email) {
    logger.info(
      `🦊 [GitLab Service] Revoking project invitation for ${email} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/invitations/${encodeURIComponent(email)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete project invitation:`, error);
      throw error;
    }
  },

  // ==========================================
  // 46. Phase 11: System Hooks, Instance Audit Events, Project & Group Custom Attributes & Application Settings
  // ==========================================
  async listSystemHooks() {
    logger.info('🦊 [GitLab Service] Listing system hooks');
    try {
      const { data } = await gitlabClient.get('/system_hooks');
      return data;
    } catch (error) {
      logger.error('Failed to list system hooks:', error);
      throw error;
    }
  },

  async addSystemHook(hookData = {}) {
    logger.info('🦊 [GitLab Service] Adding a system hook');
    try {
      const { data } = await gitlabClient.post('/system_hooks', {
        url: hookData.url,
        token: hookData.token,
        push_events: hookData.pushEvents,
        tag_push_events: hookData.tagPushEvents,
        merge_requests_events: hookData.mergeRequestsEvents,
        repository_update_events: hookData.repositoryUpdateEvents,
        enable_ssl_verification: hookData.enableSslVerification,
      });
      return data;
    } catch (error) {
      logger.error('Failed to add system hook:', error);
      throw error;
    }
  },

  async testSystemHook(hookId) {
    logger.info(`🦊 [GitLab Service] Testing system hook ${hookId}`);
    try {
      const { data } = await gitlabClient.post(
        `/system_hooks/${encodeURIComponent(hookId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to test system hook ${hookId}:`, error);
      throw error;
    }
  },

  async deleteSystemHook(hookId) {
    logger.info(`🦊 [GitLab Service] Deleting system hook ${hookId}`);
    try {
      await gitlabClient.delete(`/system_hooks/${encodeURIComponent(hookId)}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete system hook ${hookId}:`, error);
      throw error;
    }
  },

  async listInstanceAuditEvents(params = {}) {
    logger.info('🦊 [GitLab Service] Listing instance-wide audit events');
    try {
      const { data } = await gitlabClient.get('/audit_events', {
        params: {
          created_after: params.createdAfter,
          created_before: params.createdBefore,
          entity_type: params.entityType,
          entity_id: params.entityId,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list instance-wide audit events:', error);
      throw error;
    }
  },

  async listProjectCustomAttributes(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing custom attributes for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/custom_attributes`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list project custom attributes for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectCustomAttribute(projectId, key) {
    logger.info(
      `🦊 [GitLab Service] Getting custom attribute "${key}" for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get project custom attribute "${key}" for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async setProjectCustomAttribute(projectId, key, value) {
    logger.info(
      `🦊 [GitLab Service] Setting custom attribute "${key}" to "${value}" for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/custom_attributes/${encodeURIComponent(key)}`,
        { value },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to set project custom attribute "${key}" for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectCustomAttribute(projectId, key) {
    logger.info(
      `🦊 [GitLab Service] Deleting custom attribute "${key}" for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete project custom attribute "${key}" for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupCustomAttributes(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing custom attributes for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/custom_attributes`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list group custom attributes for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async getGroupCustomAttribute(groupId, key) {
    logger.info(
      `🦊 [GitLab Service] Getting custom attribute "${key}" for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get group custom attribute "${key}" for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async setGroupCustomAttribute(groupId, key, value) {
    logger.info(
      `🦊 [GitLab Service] Setting custom attribute "${key}" to "${value}" for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/custom_attributes/${encodeURIComponent(key)}`,
        { value },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to set group custom attribute "${key}" for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupCustomAttribute(groupId, key) {
    logger.info(
      `🦊 [GitLab Service] Deleting custom attribute "${key}" for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/custom_attributes/${encodeURIComponent(key)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete group custom attribute "${key}" for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async getApplicationSettings() {
    logger.info('🦊 [GitLab Service] Fetching global application settings');
    try {
      const { data } = await gitlabClient.get('/application/settings');
      return data;
    } catch (error) {
      logger.error('Failed to get application settings:', error);
      throw error;
    }
  },

  async updateApplicationSettings(settings = {}) {
    logger.info('🦊 [GitLab Service] Updating global application settings');
    try {
      const { data } = await gitlabClient.put(
        '/application/settings',
        settings,
      );
      return data;
    } catch (error) {
      logger.error('Failed to update application settings:', error);
      throw error;
    }
  },

  // ==========================================
  // 47. Phase 12: Project Secure Files, Group Access Tokens, Broadcast Messages, and Markdown Rendering
  // ==========================================
  async listProjectSecureFiles(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing secure files for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/secure_files`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list project secure files for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectSecureFile(projectId, fileId) {
    logger.info(
      `🦊 [GitLab Service] Getting secure file ${fileId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/secure_files/${encodeURIComponent(fileId)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get project secure file ${fileId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createProjectSecureFile(projectId, fileData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating secure file "${fileData.name}" for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/secure_files`,
        fileData,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create project secure file for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectSecureFile(projectId, fileId) {
    logger.info(
      `🦊 [GitLab Service] Deleting secure file ${fileId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/secure_files/${encodeURIComponent(fileId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete project secure file ${fileId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupAccessTokens(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing group access tokens for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/access_tokens`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list group access tokens for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async createGroupAccessToken(groupId, tokenData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating group access token for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/access_tokens`,
        {
          name: tokenData.name,
          scopes: tokenData.scopes,
          expires_at: tokenData.expiresAt,
          access_level: tokenData.accessLevel,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create group access token for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async revokeGroupAccessToken(groupId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Revoking group access token ${tokenId} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/access_tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to revoke group access token ${tokenId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async listBroadcastMessages() {
    logger.info('🦊 [GitLab Service] Listing broadcast messages');
    try {
      const { data } = await gitlabClient.get('/broadcast_messages');
      return data;
    } catch (error) {
      logger.error('Failed to list broadcast messages:', error);
      throw error;
    }
  },

  async getBroadcastMessage(messageId) {
    logger.info(`🦊 [GitLab Service] Getting broadcast message ${messageId}`);
    try {
      const { data } = await gitlabClient.get(
        `/broadcast_messages/${encodeURIComponent(messageId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get broadcast message ${messageId}:`, error);
      throw error;
    }
  },

  async createBroadcastMessage(messageData = {}) {
    logger.info('🦊 [GitLab Service] Creating broadcast message');
    try {
      const { data } = await gitlabClient.post('/broadcast_messages', {
        message: messageData.message,
        starts_at: messageData.startsAt,
        ends_at: messageData.endsAt,
        color: messageData.color,
        font: messageData.font,
        target_path: messageData.targetPath,
        broadcast_type: messageData.broadcastType,
        dismissible: messageData.dismissible,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create broadcast message:', error);
      throw error;
    }
  },

  async updateBroadcastMessage(messageId, messageData = {}) {
    logger.info(`🦊 [GitLab Service] Updating broadcast message ${messageId}`);
    try {
      const { data } = await gitlabClient.put(
        `/broadcast_messages/${encodeURIComponent(messageId)}`,
        {
          message: messageData.message,
          starts_at: messageData.startsAt,
          ends_at: messageData.endsAt,
          color: messageData.color,
          font: messageData.font,
          target_path: messageData.targetPath,
          broadcast_type: messageData.broadcastType,
          dismissible: messageData.dismissible,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update broadcast message ${messageId}:`, error);
      throw error;
    }
  },

  async deleteBroadcastMessage(messageId) {
    logger.info(`🦊 [GitLab Service] Deleting broadcast message ${messageId}`);
    try {
      await gitlabClient.delete(
        `/broadcast_messages/${encodeURIComponent(messageId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete broadcast message ${messageId}:`, error);
      throw error;
    }
  },

  async renderMarkdown(text, gfmProject) {
    logger.info('🦊 [GitLab Service] Rendering markdown text');
    try {
      const { data } = await gitlabClient.post('/markdown', {
        text,
        gfm: true,
        project: gfmProject,
      });
      return data;
    } catch (error) {
      logger.error('Failed to render markdown:', error);
      throw error;
    }
  },

  // ==========================================
  // 48. Phase 13: Deploy Tokens, Personal Access Tokens, Project Topics, and MR Suggestions
  // ==========================================
  async listProjectDeployTokens(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing deploy tokens for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/deploy_tokens`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list project deploy tokens for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createProjectDeployToken(projectId, tokenData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating deploy token for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/deploy_tokens`,
        {
          name: tokenData.name,
          scopes: tokenData.scopes,
          expires_at: tokenData.expiresAt,
          username: tokenData.username,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create project deploy token for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectDeployToken(projectId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Deleting deploy token ${tokenId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/deploy_tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete project deploy token ${tokenId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupDeployTokens(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing deploy tokens for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/deploy_tokens`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list group deploy tokens for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async createGroupDeployToken(groupId, tokenData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating deploy token for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/deploy_tokens`,
        {
          name: tokenData.name,
          scopes: tokenData.scopes,
          expires_at: tokenData.expiresAt,
          username: tokenData.username,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create group deploy token for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupDeployToken(groupId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Deleting deploy token ${tokenId} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/deploy_tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete group deploy token ${tokenId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async listPersonalAccessTokens(params = {}) {
    logger.info('🦊 [GitLab Service] Listing personal access tokens');
    try {
      const { data } = await gitlabClient.get('/personal_access_tokens', {
        params: {
          user_id: params.userId,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list personal access tokens:', error);
      throw error;
    }
  },

  async getPersonalAccessToken(tokenId) {
    logger.info(
      `🦊 [GitLab Service] Getting details for personal access token ${tokenId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/personal_access_tokens/${encodeURIComponent(tokenId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get personal access token ${tokenId}:`, error);
      throw error;
    }
  },

  async createPersonalAccessToken(tokenData = {}) {
    logger.info('🦊 [GitLab Service] Creating a personal access token');
    try {
      const { data } = await gitlabClient.post('/personal_access_tokens', {
        user_id: tokenData.userId,
        name: tokenData.name,
        scopes: tokenData.scopes,
        expires_at: tokenData.expiresAt,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create personal access token:', error);
      throw error;
    }
  },

  async revokePersonalAccessToken(tokenId) {
    logger.info(
      `🦊 [GitLab Service] Revoking personal access token ${tokenId}`,
    );
    try {
      await gitlabClient.delete(
        `/personal_access_tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to revoke personal access token ${tokenId}:`, error);
      throw error;
    }
  },

  async listProjectTopics(params = {}) {
    logger.info('🦊 [GitLab Service] Listing project topics');
    try {
      const { data } = await gitlabClient.get('/topics', {
        params: {
          search: params.search,
          without_projects: params.withoutProjects,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list project topics:', error);
      throw error;
    }
  },

  async getProjectTopic(topicId) {
    logger.info(`🦊 [GitLab Service] Getting details for topic ${topicId}`);
    try {
      const { data } = await gitlabClient.get(
        `/topics/${encodeURIComponent(topicId)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get topic ${topicId}:`, error);
      throw error;
    }
  },

  async createProjectTopic(topicData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating project topic "${topicData.name}"`,
    );
    try {
      const { data } = await gitlabClient.post('/topics', {
        name: topicData.name,
        title: topicData.title,
        description: topicData.description,
      });
      return data;
    } catch (error) {
      logger.error('Failed to create topic:', error);
      throw error;
    }
  },

  async updateProjectTopic(topicId, topicData = {}) {
    logger.info(`🦊 [GitLab Service] Updating project topic ${topicId}`);
    try {
      const { data } = await gitlabClient.put(
        `/topics/${encodeURIComponent(topicId)}`,
        {
          name: topicData.name,
          title: topicData.title,
          description: topicData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to update topic ${topicId}:`, error);
      throw error;
    }
  },

  async deleteProjectTopic(topicId) {
    logger.info(`🦊 [GitLab Service] Deleting project topic ${topicId}`);
    try {
      await gitlabClient.delete(`/topics/${encodeURIComponent(topicId)}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete topic ${topicId}:`, error);
      throw error;
    }
  },

  async applyMergeRequestSuggestion(suggestionId) {
    logger.info(`🦊 [GitLab Service] Applying MR suggestion ${suggestionId}`);
    try {
      const { data } = await gitlabClient.put(
        `/suggestions/${encodeURIComponent(suggestionId)}/apply`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to apply suggestion ${suggestionId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 49. Phase 14: Protected Tags, DORA Metrics, Feature Flags, Resource Groups, and Iteration Cadences
  // ==========================================
  async listProtectedTags(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing protected tags for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_tags`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list protected tags for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProtectedTag(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Getting protected tag ${tagName} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/protected_tags/${encodeURIComponent(tagName)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Protected tag ${tagName} not found for project ${projectId}, returning safe default`,
        );
        return { protected: false };
      }
      logger.error(
        `Failed to get protected tag ${tagName} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async protectTag(projectId, tagData = {}) {
    logger.info(
      `🦊 [GitLab Service] Protecting tag ${tagData.name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/protected_tags`,
        {
          name: tagData.name,
          create_access_level: tagData.createAccessLevel,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed to protect tag for project ${projectId}:`, error);
      throw error;
    }
  },

  async unprotectTag(projectId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Unprotecting tag ${tagName} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/protected_tags/${encodeURIComponent(tagName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to unprotect tag ${tagName} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectDoraMetrics(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Getting DORA metrics for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/dora/metrics`,
        {
          params: {
            metric_type: params.metricType,
            start_date: params.startDate,
            end_date: params.endDate,
            interval: params.interval,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get DORA metrics for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listFeatureFlags(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing feature flags for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/feature_flags`,
        { params },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list feature flags for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getFeatureFlag(projectId, flagId) {
    logger.info(
      `🦊 [GitLab Service] Getting feature flag ${flagId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/feature_flags/${encodeURIComponent(flagId)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get feature flag ${flagId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createFeatureFlag(projectId, flagData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating feature flag "${flagData.name}" for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/feature_flags`,
        {
          name: flagData.name,
          description: flagData.description,
          version: flagData.version,
          active: flagData.active,
          strategies: flagData.strategies,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create feature flag for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateFeatureFlag(projectId, flagId, flagData = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating feature flag ${flagId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/feature_flags/${encodeURIComponent(flagId)}`,
        {
          name: flagData.name,
          description: flagData.description,
          active: flagData.active,
          strategies: flagData.strategies,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update feature flag ${flagId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteFeatureFlag(projectId, flagId) {
    logger.info(
      `🦊 [GitLab Service] Deleting feature flag ${flagId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/feature_flags/${encodeURIComponent(flagId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete feature flag ${flagId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listResourceGroups(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing resource groups for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/resource_groups`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list resource groups for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getResourceGroup(projectId, groupKey) {
    logger.info(
      `🦊 [GitLab Service] Getting resource group ${groupKey} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/resource_groups/${encodeURIComponent(groupKey)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get resource group ${groupKey} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateResourceGroup(projectId, groupKey, groupData = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating resource group ${groupKey} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/resource_groups/${encodeURIComponent(groupKey)}`,
        {
          process_mode: groupData.processMode,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update resource group ${groupKey} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGroupIterationCadences(groupId) {
    logger.info(
      `🦊 [GitLab Service] Listing iteration cadences for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/iteration_cadences`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list iteration cadences for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async createGroupIterationCadence(groupId, cadenceData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating iteration cadence for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/iteration_cadences`,
        {
          title: cadenceData.title,
          automatic: cadenceData.automatic,
          duration_in_weeks: cadenceData.durationInWeeks,
          iterations_in_advance: cadenceData.iterationsInAdvance,
          start_date: cadenceData.startDate,
          roll_over: cadenceData.rollOver,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create iteration cadence for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async updateGroupIterationCadence(groupId, cadenceId, cadenceData = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating iteration cadence ${cadenceId} for group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/iteration_cadences/${encodeURIComponent(cadenceId)}`,
        {
          title: cadenceData.title,
          automatic: cadenceData.automatic,
          duration_in_weeks: cadenceData.durationInWeeks,
          iterations_in_advance: cadenceData.iterationsInAdvance,
          roll_over: cadenceData.rollOver,
          active: cadenceData.active,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update iteration cadence ${cadenceId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteGroupIterationCadence(groupId, cadenceId) {
    logger.info(
      `🦊 [GitLab Service] Deleting iteration cadence ${cadenceId} for group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/iteration_cadences/${encodeURIComponent(cadenceId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete iteration cadence ${cadenceId} for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 50. Phase 15: Cluster Agents, Package Protection, and Pipeline Triggers
  // ==========================================
  async listProjectClusterAgents(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing cluster agents for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list cluster agents for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectClusterAgent(projectId, agentId) {
    logger.info(
      `🦊 [GitLab Service] Getting cluster agent ${agentId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents/${encodeURIComponent(agentId)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get cluster agent ${agentId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createProjectClusterAgent(projectId, name) {
    logger.info(
      `🦊 [GitLab Service] Creating cluster agent ${name} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents`,
        { name },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create cluster agent for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectClusterAgent(projectId, agentId) {
    logger.info(
      `🦊 [GitLab Service] Deleting cluster agent ${agentId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents/${encodeURIComponent(agentId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete cluster agent ${agentId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listClusterAgentTokens(projectId, agentId) {
    logger.info(
      `🦊 [GitLab Service] Listing tokens for cluster agent ${agentId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents/${encodeURIComponent(agentId)}/tokens`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Tokens or agent not found for agent ${agentId} in project ${projectId}, returning empty array`,
        );
        return [];
      }
      logger.error(
        `Failed to list tokens for cluster agent ${agentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createClusterAgentToken(projectId, agentId, tokenData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating token for cluster agent ${agentId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents/${encodeURIComponent(agentId)}/tokens`,
        {
          name: tokenData.name,
          description: tokenData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create token for cluster agent ${agentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteClusterAgentToken(projectId, agentId, tokenId) {
    logger.info(
      `🦊 [GitLab Service] Deleting token ${tokenId} for cluster agent ${agentId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/cluster_agents/${encodeURIComponent(agentId)}/tokens/${encodeURIComponent(tokenId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete token ${tokenId} for cluster agent ${agentId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listPackageProtectionRules(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing package protection rules for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/packages/protection/rules`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list package protection rules for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createPackageProtectionRule(projectId, ruleData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating package protection rule for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/packages/protection/rules`,
        {
          package_name_pattern: ruleData.packageNamePattern,
          package_type: ruleData.packageType,
          minimum_access_level_for_push: ruleData.minimumAccessLevelForPush,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create package protection rule for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updatePackageProtectionRule(projectId, ruleId, ruleData = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating package protection rule ${ruleId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/packages/protection/rules/${encodeURIComponent(ruleId)}`,
        {
          package_name_pattern: ruleData.packageNamePattern,
          package_type: ruleData.packageType,
          minimum_access_level_for_push: ruleData.minimumAccessLevelForPush,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update package protection rule ${ruleId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deletePackageProtectionRule(projectId, ruleId) {
    logger.info(
      `🦊 [GitLab Service] Deleting package protection rule ${ruleId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/packages/protection/rules/${encodeURIComponent(ruleId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete package protection rule ${ruleId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listPipelineTriggers(projectId) {
    logger.info(
      `🦊 [GitLab Service] Listing pipeline triggers for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/triggers`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list pipeline triggers for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getPipelineTrigger(projectId, triggerId) {
    logger.info(
      `🦊 [GitLab Service] Getting pipeline trigger ${triggerId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/triggers/${encodeURIComponent(triggerId)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to get pipeline trigger ${triggerId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async createPipelineTrigger(projectId, triggerData = {}) {
    logger.info(
      `🦊 [GitLab Service] Creating pipeline trigger for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/triggers`,
        {
          description: triggerData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create pipeline trigger for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updatePipelineTrigger(projectId, triggerId, triggerData = {}) {
    logger.info(
      `🦊 [GitLab Service] Updating pipeline trigger ${triggerId} for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/triggers/${encodeURIComponent(triggerId)}`,
        {
          description: triggerData.description,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update pipeline trigger ${triggerId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deletePipelineTrigger(projectId, triggerId) {
    logger.info(
      `🦊 [GitLab Service] Deleting pipeline trigger ${triggerId} for project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/triggers/${encodeURIComponent(triggerId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete pipeline trigger ${triggerId} for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 51. Phase 16: Epic Notes, Snippet Notes, and Extended Issue/MR Notes CRUD
  // ==========================================
  async getIssueComment(projectId, issueIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Getting comment ${noteId} for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueIid)}/notes/${encodeURIComponent(noteId)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Issue comment ${noteId} not found, returning safe default`,
        );
        return { id: null, body: '' };
      }
      logger.error(
        `Failed to get comment ${noteId} for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async updateIssueComment(projectId, issueIid, noteId, body) {
    logger.info(
      `🦊 [GitLab Service] Updating comment ${noteId} for issue ${issueIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueIid)}/notes/${encodeURIComponent(noteId)}`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update comment ${noteId} for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async deleteIssueComment(projectId, issueIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Deleting comment ${noteId} for issue ${issueIid} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueIid)}/notes/${encodeURIComponent(noteId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete comment ${noteId} for issue ${issueIid}:`,
        error,
      );
      throw error;
    }
  },

  async getMergeRequestComment(projectId, mrIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Getting comment ${noteId} for merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${encodeURIComponent(mrIid)}/notes/${encodeURIComponent(noteId)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Merge request comment ${noteId} not found, returning safe default`,
        );
        return { id: null, body: '' };
      }
      logger.error(
        `Failed to get comment ${noteId} for merge request ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async updateMergeRequestComment(projectId, mrIid, noteId, body) {
    logger.info(
      `🦊 [GitLab Service] Updating comment ${noteId} for merge request ${mrIid} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${encodeURIComponent(mrIid)}/notes/${encodeURIComponent(noteId)}`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update comment ${noteId} for merge request ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async deleteMergeRequestComment(projectId, mrIid, noteId) {
    logger.info(
      `🦊 [GitLab Service] Deleting comment ${noteId} for merge request ${mrIid} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/merge_requests/${encodeURIComponent(mrIid)}/notes/${encodeURIComponent(noteId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete comment ${noteId} for merge request ${mrIid}:`,
        error,
      );
      throw error;
    }
  },

  async listEpicNotes(groupId, epicId) {
    logger.info(
      `🦊 [GitLab Service] Listing notes for epic ${epicId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/epics/${encodeURIComponent(epicId)}/notes`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list notes for epic ${epicId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async getEpicNote(groupId, epicId, noteId) {
    logger.info(
      `🦊 [GitLab Service] Getting note ${noteId} for epic ${epicId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/epics/${encodeURIComponent(epicId)}/notes/${encodeURIComponent(noteId)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(`Epic note ${noteId} not found, returning safe default`);
        return { id: null, body: '' };
      }
      logger.error(`Failed to get note ${noteId} for epic ${epicId}:`, error);
      throw error;
    }
  },

  async createEpicNote(groupId, epicId, body) {
    logger.info(
      `🦊 [GitLab Service] Creating note for epic ${epicId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/epics/${encodeURIComponent(epicId)}/notes`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create note for epic ${epicId} in group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async updateEpicNote(groupId, epicId, noteId, body) {
    logger.info(
      `🦊 [GitLab Service] Updating note ${noteId} for epic ${epicId} in group ${groupId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/groups/${encodeURIComponent(groupId)}/epics/${encodeURIComponent(epicId)}/notes/${encodeURIComponent(noteId)}`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update note ${noteId} for epic ${epicId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteEpicNote(groupId, epicId, noteId) {
    logger.info(
      `🦊 [GitLab Service] Deleting note ${noteId} for epic ${epicId} in group ${groupId}`,
    );
    try {
      await gitlabClient.delete(
        `/groups/${encodeURIComponent(groupId)}/epics/${encodeURIComponent(epicId)}/notes/${encodeURIComponent(noteId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete note ${noteId} for epic ${epicId}:`,
        error,
      );
      throw error;
    }
  },

  async listProjectSnippetNotes(projectId, snippetId) {
    logger.info(
      `🦊 [GitLab Service] Listing notes for snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${encodeURIComponent(snippetId)}/notes`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list notes for snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectSnippetNote(projectId, snippetId, noteId) {
    logger.info(
      `🦊 [GitLab Service] Getting note ${noteId} for snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/snippets/${encodeURIComponent(snippetId)}/notes/${encodeURIComponent(noteId)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(`Snippet note ${noteId} not found, returning safe default`);
        return { id: null, body: '' };
      }
      logger.error(
        `Failed to get note ${noteId} for snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async createProjectSnippetNote(projectId, snippetId, body) {
    logger.info(
      `🦊 [GitLab Service] Creating note for snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/snippets/${encodeURIComponent(snippetId)}/notes`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to create note for snippet ${snippetId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async updateProjectSnippetNote(projectId, snippetId, noteId, body) {
    logger.info(
      `🦊 [GitLab Service] Updating note ${noteId} for snippet ${snippetId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.put(
        `/projects/${encodeURIComponent(projectId)}/snippets/${encodeURIComponent(snippetId)}/notes/${encodeURIComponent(noteId)}`,
        { body },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to update note ${noteId} for snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteProjectSnippetNote(projectId, snippetId, noteId) {
    logger.info(
      `🦊 [GitLab Service] Deleting note ${noteId} for snippet ${snippetId} in project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/snippets/${encodeURIComponent(snippetId)}/notes/${encodeURIComponent(noteId)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete note ${noteId} for snippet ${snippetId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 52. Phase 17: Global/Group/Project Search, Issues Statistics, Application Statistics & Settings, Webhook Test API & Deliveries, and CI/CD Linting
  // ==========================================
  async searchGlobal(scope, search, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Performing global search for ${search} in scope ${scope}`,
    );
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get('/search', {
        params: {
          scope,
          search,
          page,
          per_page: perPage,
          ...rest,
        },
      });
      return data;
    } catch (error) {
      logger.error(`Failed global search for ${search}:`, error);
      throw error;
    }
  },

  async searchGroup(groupId, scope, search, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Performing search for ${search} in group ${groupId} for scope ${scope}`,
    );
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/search`,
        {
          params: {
            scope,
            search,
            page,
            per_page: perPage,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed search in group ${groupId} for ${search}:`, error);
      throw error;
    }
  },

  async searchProject(projectId, scope, search, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Performing search for ${search} in project ${projectId} for scope ${scope}`,
    );
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/search`,
        {
          params: {
            scope,
            search,
            page,
            per_page: perPage,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed search in project ${projectId} for ${search}:`,
        error,
      );
      throw error;
    }
  },

  async getIssuesStatistics(params = {}) {
    logger.info('🦊 [GitLab Service] Fetching global issues statistics');
    try {
      const { page, perPage, authorId, assigneeId, ...rest } = params;
      const { data } = await gitlabClient.get('/issues_statistics', {
        params: {
          page,
          per_page: perPage,
          author_id: authorId,
          assignee_id: assigneeId,
          ...rest,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to fetch global issues statistics:', error);
      throw error;
    }
  },

  async getGroupIssuesStatistics(groupId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Fetching issues statistics for group ${groupId}`,
    );
    try {
      const { page, perPage, authorId, assigneeId, ...rest } = params;
      const { data } = await gitlabClient.get(
        `/groups/${encodeURIComponent(groupId)}/issues_statistics`,
        {
          params: {
            page,
            per_page: perPage,
            author_id: authorId,
            assignee_id: assigneeId,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch issues statistics for group ${groupId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectIssuesStatistics(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Fetching issues statistics for project ${projectId}`,
    );
    try {
      const { page, perPage, authorId, assigneeId, ...rest } = params;
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/issues_statistics`,
        {
          params: {
            page,
            per_page: perPage,
            author_id: authorId,
            assignee_id: assigneeId,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch issues statistics for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getApplicationStatistics() {
    logger.info('🦊 [GitLab Service] Fetching application statistics');
    try {
      const { data } = await gitlabClient.get('/application/statistics');
      return data;
    } catch (error) {
      logger.error('Failed to fetch application statistics:', error);
      throw error;
    }
  },

  async getAppearance() {
    logger.info('🦊 [GitLab Service] Fetching application appearance settings');
    try {
      const { data } = await gitlabClient.get('/application/appearance');
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          'Appearance settings not found (404), returning safe default',
        );
        return { title: '', description: '' };
      }
      logger.error('Failed to fetch application appearance settings:', error);
      throw error;
    }
  },

  async updateAppearance(appearanceData = {}) {
    logger.info('🦊 [GitLab Service] Updating application appearance settings');
    try {
      const { data } = await gitlabClient.put(
        '/application/appearance',
        appearanceData,
      );
      return data;
    } catch (error) {
      logger.error('Failed to update application appearance settings:', error);
      throw error;
    }
  },

  async testProjectHook(projectId, hookId, trigger) {
    logger.info(
      `🦊 [GitLab Service] Testing hook ${hookId} in project ${projectId} with trigger ${trigger}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/hooks/${encodeURIComponent(hookId)}/test/${encodeURIComponent(trigger)}`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to test hook ${hookId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listProjectHookDeliveries(projectId, hookId) {
    logger.info(
      `🦊 [GitLab Service] Listing deliveries for hook ${hookId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/hooks/${encodeURIComponent(hookId)}/deliveries`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list deliveries for hook ${hookId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectHookDelivery(projectId, hookId, deliveryId) {
    logger.info(
      `🦊 [GitLab Service] Getting delivery ${deliveryId} for hook ${hookId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/hooks/${encodeURIComponent(hookId)}/deliveries/${encodeURIComponent(deliveryId)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Hook delivery ${deliveryId} not found, returning safe default`,
        );
        return { id: null, status: null, request: {}, response: {} };
      }
      logger.error(
        `Failed to get delivery ${deliveryId} for hook ${hookId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async resubmitProjectHookDelivery(projectId, hookId, deliveryId) {
    logger.info(
      `🦊 [GitLab Service] Resubmitting delivery ${deliveryId} for hook ${hookId} in project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/hooks/${encodeURIComponent(hookId)}/deliveries/${encodeURIComponent(deliveryId)}/resubmit`,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to resubmit delivery ${deliveryId} for hook ${hookId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async testGroupHook(groupId, hookId, trigger) {
    logger.info(
      `🦊 [GitLab Service] Testing hook ${hookId} in group ${groupId} with trigger ${trigger}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/groups/${encodeURIComponent(groupId)}/hooks/${encodeURIComponent(hookId)}/test/${encodeURIComponent(trigger)}`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to test hook ${hookId} in group ${groupId}:`, error);
      throw error;
    }
  },

  async lintCI(content) {
    logger.info('🦊 [GitLab Service] Performing global CI lint check');
    try {
      const { data } = await gitlabClient.post('/ci/lint', { content });
      return data;
    } catch (error) {
      logger.error('Failed to perform global CI lint:', error);
      throw error;
    }
  },

  async lintProjectCI(
    projectId,
    content,
    dryRun = false,
    includeMergedYaml = false,
  ) {
    logger.info(
      `🦊 [GitLab Service] Performing project-contextual CI lint for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/ci/lint`,
        {
          content,
          dry_run: dryRun,
          include_merged_yaml: includeMergedYaml,
        },
      );
      return data;
    } catch (error) {
      logger.error(`Failed project CI lint for project ${projectId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 53. Phase 18: Container Registry Tags, GitLab Geo Nodes, and Project Import/Export
  // ==========================================
  async listContainerRepositoryTags(projectId, repositoryId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Listing tags for container repository ${repositoryId} in project ${projectId}`,
    );
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${encodeURIComponent(repositoryId)}/tags`,
        {
          params: {
            page: page || 1,
            per_page: perPage || 30,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list container repository tags for repository ${repositoryId} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getContainerRepositoryTagDetails(projectId, repositoryId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Fetching details for container repository tag ${tagName} in repository ${repositoryId} of project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${encodeURIComponent(repositoryId)}/tags/${encodeURIComponent(tagName)}`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Container repository tag ${tagName} not found, returning safe default`,
        );
        return { name: null, path: '', location: '' };
      }
      logger.error(
        `Failed to get details for container repository tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async deleteContainerRepositoryTag(projectId, repositoryId, tagName) {
    logger.info(
      `🦊 [GitLab Service] Deleting container repository tag ${tagName} in repository ${repositoryId} of project ${projectId}`,
    );
    try {
      await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${encodeURIComponent(repositoryId)}/tags/${encodeURIComponent(tagName)}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete container repository tag ${tagName} in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async bulkDeleteContainerRepositoryTags(projectId, repositoryId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Bulk deleting container repository tags in repository ${repositoryId} of project ${projectId}`,
    );
    try {
      const { nameRegexDelete, keepN, nameRegex, nameRegexKeep, ...rest } = params;
      const { data } = await gitlabClient.delete(
        `/projects/${encodeURIComponent(projectId)}/registry/repositories/${encodeURIComponent(repositoryId)}/tags`,
        {
          params: {
            name_regex_delete: nameRegexDelete,
            keep_n: keepN,
            name_regex: nameRegex,
            name_regex_keep: nameRegexKeep,
            ...rest,
          },
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to bulk delete container repository tags in project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async listGeoNodes(params = {}) {
    logger.info('🦊 [GitLab Service] Listing GitLab Geo replication nodes');
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get('/geo_nodes', {
        params: {
          page: page || 1,
          per_page: perPage || 30,
          ...rest,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list GitLab Geo replication nodes:', error);
      throw error;
    }
  },

  async getGeoNodeStatus(nodeId) {
    logger.info(`🦊 [GitLab Service] Fetching status for Geo node ${nodeId}`);
    try {
      const { data } = await gitlabClient.get(
        `/geo_nodes/${encodeURIComponent(nodeId)}/status`,
      );
      return data;
    } catch (error) {
      logger.error(`Failed to get status for Geo node ${nodeId}:`, error);
      throw error;
    }
  },

  async listGeoNodesStatus(params = {}) {
    logger.info('🦊 [GitLab Service] Listing status for all Geo replication nodes');
    try {
      const { page, perPage, ...rest } = params;
      const { data } = await gitlabClient.get('/geo_nodes/status', {
        params: {
          page: page || 1,
          per_page: perPage || 30,
          ...rest,
        },
      });
      return data;
    } catch (error) {
      logger.error('Failed to list status for all Geo replication nodes:', error);
      throw error;
    }
  },

  async scheduleProjectExport(projectId, params = {}) {
    logger.info(
      `🦊 [GitLab Service] Scheduling project export for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.post(
        `/projects/${encodeURIComponent(projectId)}/export`,
        params,
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to schedule export for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async getProjectExportStatus(projectId) {
    logger.info(
      `🦊 [GitLab Service] Fetching export status for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/export`,
      );
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logger.info(
          `Export status for project ${projectId} not found, returning safe default`,
        );
        return { export_status: 'none', message: 'Export not started' };
      }
      logger.error(
        `Failed to get export status for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async downloadProjectExport(projectId) {
    logger.info(
      `🦊 [GitLab Service] Downloading export archive for project ${projectId}`,
    );
    try {
      const { data } = await gitlabClient.get(
        `/projects/${encodeURIComponent(projectId)}/export/download`,
        { responseType: 'arraybuffer' },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to download export archive for project ${projectId}:`,
        error,
      );
      throw error;
    }
  },

  async importProject(formData) {
    logger.info('🦊 [GitLab Service] Importing project from export archive');
    try {
      const headers = typeof formData.getHeaders === 'function' ? formData.getHeaders() : {};
      const { data } = await gitlabClient.post('/projects/import', formData, {
        headers,
      });
      return data;
    } catch (error) {
      logger.error('Failed to import project:', error);
      throw error;
    }
  },
};

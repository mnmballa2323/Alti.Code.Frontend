import httpStatus from 'http-status';
import { GitlabService } from './gitlab.service.js';
import { logger } from '../../../shared/logger.js';

// ==========================================
// 1. User & Keys Handlers
// ==========================================
export const getAuthenticatedUser = async (req, res) => {
  try {
    const user = await GitlabService.getAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: user });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSSHKeys = async (req, res) => {
  try {
    const keys = await GitlabService.listSSHKeys();
    res.status(httpStatus.OK).json({ success: true, data: keys });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing SSH keys:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSSHKey = async (req, res) => {
  try {
    const { title, key } = req.body;
    const sshKey = await GitlabService.addSSHKey(title, key);
    res.status(httpStatus.CREATED).json({ success: true, data: sshKey });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding SSH key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteSSHKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const result = await GitlabService.deleteSSHKey(keyId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting SSH key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGPGKeys = async (req, res) => {
  try {
    const keys = await GitlabService.listGPGKeys();
    res.status(httpStatus.OK).json({ success: true, data: keys });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing GPG keys:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addGPGKey = async (req, res) => {
  try {
    const { key } = req.body;
    const gpgKey = await GitlabService.addGPGKey(key);
    res.status(httpStatus.CREATED).json({ success: true, data: gpgKey });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding GPG key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGPGKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const result = await GitlabService.deleteGPGKey(keyId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting GPG key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. Projects & Branches Handlers
// ==========================================
export const listProjects = async (req, res) => {
  try {
    const projects = await GitlabService.listProjects(req.query);
    res.status(httpStatus.OK).json({ success: true, data: projects });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing projects:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await GitlabService.createProject(req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: project });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating project:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await GitlabService.getProject(projectId);
    res.status(httpStatus.OK).json({ success: true, data: project });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting project:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await GitlabService.deleteProject(projectId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listBranches = async (req, res) => {
  try {
    const { projectId } = req.params;
    const branches = await GitlabService.listBranches(projectId);
    res.status(httpStatus.OK).json({ success: true, data: branches });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing branches:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getBranch = async (req, res) => {
  try {
    const { projectId, branch } = req.params;
    const branchInfo = await GitlabService.getBranch(projectId, branch);
    res.status(httpStatus.OK).json({ success: true, data: branchInfo });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branch, ref } = req.body;
    const branchInfo = await GitlabService.createBranch(projectId, branch, ref);
    res.status(httpStatus.CREATED).json({ success: true, data: branchInfo });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { projectId, branch } = req.params;
    const result = await GitlabService.deleteBranch(projectId, branch);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. Repository Files Handlers
// ==========================================
export const getFileContent = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const { ref } = req.query;
    const content = await GitlabService.getFileContent(
      projectId,
      filePath,
      ref,
    );
    res.status(httpStatus.OK).json({ success: true, data: content });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting file content:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createFile = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const { content, commitMessage, branch } = req.body;
    const file = await GitlabService.createFile(
      projectId,
      filePath,
      content,
      commitMessage,
      branch,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: file });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const { content, commitMessage, branch } = req.body;
    const file = await GitlabService.updateFile(
      projectId,
      filePath,
      content,
      commitMessage,
      branch,
    );
    res.status(httpStatus.OK).json({ success: true, data: file });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const { commitMessage, branch } = req.body;
    const result = await GitlabService.deleteFile(
      projectId,
      filePath,
      commitMessage,
      branch,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. Merge Requests Handlers
// ==========================================
export const listMergeRequests = async (req, res) => {
  try {
    const { projectId } = req.params;
    const mrs = await GitlabService.listMergeRequests(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: mrs });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing merge requests:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const mr = await GitlabService.getMergeRequest(projectId, mrIid);
    res.status(httpStatus.OK).json({ success: true, data: mr });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting merge request:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMergeRequest = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      sourceBranch,
      targetBranch,
      title,
      description,
      removeSourceBranch,
    } = req.body;
    const mr = await GitlabService.createMergeRequest(
      projectId,
      sourceBranch,
      targetBranch,
      title,
      { description, removeSourceBranch },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: mr });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating merge request:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const mr = await GitlabService.updateMergeRequest(
      projectId,
      mrIid,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: mr });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating merge request:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const mergeMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const { mergeCommitMessage, shouldRemoveSourceBranch } = req.body;
    const result = await GitlabService.mergeMergeRequest(projectId, mrIid, {
      mergeCommitMessage,
      shouldRemoveSourceBranch,
    });
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error merging merge request:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMergeRequestComments = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const comments = await GitlabService.listMergeRequestComments(
      projectId,
      mrIid,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: comments });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing MR comments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMergeRequestComment = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const { body } = req.body;
    const comment = await GitlabService.createMergeRequestComment(
      projectId,
      mrIid,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: comment });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating MR comment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 5. Issues & Milestones Handlers
// ==========================================
export const listIssues = async (req, res) => {
  try {
    const { projectId } = req.params;
    const issues = await GitlabService.listIssues(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: issues });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing issues:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getIssue = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const issue = await GitlabService.getIssue(projectId, issueIid);
    res.status(httpStatus.OK).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { projectId } = req.params;
    const issue = await GitlabService.createIssue(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const issue = await GitlabService.updateIssue(
      projectId,
      issueIid,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listIssueComments = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const comments = await GitlabService.listIssueComments(
      projectId,
      issueIid,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: comments });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing issue comments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssueComment = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const { body } = req.body;
    const comment = await GitlabService.createIssueComment(
      projectId,
      issueIid,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: comment });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating issue comment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestones = await GitlabService.listMilestones(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: milestones });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing milestones:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;
    const milestone = await GitlabService.createMilestone(
      projectId,
      title,
      description,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: milestone });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating milestone:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const milestone = await GitlabService.updateMilestone(
      projectId,
      milestoneId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: milestone });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating milestone:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const result = await GitlabService.deleteMilestone(projectId, milestoneId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting milestone:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 6. CI/CD Pipelines & Jobs Handlers
// ==========================================
export const listPipelines = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pipelines = await GitlabService.listPipelines(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: pipelines });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing pipelines:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPipeline = async (req, res) => {
  try {
    const { projectId, pipelineId } = req.params;
    const pipeline = await GitlabService.getPipeline(projectId, pipelineId);
    res.status(httpStatus.OK).json({ success: true, data: pipeline });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting pipeline:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createPipeline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { ref, variables } = req.body;
    const pipeline = await GitlabService.createPipeline(
      projectId,
      ref,
      variables,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: pipeline });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating pipeline:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const cancelPipeline = async (req, res) => {
  try {
    const { projectId, pipelineId } = req.params;
    const pipeline = await GitlabService.cancelPipeline(projectId, pipelineId);
    res.status(httpStatus.OK).json({ success: true, data: pipeline });
  } catch (error) {
    logger.error('[GitLab Controller] Error canceling pipeline:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const retryPipeline = async (req, res) => {
  try {
    const { projectId, pipelineId } = req.params;
    const pipeline = await GitlabService.retryPipeline(projectId, pipelineId);
    res.status(httpStatus.OK).json({ success: true, data: pipeline });
  } catch (error) {
    logger.error('[GitLab Controller] Error retrying pipeline:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPipelineJobs = async (req, res) => {
  try {
    const { projectId, pipelineId } = req.params;
    const jobs = await GitlabService.listPipelineJobs(
      projectId,
      pipelineId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: jobs });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing pipeline jobs:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getJobLog = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const trace = await GitlabService.getJobLog(projectId, jobId);
    res.status(httpStatus.OK).json({ success: true, data: trace });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting job log trace:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 7. CI/CD Variables Handlers
// ==========================================
export const listProjectVariables = async (req, res) => {
  try {
    const { projectId } = req.params;
    const vars = await GitlabService.listProjectVariables(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: vars });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project variables:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectVariable = async (req, res) => {
  try {
    const { projectId, key } = req.params;
    const variable = await GitlabService.getProjectVariable(projectId, key);
    res.status(httpStatus.OK).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting project variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectVariable = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      key,
      value,
      variableType,
      protected: isProtected,
      masked,
      raw,
      environmentScope,
    } = req.body;
    const variable = await GitlabService.createProjectVariable(
      projectId,
      key,
      value,
      {
        variableType,
        protected: isProtected,
        masked,
        raw,
        environmentScope,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating project variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectVariable = async (req, res) => {
  try {
    const { projectId, key } = req.params;
    const {
      value,
      variableType,
      protected: isProtected,
      masked,
      raw,
      environmentScope,
    } = req.body;
    const variable = await GitlabService.updateProjectVariable(
      projectId,
      key,
      value,
      {
        variableType,
        protected: isProtected,
        masked,
        raw,
        environmentScope,
      },
    );
    res.status(httpStatus.OK).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating project variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectVariable = async (req, res) => {
  try {
    const { projectId, key } = req.params;
    const result = await GitlabService.deleteProjectVariable(projectId, key);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupVariables = async (req, res) => {
  try {
    const { groupId } = req.params;
    const vars = await GitlabService.listGroupVariables(groupId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: vars });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group variables:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroupVariable = async (req, res) => {
  try {
    const { groupId, key } = req.params;
    const variable = await GitlabService.getGroupVariable(groupId, key);
    res.status(httpStatus.OK).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting group variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupVariable = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      key,
      value,
      variableType,
      protected: isProtected,
      masked,
      raw,
    } = req.body;
    const variable = await GitlabService.createGroupVariable(
      groupId,
      key,
      value,
      {
        variableType,
        protected: isProtected,
        masked,
        raw,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating group variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupVariable = async (req, res) => {
  try {
    const { groupId, key } = req.params;
    const {
      value,
      variableType,
      protected: isProtected,
      masked,
      raw,
    } = req.body;
    const variable = await GitlabService.updateGroupVariable(
      groupId,
      key,
      value,
      {
        variableType,
        protected: isProtected,
        masked,
        raw,
      },
    );
    res.status(httpStatus.OK).json({ success: true, data: variable });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupVariable = async (req, res) => {
  try {
    const { groupId, key } = req.params;
    const result = await GitlabService.deleteGroupVariable(groupId, key);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 8. Groups & Members Handlers
// ==========================================
export const listGroups = async (req, res) => {
  try {
    const groups = await GitlabService.listGroups(req.query);
    res.status(httpStatus.OK).json({ success: true, data: groups });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing groups:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await GitlabService.getGroup(groupId);
    res.status(httpStatus.OK).json({ success: true, data: group });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting group:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const members = await GitlabService.listProjectMembers(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: members });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project members:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, accessLevel } = req.body;
    const member = await GitlabService.addProjectMember(
      projectId,
      userId,
      accessLevel,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: member });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding project member:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const result = await GitlabService.removeProjectMember(projectId, userId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error removing project member:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await GitlabService.listGroupMembers(groupId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: members });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group members:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, accessLevel } = req.body;
    const member = await GitlabService.addGroupMember(
      groupId,
      userId,
      accessLevel,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: member });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding group member:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const result = await GitlabService.removeGroupMember(groupId, userId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error removing group member:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 9. Project Webhooks Handlers
// ==========================================
export const listProjectHooks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const hooks = await GitlabService.listProjectHooks(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: hooks });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing webhooks:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectHook = async (req, res) => {
  try {
    const { projectId, hookId } = req.params;
    const hook = await GitlabService.getProjectHook(projectId, hookId);
    res.status(httpStatus.OK).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectHook = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      url,
      pushEvents,
      issuesEvents,
      mergeRequestsEvents,
      tagPushEvents,
      noteEvents,
      pipelineEvents,
      jobEvents,
      token,
      enableSslVerification,
    } = req.body;
    const hook = await GitlabService.createProjectHook(projectId, url, {
      pushEvents,
      issuesEvents,
      mergeRequestsEvents,
      tagPushEvents,
      noteEvents,
      pipelineEvents,
      jobEvents,
      token,
      enableSslVerification,
    });
    res.status(httpStatus.CREATED).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectHook = async (req, res) => {
  try {
    const { projectId, hookId } = req.params;
    const {
      url,
      pushEvents,
      issuesEvents,
      mergeRequestsEvents,
      tagPushEvents,
      noteEvents,
      pipelineEvents,
      jobEvents,
      token,
      enableSslVerification,
    } = req.body;
    const hook = await GitlabService.updateProjectHook(projectId, hookId, url, {
      pushEvents,
      issuesEvents,
      mergeRequestsEvents,
      tagPushEvents,
      noteEvents,
      pipelineEvents,
      jobEvents,
      token,
      enableSslVerification,
    });
    res.status(httpStatus.OK).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectHook = async (req, res) => {
  try {
    const { projectId, hookId } = req.params;
    const result = await GitlabService.deleteProjectHook(projectId, hookId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 10. Access Tokens Handlers
// ==========================================
export const listProjectAccessTokens = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tokens = await GitlabService.listProjectAccessTokens(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: tokens });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing access tokens:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectAccessToken = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, scopes, expiresAt, accessLevel } = req.body;
    const token = await GitlabService.createProjectAccessToken(
      projectId,
      name,
      scopes,
      expiresAt,
      accessLevel,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: token });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating access token:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const revokeProjectAccessToken = async (req, res) => {
  try {
    const { projectId, tokenId } = req.params;
    const result = await GitlabService.revokeProjectAccessToken(
      projectId,
      tokenId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error revoking access token:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 11. Security Scanning Handlers
// ==========================================
export const listVulnerabilityAlerts = async (req, res) => {
  try {
    const { projectId } = req.params;
    const alerts = await GitlabService.listVulnerabilityAlerts(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: alerts });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing vulnerability alerts:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 12. Commits, Diff & Comments Handlers
// ==========================================
export const listCommits = async (req, res) => {
  try {
    const { projectId } = req.params;
    const commits = await GitlabService.listCommits(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: commits });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing commits:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCommit = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const commit = await GitlabService.getCommit(projectId, sha);
    res.status(httpStatus.OK).json({ success: true, data: commit });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting commit:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const compareCommits = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { from, to } = req.query;
    const result = await GitlabService.compareCommits(projectId, from, to);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error comparing commits:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCommitDiff = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const diff = await GitlabService.getCommitDiff(projectId, sha);
    res.status(httpStatus.OK).json({ success: true, data: diff });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting commit diff:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCommitComments = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const comments = await GitlabService.getCommitComments(projectId, sha);
    res.status(httpStatus.OK).json({ success: true, data: comments });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting commit comments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCommitComment = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const { note, path, line, lineType } = req.body;
    const comment = await GitlabService.createCommitComment(
      projectId,
      sha,
      note,
      {
        path,
        line,
        lineType,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: comment });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating commit comment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCommitStatus = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const { state, ref, name, targetUrl, description, coverage } = req.body;
    const status = await GitlabService.createCommitStatus(
      projectId,
      sha,
      state,
      {
        ref,
        name,
        targetUrl,
        description,
        coverage,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: status });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating commit status:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCommitStatuses = async (req, res) => {
  try {
    const { projectId, sha } = req.params;
    const statuses = await GitlabService.listCommitStatuses(
      projectId,
      sha,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: statuses });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing commit statuses:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 13. Releases & Tags Handlers
// ==========================================
export const listReleases = async (req, res) => {
  try {
    const { projectId } = req.params;
    const releases = await GitlabService.listReleases(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: releases });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing releases:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRelease = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const release = await GitlabService.getRelease(projectId, tagName);
    res.status(httpStatus.OK).json({ success: true, data: release });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRelease = async (req, res) => {
  try {
    const { projectId } = req.params;
    const release = await GitlabService.createRelease(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: release });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRelease = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const release = await GitlabService.updateRelease(
      projectId,
      tagName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: release });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRelease = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const result = await GitlabService.deleteRelease(projectId, tagName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listTags = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tags = await GitlabService.listTags(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: tags });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing tags:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getTag = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const tag = await GitlabService.getTag(projectId, tagName);
    res.status(httpStatus.OK).json({ success: true, data: tag });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting tag:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tagName, ref, message, releaseDescription } = req.body;
    const tag = await GitlabService.createTag(projectId, tagName, ref, {
      message,
      releaseDescription,
    });
    res.status(httpStatus.CREATED).json({ success: true, data: tag });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating tag:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const result = await GitlabService.deleteTag(projectId, tagName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting tag:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 14. Deployments & Environments Handlers
// ==========================================
export const listEnvironments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const environments = await GitlabService.listEnvironments(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: environments });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing environments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnvironment = async (req, res) => {
  try {
    const { projectId, environmentId } = req.params;
    const environment = await GitlabService.getEnvironment(
      projectId,
      environmentId,
    );
    res.status(httpStatus.OK).json({ success: true, data: environment });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createEnvironment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, externalUrl, tier } = req.body;
    const environment = await GitlabService.createEnvironment(projectId, name, {
      externalUrl,
      tier,
    });
    res.status(httpStatus.CREATED).json({ success: true, data: environment });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateEnvironment = async (req, res) => {
  try {
    const { projectId, environmentId } = req.params;
    const { externalUrl, tier } = req.body;
    const environment = await GitlabService.updateEnvironment(
      projectId,
      environmentId,
      {
        externalUrl,
        tier,
      },
    );
    res.status(httpStatus.OK).json({ success: true, data: environment });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteEnvironment = async (req, res) => {
  try {
    const { projectId, environmentId } = req.params;
    const result = await GitlabService.deleteEnvironment(
      projectId,
      environmentId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listDeployments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deployments = await GitlabService.listDeployments(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: deployments });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing deployments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDeployment = async (req, res) => {
  try {
    const { projectId, deploymentId } = req.params;
    const deployment = await GitlabService.getDeployment(
      projectId,
      deploymentId,
    );
    res.status(httpStatus.OK).json({ success: true, data: deployment });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting deployment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createDeployment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { environment, ref, tag, status } = req.body;
    const deployment = await GitlabService.createDeployment(
      projectId,
      environment,
      ref,
      tag,
      {
        status,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: deployment });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating deployment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateDeployment = async (req, res) => {
  try {
    const { projectId, deploymentId } = req.params;
    const { status } = req.body;
    const deployment = await GitlabService.updateDeployment(
      projectId,
      deploymentId,
      status,
    );
    res.status(httpStatus.OK).json({ success: true, data: deployment });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating deployment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 15. Snippets Handlers
// ==========================================
export const listSnippets = async (req, res) => {
  try {
    const snippets = await GitlabService.listSnippets(req.query);
    res.status(httpStatus.OK).json({ success: true, data: snippets });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing personal snippets:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProjectSnippets = async (req, res) => {
  try {
    const { projectId } = req.params;
    const snippets = await GitlabService.listProjectSnippets(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: snippets });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project snippets:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSnippet = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const snippet = await GitlabService.getSnippet(snippetId);
    res.status(httpStatus.OK).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting personal snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const snippet = await GitlabService.getProjectSnippet(projectId, snippetId);
    res.status(httpStatus.OK).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting project snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createSnippet = async (req, res) => {
  try {
    const { title, fileName, content, visibility, description } = req.body;
    const snippet = await GitlabService.createSnippet(
      title,
      fileName,
      content,
      visibility,
      description,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating personal snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectSnippet = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, fileName, content, visibility, description } = req.body;
    const snippet = await GitlabService.createProjectSnippet(
      projectId,
      title,
      fileName,
      content,
      visibility,
      description,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating project snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateSnippet = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const snippet = await GitlabService.updateSnippet(snippetId, req.body);
    res.status(httpStatus.OK).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating personal snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const snippet = await GitlabService.updateProjectSnippet(
      projectId,
      snippetId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: snippet });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating project snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteSnippet = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const result = await GitlabService.deleteSnippet(snippetId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting personal snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const result = await GitlabService.deleteProjectSnippet(
      projectId,
      snippetId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project snippet:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSnippetContent = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const content = await GitlabService.getSnippetContent(snippetId);
    res.status(httpStatus.OK).send(content);
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting personal snippet raw content:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectSnippetContent = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const content = await GitlabService.getProjectSnippetContent(
      projectId,
      snippetId,
    );
    res.status(httpStatus.OK).send(content);
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting project snippet raw content:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 16. Self-Hosted Runners Handlers
// ==========================================
export const listRunners = async (req, res) => {
  try {
    const runners = await GitlabService.listRunners(req.query);
    res.status(httpStatus.OK).json({ success: true, data: runners });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing self-hosted runners:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProjectRunners = async (req, res) => {
  try {
    const { projectId } = req.params;
    const runners = await GitlabService.listProjectRunners(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: runners });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project runners:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRunner = async (req, res) => {
  try {
    const { runnerId } = req.params;
    const runner = await GitlabService.getRunner(runnerId);
    res.status(httpStatus.OK).json({ success: true, data: runner });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting runner details:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRunner = async (req, res) => {
  try {
    const { runnerId } = req.params;
    const runner = await GitlabService.updateRunner(runnerId, req.body);
    res.status(httpStatus.OK).json({ success: true, data: runner });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating runner:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRunner = async (req, res) => {
  try {
    const { runnerId } = req.params;
    const result = await GitlabService.deleteRunner(runnerId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting runner:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const registerRunner = async (req, res) => {
  try {
    const {
      token,
      description,
      active,
      tagList,
      runUntagged,
      locked,
      accessLevel,
    } = req.body;
    const runner = await GitlabService.registerRunner(token, {
      description,
      active,
      tagList,
      runUntagged,
      locked,
      accessLevel,
    });
    res.status(httpStatus.CREATED).json({ success: true, data: runner });
  } catch (error) {
    logger.error('[GitLab Controller] Error registering runner:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const verifyRunner = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await GitlabService.verifyRunner(token);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error verifying runner:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 17. Epics & Epic Boards Handlers
// ==========================================
export const listGroupEpics = async (req, res) => {
  try {
    const { groupId } = req.params;
    const epics = await GitlabService.listGroupEpics(groupId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: epics });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group epics:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroupEpic = async (req, res) => {
  try {
    const { groupId, epicId } = req.params;
    const epic = await GitlabService.getGroupEpic(groupId, epicId);
    res.status(httpStatus.OK).json({ success: true, data: epic });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting group epic:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupEpic = async (req, res) => {
  try {
    const { groupId } = req.params;
    const epic = await GitlabService.createGroupEpic(groupId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: epic });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating group epic:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupEpic = async (req, res) => {
  try {
    const { groupId, epicId } = req.params;
    const epic = await GitlabService.updateGroupEpic(groupId, epicId, req.body);
    res.status(httpStatus.OK).json({ success: true, data: epic });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group epic:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupEpic = async (req, res) => {
  try {
    const { groupId, epicId } = req.params;
    const result = await GitlabService.deleteGroupEpic(groupId, epicId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group epic:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listEpicIssues = async (req, res) => {
  try {
    const { groupId, epicId } = req.params;
    const issues = await GitlabService.listEpicIssues(groupId, epicId);
    res.status(httpStatus.OK).json({ success: true, data: issues });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing epic issues:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const linkEpicIssue = async (req, res) => {
  try {
    const { groupId, epicId, issueId } = req.params;
    const result = await GitlabService.linkEpicIssue(groupId, epicId, issueId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error linking epic issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unlinkEpicIssue = async (req, res) => {
  try {
    const { groupId, epicId, issueId } = req.params;
    const result = await GitlabService.unlinkEpicIssue(
      groupId,
      epicId,
      issueId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error unlinking epic issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 18. Packages & Registries Handlers
// ==========================================
export const listProjectPackages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const packages = await GitlabService.listProjectPackages(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: packages });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project packages:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectPackage = async (req, res) => {
  try {
    const { projectId, packageId } = req.params;
    const pkg = await GitlabService.getProjectPackage(projectId, packageId);
    res.status(httpStatus.OK).json({ success: true, data: pkg });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting project package:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectPackage = async (req, res) => {
  try {
    const { projectId, packageId } = req.params;
    const result = await GitlabService.deleteProjectPackage(
      projectId,
      packageId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project package:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPackageVersions = async (req, res) => {
  try {
    const { projectId, packageId } = req.params;
    const versions = await GitlabService.listPackageVersions(
      projectId,
      packageId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: versions });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing package files:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listContainerRepositories = async (req, res) => {
  try {
    const { projectId } = req.params;
    const repos = await GitlabService.listContainerRepositories(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: repos });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing container repositories:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteContainerRepository = async (req, res) => {
  try {
    const { projectId, repositoryId } = req.params;
    const result = await GitlabService.deleteContainerRepository(
      projectId,
      repositoryId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting container repository:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 19. Project & Group Badges Handlers
// ==========================================
export const listProjectBadges = async (req, res) => {
  try {
    const { projectId } = req.params;
    const badges = await GitlabService.listProjectBadges(projectId);
    res.status(httpStatus.OK).json({ success: true, data: badges });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project badges:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectBadge = async (req, res) => {
  try {
    const { projectId, badgeId } = req.params;
    const badge = await GitlabService.getProjectBadge(projectId, badgeId);
    res.status(httpStatus.OK).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting project badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectBadge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const badge = await GitlabService.createProjectBadge(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating project badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectBadge = async (req, res) => {
  try {
    const { projectId, badgeId } = req.params;
    const badge = await GitlabService.updateProjectBadge(
      projectId,
      badgeId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating project badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectBadge = async (req, res) => {
  try {
    const { projectId, badgeId } = req.params;
    const result = await GitlabService.deleteProjectBadge(projectId, badgeId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupBadges = async (req, res) => {
  try {
    const { groupId } = req.params;
    const badges = await GitlabService.listGroupBadges(groupId);
    res.status(httpStatus.OK).json({ success: true, data: badges });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group badges:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroupBadge = async (req, res) => {
  try {
    const { groupId, badgeId } = req.params;
    const badge = await GitlabService.getGroupBadge(groupId, badgeId);
    res.status(httpStatus.OK).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting group badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupBadge = async (req, res) => {
  try {
    const { groupId } = req.params;
    const badge = await GitlabService.createGroupBadge(groupId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating group badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupBadge = async (req, res) => {
  try {
    const { groupId, badgeId } = req.params;
    const badge = await GitlabService.updateGroupBadge(
      groupId,
      badgeId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: badge });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupBadge = async (req, res) => {
  try {
    const { groupId, badgeId } = req.params;
    const result = await GitlabService.deleteGroupBadge(groupId, badgeId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group badge:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 20. Pages & Pages Domains Handlers
// ==========================================
export const getProjectPages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pages = await GitlabService.getProjectPages(projectId);
    res.status(httpStatus.OK).json({ success: true, data: pages });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting project pages settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectPages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await GitlabService.deleteProjectPages(projectId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting project pages site:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPagesDomains = async (req, res) => {
  try {
    const { projectId } = req.params;
    const domains = await GitlabService.listPagesDomains(projectId);
    res.status(httpStatus.OK).json({ success: true, data: domains });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing pages domains:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPagesDomain = async (req, res) => {
  try {
    const { projectId, domain } = req.params;
    const pagesDomain = await GitlabService.getPagesDomain(projectId, domain);
    res.status(httpStatus.OK).json({ success: true, data: pagesDomain });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting pages domain:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createPagesDomain = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { domain, certificate, key, autoSslEnabled } = req.body;
    const pagesDomain = await GitlabService.createPagesDomain(
      projectId,
      domain,
      {
        certificate,
        key,
        autoSslEnabled,
      },
    );
    res.status(httpStatus.CREATED).json({ success: true, data: pagesDomain });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating pages domain:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updatePagesDomain = async (req, res) => {
  try {
    const { projectId, domain } = req.params;
    const pagesDomain = await GitlabService.updatePagesDomain(
      projectId,
      domain,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: pagesDomain });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating pages domain:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deletePagesDomain = async (req, res) => {
  try {
    const { projectId, domain } = req.params;
    const result = await GitlabService.deletePagesDomain(projectId, domain);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting pages domain:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 21. Audit Events Handlers
// ==========================================
export const listProjectAuditEvents = async (req, res) => {
  try {
    const { projectId } = req.params;
    const events = await GitlabService.listProjectAuditEvents(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing project audit events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupAuditEvents = async (req, res) => {
  try {
    const { groupId } = req.params;
    const events = await GitlabService.listGroupAuditEvents(groupId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing group audit events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 22. Award Emoji (Reactions) Handlers
// ==========================================
export const listAwardEmojisOnIssue = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnIssue(
      projectId,
      issueIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on issue:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnIssue = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnIssue(
      projectId,
      issueIid,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on issue:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnIssue = async (req, res) => {
  try {
    const { projectId, issueIid, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnIssue(
      projectId,
      issueIid,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on issue:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAwardEmojisOnMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnMergeRequest(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on MR:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnMergeRequest(
      projectId,
      mrIid,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on MR:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnMergeRequest(
      projectId,
      mrIid,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on MR:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAwardEmojisOnSnippet = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnSnippet(snippetId);
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnSnippet = async (req, res) => {
  try {
    const { snippetId } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnSnippet(
      snippetId,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnSnippet = async (req, res) => {
  try {
    const { snippetId, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnSnippet(
      snippetId,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAwardEmojisOnProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnProjectSnippet(
      projectId,
      snippetId,
    );
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on project snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnProjectSnippet(
      projectId,
      snippetId,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on project snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnProjectSnippet = async (req, res) => {
  try {
    const { projectId, snippetId, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnProjectSnippet(
      projectId,
      snippetId,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on project snippet:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAwardEmojisOnIssueNote = async (req, res) => {
  try {
    const { projectId, issueIid, noteId } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnIssueNote(
      projectId,
      issueIid,
      noteId,
    );
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on issue note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnIssueNote = async (req, res) => {
  try {
    const { projectId, issueIid, noteId } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnIssueNote(
      projectId,
      issueIid,
      noteId,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on issue note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnIssueNote = async (req, res) => {
  try {
    const { projectId, issueIid, noteId, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnIssueNote(
      projectId,
      issueIid,
      noteId,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on issue note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAwardEmojisOnMergeRequestNote = async (req, res) => {
  try {
    const { projectId, mrIid, noteId } = req.params;
    const emojis = await GitlabService.listAwardEmojisOnMergeRequestNote(
      projectId,
      mrIid,
      noteId,
    );
    res.status(httpStatus.OK).json({ success: true, data: emojis });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing award emojis on MR note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAwardEmojiOnMergeRequestNote = async (req, res) => {
  try {
    const { projectId, mrIid, noteId } = req.params;
    const { name } = req.body;
    const emoji = await GitlabService.createAwardEmojiOnMergeRequestNote(
      projectId,
      mrIid,
      noteId,
      name,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: emoji });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating award emoji on MR note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAwardEmojiOnMergeRequestNote = async (req, res) => {
  try {
    const { projectId, mrIid, noteId, emojiId } = req.params;
    const result = await GitlabService.deleteAwardEmojiOnMergeRequestNote(
      projectId,
      mrIid,
      noteId,
      emojiId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting award emoji on MR note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 23. Pipeline Schedules Handlers
// ==========================================
export const listProjectPipelineSchedules = async (req, res) => {
  try {
    const { projectId } = req.params;
    const schedules = await GitlabService.listProjectPipelineSchedules(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: schedules });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing pipeline schedules:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectPipelineSchedule = async (req, res) => {
  try {
    const { projectId, scheduleId } = req.params;
    const schedule = await GitlabService.getProjectPipelineSchedule(
      projectId,
      scheduleId,
    );
    res.status(httpStatus.OK).json({ success: true, data: schedule });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting pipeline schedule:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectPipelineSchedule = async (req, res) => {
  try {
    const { projectId } = req.params;
    const schedule = await GitlabService.createProjectPipelineSchedule(
      projectId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: schedule });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating pipeline schedule:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectPipelineSchedule = async (req, res) => {
  try {
    const { projectId, scheduleId } = req.params;
    const schedule = await GitlabService.updateProjectPipelineSchedule(
      projectId,
      scheduleId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: schedule });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating pipeline schedule:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectPipelineSchedule = async (req, res) => {
  try {
    const { projectId, scheduleId } = req.params;
    const result = await GitlabService.deleteProjectPipelineSchedule(
      projectId,
      scheduleId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting pipeline schedule:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const playProjectPipelineSchedule = async (req, res) => {
  try {
    const { projectId, scheduleId } = req.params;
    const result = await GitlabService.playProjectPipelineSchedule(
      projectId,
      scheduleId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error triggering pipeline schedule:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 24. Job Artifacts Handlers
// ==========================================
export const downloadJobArtifacts = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const data = await GitlabService.downloadJobArtifacts(projectId, jobId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=artifacts-${jobId}.zip`,
    );
    res.status(httpStatus.OK).send(Buffer.from(data));
  } catch (error) {
    logger.error('[GitLab Controller] Error downloading job artifacts:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const downloadJobArtifactFile = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const artifactPath = req.params[0];
    const data = await GitlabService.downloadJobArtifactFile(
      projectId,
      jobId,
      artifactPath,
    );
    res.status(httpStatus.OK).send(Buffer.from(data));
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error downloading job artifact file:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteJobArtifacts = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const result = await GitlabService.deleteJobArtifacts(projectId, jobId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting job artifacts:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const keepJobArtifacts = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const result = await GitlabService.keepJobArtifacts(projectId, jobId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error keeping job artifacts:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 25. Merge Request Approval Rules Handlers
// ==========================================
export const listMergeRequestApprovalRules = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const rules = await GitlabService.listMergeRequestApprovalRules(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: rules });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing MR approval rules:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMergeRequestApprovalRule = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const rule = await GitlabService.createMergeRequestApprovalRule(
      projectId,
      mrIid,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: rule });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating MR approval rule:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateMergeRequestApprovalRule = async (req, res) => {
  try {
    const { projectId, mrIid, ruleId } = req.params;
    const rule = await GitlabService.updateMergeRequestApprovalRule(
      projectId,
      mrIid,
      ruleId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: rule });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating MR approval rule:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteMergeRequestApprovalRule = async (req, res) => {
  try {
    const { projectId, mrIid, ruleId } = req.params;
    const result = await GitlabService.deleteMergeRequestApprovalRule(
      projectId,
      mrIid,
      ruleId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting MR approval rule:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectApprovalSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const settings = await GitlabService.getProjectApprovalSettings(projectId);
    res.status(httpStatus.OK).json({ success: true, data: settings });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting project approval settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectApprovalSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const settings = await GitlabService.updateProjectApprovalSettings(
      projectId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: settings });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating project approval settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 26. Wikis & Wiki Pages Handlers
// ==========================================
export const listProjectWikis = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pages = await GitlabService.listProjectWikis(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: pages });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing wiki pages:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectWikiPage = async (req, res) => {
  try {
    const { projectId, slug } = req.params;
    const page = await GitlabService.getProjectWikiPage(projectId, slug);
    res.status(httpStatus.OK).json({ success: true, data: page });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting wiki page:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectWikiPage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = await GitlabService.createProjectWikiPage(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: page });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating wiki page:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectWikiPage = async (req, res) => {
  try {
    const { projectId, slug } = req.params;
    const page = await GitlabService.updateProjectWikiPage(
      projectId,
      slug,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: page });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating wiki page:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectWikiPage = async (req, res) => {
  try {
    const { projectId, slug } = req.params;
    const result = await GitlabService.deleteProjectWikiPage(projectId, slug);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting wiki page:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 27. Vulnerability State Management Handlers
// ==========================================
export const getVulnerabilityDetails = async (req, res) => {
  try {
    const { projectId, vulnerabilityId } = req.params;
    const details = await GitlabService.getVulnerabilityDetails(
      projectId,
      vulnerabilityId,
    );
    res.status(httpStatus.OK).json({ success: true, data: details });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting vulnerability details:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const dismissVulnerability = async (req, res) => {
  try {
    const { projectId, vulnerabilityId } = req.params;
    const { comment } = req.body;
    const result = await GitlabService.dismissVulnerability(
      projectId,
      vulnerabilityId,
      comment,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error dismissing vulnerability:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const confirmVulnerability = async (req, res) => {
  try {
    const { projectId, vulnerabilityId } = req.params;
    const result = await GitlabService.confirmVulnerability(
      projectId,
      vulnerabilityId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error confirming vulnerability:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const resolveVulnerability = async (req, res) => {
  try {
    const { projectId, vulnerabilityId } = req.params;
    const result = await GitlabService.resolveVulnerability(
      projectId,
      vulnerabilityId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error resolving vulnerability:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 28. Group & Project Access Requests Handlers
// ==========================================
export const listProjectAccessRequests = async (req, res) => {
  try {
    const { projectId } = req.params;
    const requests = await GitlabService.listProjectAccessRequests(projectId);
    res.status(httpStatus.OK).json({ success: true, data: requests });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing project access requests:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const requestProjectAccess = async (req, res) => {
  try {
    const { projectId } = req.params;
    const request = await GitlabService.requestProjectAccess(projectId);
    res.status(httpStatus.CREATED).json({ success: true, data: request });
  } catch (error) {
    logger.error('[GitLab Controller] Error requesting project access:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const approveProjectAccessRequest = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { accessLevel } = req.body;
    const result = await GitlabService.approveProjectAccessRequest(
      projectId,
      userId,
      accessLevel,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error approving project access request:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const denyProjectAccessRequest = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const result = await GitlabService.denyProjectAccessRequest(
      projectId,
      userId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error denying project access request:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupAccessRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const requests = await GitlabService.listGroupAccessRequests(groupId);
    res.status(httpStatus.OK).json({ success: true, data: requests });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing group access requests:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const requestGroupAccess = async (req, res) => {
  try {
    const { groupId } = req.params;
    const request = await GitlabService.requestGroupAccess(groupId);
    res.status(httpStatus.CREATED).json({ success: true, data: request });
  } catch (error) {
    logger.error('[GitLab Controller] Error requesting group access:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const approveGroupAccessRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { accessLevel } = req.body;
    const result = await GitlabService.approveGroupAccessRequest(
      groupId,
      userId,
      accessLevel,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error approving group access request:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const denyGroupAccessRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const result = await GitlabService.denyGroupAccessRequest(groupId, userId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error denying group access request:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

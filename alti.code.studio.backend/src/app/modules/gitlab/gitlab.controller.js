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

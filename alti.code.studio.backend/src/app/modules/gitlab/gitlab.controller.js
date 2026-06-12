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

// ==========================================
// 29. Protected Branches Handlers
// ==========================================
export const listProtectedBranches = async (req, res) => {
  try {
    const { projectId } = req.params;
    const branches = await GitlabService.listProtectedBranches(projectId);
    res.status(httpStatus.OK).json({ success: true, data: branches });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing protected branches:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProtectedBranch = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const branch = await GitlabService.getProtectedBranch(projectId, name);
    res.status(httpStatus.OK).json({ success: true, data: branch });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting protected branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const protectBranch = async (req, res) => {
  try {
    const { projectId } = req.params;
    const branch = await GitlabService.protectBranch(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: branch });
  } catch (error) {
    logger.error('[GitLab Controller] Error protecting branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProtectedBranch = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const branch = await GitlabService.updateProtectedBranch(
      projectId,
      name,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: branch });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating protected branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unprotectBranch = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const result = await GitlabService.unprotectBranch(projectId, name);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error unprotecting branch:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 30. Deploy Keys Handlers
// ==========================================
export const listProjectDeployKeys = async (req, res) => {
  try {
    const { projectId } = req.params;
    const keys = await GitlabService.listProjectDeployKeys(projectId);
    res.status(httpStatus.OK).json({ success: true, data: keys });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing deploy keys:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectDeployKey = async (req, res) => {
  try {
    const { projectId, keyId } = req.params;
    const key = await GitlabService.getProjectDeployKey(projectId, keyId);
    res.status(httpStatus.OK).json({ success: true, data: key });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting deploy key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addProjectDeployKey = async (req, res) => {
  try {
    const { projectId } = req.params;
    const key = await GitlabService.addProjectDeployKey(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: key });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding deploy key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const enableProjectDeployKey = async (req, res) => {
  try {
    const { projectId, keyId } = req.params;
    const key = await GitlabService.enableProjectDeployKey(projectId, keyId);
    res.status(httpStatus.OK).json({ success: true, data: key });
  } catch (error) {
    logger.error('[GitLab Controller] Error enabling deploy key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectDeployKey = async (req, res) => {
  try {
    const { projectId, keyId } = req.params;
    const key = await GitlabService.updateProjectDeployKey(
      projectId,
      keyId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: key });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating deploy key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectDeployKey = async (req, res) => {
  try {
    const { projectId, keyId } = req.params;
    const result = await GitlabService.deleteProjectDeployKey(projectId, keyId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting deploy key:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 31. Labels Handlers
// ==========================================
export const listProjectLabels = async (req, res) => {
  try {
    const { projectId } = req.params;
    const labels = await GitlabService.listProjectLabels(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: labels });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing project labels:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectLabel = async (req, res) => {
  try {
    const { projectId } = req.params;
    const label = await GitlabService.createProjectLabel(projectId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: label });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating project label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectLabel = async (req, res) => {
  try {
    const { projectId, labelIdOrName } = req.params;
    const label = await GitlabService.updateProjectLabel(
      projectId,
      labelIdOrName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: label });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating project label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectLabel = async (req, res) => {
  try {
    const { projectId, labelIdOrName } = req.params;
    const result = await GitlabService.deleteProjectLabel(
      projectId,
      labelIdOrName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting project label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupLabels = async (req, res) => {
  try {
    const { groupId } = req.params;
    const labels = await GitlabService.listGroupLabels(groupId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: labels });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group labels:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupLabel = async (req, res) => {
  try {
    const { groupId } = req.params;
    const label = await GitlabService.createGroupLabel(groupId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: label });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating group label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupLabel = async (req, res) => {
  try {
    const { groupId, labelIdOrName } = req.params;
    const label = await GitlabService.updateGroupLabel(
      groupId,
      labelIdOrName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: label });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupLabel = async (req, res) => {
  try {
    const { groupId, labelIdOrName } = req.params;
    const result = await GitlabService.deleteGroupLabel(groupId, labelIdOrName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group label:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 32. Todos Handlers
// ==========================================
export const listUserTodos = async (req, res) => {
  try {
    const todos = await GitlabService.listUserTodos(req.query);
    res.status(httpStatus.OK).json({ success: true, data: todos });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing user todos:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTodoOnIssue = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const todo = await GitlabService.createTodoOnIssue(projectId, issueIid);
    res.status(httpStatus.CREATED).json({ success: true, data: todo });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating todo on issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTodoOnMergeRequest = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const todo = await GitlabService.createTodoOnMergeRequest(projectId, mrIid);
    res.status(httpStatus.CREATED).json({ success: true, data: todo });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating todo on MR:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const markTodoAsDone = async (req, res) => {
  try {
    const { todoId } = req.params;
    const todo = await GitlabService.markTodoAsDone(todoId);
    res.status(httpStatus.OK).json({ success: true, data: todo });
  } catch (error) {
    logger.error('[GitLab Controller] Error marking todo as done:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const markAllTodosAsDone = async (req, res) => {
  try {
    const result = await GitlabService.markAllTodosAsDone();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error marking all todos as done:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 33. Project Integrations Handlers
// ==========================================
export const listProjectIntegrations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const integrations = await GitlabService.listProjectIntegrations(projectId);
    res.status(httpStatus.OK).json({ success: true, data: integrations });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing integrations:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectIntegration = async (req, res) => {
  try {
    const { projectId, integrationSlug } = req.params;
    const integration = await GitlabService.getProjectIntegration(
      projectId,
      integrationSlug,
    );
    res.status(httpStatus.OK).json({ success: true, data: integration });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting integration settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectIntegration = async (req, res) => {
  try {
    const { projectId, integrationSlug } = req.params;
    const integration = await GitlabService.updateProjectIntegration(
      projectId,
      integrationSlug,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: integration });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating integration settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectIntegration = async (req, res) => {
  try {
    const { projectId, integrationSlug } = req.params;
    const result = await GitlabService.deleteProjectIntegration(
      projectId,
      integrationSlug,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting integration settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 34. Repository Extras Handlers
// ==========================================
export const getFileBlame = async (req, res) => {
  try {
    const { projectId } = req.params;
    const filePath = req.params[0] || req.query.path || '';
    const blame = await GitlabService.getFileBlame(
      projectId,
      filePath,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: blame });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting file blame:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const downloadRepositoryArchive = async (req, res) => {
  try {
    const { projectId } = req.params;
    const data = await GitlabService.downloadRepositoryArchive(
      projectId,
      req.query,
    );
    const format = req.query.format || 'zip';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="archive.${format}"`,
    );
    res.status(httpStatus.OK).send(data);
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error downloading repository archive:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 35. Group Webhooks Handlers
// ==========================================
export const listGroupHooks = async (req, res) => {
  try {
    const { groupId } = req.params;
    const hooks = await GitlabService.listGroupHooks(groupId);
    res.status(httpStatus.OK).json({ success: true, data: hooks });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group hooks:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroupHook = async (req, res) => {
  try {
    const { groupId, hookId } = req.params;
    const hook = await GitlabService.getGroupHook(groupId, hookId);
    res.status(httpStatus.OK).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting group hook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addGroupHook = async (req, res) => {
  try {
    const { groupId } = req.params;
    const hook = await GitlabService.addGroupHook(groupId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding group hook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupHook = async (req, res) => {
  try {
    const { groupId, hookId } = req.params;
    const hook = await GitlabService.updateGroupHook(groupId, hookId, req.body);
    res.status(httpStatus.OK).json({ success: true, data: hook });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group hook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupHook = async (req, res) => {
  try {
    const { groupId, hookId } = req.params;
    const result = await GitlabService.deleteGroupHook(groupId, hookId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group hook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 36. Issue Links Handlers
// ==========================================
export const listIssueLinks = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const links = await GitlabService.listIssueLinks(projectId, issueIid);
    res.status(httpStatus.OK).json({ success: true, data: links });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing issue links:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssueLink = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const { targetProjectId, targetIssueIid, linkType } = req.body;
    const link = await GitlabService.createIssueLink(
      projectId,
      issueIid,
      targetProjectId,
      targetIssueIid,
      linkType,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: link });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating issue link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteIssueLink = async (req, res) => {
  try {
    const { projectId, issueIid, issueLinkId } = req.params;
    const result = await GitlabService.deleteIssueLink(
      projectId,
      issueIid,
      issueLinkId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting issue link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 37. Time Tracking Handlers
// ==========================================
export const addIssueTimeSpent = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const { duration } = req.body;
    const result = await GitlabService.addIssueTimeSpent(
      projectId,
      issueIid,
      duration,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding issue spent time:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addMergeRequestTimeSpent = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const { duration } = req.body;
    const result = await GitlabService.addMergeRequestTimeSpent(
      projectId,
      mrIid,
      duration,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding MR spent time:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getIssueTimeTracking = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const stats = await GitlabService.getIssueTimeTracking(projectId, issueIid);
    res.status(httpStatus.OK).json({ success: true, data: stats });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting issue time stats:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getMergeRequestTimeTracking = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const stats = await GitlabService.getMergeRequestTimeTracking(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: stats });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting MR time stats:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const resetIssueTimeTracking = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const result = await GitlabService.resetIssueTimeTracking(
      projectId,
      issueIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error resetting issue time stats:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const resetMergeRequestTimeTracking = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const result = await GitlabService.resetMergeRequestTimeTracking(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error resetting MR time stats:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 38. Group Iterations Handlers
// ==========================================
export const listGroupIterations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const iterations = await GitlabService.listGroupIterations(groupId);
    res.status(httpStatus.OK).json({ success: true, data: iterations });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing group iterations:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProjectIterations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const iterations = await GitlabService.listProjectIterations(projectId);
    res.status(httpStatus.OK).json({ success: true, data: iterations });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing project iterations:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupIteration = async (req, res) => {
  try {
    const { groupId } = req.params;
    const iteration = await GitlabService.createGroupIteration(
      groupId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: iteration });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating group iteration:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupIteration = async (req, res) => {
  try {
    const { groupId, iterationId } = req.params;
    const iteration = await GitlabService.updateGroupIteration(
      groupId,
      iterationId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: iteration });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating group iteration:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupIteration = async (req, res) => {
  try {
    const { groupId, iterationId } = req.params;
    const result = await GitlabService.deleteGroupIteration(
      groupId,
      iterationId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting group iteration:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 39. Release Links Handlers
// ==========================================
export const listReleaseLinks = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const links = await GitlabService.listReleaseLinks(projectId, tagName);
    res.status(httpStatus.OK).json({ success: true, data: links });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing release links:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getReleaseLink = async (req, res) => {
  try {
    const { projectId, tagName, linkId } = req.params;
    const link = await GitlabService.getReleaseLink(projectId, tagName, linkId);
    res.status(httpStatus.OK).json({ success: true, data: link });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting release link details:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createReleaseLink = async (req, res) => {
  try {
    const { projectId, tagName } = req.params;
    const link = await GitlabService.createReleaseLink(
      projectId,
      tagName,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: link });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating release link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateReleaseLink = async (req, res) => {
  try {
    const { projectId, tagName, linkId } = req.params;
    const link = await GitlabService.updateReleaseLink(
      projectId,
      tagName,
      linkId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: link });
  } catch (error) {
    logger.error('[GitLab Controller] Error updating release link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteReleaseLink = async (req, res) => {
  try {
    const { projectId, tagName, linkId } = req.params;
    const result = await GitlabService.deleteReleaseLink(
      projectId,
      tagName,
      linkId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error deleting release link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 40. Repository File Locks Handlers
// ==========================================
export const listProjectFileLocks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const locks = await GitlabService.listProjectFileLocks(projectId);
    res.status(httpStatus.OK).json({ success: true, data: locks });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing file locks:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const lockProjectFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path } = req.body;
    const lock = await GitlabService.lockProjectFile(projectId, path);
    res.status(httpStatus.CREATED).json({ success: true, data: lock });
  } catch (error) {
    logger.error('[GitLab Controller] Error locking file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unlockProjectFile = async (req, res) => {
  try {
    const { projectId, lockId } = req.params;
    const result = await GitlabService.unlockProjectFile(projectId, lockId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error unlocking file lock:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 41. Repository Traversal (Trees) Handlers
// ==========================================
export const listRepositoryTree = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tree = await GitlabService.listRepositoryTree(projectId, req.query);
    res.status(httpStatus.OK).json({ success: true, data: tree });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing repository tree:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 42. Threaded Discussions (Notes) Handlers
// ==========================================
export const listIssueDiscussions = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const discussions = await GitlabService.listIssueDiscussions(
      projectId,
      issueIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussions });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing issue discussions:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getIssueDiscussion = async (req, res) => {
  try {
    const { projectId, issueIid, discussionId } = req.params;
    const discussion = await GitlabService.getIssueDiscussion(
      projectId,
      issueIid,
      discussionId,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussion });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting issue discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssueDiscussion = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const { body } = req.body;
    const discussion = await GitlabService.createIssueDiscussion(
      projectId,
      issueIid,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: discussion });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating issue discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const resolveIssueDiscussion = async (req, res) => {
  try {
    const { projectId, issueIid, discussionId } = req.params;
    const { resolved } = req.body;
    const discussion = await GitlabService.resolveIssueDiscussion(
      projectId,
      issueIid,
      discussionId,
      resolved,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussion });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error resolving issue discussion:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMergeRequestDiscussions = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const discussions = await GitlabService.listMergeRequestDiscussions(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussions });
  } catch (error) {
    logger.error('[GitLab Controller] Error listing MR discussions:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getMergeRequestDiscussion = async (req, res) => {
  try {
    const { projectId, mrIid, discussionId } = req.params;
    const discussion = await GitlabService.getMergeRequestDiscussion(
      projectId,
      mrIid,
      discussionId,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussion });
  } catch (error) {
    logger.error('[GitLab Controller] Error getting MR discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMergeRequestDiscussion = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const { body } = req.body;
    const discussion = await GitlabService.createMergeRequestDiscussion(
      projectId,
      mrIid,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: discussion });
  } catch (error) {
    logger.error('[GitLab Controller] Error creating MR discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const resolveMergeRequestDiscussion = async (req, res) => {
  try {
    const { projectId, mrIid, discussionId } = req.params;
    const { resolved } = req.body;
    const discussion = await GitlabService.resolveMergeRequestDiscussion(
      projectId,
      mrIid,
      discussionId,
      resolved,
    );
    res.status(httpStatus.OK).json({ success: true, data: discussion });
  } catch (error) {
    logger.error('[GitLab Controller] Error resolving MR discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addMergeRequestDiscussionNote = async (req, res) => {
  try {
    const { projectId, mrIid, discussionId } = req.params;
    const { body } = req.body;
    const note = await GitlabService.addMergeRequestDiscussionNote(
      projectId,
      mrIid,
      discussionId,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: note });
  } catch (error) {
    logger.error('[GitLab Controller] Error adding MR discussion note:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateMergeRequestDiscussionNote = async (req, res) => {
  try {
    const { projectId, mrIid, discussionId, noteId } = req.params;
    const { body } = req.body;
    const note = await GitlabService.updateMergeRequestDiscussionNote(
      projectId,
      mrIid,
      discussionId,
      noteId,
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: note });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating MR discussion note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteMergeRequestDiscussionNote = async (req, res) => {
  try {
    const { projectId, mrIid, discussionId, noteId } = req.params;
    const result = await GitlabService.deleteMergeRequestDiscussionNote(
      projectId,
      mrIid,
      discussionId,
      noteId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting MR discussion note:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 43. Project & Group Share Links Handlers
// ==========================================
export const shareProjectWithGroup = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await GitlabService.shareProjectWithGroup(
      projectId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error sharing project with group:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unshareProjectFromGroup = async (req, res) => {
  try {
    const { projectId, groupId } = req.params;
    const result = await GitlabService.unshareProjectFromGroup(
      projectId,
      groupId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error removing project share link:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const shareGroupWithGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await GitlabService.shareGroupWithGroup(groupId, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error sharing group with group:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unshareGroupFromGroup = async (req, res) => {
  try {
    const { groupId, sharedGroupId } = req.params;
    const result = await GitlabService.unshareGroupFromGroup(
      groupId,
      sharedGroupId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error removing group share link:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 44. Vulnerability Exports Handlers
// ==========================================
export const createVulnerabilityExport = async (req, res) => {
  try {
    const result = await GitlabService.createVulnerabilityExport(req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating vulnerability export job:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getVulnerabilityExportStatus = async (req, res) => {
  try {
    const { exportId } = req.params;
    const status = await GitlabService.getVulnerabilityExportStatus(exportId);
    res.status(httpStatus.OK).json({ success: true, data: status });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting vulnerability export status:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const downloadVulnerabilityExport = async (req, res) => {
  try {
    const { exportId } = req.params;
    const data = await GitlabService.downloadVulnerabilityExport(exportId);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="vulnerability_export_${exportId}.csv"`,
    );
    res.status(httpStatus.OK).send(data);
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error downloading vulnerability export:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 45. Instance Metadata Handlers
// ==========================================
export const getGitlabVersion = async (req, res) => {
  try {
    const version = await GitlabService.getGitlabVersion();
    res.status(httpStatus.OK).json({ success: true, data: version });
  } catch (error) {
    logger.error('[GitLab Controller] Error fetching GitLab version:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGitlabMetadata = async (req, res) => {
  try {
    const metadata = await GitlabService.getGitlabMetadata();
    res.status(httpStatus.OK).json({ success: true, data: metadata });
  } catch (error) {
    logger.error('[GitLab Controller] Error fetching GitLab metadata:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 46. Resource State Events Handlers
// ==========================================
export const listIssueResourceLabelEvents = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const events = await GitlabService.listIssueResourceLabelEvents(
      projectId,
      issueIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing issue resource label events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMergeRequestResourceLabelEvents = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const events = await GitlabService.listMergeRequestResourceLabelEvents(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing MR resource label events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listIssueResourceMilestoneEvents = async (req, res) => {
  try {
    const { projectId, issueIid } = req.params;
    const events = await GitlabService.listIssueResourceMilestoneEvents(
      projectId,
      issueIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing issue resource milestone events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMergeRequestResourceMilestoneEvents = async (req, res) => {
  try {
    const { projectId, mrIid } = req.params;
    const events = await GitlabService.listMergeRequestResourceMilestoneEvents(
      projectId,
      mrIid,
    );
    res.status(httpStatus.OK).json({ success: true, data: events });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing MR resource milestone events:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 47. Phase 8: Compliance & Security Handlers
// ==========================================
export const listProjectDependencies = async (req, res) => {
  try {
    const { projectId } = req.params;
    const dependencies = await GitlabService.listProjectDependencies(
      projectId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: dependencies });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing project dependencies:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listGroupComplianceFrameworks = async (req, res) => {
  try {
    const { groupId } = req.params;
    const frameworks =
      await GitlabService.listGroupComplianceFrameworks(groupId);
    res.status(httpStatus.OK).json({ success: true, data: frameworks });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing group compliance frameworks:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGroupComplianceFramework = async (req, res) => {
  try {
    const { groupId, frameworkId } = req.params;
    const framework = await GitlabService.getGroupComplianceFramework(
      groupId,
      frameworkId,
    );
    res.status(httpStatus.OK).json({ success: true, data: framework });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting group compliance framework:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGroupComplianceFramework = async (req, res) => {
  try {
    const { groupId } = req.params;
    const framework = await GitlabService.createGroupComplianceFramework(
      groupId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: framework });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating group compliance framework:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateGroupComplianceFramework = async (req, res) => {
  try {
    const { groupId, frameworkId } = req.params;
    const framework = await GitlabService.updateGroupComplianceFramework(
      groupId,
      frameworkId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: framework });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating group compliance framework:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroupComplianceFramework = async (req, res) => {
  try {
    const { groupId, frameworkId } = req.params;
    const result = await GitlabService.deleteGroupComplianceFramework(
      groupId,
      frameworkId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting group compliance framework:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProjectComplianceFramework = async (req, res) => {
  try {
    const { projectId } = req.params;
    const settings =
      await GitlabService.getProjectComplianceFramework(projectId);
    res.status(httpStatus.OK).json({ success: true, data: settings });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting project compliance framework settings:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProjectManagedLicenses = async (req, res) => {
  try {
    const { projectId } = req.params;
    const licenses = await GitlabService.listProjectManagedLicenses(projectId);
    res.status(httpStatus.OK).json({ success: true, data: licenses });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing project managed licenses:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProjectManagedLicense = async (req, res) => {
  try {
    const { projectId } = req.params;
    const license = await GitlabService.createProjectManagedLicense(
      projectId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: license });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error creating project managed license:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProjectManagedLicense = async (req, res) => {
  try {
    const { projectId, licenseId } = req.params;
    const license = await GitlabService.updateProjectManagedLicense(
      projectId,
      licenseId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: license });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating project managed license:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteProjectManagedLicense = async (req, res) => {
  try {
    const { projectId, licenseId } = req.params;
    const result = await GitlabService.deleteProjectManagedLicense(
      projectId,
      licenseId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error deleting project managed license:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listProtectedEnvironments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const environments =
      await GitlabService.listProtectedEnvironments(projectId);
    res.status(httpStatus.OK).json({ success: true, data: environments });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error listing protected environments:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProtectedEnvironment = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const environment = await GitlabService.getProtectedEnvironment(
      projectId,
      name,
    );
    res.status(httpStatus.OK).json({ success: true, data: environment });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error getting protected environment:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const protectEnvironment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const environment = await GitlabService.protectEnvironment(
      projectId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: environment });
  } catch (error) {
    logger.error('[GitLab Controller] Error protecting environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProtectedEnvironment = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const environment = await GitlabService.updateProtectedEnvironment(
      projectId,
      name,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: environment });
  } catch (error) {
    logger.error(
      '[GitLab Controller] Error updating protected environment:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unprotectEnvironment = async (req, res) => {
  try {
    const { projectId, name } = req.params;
    const result = await GitlabService.unprotectEnvironment(projectId, name);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitLab Controller] Error unprotecting environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

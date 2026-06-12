import express from 'express';
import * as GitlabController from './gitlab.controller.js';

const router = express.Router();

// Middleware to capture wildcard filePath from URL parameters for repository file endpoints
const captureFilePath = (req, res, next) => {
  req.params.filePath = req.params[0];
  next();
};

// ==========================================
// 1. User & Keys Endpoints
// ==========================================
router.get('/user', GitlabController.getAuthenticatedUser);

router.get('/user/keys', GitlabController.listSSHKeys);
router.post('/user/keys', GitlabController.addSSHKey);
router.delete('/user/keys/:keyId', GitlabController.deleteSSHKey);

router.get('/user/gpg_keys', GitlabController.listGPGKeys);
router.post('/user/gpg_keys', GitlabController.addGPGKey);
router.delete('/user/gpg_keys/:keyId', GitlabController.deleteGPGKey);

// ==========================================
// 2. Projects & Branches Endpoints
// ==========================================
router.get('/projects', GitlabController.listProjects);
router.post('/projects', GitlabController.createProject);
router.get('/projects/:projectId', GitlabController.getProject);
router.delete('/projects/:projectId', GitlabController.deleteProject);

router.get('/projects/:projectId/branches', GitlabController.listBranches);
router.get('/projects/:projectId/branches/:branch', GitlabController.getBranch);
router.post('/projects/:projectId/branches', GitlabController.createBranch);
router.delete('/projects/:projectId/branches/:branch', GitlabController.deleteBranch);

// ==========================================
// 3. Repository Files Endpoints
// ==========================================
router.get('/projects/:projectId/files/*', captureFilePath, GitlabController.getFileContent);
router.post('/projects/:projectId/files/*', captureFilePath, GitlabController.createFile);
router.put('/projects/:projectId/files/*', captureFilePath, GitlabController.updateFile);
router.delete('/projects/:projectId/files/*', captureFilePath, GitlabController.deleteFile);

// ==========================================
// 4. Merge Requests Endpoints
// ==========================================
router.get('/projects/:projectId/merge_requests', GitlabController.listMergeRequests);
router.get('/projects/:projectId/merge_requests/:mrIid', GitlabController.getMergeRequest);
router.post('/projects/:projectId/merge_requests', GitlabController.createMergeRequest);
router.put('/projects/:projectId/merge_requests/:mrIid', GitlabController.updateMergeRequest);
router.put('/projects/:projectId/merge_requests/:mrIid/merge', GitlabController.mergeMergeRequest);
router.get('/projects/:projectId/merge_requests/:mrIid/comments', GitlabController.listMergeRequestComments);
router.post('/projects/:projectId/merge_requests/:mrIid/comments', GitlabController.createMergeRequestComment);

// ==========================================
// 5. Issues & Milestones Endpoints
// ==========================================
router.get('/projects/:projectId/issues', GitlabController.listIssues);
router.get('/projects/:projectId/issues/:issueIid', GitlabController.getIssue);
router.post('/projects/:projectId/issues', GitlabController.createIssue);
router.put('/projects/:projectId/issues/:issueIid', GitlabController.updateIssue);
router.get('/projects/:projectId/issues/:issueIid/comments', GitlabController.listIssueComments);
router.post('/projects/:projectId/issues/:issueIid/comments', GitlabController.createIssueComment);

router.get('/projects/:projectId/milestones', GitlabController.listMilestones);
router.post('/projects/:projectId/milestones', GitlabController.createMilestone);
router.put('/projects/:projectId/milestones/:milestoneId', GitlabController.updateMilestone);
router.delete('/projects/:projectId/milestones/:milestoneId', GitlabController.deleteMilestone);

// ==========================================
// 6. CI/CD Pipelines & Jobs Endpoints
// ==========================================
router.get('/projects/:projectId/pipelines', GitlabController.listPipelines);
router.get('/projects/:projectId/pipelines/:pipelineId', GitlabController.getPipeline);
router.post('/projects/:projectId/pipelines', GitlabController.createPipeline);
router.post('/projects/:projectId/pipelines/:pipelineId/cancel', GitlabController.cancelPipeline);
router.post('/projects/:projectId/pipelines/:pipelineId/retry', GitlabController.retryPipeline);
router.get('/projects/:projectId/pipelines/:pipelineId/jobs', GitlabController.listPipelineJobs);
router.get('/projects/:projectId/jobs/:jobId/log', GitlabController.getJobLog);

// ==========================================
// 7. CI/CD Variables Endpoints
// ==========================================
router.get('/projects/:projectId/variables', GitlabController.listProjectVariables);
router.get('/projects/:projectId/variables/:key', GitlabController.getProjectVariable);
router.post('/projects/:projectId/variables', GitlabController.createProjectVariable);
router.put('/projects/:projectId/variables/:key', GitlabController.updateProjectVariable);
router.delete('/projects/:projectId/variables/:key', GitlabController.deleteProjectVariable);

router.get('/groups/:groupId/variables', GitlabController.listGroupVariables);
router.get('/groups/:groupId/variables/:key', GitlabController.getGroupVariable);
router.post('/groups/:groupId/variables', GitlabController.createGroupVariable);
router.put('/groups/:groupId/variables/:key', GitlabController.updateGroupVariable);
router.delete('/groups/:groupId/variables/:key', GitlabController.deleteGroupVariable);

// ==========================================
// 8. Groups & Members Endpoints
// ==========================================
router.get('/groups', GitlabController.listGroups);
router.get('/groups/:groupId', GitlabController.getGroup);

router.get('/projects/:projectId/members', GitlabController.listProjectMembers);
router.post('/projects/:projectId/members', GitlabController.addProjectMember);
router.delete('/projects/:projectId/members/:userId', GitlabController.removeProjectMember);

router.get('/groups/:groupId/members', GitlabController.listGroupMembers);
router.post('/groups/:groupId/members', GitlabController.addGroupMember);
router.delete('/groups/:groupId/members/:userId', GitlabController.removeGroupMember);

// ==========================================
// 9. Project Webhooks Endpoints
// ==========================================
router.get('/projects/:projectId/hooks', GitlabController.listProjectHooks);
router.get('/projects/:projectId/hooks/:hookId', GitlabController.getProjectHook);
router.post('/projects/:projectId/hooks', GitlabController.createProjectHook);
router.put('/projects/:projectId/hooks/:hookId', GitlabController.updateProjectHook);
router.delete('/projects/:projectId/hooks/:hookId', GitlabController.deleteProjectHook);

// ==========================================
// 10. Access Tokens Endpoints
// ==========================================
router.get('/projects/:projectId/access_tokens', GitlabController.listProjectAccessTokens);
router.post('/projects/:projectId/access_tokens', GitlabController.createProjectAccessToken);
router.delete('/projects/:projectId/access_tokens/:tokenId', GitlabController.revokeProjectAccessToken);

// ==========================================
// 11. Security Scanning Endpoints
// ==========================================
router.get('/projects/:projectId/vulnerabilities', GitlabController.listVulnerabilityAlerts);

export const GitlabRoutes = router;

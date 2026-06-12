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
router.delete(
  '/projects/:projectId/branches/:branch',
  GitlabController.deleteBranch,
);

// ==========================================
// 3. Repository Files Endpoints
// ==========================================
router.get(
  '/projects/:projectId/files/*',
  captureFilePath,
  GitlabController.getFileContent,
);
router.post(
  '/projects/:projectId/files/*',
  captureFilePath,
  GitlabController.createFile,
);
router.put(
  '/projects/:projectId/files/*',
  captureFilePath,
  GitlabController.updateFile,
);
router.delete(
  '/projects/:projectId/files/*',
  captureFilePath,
  GitlabController.deleteFile,
);

// ==========================================
// 4. Merge Requests Endpoints
// ==========================================
router.get(
  '/projects/:projectId/merge_requests',
  GitlabController.listMergeRequests,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid',
  GitlabController.getMergeRequest,
);
router.post(
  '/projects/:projectId/merge_requests',
  GitlabController.createMergeRequest,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid',
  GitlabController.updateMergeRequest,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/merge',
  GitlabController.mergeMergeRequest,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid/comments',
  GitlabController.listMergeRequestComments,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/comments',
  GitlabController.createMergeRequestComment,
);

// ==========================================
// 5. Issues & Milestones Endpoints
// ==========================================
router.get('/projects/:projectId/issues', GitlabController.listIssues);
router.get('/projects/:projectId/issues/:issueIid', GitlabController.getIssue);
router.post('/projects/:projectId/issues', GitlabController.createIssue);
router.put(
  '/projects/:projectId/issues/:issueIid',
  GitlabController.updateIssue,
);
router.get(
  '/projects/:projectId/issues/:issueIid/comments',
  GitlabController.listIssueComments,
);
router.post(
  '/projects/:projectId/issues/:issueIid/comments',
  GitlabController.createIssueComment,
);

router.get('/projects/:projectId/milestones', GitlabController.listMilestones);
router.post(
  '/projects/:projectId/milestones',
  GitlabController.createMilestone,
);
router.put(
  '/projects/:projectId/milestones/:milestoneId',
  GitlabController.updateMilestone,
);
router.delete(
  '/projects/:projectId/milestones/:milestoneId',
  GitlabController.deleteMilestone,
);

// ==========================================
// 6. CI/CD Pipelines & Jobs Endpoints
// ==========================================
router.get('/projects/:projectId/pipelines', GitlabController.listPipelines);
router.get(
  '/projects/:projectId/pipelines/:pipelineId',
  GitlabController.getPipeline,
);
router.post('/projects/:projectId/pipelines', GitlabController.createPipeline);
router.post(
  '/projects/:projectId/pipelines/:pipelineId/cancel',
  GitlabController.cancelPipeline,
);
router.post(
  '/projects/:projectId/pipelines/:pipelineId/retry',
  GitlabController.retryPipeline,
);
router.get(
  '/projects/:projectId/pipelines/:pipelineId/jobs',
  GitlabController.listPipelineJobs,
);
router.get('/projects/:projectId/jobs/:jobId/log', GitlabController.getJobLog);

// ==========================================
// 7. CI/CD Variables Endpoints
// ==========================================
router.get(
  '/projects/:projectId/variables',
  GitlabController.listProjectVariables,
);
router.get(
  '/projects/:projectId/variables/:key',
  GitlabController.getProjectVariable,
);
router.post(
  '/projects/:projectId/variables',
  GitlabController.createProjectVariable,
);
router.put(
  '/projects/:projectId/variables/:key',
  GitlabController.updateProjectVariable,
);
router.delete(
  '/projects/:projectId/variables/:key',
  GitlabController.deleteProjectVariable,
);

router.get('/groups/:groupId/variables', GitlabController.listGroupVariables);
router.get(
  '/groups/:groupId/variables/:key',
  GitlabController.getGroupVariable,
);
router.post('/groups/:groupId/variables', GitlabController.createGroupVariable);
router.put(
  '/groups/:groupId/variables/:key',
  GitlabController.updateGroupVariable,
);
router.delete(
  '/groups/:groupId/variables/:key',
  GitlabController.deleteGroupVariable,
);

// ==========================================
// 8. Groups & Members Endpoints
// ==========================================
router.get('/groups', GitlabController.listGroups);
router.get('/groups/:groupId', GitlabController.getGroup);

router.get('/projects/:projectId/members', GitlabController.listProjectMembers);
router.post('/projects/:projectId/members', GitlabController.addProjectMember);
router.delete(
  '/projects/:projectId/members/:userId',
  GitlabController.removeProjectMember,
);

router.get('/groups/:groupId/members', GitlabController.listGroupMembers);
router.post('/groups/:groupId/members', GitlabController.addGroupMember);
router.delete(
  '/groups/:groupId/members/:userId',
  GitlabController.removeGroupMember,
);

// ==========================================
// 9. Project Webhooks Endpoints
// ==========================================
router.get('/projects/:projectId/hooks', GitlabController.listProjectHooks);
router.get(
  '/projects/:projectId/hooks/:hookId',
  GitlabController.getProjectHook,
);
router.post('/projects/:projectId/hooks', GitlabController.createProjectHook);
router.put(
  '/projects/:projectId/hooks/:hookId',
  GitlabController.updateProjectHook,
);
router.delete(
  '/projects/:projectId/hooks/:hookId',
  GitlabController.deleteProjectHook,
);

// ==========================================
// 10. Access Tokens Endpoints
// ==========================================
router.get(
  '/projects/:projectId/access_tokens',
  GitlabController.listProjectAccessTokens,
);
router.post(
  '/projects/:projectId/access_tokens',
  GitlabController.createProjectAccessToken,
);
router.delete(
  '/projects/:projectId/access_tokens/:tokenId',
  GitlabController.revokeProjectAccessToken,
);

// ==========================================
// 11. Security Scanning Endpoints
// ==========================================
router.get(
  '/projects/:projectId/vulnerabilities',
  GitlabController.listVulnerabilityAlerts,
);

// ==========================================
// 12. Commits, Diff & Comments Endpoints
// ==========================================
router.get(
  '/projects/:projectId/repository/commits',
  GitlabController.listCommits,
);
router.get(
  '/projects/:projectId/repository/commits/:sha',
  GitlabController.getCommit,
);
router.get(
  '/projects/:projectId/repository/compare',
  GitlabController.compareCommits,
);
router.get(
  '/projects/:projectId/repository/commits/:sha/diff',
  GitlabController.getCommitDiff,
);
router.get(
  '/projects/:projectId/repository/commits/:sha/comments',
  GitlabController.getCommitComments,
);
router.post(
  '/projects/:projectId/repository/commits/:sha/comments',
  GitlabController.createCommitComment,
);
router.post(
  '/projects/:projectId/statuses/:sha',
  GitlabController.createCommitStatus,
);
router.get(
  '/projects/:projectId/repository/commits/:sha/statuses',
  GitlabController.listCommitStatuses,
);

// ==========================================
// 13. Releases & Tags Endpoints
// ==========================================
router.get('/projects/:projectId/releases', GitlabController.listReleases);
router.get(
  '/projects/:projectId/releases/:tagName',
  GitlabController.getRelease,
);
router.post('/projects/:projectId/releases', GitlabController.createRelease);
router.put(
  '/projects/:projectId/releases/:tagName',
  GitlabController.updateRelease,
);
router.delete(
  '/projects/:projectId/releases/:tagName',
  GitlabController.deleteRelease,
);

router.get('/projects/:projectId/repository/tags', GitlabController.listTags);
router.get(
  '/projects/:projectId/repository/tags/:tagName',
  GitlabController.getTag,
);
router.post('/projects/:projectId/repository/tags', GitlabController.createTag);
router.delete(
  '/projects/:projectId/repository/tags/:tagName',
  GitlabController.deleteTag,
);

// ==========================================
// 14. Deployments & Environments Endpoints
// ==========================================
router.get(
  '/projects/:projectId/environments',
  GitlabController.listEnvironments,
);
router.get(
  '/projects/:projectId/environments/:environmentId',
  GitlabController.getEnvironment,
);
router.post(
  '/projects/:projectId/environments',
  GitlabController.createEnvironment,
);
router.put(
  '/projects/:projectId/environments/:environmentId',
  GitlabController.updateEnvironment,
);
router.delete(
  '/projects/:projectId/environments/:environmentId',
  GitlabController.deleteEnvironment,
);

router.get(
  '/projects/:projectId/deployments',
  GitlabController.listDeployments,
);
router.get(
  '/projects/:projectId/deployments/:deploymentId',
  GitlabController.getDeployment,
);
router.post(
  '/projects/:projectId/deployments',
  GitlabController.createDeployment,
);
router.put(
  '/projects/:projectId/deployments/:deploymentId',
  GitlabController.updateDeployment,
);

// ==========================================
// 15. Snippets Endpoints
// ==========================================
router.get('/snippets', GitlabController.listSnippets);
router.get(
  '/projects/:projectId/snippets',
  GitlabController.listProjectSnippets,
);
router.get('/snippets/:snippetId', GitlabController.getSnippet);
router.get(
  '/projects/:projectId/snippets/:snippetId',
  GitlabController.getProjectSnippet,
);
router.post('/snippets', GitlabController.createSnippet);
router.post(
  '/projects/:projectId/snippets',
  GitlabController.createProjectSnippet,
);
router.put('/snippets/:snippetId', GitlabController.updateSnippet);
router.put(
  '/projects/:projectId/snippets/:snippetId',
  GitlabController.updateProjectSnippet,
);
router.delete('/snippets/:snippetId', GitlabController.deleteSnippet);
router.delete(
  '/projects/:projectId/snippets/:snippetId',
  GitlabController.deleteProjectSnippet,
);
router.get('/snippets/:snippetId/raw', GitlabController.getSnippetContent);
router.get(
  '/projects/:projectId/snippets/:snippetId/raw',
  GitlabController.getProjectSnippetContent,
);

// ==========================================
// 16. Self-Hosted Runners Endpoints
// ==========================================
router.get('/runners', GitlabController.listRunners);
router.get('/projects/:projectId/runners', GitlabController.listProjectRunners);
router.get('/runners/:runnerId', GitlabController.getRunner);
router.put('/runners/:runnerId', GitlabController.updateRunner);
router.delete('/runners/:runnerId', GitlabController.deleteRunner);
router.post('/runners', GitlabController.registerRunner);
router.post('/runners/verify', GitlabController.verifyRunner);

// ==========================================
// 17. Epics & Epic Boards Endpoints
// ==========================================
router.get('/groups/:groupId/epics', GitlabController.listGroupEpics);
router.get('/groups/:groupId/epics/:epicId', GitlabController.getGroupEpic);
router.post('/groups/:groupId/epics', GitlabController.createGroupEpic);
router.put('/groups/:groupId/epics/:epicId', GitlabController.updateGroupEpic);
router.delete('/groups/:groupId/epics/:epicId', GitlabController.deleteGroupEpic);
router.get('/groups/:groupId/epics/:epicId/issues', GitlabController.listEpicIssues);
router.post('/groups/:groupId/epics/:epicId/issues/:issueId', GitlabController.linkEpicIssue);
router.delete('/groups/:groupId/epics/:epicId/issues/:issueId', GitlabController.unlinkEpicIssue);

// ==========================================
// 18. Packages & Registries Endpoints
// ==========================================
router.get('/projects/:projectId/packages', GitlabController.listProjectPackages);
router.get('/projects/:projectId/packages/:packageId', GitlabController.getProjectPackage);
router.delete('/projects/:projectId/packages/:packageId', GitlabController.deleteProjectPackage);
router.get('/projects/:projectId/packages/:packageId/versions', GitlabController.listPackageVersions);
router.get('/projects/:projectId/registry/repositories', GitlabController.listContainerRepositories);
router.delete('/projects/:projectId/registry/repositories/:repositoryId', GitlabController.deleteContainerRepository);

// ==========================================
// 19. Project & Group Badges Endpoints
// ==========================================
router.get('/projects/:projectId/badges', GitlabController.listProjectBadges);
router.get('/projects/:projectId/badges/:badgeId', GitlabController.getProjectBadge);
router.post('/projects/:projectId/badges', GitlabController.createProjectBadge);
router.put('/projects/:projectId/badges/:badgeId', GitlabController.updateProjectBadge);
router.delete('/projects/:projectId/badges/:badgeId', GitlabController.deleteProjectBadge);

router.get('/groups/:groupId/badges', GitlabController.listGroupBadges);
router.get('/groups/:groupId/badges/:badgeId', GitlabController.getGroupBadge);
router.post('/groups/:groupId/badges', GitlabController.createGroupBadge);
router.put('/groups/:groupId/badges/:badgeId', GitlabController.updateGroupBadge);
router.delete('/groups/:groupId/badges/:badgeId', GitlabController.deleteGroupBadge);

// ==========================================
// 20. Pages & Pages Domains Endpoints
// ==========================================
router.get('/projects/:projectId/pages', GitlabController.getProjectPages);
router.delete('/projects/:projectId/pages', GitlabController.deleteProjectPages);
router.get('/projects/:projectId/pages/domains', GitlabController.listPagesDomains);
router.get('/projects/:projectId/pages/domains/:domain', GitlabController.getPagesDomain);
router.post('/projects/:projectId/pages/domains', GitlabController.createPagesDomain);
router.put('/projects/:projectId/pages/domains/:domain', GitlabController.updatePagesDomain);
router.delete('/projects/:projectId/pages/domains/:domain', GitlabController.deletePagesDomain);

// ==========================================
// 21. Audit Events Endpoints
// ==========================================
router.get('/projects/:projectId/audit_events', GitlabController.listProjectAuditEvents);
router.get('/groups/:groupId/audit_events', GitlabController.listGroupAuditEvents);

// ==========================================
// 22. Award Emoji (Reactions) Endpoints
// ==========================================
router.get('/projects/:projectId/issues/:issueIid/award_emoji', GitlabController.listAwardEmojisOnIssue);
router.post('/projects/:projectId/issues/:issueIid/award_emoji', GitlabController.createAwardEmojiOnIssue);
router.delete('/projects/:projectId/issues/:issueIid/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnIssue);

router.get('/projects/:projectId/merge_requests/:mrIid/award_emoji', GitlabController.listAwardEmojisOnMergeRequest);
router.post('/projects/:projectId/merge_requests/:mrIid/award_emoji', GitlabController.createAwardEmojiOnMergeRequest);
router.delete('/projects/:projectId/merge_requests/:mrIid/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnMergeRequest);

router.get('/snippets/:snippetId/award_emoji', GitlabController.listAwardEmojisOnSnippet);
router.post('/snippets/:snippetId/award_emoji', GitlabController.createAwardEmojiOnSnippet);
router.delete('/snippets/:snippetId/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnSnippet);

router.get('/projects/:projectId/snippets/:snippetId/award_emoji', GitlabController.listAwardEmojisOnProjectSnippet);
router.post('/projects/:projectId/snippets/:snippetId/award_emoji', GitlabController.createAwardEmojiOnProjectSnippet);
router.delete('/projects/:projectId/snippets/:snippetId/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnProjectSnippet);

router.get('/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji', GitlabController.listAwardEmojisOnIssueNote);
router.post('/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji', GitlabController.createAwardEmojiOnIssueNote);
router.delete('/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnIssueNote);

router.get('/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji', GitlabController.listAwardEmojisOnMergeRequestNote);
router.post('/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji', GitlabController.createAwardEmojiOnMergeRequestNote);
router.delete('/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji/:emojiId', GitlabController.deleteAwardEmojiOnMergeRequestNote);

export const GitlabRoutes = router;


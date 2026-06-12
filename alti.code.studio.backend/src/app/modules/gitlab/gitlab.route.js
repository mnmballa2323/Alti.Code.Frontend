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
  GitlabController.listCommitComments,
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
router.delete(
  '/groups/:groupId/epics/:epicId',
  GitlabController.deleteGroupEpic,
);
router.get(
  '/groups/:groupId/epics/:epicId/issues',
  GitlabController.listEpicIssues,
);
router.post(
  '/groups/:groupId/epics/:epicId/issues/:issueId',
  GitlabController.linkEpicIssue,
);
router.delete(
  '/groups/:groupId/epics/:epicId/issues/:issueId',
  GitlabController.unlinkEpicIssue,
);

// ==========================================
// 18. Packages & Registries Endpoints
// ==========================================
router.get(
  '/projects/:projectId/packages',
  GitlabController.listProjectPackages,
);
router.get(
  '/projects/:projectId/packages/:packageId',
  GitlabController.getProjectPackage,
);
router.delete(
  '/projects/:projectId/packages/:packageId',
  GitlabController.deleteProjectPackage,
);
router.get(
  '/projects/:projectId/packages/:packageId/versions',
  GitlabController.listPackageVersions,
);
router.get(
  '/projects/:projectId/registry/repositories',
  GitlabController.listContainerRepositories,
);
router.delete(
  '/projects/:projectId/registry/repositories/:repositoryId',
  GitlabController.deleteContainerRepository,
);

// ==========================================
// 19. Project & Group Badges Endpoints
// ==========================================
router.get('/projects/:projectId/badges', GitlabController.listProjectBadges);
router.get(
  '/projects/:projectId/badges/:badgeId',
  GitlabController.getProjectBadge,
);
router.post('/projects/:projectId/badges', GitlabController.createProjectBadge);
router.put(
  '/projects/:projectId/badges/:badgeId',
  GitlabController.updateProjectBadge,
);
router.delete(
  '/projects/:projectId/badges/:badgeId',
  GitlabController.deleteProjectBadge,
);

router.get('/groups/:groupId/badges', GitlabController.listGroupBadges);
router.get('/groups/:groupId/badges/:badgeId', GitlabController.getGroupBadge);
router.post('/groups/:groupId/badges', GitlabController.createGroupBadge);
router.put(
  '/groups/:groupId/badges/:badgeId',
  GitlabController.updateGroupBadge,
);
router.delete(
  '/groups/:groupId/badges/:badgeId',
  GitlabController.deleteGroupBadge,
);

// ==========================================
// 20. Pages & Pages Domains Endpoints
// ==========================================
router.get('/projects/:projectId/pages', GitlabController.getProjectPages);
router.delete(
  '/projects/:projectId/pages',
  GitlabController.deleteProjectPages,
);
router.get(
  '/projects/:projectId/pages/domains',
  GitlabController.listPagesDomains,
);
router.get(
  '/projects/:projectId/pages/domains/:domain',
  GitlabController.getPagesDomain,
);
router.post(
  '/projects/:projectId/pages/domains',
  GitlabController.createPagesDomain,
);
router.put(
  '/projects/:projectId/pages/domains/:domain',
  GitlabController.updatePagesDomain,
);
router.delete(
  '/projects/:projectId/pages/domains/:domain',
  GitlabController.deletePagesDomain,
);

// ==========================================
// 21. Audit Events Endpoints
// ==========================================
router.get(
  '/projects/:projectId/audit_events',
  GitlabController.listProjectAuditEvents,
);
router.get(
  '/groups/:groupId/audit_events',
  GitlabController.listGroupAuditEvents,
);

// ==========================================
// 22. Award Emoji (Reactions) Endpoints
// ==========================================
router.get(
  '/projects/:projectId/issues/:issueIid/award_emoji',
  GitlabController.listAwardEmojisOnIssue,
);
router.post(
  '/projects/:projectId/issues/:issueIid/award_emoji',
  GitlabController.createAwardEmojiOnIssue,
);
router.delete(
  '/projects/:projectId/issues/:issueIid/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnIssue,
);

router.get(
  '/projects/:projectId/merge_requests/:mrIid/award_emoji',
  GitlabController.listAwardEmojisOnMergeRequest,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/award_emoji',
  GitlabController.createAwardEmojiOnMergeRequest,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnMergeRequest,
);

router.get(
  '/snippets/:snippetId/award_emoji',
  GitlabController.listAwardEmojisOnSnippet,
);
router.post(
  '/snippets/:snippetId/award_emoji',
  GitlabController.createAwardEmojiOnSnippet,
);
router.delete(
  '/snippets/:snippetId/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnSnippet,
);

router.get(
  '/projects/:projectId/snippets/:snippetId/award_emoji',
  GitlabController.listAwardEmojisOnProjectSnippet,
);
router.post(
  '/projects/:projectId/snippets/:snippetId/award_emoji',
  GitlabController.createAwardEmojiOnProjectSnippet,
);
router.delete(
  '/projects/:projectId/snippets/:snippetId/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnProjectSnippet,
);

router.get(
  '/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji',
  GitlabController.listAwardEmojisOnIssueNote,
);
router.post(
  '/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji',
  GitlabController.createAwardEmojiOnIssueNote,
);
router.delete(
  '/projects/:projectId/issues/:issueIid/notes/:noteId/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnIssueNote,
);

router.get(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji',
  GitlabController.listAwardEmojisOnMergeRequestNote,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji',
  GitlabController.createAwardEmojiOnMergeRequestNote,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId/award_emoji/:emojiId',
  GitlabController.deleteAwardEmojiOnMergeRequestNote,
);

// ==========================================
// 23. Pipeline Schedules Endpoints
// ==========================================
router.get(
  '/projects/:projectId/pipeline_schedules',
  GitlabController.listProjectPipelineSchedules,
);
router.get(
  '/projects/:projectId/pipeline_schedules/:scheduleId',
  GitlabController.getProjectPipelineSchedule,
);
router.post(
  '/projects/:projectId/pipeline_schedules',
  GitlabController.createProjectPipelineSchedule,
);
router.put(
  '/projects/:projectId/pipeline_schedules/:scheduleId',
  GitlabController.updateProjectPipelineSchedule,
);
router.delete(
  '/projects/:projectId/pipeline_schedules/:scheduleId',
  GitlabController.deleteProjectPipelineSchedule,
);
router.post(
  '/projects/:projectId/pipeline_schedules/:scheduleId/play',
  GitlabController.playProjectPipelineSchedule,
);

// ==========================================
// 24. Job Artifacts Endpoints
// ==========================================
router.get(
  '/projects/:projectId/jobs/:jobId/artifacts',
  GitlabController.downloadJobArtifacts,
);
router.get(
  '/projects/:projectId/jobs/:jobId/artifacts/*',
  GitlabController.downloadJobArtifactFile,
);
router.delete(
  '/projects/:projectId/jobs/:jobId/artifacts',
  GitlabController.deleteJobArtifacts,
);
router.post(
  '/projects/:projectId/jobs/:jobId/artifacts/keep',
  GitlabController.keepJobArtifacts,
);

// ==========================================
// 25. Merge Request Approval Rules Endpoints
// ==========================================
router.get(
  '/projects/:projectId/merge_requests/:mrIid/approval_rules',
  GitlabController.listMergeRequestApprovalRules,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/approval_rules',
  GitlabController.createMergeRequestApprovalRule,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/approval_rules/:ruleId',
  GitlabController.updateMergeRequestApprovalRule,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/approval_rules/:ruleId',
  GitlabController.deleteMergeRequestApprovalRule,
);
router.get(
  '/projects/:projectId/approvals',
  GitlabController.getProjectApprovalSettings,
);
router.post(
  '/projects/:projectId/approvals',
  GitlabController.updateProjectApprovalSettings,
);

// ==========================================
// 26. Wikis & Wiki Pages Endpoints
// ==========================================
router.get('/projects/:projectId/wikis', GitlabController.listProjectWikis);
router.get(
  '/projects/:projectId/wikis/:slug',
  GitlabController.getProjectWikiPage,
);
router.post(
  '/projects/:projectId/wikis',
  GitlabController.createProjectWikiPage,
);
router.put(
  '/projects/:projectId/wikis/:slug',
  GitlabController.updateProjectWikiPage,
);
router.delete(
  '/projects/:projectId/wikis/:slug',
  GitlabController.deleteProjectWikiPage,
);

// ==========================================
// 27. Vulnerability State Management Endpoints
// ==========================================
router.get(
  '/projects/:projectId/vulnerabilities/:vulnerabilityId',
  GitlabController.getVulnerabilityDetails,
);
router.post(
  '/projects/:projectId/vulnerabilities/:vulnerabilityId/dismiss',
  GitlabController.dismissVulnerability,
);
router.post(
  '/projects/:projectId/vulnerabilities/:vulnerabilityId/confirm',
  GitlabController.confirmVulnerability,
);
router.post(
  '/projects/:projectId/vulnerabilities/:vulnerabilityId/resolve',
  GitlabController.resolveVulnerability,
);

// ==========================================
// 28. Group & Project Access Requests Endpoints
// ==========================================
router.get(
  '/projects/:projectId/access_requests',
  GitlabController.listProjectAccessRequests,
);
router.post(
  '/projects/:projectId/access_requests',
  GitlabController.requestProjectAccess,
);
router.put(
  '/projects/:projectId/access_requests/:userId/approve',
  GitlabController.approveProjectAccessRequest,
);
router.delete(
  '/projects/:projectId/access_requests/:userId',
  GitlabController.denyProjectAccessRequest,
);

router.get(
  '/groups/:groupId/access_requests',
  GitlabController.listGroupAccessRequests,
);
router.post(
  '/groups/:groupId/access_requests',
  GitlabController.requestGroupAccess,
);
router.put(
  '/groups/:groupId/access_requests/:userId/approve',
  GitlabController.approveGroupAccessRequest,
);
router.delete(
  '/groups/:groupId/access_requests/:userId',
  GitlabController.denyGroupAccessRequest,
);

// ==========================================
// 29. Protected Branches Endpoints
// ==========================================
router.get(
  '/projects/:projectId/protected_branches',
  GitlabController.listProtectedBranches,
);
router.get(
  '/projects/:projectId/protected_branches/:name',
  GitlabController.getProtectedBranch,
);
router.post(
  '/projects/:projectId/protected_branches',
  GitlabController.protectBranch,
);
router.patch(
  '/projects/:projectId/protected_branches/:name',
  GitlabController.updateProtectedBranch,
);
router.delete(
  '/projects/:projectId/protected_branches/:name',
  GitlabController.unprotectBranch,
);

// ==========================================
// 30. Deploy Keys Endpoints
// ==========================================
router.get(
  '/projects/:projectId/deploy_keys',
  GitlabController.listProjectDeployKeys,
);
router.get(
  '/projects/:projectId/deploy_keys/:keyId',
  GitlabController.getProjectDeployKey,
);
router.post(
  '/projects/:projectId/deploy_keys',
  GitlabController.addProjectDeployKey,
);
router.post(
  '/projects/:projectId/deploy_keys/:keyId/enable',
  GitlabController.enableProjectDeployKey,
);
router.put(
  '/projects/:projectId/deploy_keys/:keyId',
  GitlabController.updateProjectDeployKey,
);
router.delete(
  '/projects/:projectId/deploy_keys/:keyId',
  GitlabController.deleteProjectDeployKey,
);

// ==========================================
// 31. Labels Endpoints
// ==========================================
router.get('/projects/:projectId/labels', GitlabController.listProjectLabels);
router.post('/projects/:projectId/labels', GitlabController.createProjectLabel);
router.put(
  '/projects/:projectId/labels/:labelIdOrName',
  GitlabController.updateProjectLabel,
);
router.delete(
  '/projects/:projectId/labels/:labelIdOrName',
  GitlabController.deleteProjectLabel,
);

router.get('/groups/:groupId/labels', GitlabController.listGroupLabels);
router.post('/groups/:groupId/labels', GitlabController.createGroupLabel);
router.put(
  '/groups/:groupId/labels/:labelIdOrName',
  GitlabController.updateGroupLabel,
);
router.delete(
  '/groups/:groupId/labels/:labelIdOrName',
  GitlabController.deleteGroupLabel,
);

// ==========================================
// 32. Todos Endpoints
// ==========================================
router.get('/todos', GitlabController.listUserTodos);
router.post(
  '/projects/:projectId/issues/:issueIid/todo',
  GitlabController.createTodoOnIssue,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/todo',
  GitlabController.createTodoOnMergeRequest,
);
router.post('/todos/:todoId/mark_as_done', GitlabController.markTodoAsDone);
router.post('/todos/mark_as_done', GitlabController.markAllTodosAsDone);

// ==========================================
// 33. Project Integrations Endpoints
// ==========================================
router.get(
  '/projects/:projectId/integrations',
  GitlabController.listProjectIntegrations,
);
router.get(
  '/projects/:projectId/integrations/:integrationSlug',
  GitlabController.getProjectIntegration,
);
router.put(
  '/projects/:projectId/integrations/:integrationSlug',
  GitlabController.updateProjectIntegration,
);
router.delete(
  '/projects/:projectId/integrations/:integrationSlug',
  GitlabController.deleteProjectIntegration,
);

// ==========================================
// 34. Repository Extras Endpoints
// ==========================================
router.get(
  '/projects/:projectId/repository/files/*/blame',
  GitlabController.getFileBlame,
);
router.get(
  '/projects/:projectId/repository/archive',
  GitlabController.downloadRepositoryArchive,
);

// ==========================================
// 35. Group Webhooks Endpoints
// ==========================================
router.get('/groups/:groupId/hooks', GitlabController.listGroupHooks);
router.get('/groups/:groupId/hooks/:hookId', GitlabController.getGroupHook);
router.post('/groups/:groupId/hooks', GitlabController.addGroupHook);
router.put('/groups/:groupId/hooks/:hookId', GitlabController.updateGroupHook);
router.delete(
  '/groups/:groupId/hooks/:hookId',
  GitlabController.deleteGroupHook,
);

// ==========================================
// 36. Issue Links Endpoints
// ==========================================
router.get(
  '/projects/:projectId/issues/:issueIid/links',
  GitlabController.listIssueLinks,
);
router.post(
  '/projects/:projectId/issues/:issueIid/links',
  GitlabController.createIssueLink,
);
router.delete(
  '/projects/:projectId/issues/:issueIid/links/:issueLinkId',
  GitlabController.deleteIssueLink,
);

// ==========================================
// 37. Time Tracking Endpoints
// ==========================================
router.post(
  '/projects/:projectId/issues/:issueIid/time_spent',
  GitlabController.addIssueTimeSpent,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/time_spent',
  GitlabController.addMergeRequestTimeSpent,
);
router.get(
  '/projects/:projectId/issues/:issueIid/time_stats',
  GitlabController.getIssueTimeTracking,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid/time_stats',
  GitlabController.getMergeRequestTimeTracking,
);
router.post(
  '/projects/:projectId/issues/:issueIid/time_reset',
  GitlabController.resetIssueTimeTracking,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/time_reset',
  GitlabController.resetMergeRequestTimeTracking,
);

// ==========================================
// 38. Group Iterations Endpoints
// ==========================================
router.get('/groups/:groupId/iterations', GitlabController.listGroupIterations);
router.get(
  '/projects/:projectId/iterations',
  GitlabController.listProjectIterations,
);
router.post(
  '/groups/:groupId/iterations',
  GitlabController.createGroupIteration,
);
router.put(
  '/groups/:groupId/iterations/:iterationId',
  GitlabController.updateGroupIteration,
);
router.delete(
  '/groups/:groupId/iterations/:iterationId',
  GitlabController.deleteGroupIteration,
);

// ==========================================
// 39. Release Links Endpoints
// ==========================================
router.get(
  '/projects/:projectId/releases/:tagName/assets/links',
  GitlabController.listReleaseLinks,
);
router.get(
  '/projects/:projectId/releases/:tagName/assets/links/:linkId',
  GitlabController.getReleaseLink,
);
router.post(
  '/projects/:projectId/releases/:tagName/assets/links',
  GitlabController.createReleaseLink,
);
router.put(
  '/projects/:projectId/releases/:tagName/assets/links/:linkId',
  GitlabController.updateReleaseLink,
);
router.delete(
  '/projects/:projectId/releases/:tagName/assets/links/:linkId',
  GitlabController.deleteReleaseLink,
);

// ==========================================
// 40. Repository File Locks Endpoints
// ==========================================
router.get(
  '/projects/:projectId/infrastructure/file_locks',
  GitlabController.listProjectFileLocks,
);
router.post(
  '/projects/:projectId/infrastructure/file_locks',
  GitlabController.lockProjectFile,
);
router.delete(
  '/projects/:projectId/infrastructure/file_locks/:lockId',
  GitlabController.unlockProjectFile,
);

// ==========================================
// 41. Phase 7 Endpoints
// ==========================================
// 1. Repository Traversal (Trees)
router.get(
  '/projects/:projectId/repository/tree',
  GitlabController.listRepositoryTree,
);

// 2. Threaded Discussions
router.get(
  '/projects/:projectId/issues/:issueIid/discussions',
  GitlabController.listIssueDiscussions,
);
router.post(
  '/projects/:projectId/issues/:issueIid/discussions',
  GitlabController.createIssueDiscussion,
);
router.get(
  '/projects/:projectId/issues/:issueIid/discussions/:discussionId',
  GitlabController.getIssueDiscussion,
);
router.put(
  '/projects/:projectId/issues/:issueIid/discussions/:discussionId/resolve',
  GitlabController.resolveIssueDiscussion,
);

router.get(
  '/projects/:projectId/merge_requests/:mrIid/discussions',
  GitlabController.listMergeRequestDiscussions,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/discussions',
  GitlabController.createMergeRequestDiscussion,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid/discussions/:discussionId',
  GitlabController.getMergeRequestDiscussion,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/discussions/:discussionId/resolve',
  GitlabController.resolveMergeRequestDiscussion,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/discussions/:discussionId/notes',
  GitlabController.addMergeRequestDiscussionNote,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/discussions/:discussionId/notes/:noteId',
  GitlabController.updateMergeRequestDiscussionNote,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/discussions/:discussionId/notes/:noteId',
  GitlabController.deleteMergeRequestDiscussionNote,
);

// 3. Project & Group Share Links
router.post(
  '/projects/:projectId/share',
  GitlabController.shareProjectWithGroup,
);
router.delete(
  '/projects/:projectId/share/:groupId',
  GitlabController.unshareProjectFromGroup,
);
router.post('/groups/:groupId/share', GitlabController.shareGroupWithGroup);
router.delete(
  '/groups/:groupId/share/:sharedGroupId',
  GitlabController.unshareGroupFromGroup,
);

// 4. Vulnerability Exports
router.post(
  '/vulnerability_exports',
  GitlabController.createVulnerabilityExport,
);
router.get(
  '/vulnerability_exports/:exportId',
  GitlabController.getVulnerabilityExportStatus,
);
router.get(
  '/vulnerability_exports/:exportId/download',
  GitlabController.downloadVulnerabilityExport,
);

// 5. Instance Metadata
router.get('/version', GitlabController.getGitlabVersion);
router.get('/metadata', GitlabController.getGitlabMetadata);

// 6. Resource State Events
router.get(
  '/projects/:projectId/issues/:issueIid/resource_label_events',
  GitlabController.listIssueResourceLabelEvents,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid/resource_label_events',
  GitlabController.listMergeRequestResourceLabelEvents,
);
router.get(
  '/projects/:projectId/issues/:issueIid/resource_milestone_events',
  GitlabController.listIssueResourceMilestoneEvents,
);
router.get(
  '/projects/:projectId/merge_requests/:mrIid/resource_milestone_events',
  GitlabController.listMergeRequestResourceMilestoneEvents,
);

// ==========================================
// 42. Phase 8 Endpoints
// ==========================================
// 1. Dependency List
router.get(
  '/projects/:projectId/dependencies',
  GitlabController.listProjectDependencies,
);

// 2. Compliance Frameworks
router.get(
  '/groups/:groupId/compliance_frameworks',
  GitlabController.listGroupComplianceFrameworks,
);
router.post(
  '/groups/:groupId/compliance_frameworks',
  GitlabController.createGroupComplianceFramework,
);
router.get(
  '/groups/:groupId/compliance_frameworks/:frameworkId',
  GitlabController.getGroupComplianceFramework,
);
router.put(
  '/groups/:groupId/compliance_frameworks/:frameworkId',
  GitlabController.updateGroupComplianceFramework,
);
router.delete(
  '/groups/:groupId/compliance_frameworks/:frameworkId',
  GitlabController.deleteGroupComplianceFramework,
);
router.get(
  '/projects/:projectId/compliance_frameworks',
  GitlabController.getProjectComplianceFramework,
);

// 3. License Compliance
router.get(
  '/projects/:projectId/managed_licenses',
  GitlabController.listProjectManagedLicenses,
);
router.post(
  '/projects/:projectId/managed_licenses',
  GitlabController.createProjectManagedLicense,
);
router.put(
  '/projects/:projectId/managed_licenses/:licenseId',
  GitlabController.updateProjectManagedLicense,
);
router.patch(
  '/projects/:projectId/managed_licenses/:licenseId',
  GitlabController.updateProjectManagedLicense,
);
router.delete(
  '/projects/:projectId/managed_licenses/:licenseId',
  GitlabController.deleteProjectManagedLicense,
);

// 4. Protected Environments
router.get(
  '/projects/:projectId/protected_environments',
  GitlabController.listProtectedEnvironments,
);
router.post(
  '/projects/:projectId/protected_environments',
  GitlabController.protectEnvironment,
);
router.get(
  '/projects/:projectId/protected_environments/:name',
  GitlabController.getProtectedEnvironment,
);
router.put(
  '/projects/:projectId/protected_environments/:name',
  GitlabController.updateProtectedEnvironment,
);
router.delete(
  '/projects/:projectId/protected_environments/:name',
  GitlabController.unprotectEnvironment,
);

// ==========================================
// 43. Phase 9 Endpoints
// ==========================================
// 1. SAML Group Links
router.get(
  '/groups/:groupId/saml_group_links',
  GitlabController.listGroupSamlGroupLinks,
);
router.post(
  '/groups/:groupId/saml_group_links',
  GitlabController.createGroupSamlGroupLink,
);
router.get(
  '/groups/:groupId/saml_group_links/:samlGroupName',
  GitlabController.getGroupSamlGroupLink,
);
router.delete(
  '/groups/:groupId/saml_group_links/:samlGroupName',
  GitlabController.deleteGroupSamlGroupLink,
);

// 2. User Custom Attributes
router.get(
  '/users/:userId/custom_attributes',
  GitlabController.listUserCustomAttributes,
);
router.get(
  '/users/:userId/custom_attributes/:key',
  GitlabController.getUserCustomAttribute,
);
router.put(
  '/users/:userId/custom_attributes/:key',
  GitlabController.setUserCustomAttribute,
);
router.delete(
  '/users/:userId/custom_attributes/:key',
  GitlabController.deleteUserCustomAttribute,
);

// 3. User Impersonation Tokens
router.get(
  '/users/:userId/impersonation_tokens',
  GitlabController.listUserImpersonationTokens,
);
router.post(
  '/users/:userId/impersonation_tokens',
  GitlabController.createUserImpersonationToken,
);
router.get(
  '/users/:userId/impersonation_tokens/:tokenId',
  GitlabController.getUserImpersonationToken,
);
router.delete(
  '/users/:userId/impersonation_tokens/:tokenId',
  GitlabController.revokeUserImpersonationToken,
);

// 4. SCIM Group Provisioning
router.get(
  '/groups/:groupId/scim/v2/users',
  GitlabController.listGroupScimUsers,
);
router.post(
  '/groups/:groupId/scim/v2/users',
  GitlabController.createGroupScimUser,
);
router.get(
  '/groups/:groupId/scim/v2/users/:scimUserId',
  GitlabController.getGroupScimUser,
);
router.put(
  '/groups/:groupId/scim/v2/users/:scimUserId',
  GitlabController.updateGroupScimUser,
);
router.patch(
  '/groups/:groupId/scim/v2/users/:scimUserId',
  GitlabController.updateGroupScimUser,
);
router.delete(
  '/groups/:groupId/scim/v2/users/:scimUserId',
  GitlabController.deleteGroupScimUser,
);

// ==========================================
// 44. Phase 10 Endpoints
// ==========================================
// 2. Project Forks
router.get('/projects/:projectId/forks', GitlabController.listProjectForks);
router.post('/projects/:projectId/forks', GitlabController.createProjectFork);

// 3. Project & Group Push Rules
router.get(
  '/projects/:projectId/push_rule',
  GitlabController.getProjectPushRules,
);
router.post(
  '/projects/:projectId/push_rule',
  GitlabController.createProjectPushRules,
);
router.put(
  '/projects/:projectId/push_rule',
  GitlabController.updateProjectPushRules,
);
router.delete(
  '/projects/:projectId/push_rule',
  GitlabController.deleteProjectPushRules,
);

router.get('/groups/:groupId/push_rule', GitlabController.getGroupPushRules);
router.post(
  '/groups/:groupId/push_rule',
  GitlabController.createGroupPushRules,
);
router.put('/groups/:groupId/push_rule', GitlabController.updateGroupPushRules);
router.delete(
  '/groups/:groupId/push_rule',
  GitlabController.deleteGroupPushRules,
);

// 4. Merge Request Draft Notes (Batch Reviews)
router.get(
  '/projects/:projectId/merge_requests/:mrIid/draft_notes',
  GitlabController.listMergeRequestDraftNotes,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/draft_notes',
  GitlabController.createMergeRequestDraftNote,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/draft_notes/:draftNoteId',
  GitlabController.updateMergeRequestDraftNote,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/draft_notes/:draftNoteId',
  GitlabController.deleteMergeRequestDraftNote,
);
router.post(
  '/projects/:projectId/merge_requests/:mrIid/draft_notes/publish',
  GitlabController.publishMergeRequestDraftNotes,
);

// 5. Project & Group Invitations
router.get(
  '/groups/:groupId/invitations',
  GitlabController.listGroupInvitations,
);
router.post(
  '/groups/:groupId/invitations',
  GitlabController.inviteGroupMembers,
);
router.delete(
  '/groups/:groupId/invitations/:email',
  GitlabController.deleteGroupInvitation,
);

router.get(
  '/projects/:projectId/invitations',
  GitlabController.listProjectInvitations,
);
router.post(
  '/projects/:projectId/invitations',
  GitlabController.inviteProjectMembers,
);
router.delete(
  '/projects/:projectId/invitations/:email',
  GitlabController.deleteProjectInvitation,
);

// 6. Phase 11: System Hooks, Instance Audit Events, Project & Group Custom Attributes & Application Settings
router.get('/system_hooks', GitlabController.listSystemHooks);
router.post('/system_hooks', GitlabController.addSystemHook);
router.delete('/system_hooks/:hookId', GitlabController.deleteSystemHook);
router.post('/system_hooks/:hookId/test', GitlabController.testSystemHook);

router.get('/audit_events', GitlabController.listInstanceAuditEvents);

router.get(
  '/projects/:projectId/custom_attributes',
  GitlabController.listProjectCustomAttributes,
);
router.get(
  '/projects/:projectId/custom_attributes/:key',
  GitlabController.getProjectCustomAttribute,
);
router.put(
  '/projects/:projectId/custom_attributes/:key',
  GitlabController.setProjectCustomAttribute,
);
router.delete(
  '/projects/:projectId/custom_attributes/:key',
  GitlabController.deleteProjectCustomAttribute,
);

router.get(
  '/groups/:groupId/custom_attributes',
  GitlabController.listGroupCustomAttributes,
);
router.get(
  '/groups/:groupId/custom_attributes/:key',
  GitlabController.getGroupCustomAttribute,
);
router.put(
  '/groups/:groupId/custom_attributes/:key',
  GitlabController.setGroupCustomAttribute,
);
router.delete(
  '/groups/:groupId/custom_attributes/:key',
  GitlabController.deleteGroupCustomAttribute,
);

router.get('/application/settings', GitlabController.getApplicationSettings);
router.put('/application/settings', GitlabController.updateApplicationSettings);

// 7. Phase 12: Project Secure Files, Group Access Tokens, Broadcast Messages, and Markdown Rendering
router.get(
  '/projects/:projectId/secure_files',
  GitlabController.listProjectSecureFiles,
);
router.get(
  '/projects/:projectId/secure_files/:fileId',
  GitlabController.getProjectSecureFile,
);
router.post(
  '/projects/:projectId/secure_files',
  GitlabController.createProjectSecureFile,
);
router.delete(
  '/projects/:projectId/secure_files/:fileId',
  GitlabController.deleteProjectSecureFile,
);

router.get(
  '/groups/:groupId/access_tokens',
  GitlabController.listGroupAccessTokens,
);
router.post(
  '/groups/:groupId/access_tokens',
  GitlabController.createGroupAccessToken,
);
router.delete(
  '/groups/:groupId/access_tokens/:tokenId',
  GitlabController.revokeGroupAccessToken,
);

router.get('/broadcast_messages', GitlabController.listBroadcastMessages);
router.get(
  '/broadcast_messages/:messageId',
  GitlabController.getBroadcastMessage,
);
router.post('/broadcast_messages', GitlabController.createBroadcastMessage);
router.put(
  '/broadcast_messages/:messageId',
  GitlabController.updateBroadcastMessage,
);
router.delete(
  '/broadcast_messages/:messageId',
  GitlabController.deleteBroadcastMessage,
);

router.post('/markdown', GitlabController.renderMarkdown);

// ==========================================
// 48. Phase 13: Deploy Tokens, Personal Access Tokens, Project Topics, and MR Suggestions
// ==========================================
router.get(
  '/projects/:projectId/deploy_tokens',
  GitlabController.listProjectDeployTokens,
);
router.post(
  '/projects/:projectId/deploy_tokens',
  GitlabController.createProjectDeployToken,
);
router.delete(
  '/projects/:projectId/deploy_tokens/:tokenId',
  GitlabController.deleteProjectDeployToken,
);

router.get(
  '/groups/:groupId/deploy_tokens',
  GitlabController.listGroupDeployTokens,
);
router.post(
  '/groups/:groupId/deploy_tokens',
  GitlabController.createGroupDeployToken,
);
router.delete(
  '/groups/:groupId/deploy_tokens/:tokenId',
  GitlabController.deleteGroupDeployToken,
);

router.get(
  '/personal_access_tokens',
  GitlabController.listPersonalAccessTokens,
);
router.post(
  '/personal_access_tokens',
  GitlabController.createPersonalAccessToken,
);
router.get(
  '/personal_access_tokens/:tokenId',
  GitlabController.getPersonalAccessToken,
);
router.delete(
  '/personal_access_tokens/:tokenId',
  GitlabController.revokePersonalAccessToken,
);

router.get('/topics', GitlabController.listProjectTopics);
router.post('/topics', GitlabController.createProjectTopic);
router.get('/topics/:topicId', GitlabController.getProjectTopic);
router.put('/topics/:topicId', GitlabController.updateProjectTopic);
router.delete('/topics/:topicId', GitlabController.deleteProjectTopic);

router.put(
  '/suggestions/:suggestionId/apply',
  GitlabController.applyMergeRequestSuggestion,
);

// ==========================================
// 49. Phase 14: Protected Tags, DORA Metrics, Feature Flags, Resource Groups, and Iteration Cadences
// ==========================================
router.get(
  '/projects/:projectId/protected_tags',
  GitlabController.listProtectedTags,
);
router.post('/projects/:projectId/protected_tags', GitlabController.protectTag);
router.get(
  '/projects/:projectId/protected_tags/:tagName',
  GitlabController.getProtectedTag,
);
router.delete(
  '/projects/:projectId/protected_tags/:tagName',
  GitlabController.unprotectTag,
);

router.get(
  '/projects/:projectId/dora/metrics',
  GitlabController.getProjectDoraMetrics,
);

router.get(
  '/projects/:projectId/feature_flags',
  GitlabController.listFeatureFlags,
);
router.post(
  '/projects/:projectId/feature_flags',
  GitlabController.createFeatureFlag,
);
router.get(
  '/projects/:projectId/feature_flags/:flagId',
  GitlabController.getFeatureFlag,
);
router.put(
  '/projects/:projectId/feature_flags/:flagId',
  GitlabController.updateFeatureFlag,
);
router.delete(
  '/projects/:projectId/feature_flags/:flagId',
  GitlabController.deleteFeatureFlag,
);

router.get(
  '/projects/:projectId/resource_groups',
  GitlabController.listResourceGroups,
);
router.get(
  '/projects/:projectId/resource_groups/:groupKey',
  GitlabController.getResourceGroup,
);
router.put(
  '/projects/:projectId/resource_groups/:groupKey',
  GitlabController.updateResourceGroup,
);

router.get(
  '/groups/:groupId/iteration_cadences',
  GitlabController.listGroupIterationCadences,
);
router.post(
  '/groups/:groupId/iteration_cadences',
  GitlabController.createGroupIterationCadence,
);
router.put(
  '/groups/:groupId/iteration_cadences/:cadenceId',
  GitlabController.updateGroupIterationCadence,
);
router.delete(
  '/groups/:groupId/iteration_cadences/:cadenceId',
  GitlabController.deleteGroupIterationCadence,
);

// ==========================================
// 50. Phase 15: Cluster Agents, Package Protection, and Pipeline Triggers
// ==========================================
router.get(
  '/projects/:projectId/cluster_agents',
  GitlabController.listProjectClusterAgents,
);
router.post(
  '/projects/:projectId/cluster_agents',
  GitlabController.createProjectClusterAgent,
);
router.get(
  '/projects/:projectId/cluster_agents/:agentId',
  GitlabController.getProjectClusterAgent,
);
router.delete(
  '/projects/:projectId/cluster_agents/:agentId',
  GitlabController.deleteProjectClusterAgent,
);

router.get(
  '/projects/:projectId/cluster_agents/:agentId/tokens',
  GitlabController.listClusterAgentTokens,
);
router.post(
  '/projects/:projectId/cluster_agents/:agentId/tokens',
  GitlabController.createClusterAgentToken,
);
router.delete(
  '/projects/:projectId/cluster_agents/:agentId/tokens/:tokenId',
  GitlabController.deleteClusterAgentToken,
);

router.get(
  '/projects/:projectId/packages/protection/rules',
  GitlabController.listPackageProtectionRules,
);
router.post(
  '/projects/:projectId/packages/protection/rules',
  GitlabController.createPackageProtectionRule,
);
router.put(
  '/projects/:projectId/packages/protection/rules/:ruleId',
  GitlabController.updatePackageProtectionRule,
);
router.delete(
  '/projects/:projectId/packages/protection/rules/:ruleId',
  GitlabController.deletePackageProtectionRule,
);

router.get(
  '/projects/:projectId/triggers',
  GitlabController.listPipelineTriggers,
);
router.post(
  '/projects/:projectId/triggers',
  GitlabController.createPipelineTrigger,
);
router.get(
  '/projects/:projectId/triggers/:triggerId',
  GitlabController.getPipelineTrigger,
);
router.put(
  '/projects/:projectId/triggers/:triggerId',
  GitlabController.updatePipelineTrigger,
);
router.delete(
  '/projects/:projectId/triggers/:triggerId',
  GitlabController.deletePipelineTrigger,
);

// ==========================================
// 51. Phase 16: Epic Notes, Snippet Notes, and Extended Issue/MR Notes CRUD
// ==========================================
router.get(
  '/projects/:projectId/issues/:issueIid/notes/:noteId',
  GitlabController.getIssueComment,
);
router.put(
  '/projects/:projectId/issues/:issueIid/notes/:noteId',
  GitlabController.updateIssueComment,
);
router.delete(
  '/projects/:projectId/issues/:issueIid/notes/:noteId',
  GitlabController.deleteIssueComment,
);

router.get(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId',
  GitlabController.getMergeRequestComment,
);
router.put(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId',
  GitlabController.updateMergeRequestComment,
);
router.delete(
  '/projects/:projectId/merge_requests/:mrIid/notes/:noteId',
  GitlabController.deleteMergeRequestComment,
);

router.get(
  '/groups/:groupId/epics/:epicId/notes',
  GitlabController.listEpicNotes,
);
router.post(
  '/groups/:groupId/epics/:epicId/notes',
  GitlabController.createEpicNote,
);
router.get(
  '/groups/:groupId/epics/:epicId/notes/:noteId',
  GitlabController.getEpicNote,
);
router.put(
  '/groups/:groupId/epics/:epicId/notes/:noteId',
  GitlabController.updateEpicNote,
);
router.delete(
  '/groups/:groupId/epics/:epicId/notes/:noteId',
  GitlabController.deleteEpicNote,
);

router.get(
  '/projects/:projectId/snippets/:snippetId/notes',
  GitlabController.listProjectSnippetNotes,
);
router.post(
  '/projects/:projectId/snippets/:snippetId/notes',
  GitlabController.createProjectSnippetNote,
);
router.get(
  '/projects/:projectId/snippets/:snippetId/notes/:noteId',
  GitlabController.getProjectSnippetNote,
);
router.put(
  '/projects/:projectId/snippets/:snippetId/notes/:noteId',
  GitlabController.updateProjectSnippetNote,
);
router.delete(
  '/projects/:projectId/snippets/:snippetId/notes/:noteId',
  GitlabController.deleteProjectSnippetNote,
);

// ==========================================
// 52. Phase 17: Global/Group/Project Search, Issues Statistics, Application Statistics & Settings, Webhook Test API & Deliveries, and CI/CD Linting
// ==========================================
router.get('/search', GitlabController.searchGlobal);
router.get('/groups/:groupId/search', GitlabController.searchGroup);
router.get('/projects/:projectId/search', GitlabController.searchProject);

router.get('/issues_statistics', GitlabController.getIssuesStatistics);
router.get('/groups/:groupId/issues_statistics', GitlabController.getGroupIssuesStatistics);
router.get('/projects/:projectId/issues_statistics', GitlabController.getProjectIssuesStatistics);

router.get('/application/statistics', GitlabController.getApplicationStatistics);
router.get('/application/appearance', GitlabController.getAppearance);
router.put('/application/appearance', GitlabController.updateAppearance);

router.post('/projects/:projectId/hooks/:hookId/test/:trigger', GitlabController.testProjectHook);
router.get('/projects/:projectId/hooks/:hookId/deliveries', GitlabController.listProjectHookDeliveries);
router.get('/projects/:projectId/hooks/:hookId/deliveries/:deliveryId', GitlabController.getProjectHookDelivery);
router.post('/projects/:projectId/hooks/:hookId/deliveries/:deliveryId/resubmit', GitlabController.resubmitProjectHookDelivery);

router.post('/groups/:groupId/hooks/:hookId/test/:trigger', GitlabController.testGroupHook);

router.post('/ci/lint', GitlabController.lintCI);
router.post('/projects/:projectId/ci/lint', GitlabController.lintProjectCI);

export const GitlabRoutes = router;

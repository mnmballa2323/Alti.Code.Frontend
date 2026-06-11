import express from 'express';
import crypto from 'crypto';
import { GithubWebhookController } from './githubWebhook.controller.js';
import { GithubController } from './github.controller.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

const router = express.Router();

/**
 * Validates the GitHub Webhook HMAC signature to prevent spoofing
 */
const verifyGitHubSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const secret = config.github.webhook_secret;

  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  if (!secret) {
    logger.warn(
      '⚠️ [GitHub Webhook] Webhook secret not configured in env. Bypassing verification for local development.',
    );
    return next();
  }

  if (!signature) {
    logger.warn(
      '⚠️ [GitHub Webhook] Missing signature header. Rejecting request.',
    );
    return res.status(401).send('Unauthorized');
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  if (signature !== digest) {
    logger.warn(
      '⚠️ [GitHub Webhook] Signature mismatch. Possible spoofing attack.',
    );
    return res.status(401).send('Unauthorized');
  }

  next();
};

/**
 * @route POST /api/github/webhook
 * @desc Handle incoming GitHub Webhooks for Continuous RAG Ingestion and Auto-Review
 * @access Protected via HMAC Signature
 */
router.post(
  '/webhook',
  verifyGitHubSignature,
  GithubWebhookController.handleWebhook,
);

// ===========================================================================
// Direct GitHub REST/GraphQL API Integration (No middle layer)
// ===========================================================================

// 1. User Info
router.get('/user', GithubController.getAuthenticatedUser);

// 2. Repositories
router.get('/repos', GithubController.listRepositories);
router.post('/repos', GithubController.createRepository);
router.get('/repos/:owner/:repo', GithubController.getRepository);
router.delete('/repos/:owner/:repo', GithubController.deleteRepository);
router.get('/repos/:owner/:repo/branches', GithubController.listBranches);

// 3. Issues
router.get('/issues/:owner/:repo', GithubController.listIssues);
router.post('/issues/:owner/:repo', GithubController.createIssue);
router.get('/issues/:owner/:repo/:number', GithubController.getIssue);
router.patch('/issues/:owner/:repo/:number', GithubController.updateIssue);

// 4. Pull Requests
router.get('/pulls/:owner/:repo', GithubController.listPullRequests);
router.post('/pulls/:owner/:repo', GithubController.createPullRequest);
router.get('/pulls/:owner/:repo/:number', GithubController.getPullRequest);
router.put(
  '/pulls/:owner/:repo/:number/merge',
  GithubController.mergePullRequest,
);

// 5. Actions (CI/CD workflows)
router.get('/actions/:owner/:repo/workflows', GithubController.listWorkflows);
router.post(
  '/actions/:owner/:repo/workflows/:workflowId/dispatches',
  GithubController.triggerWorkflowDispatch,
);
router.get('/actions/:owner/:repo/runs', GithubController.listWorkflowRuns);

// 6. Gists
router.get('/gists', GithubController.listGists);
router.post('/gists', GithubController.createGist);
router.delete('/gists/:gistId', GithubController.deleteGist);

// 7. Projects
router.get('/projects/:owner/:repo', GithubController.listProjects);
router.post('/projects/:owner/:repo', GithubController.createProject);

// 8. GraphQL API
router.post('/graphql', GithubController.graphql);

// 9. Search API
router.get('/search/repos', GithubController.searchRepositories);
router.get('/search/code', GithubController.searchCode);
router.get('/search/issues', GithubController.searchIssues);
router.get('/search/users', GithubController.searchUsers);

// 10. Git Data / Contents API
router.get('/repos/:owner/:repo/contents/*', GithubController.getFileContent);
router.put(
  '/repos/:owner/:repo/contents/*',
  GithubController.createOrUpdateFile,
);
router.delete('/repos/:owner/:repo/contents/*', GithubController.deleteFile);
router.get('/repos/:owner/:repo/commits', GithubController.listCommits);
router.get(
  '/repos/:owner/:repo/compare/:base...:head',
  GithubController.compareCommits,
);

// 11. Releases API
router.get('/repos/:owner/:repo/releases', GithubController.listReleases);
router.post('/repos/:owner/:repo/releases', GithubController.createRelease);
router.get(
  '/repos/:owner/:repo/releases/latest',
  GithubController.getLatestRelease,
);

// 12. Collaborators API
router.get(
  '/repos/:owner/:repo/collaborators',
  GithubController.listCollaborators,
);
router.put(
  '/repos/:owner/:repo/collaborators/:username',
  GithubController.addCollaborator,
);
router.delete(
  '/repos/:owner/:repo/collaborators/:username',
  GithubController.removeCollaborator,
);

// 13. Git Database Plumbing API
router.get('/repos/:owner/:repo/git/ref/*', GithubController.getRef);
router.post('/repos/:owner/:repo/git/refs', GithubController.createRef);
router.patch('/repos/:owner/:repo/git/ref/*', GithubController.updateRef);
router.post('/repos/:owner/:repo/git/blobs', GithubController.createBlob);
router.post('/repos/:owner/:repo/git/trees', GithubController.createTree);
router.post('/repos/:owner/:repo/git/commits', GithubController.createCommit);

// 14. Organizations & Teams API
router.get('/orgs', GithubController.listOrganizations);
router.get('/orgs/:org/teams', GithubController.listTeams);
router.get(
  '/orgs/:org/teams/:team_slug/members',
  GithubController.listTeamMembers,
);

// 15. Repository Webhooks API
router.get('/repos/:owner/:repo/hooks', GithubController.listWebhooks);
router.post('/repos/:owner/:repo/hooks', GithubController.createWebhook);
router.delete(
  '/repos/:owner/:repo/hooks/:hookId',
  GithubController.deleteWebhook,
);

// 16. Actions Secrets & Variables API
router.get(
  '/repos/:owner/:repo/actions/secrets/public-key',
  GithubController.getActionsPublicKey,
);
router.put(
  '/repos/:owner/:repo/actions/secrets/:secretName',
  GithubController.createOrUpdateRepoSecret,
);
router.get(
  '/repos/:owner/:repo/actions/variables',
  GithubController.listRepoVariables,
);
router.post(
  '/repos/:owner/:repo/actions/variables',
  GithubController.createRepoVariable,
);
router.patch(
  '/repos/:owner/:repo/actions/variables/:name',
  GithubController.updateRepoVariable,
);

// 17. Codespaces API
router.get('/codespaces', GithubController.listCodespaces);
router.post('/codespaces', GithubController.createCodespace);
router.delete('/codespaces/:codespaceName', GithubController.deleteCodespace);

// 18. Dependabot Alerts API
router.get(
  '/repos/:owner/:repo/dependabot/alerts',
  GithubController.listDependabotAlerts,
);

// 19. Copilot API
router.get(
  '/copilot/billing/:username',
  GithubController.getCopilotBillingForUser,
);

// 20. Discussions API
router.get('/repos/:owner/:repo/discussions', GithubController.listDiscussions);
router.get(
  '/repos/:owner/:repo/discussions/:number',
  GithubController.getDiscussion,
);
router.post(
  '/repos/:owner/:repo/discussions',
  GithubController.createDiscussion,
);
router.post(
  '/repos/:owner/:repo/discussions/:discussionId/comments',
  GithubController.createDiscussionComment,
);

// 21. Checks API
router.post('/repos/:owner/:repo/checks/runs', GithubController.createCheckRun);
router.patch(
  '/repos/:owner/:repo/checks/runs/:checkRunId',
  GithubController.updateCheckRun,
);
router.get(
  '/repos/:owner/:repo/checks/refs/:ref',
  GithubController.listCheckRunsForRef,
);
router.post(
  '/repos/:owner/:repo/checks/suites',
  GithubController.createCheckSuite,
);

// 22. Deployments & Environments API
router.get('/repos/:owner/:repo/deployments', GithubController.listDeployments);
router.post(
  '/repos/:owner/:repo/deployments',
  GithubController.createDeployment,
);
router.post(
  '/repos/:owner/:repo/deployments/:deploymentId/statuses',
  GithubController.createDeploymentStatus,
);
router.get(
  '/repos/:owner/:repo/environments',
  GithubController.listEnvironments,
);
router.put(
  '/repos/:owner/:repo/environments/:environmentName',
  GithubController.createOrUpdateEnvironment,
);

// 23. Code & Secret Scanning API
router.get(
  '/repos/:owner/:repo/scanning/code/alerts',
  GithubController.listCodeScanningAlerts,
);
router.get(
  '/repos/:owner/:repo/scanning/code/alerts/:alertNumber',
  GithubController.getCodeScanningAlert,
);
router.get(
  '/repos/:owner/:repo/scanning/secret/alerts',
  GithubController.listSecretScanningAlerts,
);
router.get(
  '/repos/:owner/:repo/scanning/secret/alerts/:alertNumber',
  GithubController.getSecretScanningAlert,
);

// 24. Actions Artifacts & Workflow Jobs API
router.get(
  '/repos/:owner/:repo/actions/runs/:runId/jobs',
  GithubController.listWorkflowJobs,
);
router.get(
  '/repos/:owner/:repo/actions/runs/:runId/artifacts',
  GithubController.listWorkflowRunArtifacts,
);
router.get(
  '/repos/:owner/:repo/actions/artifacts/:artifactId/download',
  GithubController.downloadWorkflowArtifact,
);

// 25. GitHub Apps & Installations API
router.get('/apps/authenticated', GithubController.getAppAuthenticated);
router.get('/apps/installations', GithubController.listAppInstallations);
router.get(
  '/apps/installations/:installationId',
  GithubController.getAppInstallation,
);
router.get(
  '/apps/installations/:installationId/repositories',
  GithubController.listAppReposAccessible,
);
router.post(
  '/apps/installations/:installationId/access-tokens',
  GithubController.createAppInstallationAccessToken,
);

// 26. Resource Billing API
router.get('/orgs/:org/billing/actions', GithubController.getOrgActionsBilling);
router.get(
  '/orgs/:org/billing/packages',
  GithubController.getOrgPackagesBilling,
);
router.get(
  '/orgs/:org/billing/shared-storage',
  GithubController.getOrgSharedStorageBilling,
);

// 27. Enterprise Admin & Auditing API
router.get(
  '/enterprises/:enterprise/audit-log',
  GithubController.getEnterpriseAuditLog,
);
router.get(
  '/enterprises/:enterprise/members',
  GithubController.listEnterpriseMembers,
);

// 28. Activity Events API
router.get('/activity/events', GithubController.listPublicEvents);
router.get(
  '/repos/:owner/:repo/activity/events',
  GithubController.listRepoEvents,
);
router.get(
  '/orgs/:org/activity/events/:username',
  GithubController.listOrgEvents,
);

// 29. Interaction Limits API
router.get(
  '/repos/:owner/:repo/interactions',
  GithubController.getRepoInteractionLimits,
);
router.put(
  '/repos/:owner/:repo/interactions',
  GithubController.setRepoInteractionLimits,
);
router.delete(
  '/repos/:owner/:repo/interactions',
  GithubController.removeRepoInteractionLimits,
);

// 30. Code Security (Advisories & Configurations) API
router.get('/security/advisories', GithubController.listGlobalAdvisories);
router.get(
  '/repos/:owner/:repo/security/advisories/:ghsaId',
  GithubController.getRepositoryAdvisory,
);
router.get(
  '/orgs/:org/security/configurations',
  GithubController.getOrgSecurityConfigurations,
);

// 31. Dependency Graph (BOM / Manifests) API
router.get(
  '/repos/:owner/:repo/dependency-graph/sbom',
  GithubController.exportSbom,
);

// 32. Packages (Registries & Metadata) API
router.get('/orgs/:org/packages', GithubController.listOrgPackages);
router.get(
  '/orgs/:org/packages/versions/:packageName',
  GithubController.getPackageVersions,
);

// 33. OIDC (Actions Custom Claims) API
router.get(
  '/orgs/:org/oidc/custom-sub',
  GithubController.getOidcCustomSubTemplateForOrg,
);
router.put(
  '/orgs/:org/oidc/custom-sub',
  GithubController.updateOidcCustomSubTemplateForOrg,
);

// 34. Migrations (Import/Export) API
router.post('/orgs/:org/migrations', GithubController.startOrgMigration);
router.get(
  '/orgs/:org/migrations/:migrationId',
  GithubController.getOrgMigrationStatus,
);

// 35. Emojis, Gitignore Templates, Licenses API
router.get('/emojis', GithubController.getEmojis);
router.get('/gitignore/templates', GithubController.getGitignoreTemplates);
router.get('/gitignore/templates/:name', GithubController.getGitignoreTemplate);
router.get('/repos/:owner/:repo/license', GithubController.getRepoLicense);

// 36. Rate Limit, Meta, and Markdown API
router.get('/rate-limit', GithubController.getRateLimit);
router.get('/meta', GithubController.getMetaServerInfo);
router.post('/markdown', GithubController.renderMarkdown);

// 37. Codes of Conduct API
router.get('/codes-of-conduct', GithubController.getAllCodesOfConduct);
router.get('/codes-of-conduct/:key', GithubController.getConductCode);

// 38. Private Registries API
router.get(
  '/orgs/:org/private-registries',
  GithubController.listOrgPrivateRegistries,
);
router.get(
  '/orgs/:org/private-registries/:secretName',
  GithubController.getOrgPrivateRegistry,
);

// 39. Reactions API
router.post(
  '/repos/:owner/:repo/issues/:issueNumber/reactions',
  GithubController.createReactionForIssue,
);
router.get(
  '/repos/:owner/:repo/issues/:issueNumber/reactions',
  GithubController.listReactionsForIssue,
);
router.delete(
  '/repos/:owner/:repo/issues/:issueNumber/reactions/:reactionId',
  GithubController.deleteReactionForIssue,
);

// 40. Hosted Compute (Org Runner Network settings) API
router.get(
  '/orgs/:org/hosted-compute/network-configurations',
  GithubController.listNetworkConfigurationsForOrg,
);
router.get(
  '/orgs/:org/hosted-compute/network-settings',
  GithubController.getNetworkSettingsForOrg,
);

// 41. Campaigns API
router.get('/orgs/:org/campaigns', GithubController.listOrgCampaigns);

// 42. Custom Properties API
router.get(
  '/orgs/:org/custom-properties',
  GithubController.listCustomProperties,
);
router.get(
  '/orgs/:org/custom-properties/:propertyName',
  GithubController.getCustomProperty,
);
router.put(
  '/orgs/:org/custom-properties/:propertyName',
  GithubController.createOrUpdateCustomProperty,
);
router.delete(
  '/orgs/:org/custom-properties/:propertyName',
  GithubController.removeCustomProperty,
);
router.get(
  '/repos/:owner/:repo/custom-properties',
  GithubController.getRepoCustomPropertiesValues,
);
router.patch(
  '/repos/:owner/:repo/custom-properties',
  GithubController.createOrUpdateRepoCustomPropertiesValues,
);

// 43. Rulesets API
router.get('/repos/:owner/:repo/rulesets', GithubController.getRepoRulesets);
router.get(
  '/repos/:owner/:repo/rulesets/:rulesetId',
  GithubController.getRepoRuleset,
);
router.post('/repos/:owner/:repo/rulesets', GithubController.createRepoRuleset);
router.put(
  '/repos/:owner/:repo/rulesets/:rulesetId',
  GithubController.updateRepoRuleset,
);
router.delete(
  '/repos/:owner/:repo/rulesets/:rulesetId',
  GithubController.deleteRepoRuleset,
);
router.get('/orgs/:org/rulesets', GithubController.getOrgRulesets);
router.get('/orgs/:org/rulesets/:rulesetId', GithubController.getOrgRuleset);
router.post('/orgs/:org/rulesets', GithubController.createOrgRuleset);
router.put('/orgs/:org/rulesets/:rulesetId', GithubController.updateOrgRuleset);
router.delete(
  '/orgs/:org/rulesets/:rulesetId',
  GithubController.deleteOrgRuleset,
);

// 44. Copilot Org Seat Management API
router.get('/orgs/:org/copilot/seats', GithubController.listCopilotSeatsForOrg);
router.post('/orgs/:org/copilot/seats', GithubController.addCopilotSeatsToOrg);
router.delete(
  '/orgs/:org/copilot/seats',
  GithubController.removeCopilotSeatsFromOrg,
);
router.get(
  '/orgs/:org/copilot/seats/:username',
  GithubController.getCopilotSeatDetailsForUser,
);

// 45. Pull Request Reviews API
router.get(
  '/repos/:owner/:repo/pulls/:pullNumber/reviews',
  GithubController.listPullRequestReviews,
);
router.get(
  '/repos/:owner/:repo/pulls/:pullNumber/reviews/:reviewId',
  GithubController.getPullRequestReview,
);
router.post(
  '/repos/:owner/:repo/pulls/:pullNumber/reviews',
  GithubController.createPullRequestReview,
);
router.post(
  '/repos/:owner/:repo/pulls/:pullNumber/reviews/:reviewId/events',
  GithubController.submitPullRequestReview,
);
router.put(
  '/repos/:owner/:repo/pulls/:pullNumber/reviews/:reviewId/dismissals',
  GithubController.dismissPullRequestReview,
);

// 46. Issue Comments API
router.get(
  '/repos/:owner/:repo/issues/:issueNumber/comments',
  GithubController.listIssueComments,
);
router.get(
  '/repos/:owner/:repo/issues/comments/:commentId',
  GithubController.getIssueComment,
);
router.post(
  '/repos/:owner/:repo/issues/:issueNumber/comments',
  GithubController.createIssueComment,
);
router.patch(
  '/repos/:owner/:repo/issues/comments/:commentId',
  GithubController.updateIssueComment,
);
router.delete(
  '/repos/:owner/:repo/issues/comments/:commentId',
  GithubController.deleteIssueComment,
);

// 47. User Keys & Emails API
router.get('/user/emails', GithubController.listEmailsForAuthenticatedUser);
router.post('/user/emails', GithubController.addEmailsForAuthenticatedUser);
router.delete(
  '/user/emails',
  GithubController.deleteEmailsForAuthenticatedUser,
);
router.get('/user/keys', GithubController.listPublicKeysForAuthenticatedUser);
router.post('/user/keys', GithubController.addPublicKeyForAuthenticatedUser);
router.delete(
  '/user/keys/:keyId',
  GithubController.deletePublicKeyForAuthenticatedUser,
);

// 48. GitHub Classroom API
router.get('/classrooms', GithubController.listClassrooms);
router.get('/classrooms/:classroomId', GithubController.getClassroom);
router.get(
  '/classrooms/:classroomId/assignments',
  GithubController.listAssignmentsForClassroom,
);
router.get('/assignments/:assignmentId', GithubController.getAssignment);

// 49. Actions Workflows & Runs API
router.get('/repos/:owner/:repo/workflows', GithubController.listRepoWorkflows);
router.get(
  '/repos/:owner/:repo/workflows/:workflowId',
  GithubController.getWorkflow,
);
router.get(
  '/repos/:owner/:repo/workflow-runs',
  GithubController.listWorkflowRuns,
);
router.get(
  '/repos/:owner/:repo/workflow-runs/:runId',
  GithubController.getWorkflowRun,
);
router.post(
  '/repos/:owner/:repo/workflows/:workflowId/dispatches',
  GithubController.createWorkflowDispatch,
);

// 50. Self-Hosted Runners API
router.get('/orgs/:org/runners', GithubController.listSelfHostedRunnersForOrg);
router.get(
  '/repos/:owner/:repo/runners',
  GithubController.listSelfHostedRunnersForRepo,
);
router.get(
  '/orgs/:org/runners/:runnerId',
  GithubController.getSelfHostedRunnerForOrg,
);
router.get(
  '/repos/:owner/:repo/runners/:runnerId',
  GithubController.getSelfHostedRunnerForRepo,
);
router.delete(
  '/orgs/:org/runners/:runnerId',
  GithubController.deleteSelfHostedRunnerFromOrg,
);
router.delete(
  '/repos/:owner/:repo/runners/:runnerId',
  GithubController.deleteSelfHostedRunnerFromRepo,
);

// 51. Issue Labels & Milestones API
router.get('/repos/:owner/:repo/labels', GithubController.listLabelsForRepo);
router.get('/repos/:owner/:repo/labels/:name', GithubController.getLabel);
router.post('/repos/:owner/:repo/labels', GithubController.createLabel);
router.patch('/repos/:owner/:repo/labels/:name', GithubController.updateLabel);
router.delete('/repos/:owner/:repo/labels/:name', GithubController.deleteLabel);
router.post(
  '/repos/:owner/:repo/issues/:issueNumber/labels',
  GithubController.addLabelsToIssue,
);
router.delete(
  '/repos/:owner/:repo/issues/:issueNumber/labels/:name',
  GithubController.removeLabelFromIssue,
);
router.get('/repos/:owner/:repo/milestones', GithubController.listMilestones);
router.get(
  '/repos/:owner/:repo/milestones/:milestoneNumber',
  GithubController.getMilestone,
);
router.post('/repos/:owner/:repo/milestones', GithubController.createMilestone);
router.patch(
  '/repos/:owner/:repo/milestones/:milestoneNumber',
  GithubController.updateMilestone,
);
router.delete(
  '/repos/:owner/:repo/milestones/:milestoneNumber',
  GithubController.deleteMilestone,
);

// 52. Repository Deploy Keys & Commit Statuses API
router.get('/repos/:owner/:repo/keys', GithubController.listDeployKeys);
router.get('/repos/:owner/:repo/keys/:keyId', GithubController.getDeployKey);
router.post('/repos/:owner/:repo/keys', GithubController.addDeployKey);
router.delete(
  '/repos/:owner/:repo/keys/:keyId',
  GithubController.deleteDeployKey,
);
router.post(
  '/repos/:owner/:repo/statuses/:sha',
  GithubController.createCommitStatus,
);
router.get(
  '/repos/:owner/:repo/commits/:ref/statuses',
  GithubController.listCommitStatusesForRef,
);

// 53. PR Review Comments & Merges API
router.get(
  '/repos/:owner/:repo/pulls/:pullNumber/comments',
  GithubController.listReviewComments,
);
router.get(
  '/repos/:owner/:repo/pulls/comments/:commentId',
  GithubController.getReviewComment,
);
router.post(
  '/repos/:owner/:repo/pulls/:pullNumber/comments',
  GithubController.createReviewComment,
);
router.patch(
  '/repos/:owner/:repo/pulls/comments/:commentId',
  GithubController.updateReviewComment,
);
router.delete(
  '/repos/:owner/:repo/pulls/comments/:commentId',
  GithubController.deleteReviewComment,
);
router.put(
  '/repos/:owner/:repo/pulls/:pullNumber/merge',
  GithubController.mergePullRequest,
);
router.get(
  '/repos/:owner/:repo/pulls/:pullNumber/merge',
  GithubController.checkIfPullRequestMerged,
);

// 54. Team Discussions API
router.get(
  '/orgs/:org/teams/:teamSlug/discussions',
  GithubController.listTeamDiscussions,
);
router.get(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber',
  GithubController.getTeamDiscussion,
);
router.post(
  '/orgs/:org/teams/:teamSlug/discussions',
  GithubController.createTeamDiscussion,
);
router.patch(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber',
  GithubController.updateTeamDiscussion,
);
router.delete(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber',
  GithubController.deleteTeamDiscussion,
);
router.get(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber/comments',
  GithubController.listTeamDiscussionComments,
);
router.get(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber/comments/:commentNumber',
  GithubController.getTeamDiscussionComment,
);
router.post(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber/comments',
  GithubController.createTeamDiscussionComment,
);
router.patch(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber/comments/:commentNumber',
  GithubController.updateTeamDiscussionComment,
);
router.delete(
  '/orgs/:org/teams/:teamSlug/discussions/:discussionNumber/comments/:commentNumber',
  GithubController.deleteTeamDiscussionComment,
);

// ==========================================
// 55. SCIM Organization Member Provisioning API
// ==========================================
router.get('/orgs/:org/scim/users', GithubController.listProvisionedIdentities);
router.post('/orgs/:org/scim/users', GithubController.provisionAndInviteUser);
router.get(
  '/orgs/:org/scim/users/:scimUserId',
  GithubController.getProvisioningInformation,
);
router.put(
  '/orgs/:org/scim/users/:scimUserId',
  GithubController.replaceProvisionedUser,
);
router.patch(
  '/orgs/:org/scim/users/:scimUserId',
  GithubController.updateProvisionedUser,
);
router.delete(
  '/orgs/:org/scim/users/:scimUserId',
  GithubController.deleteUserFromOrg,
);

// ==========================================
// 56. Codespaces Secrets API
// ==========================================
router.get(
  '/user/codespaces/secrets/public-key',
  GithubController.getCodespacesPublicKeyForAuthenticatedUser,
);
router.get(
  '/user/codespaces/secrets',
  GithubController.listCodespacesSecretsForAuthenticatedUser,
);
router.get(
  '/user/codespaces/secrets/:secretName',
  GithubController.getCodespacesSecretForAuthenticatedUser,
);
router.put(
  '/user/codespaces/secrets/:secretName',
  GithubController.createOrUpdateCodespacesSecretForAuthenticatedUser,
);
router.delete(
  '/user/codespaces/secrets/:secretName',
  GithubController.deleteCodespacesSecretForAuthenticatedUser,
);
router.get(
  '/orgs/:org/codespaces/secrets/public-key',
  GithubController.getCodespacesPublicKeyForOrg,
);
router.get(
  '/orgs/:org/codespaces/secrets',
  GithubController.listCodespacesSecretsForOrg,
);
router.get(
  '/orgs/:org/codespaces/secrets/:secretName',
  GithubController.getCodespacesSecretForOrg,
);
router.put(
  '/orgs/:org/codespaces/secrets/:secretName',
  GithubController.createOrUpdateCodespacesSecretForOrg,
);
router.delete(
  '/orgs/:org/codespaces/secrets/:secretName',
  GithubController.deleteCodespacesSecretForOrg,
);

// ==========================================
// 57. Actions Organization Secrets & Variables API
// ==========================================
router.get(
  '/orgs/:org/actions/secrets/public-key',
  GithubController.getActionsPublicKeyForOrg,
);
router.get('/orgs/:org/actions/secrets', GithubController.listOrgSecrets);
router.get(
  '/orgs/:org/actions/secrets/:secretName',
  GithubController.getOrgSecret,
);
router.put(
  '/orgs/:org/actions/secrets/:secretName',
  GithubController.createOrUpdateOrgSecret,
);
router.delete(
  '/orgs/:org/actions/secrets/:secretName',
  GithubController.deleteOrgSecret,
);
router.get('/orgs/:org/actions/variables', GithubController.listOrgVariables);
router.get(
  '/orgs/:org/actions/variables/:variableName',
  GithubController.getOrgVariable,
);
router.put(
  '/orgs/:org/actions/variables/:variableName',
  GithubController.createOrUpdateOrgVariable,
);
router.delete(
  '/orgs/:org/actions/variables/:variableName',
  GithubController.deleteOrgVariable,
);

// ==========================================
// 58. Actions Environment Secrets & Variables API
// ==========================================
router.get(
  '/repos/environments/:repositoryId/:environmentName/public-key',
  GithubController.getActionsPublicKeyForEnvironment,
);
router.get(
  '/repos/:owner/:repo/environments/:environmentName/secrets',
  GithubController.listEnvironmentSecrets,
);
router.get(
  '/repos/:owner/:repo/environments/:environmentName/secrets/:secretName',
  GithubController.getEnvironmentSecret,
);
router.put(
  '/repos/:owner/:repo/environments/:environmentName/secrets/:secretName',
  GithubController.createOrUpdateEnvironmentSecret,
);
router.delete(
  '/repos/:owner/:repo/environments/:environmentName/secrets/:secretName',
  GithubController.deleteEnvironmentSecret,
);
router.get(
  '/repos/:owner/:repo/environments/:environmentName/variables',
  GithubController.listEnvironmentVariables,
);
router.get(
  '/repos/:owner/:repo/environments/:environmentName/variables/:variableName',
  GithubController.getEnvironmentVariable,
);
router.put(
  '/repos/:owner/:repo/environments/:environmentName/variables/:variableName',
  GithubController.createOrUpdateEnvironmentVariable,
);
router.delete(
  '/repos/:owner/:repo/environments/:environmentName/variables/:variableName',
  GithubController.deleteEnvironmentVariable,
);

// ==========================================
// 59. Secret Scanning Org-Level & Locations API
// ==========================================
router.get(
  '/orgs/:org/secret-scanning/alerts',
  GithubController.listSecretScanningAlertsForOrg,
);
router.get(
  '/orgs/:org/secret-scanning/alerts/:alertNumber',
  GithubController.getSecretScanningAlertForOrg,
);
router.patch(
  '/orgs/:org/secret-scanning/alerts/:alertNumber',
  GithubController.updateSecretScanningAlertForOrg,
);
router.get(
  '/repos/:owner/:repo/secret-scanning/alerts/:alertNumber/locations',
  GithubController.listSecretScanningLocations,
);

// ==========================================
// 60. Enterprise Admin Action Policies, Runners & Billing API
// ==========================================
router.get(
  '/enterprises/:enterprise/actions/permissions',
  GithubController.getEnterpriseActionsPermissions,
);
router.put(
  '/enterprises/:enterprise/actions/permissions',
  GithubController.setEnterpriseActionsPermissions,
);
router.get(
  '/enterprises/:enterprise/runners',
  GithubController.listSelfHostedRunnersForEnterprise,
);
router.get(
  '/enterprises/:enterprise/runners/:runnerId',
  GithubController.getSelfHostedRunnerForEnterprise,
);
router.delete(
  '/enterprises/:enterprise/runners/:runnerId',
  GithubController.deleteSelfHostedRunnerFromEnterprise,
);
router.get(
  '/enterprises/:enterprise/billing/actions',
  GithubController.getEnterpriseActionsBilling,
);
router.get(
  '/enterprises/:enterprise/billing/packages',
  GithubController.getEnterprisePackagesBilling,
);
router.get(
  '/enterprises/:enterprise/billing/shared-storage',
  GithubController.getEnterpriseSharedStorageBilling,
);

// ==========================================
// 61. Advanced Security Scanning
// ==========================================
router.patch(
  '/repos/:owner/:repo/scanning/code/alerts/:alertNumber',
  GithubController.updateCodeScanningAlert,
);
router.get(
  '/repos/:owner/:repo/scanning/code/alerts/:alertNumber/instances',
  GithubController.listCodeScanningAlertInstances,
);
router.get(
  '/repos/:owner/:repo/scanning/code/analyses',
  GithubController.listCodeScanningAnalyses,
);
router.get(
  '/repos/:owner/:repo/scanning/code/analyses/:analysisId',
  GithubController.getCodeScanningAnalysis,
);
router.delete(
  '/repos/:owner/:repo/scanning/code/analyses/:analysisId',
  GithubController.deleteCodeScanningAnalysis,
);
router.post(
  '/repos/:owner/:repo/scanning/code/sarifs',
  GithubController.uploadCodeScanningSarif,
);
router.get(
  '/repos/:owner/:repo/scanning/secret/alerts/:alertNumber/bypass-approvals',
  GithubController.listSecretScanningBypassApprovals,
);
router.post(
  '/repos/:owner/:repo/scanning/secret/alerts/:alertNumber/bypass-approvals',
  GithubController.createSecretScanningBypassApproval,
);

// ==========================================
// 62. Commit Comments
// ==========================================
router.get('/repos/:owner/:repo/comments', GithubController.listCommitComments);
router.get(
  '/repos/:owner/:repo/comments/:commentId',
  GithubController.getCommitComment,
);
router.post(
  '/repos/:owner/:repo/commits/:commitSha/comments',
  GithubController.createCommitComment,
);
router.patch(
  '/repos/:owner/:repo/comments/:commentId',
  GithubController.updateCommitComment,
);
router.delete(
  '/repos/:owner/:repo/comments/:commentId',
  GithubController.deleteCommitComment,
);

// ==========================================
// 63. Repository Forks & Invitations
// ==========================================
router.get('/repos/:owner/:repo/forks', GithubController.listForks);
router.post('/repos/:owner/:repo/forks', GithubController.createFork);
router.get(
  '/repos/:owner/:repo/invitations',
  GithubController.listRepoInvitations,
);
router.delete(
  '/repos/:owner/:repo/invitations/:invitationId',
  GithubController.deleteRepoInvitation,
);
router.patch(
  '/repos/:owner/:repo/invitations/:invitationId',
  GithubController.updateRepoInvitation,
);

// ==========================================
// 64. Repository Pages
// ==========================================
router.get('/repos/:owner/:repo/pages', GithubController.getPagesInfo);
router.post('/repos/:owner/:repo/pages', GithubController.createPagesSite);
router.put('/repos/:owner/:repo/pages', GithubController.updatePagesSite);
router.delete('/repos/:owner/:repo/pages', GithubController.deletePagesSite);
router.get(
  '/repos/:owner/:repo/pages/builds',
  GithubController.listPagesBuilds,
);
router.get(
  '/repos/:owner/:repo/pages/builds/:buildId',
  GithubController.getPagesBuildInfo,
);
router.post(
  '/repos/:owner/:repo/pages/builds',
  GithubController.requestPagesBuild,
);

// ==========================================
// 65. Actions Runner Groups & Workflow Permissions
// ==========================================
router.get('/orgs/:org/runner-groups', GithubController.listOrgRunnerGroups);
router.get(
  '/orgs/:org/runner-groups/:runnerGroupId',
  GithubController.getOrgRunnerGroup,
);
router.post('/orgs/:org/runner-groups', GithubController.createOrgRunnerGroup);
router.put(
  '/orgs/:org/runner-groups/:runnerGroupId',
  GithubController.updateOrgRunnerGroup,
);
router.delete(
  '/orgs/:org/runner-groups/:runnerGroupId',
  GithubController.deleteOrgRunnerGroup,
);
router.get(
  '/orgs/:org/actions/permissions',
  GithubController.getActionsPermissionsForOrg,
);
router.put(
  '/orgs/:org/actions/permissions',
  GithubController.setActionsPermissionsForOrg,
);
router.get(
  '/repos/:owner/:repo/actions/permissions',
  GithubController.getActionsPermissionsForRepo,
);
router.put(
  '/repos/:owner/:repo/actions/permissions',
  GithubController.setActionsPermissionsForRepo,
);

// ==========================================
// 66. Selected Repository Org Secrets & Variables
// ==========================================
router.get(
  '/orgs/:org/actions/secrets/:secretName/repositories',
  GithubController.listSelectedReposForOrgSecret,
);
router.put(
  '/orgs/:org/actions/secrets/:secretName/repositories',
  GithubController.setSelectedReposForOrgSecret,
);
router.put(
  '/orgs/:org/actions/secrets/:secretName/repositories/:repositoryId',
  GithubController.addSelectedRepoToOrgSecret,
);
router.delete(
  '/orgs/:org/actions/secrets/:secretName/repositories/:repositoryId',
  GithubController.removeSelectedRepoFromOrgSecret,
);

router.get(
  '/orgs/:org/actions/variables/:variableName/repositories',
  GithubController.listSelectedReposForOrgVariable,
);
router.put(
  '/orgs/:org/actions/variables/:variableName/repositories',
  GithubController.setSelectedReposForOrgVariable,
);
router.put(
  '/orgs/:org/actions/variables/:variableName/repositories/:repositoryId',
  GithubController.addSelectedRepoToOrgVariable,
);
router.delete(
  '/orgs/:org/actions/variables/:variableName/repositories/:repositoryId',
  GithubController.removeSelectedRepoFromOrgVariable,
);

router.get(
  '/orgs/:org/codespaces/secrets/:secretName/repositories',
  GithubController.listSelectedReposForOrgCodespacesSecret,
);
router.put(
  '/orgs/:org/codespaces/secrets/:secretName/repositories',
  GithubController.setSelectedReposForOrgCodespacesSecret,
);
router.put(
  '/orgs/:org/codespaces/secrets/:secretName/repositories/:repositoryId',
  GithubController.addSelectedRepoToOrgCodespacesSecret,
);
router.delete(
  '/orgs/:org/codespaces/secrets/:secretName/repositories/:repositoryId',
  GithubController.removeSelectedRepoFromOrgCodespacesSecret,
);

export const GithubRoutes = router;
export default router;

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

export const GithubRoutes = router;
export default router;

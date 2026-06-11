import httpStatus from 'http-status';
import { GithubService } from './github.service.js';
import { logger } from '../../../shared/logger.js';

// ==========================================
// 1. User Handlers
// ==========================================
export const getAuthenticatedUser = async (req, res) => {
  try {
    const user = await GithubService.getAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: user });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. Repository Handlers
// ==========================================
export const listRepositories = async (req, res) => {
  try {
    const repos = await GithubService.listRepositories(req.query);
    res.status(httpStatus.OK).json({ success: true, data: repos });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing repos:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRepository = async (req, res) => {
  try {
    const repo = await GithubService.createRepository(req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: repo });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating repo:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repository = await GithubService.getRepository(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: repository });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting repo:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const deleted = await GithubService.deleteRepository(owner, repo);
    res.status(httpStatus.OK).json({ success: true, deleted });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting repo:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listBranches = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branches = await GithubService.listBranches(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: branches });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing branches:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. Issue Handlers
// ==========================================
export const listIssues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const issues = await GithubService.listIssues(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: issues });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing issues:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const issue = await GithubService.createIssue(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getIssue = async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const issue = await GithubService.getIssue(
      owner,
      repo,
      parseInt(number, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const issue = await GithubService.updateIssue(
      owner,
      repo,
      parseInt(number, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: issue });
  } catch (error) {
    logger.error('[GitHub Controller] Error updating issue:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. Pull Request Handlers
// ==========================================
export const listPullRequests = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const prs = await GithubService.listPullRequests(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: prs });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing PRs:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createPullRequest = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const pr = await GithubService.createPullRequest(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: pr });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating PR:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPullRequest = async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const pr = await GithubService.getPullRequest(
      owner,
      repo,
      parseInt(number, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: pr });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting PR:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const mergePullRequest = async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const mergeResult = await GithubService.mergePullRequest(
      owner,
      repo,
      parseInt(number, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: mergeResult });
  } catch (error) {
    logger.error('[GitHub Controller] Error merging PR:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 5. Actions (Workflow) Handlers
// ==========================================
export const listWorkflows = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const workflows = await GithubService.listWorkflows(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: workflows });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing workflows:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const triggerWorkflowDispatch = async (req, res) => {
  try {
    const { owner, repo, workflowId } = req.params;
    const { ref, inputs } = req.body;
    const triggered = await GithubService.triggerWorkflowDispatch(
      owner,
      repo,
      workflowId,
      ref,
      inputs,
    );
    res.status(httpStatus.OK).json({ success: true, triggered });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error triggering workflow dispatch:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listWorkflowRuns = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const runs = await GithubService.listWorkflowRuns(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: runs });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing workflow runs:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 6. Gist Handlers
// ==========================================
export const listGists = async (req, res) => {
  try {
    const gists = await GithubService.listGists(req.query);
    res.status(httpStatus.OK).json({ success: true, data: gists });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing gists:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createGist = async (req, res) => {
  try {
    const gist = await GithubService.createGist(req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: gist });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating gist:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteGist = async (req, res) => {
  try {
    const { gistId } = req.params;
    const deleted = await GithubService.deleteGist(gistId);
    res.status(httpStatus.OK).json({ success: true, deleted });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting gist:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 7. Projects Handlers
// ==========================================
export const listProjects = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const projects = await GithubService.listProjects(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: projects });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing projects:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const project = await GithubService.createProject(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: project });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating project:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 8. GraphQL API
// ==========================================
export const graphql = async (req, res) => {
  try {
    const { query, variables } = req.body;
    const result = await GithubService.graphql(query, variables);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error executing GraphQL query:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 9. Search API
// ==========================================
export const searchRepositories = async (req, res) => {
  try {
    const { q } = req.query;
    const repos = await GithubService.searchRepositories(q, req.query);
    res.status(httpStatus.OK).json({ success: true, data: repos });
  } catch (error) {
    logger.error('[GitHub Controller] Error searching repos:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const searchCode = async (req, res) => {
  try {
    const { q } = req.query;
    const code = await GithubService.searchCode(q, req.query);
    res.status(httpStatus.OK).json({ success: true, data: code });
  } catch (error) {
    logger.error('[GitHub Controller] Error searching code:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const searchIssues = async (req, res) => {
  try {
    const { q } = req.query;
    const issues = await GithubService.searchIssues(q, req.query);
    res.status(httpStatus.OK).json({ success: true, data: issues });
  } catch (error) {
    logger.error('[GitHub Controller] Error searching issues:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await GithubService.searchUsers(q, req.query);
    res.status(httpStatus.OK).json({ success: true, data: users });
  } catch (error) {
    logger.error('[GitHub Controller] Error searching users:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 10. Git Data / Contents API
// ==========================================
export const getFileContent = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const filePath = req.params[0]; // Captured wildcard path
    const { ref } = req.query;
    const content = await GithubService.getFileContent(
      owner,
      repo,
      filePath,
      ref,
    );
    res.status(httpStatus.OK).json({ success: true, data: content });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting file content:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateFile = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const filePath = req.params[0];
    const fileContent = await GithubService.createOrUpdateFile(
      owner,
      repo,
      filePath,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: fileContent });
  } catch (error) {
    logger.error('[GitHub Controller] Error committing file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const filePath = req.params[0];
    const result = await GithubService.deleteFile(
      owner,
      repo,
      filePath,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting file:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCommits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const commits = await GithubService.listCommits(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: commits });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing commits:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const compareCommits = async (req, res) => {
  try {
    const { owner, repo, base, head } = req.params;
    const comparison = await GithubService.compareCommits(
      owner,
      repo,
      base,
      head,
    );
    res.status(httpStatus.OK).json({ success: true, data: comparison });
  } catch (error) {
    logger.error('[GitHub Controller] Error comparing commits:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 11. Releases API
// ==========================================
export const listReleases = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const releases = await GithubService.listReleases(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: releases });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing releases:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRelease = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const release = await GithubService.createRelease(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: release });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getLatestRelease = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const release = await GithubService.getLatestRelease(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: release });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting latest release:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 12. Collaborators API
// ==========================================
export const listCollaborators = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const collaborators = await GithubService.listCollaborators(
      owner,
      repo,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: collaborators });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing collaborators:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { owner, repo, username } = req.params;
    const { permission } = req.body;
    const result = await GithubService.addCollaborator(
      owner,
      repo,
      username,
      permission,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error adding collaborator:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { owner, repo, username } = req.params;
    const result = await GithubService.removeCollaborator(
      owner,
      repo,
      username,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error removing collaborator:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 13. Git Database Plumbing Handlers
// ==========================================
export const getRef = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const ref = req.params[0];
    const result = await GithubService.getRef(owner, repo, ref);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting Git ref:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRef = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createRef(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating Git ref:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRef = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const ref = req.params[0];
    const result = await GithubService.updateRef(owner, repo, ref, req.body);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error updating Git ref:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createBlob = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createBlob(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating Git blob:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTree = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createTree(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating Git tree:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCommit = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createCommit(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating Git commit:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 14. Organizations & Teams Handlers
// ==========================================
export const listOrganizations = async (req, res) => {
  try {
    const result = await GithubService.listOrganizations(req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing organizations:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listTeams = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listTeams(org, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing teams:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listTeamMembers = async (req, res) => {
  try {
    const { org, team_slug } = req.params;
    const result = await GithubService.listTeamMembers(org, team_slug);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing team members:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 15. Repository Webhooks Handlers
// ==========================================
export const listWebhooks = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listWebhooks(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing webhooks:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createWebhook = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createWebhook(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteWebhook = async (req, res) => {
  try {
    const { owner, repo, hookId } = req.params;
    const result = await GithubService.deleteWebhook(
      owner,
      repo,
      parseInt(hookId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, deleted: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting webhook:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 16. Actions Secrets & Variables Handlers
// ==========================================
export const getActionsPublicKey = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getActionsPublicKey(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting Actions public key:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateRepoSecret = async (req, res) => {
  try {
    const { owner, repo, secretName } = req.params;
    const result = await GithubService.createOrUpdateRepoSecret(
      owner,
      repo,
      secretName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error setting Actions secret:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listRepoVariables = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listRepoVariables(
      owner,
      repo,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing repo variables:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRepoVariable = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { name, value } = req.body;
    const result = await GithubService.createRepoVariable(
      owner,
      repo,
      name,
      value,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating repo variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRepoVariable = async (req, res) => {
  try {
    const { owner, repo, name } = req.params;
    const { value } = req.body;
    const result = await GithubService.updateRepoVariable(
      owner,
      repo,
      name,
      value,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error updating repo variable:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 17. Codespaces Handlers
// ==========================================
export const listCodespaces = async (req, res) => {
  try {
    const result = await GithubService.listCodespaces(req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing Codespaces:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCodespace = async (req, res) => {
  try {
    const { owner, repo } = req.body;
    const result = await GithubService.createCodespace(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating Codespace:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteCodespace = async (req, res) => {
  try {
    const { codespaceName } = req.params;
    const result = await GithubService.deleteCodespace(codespaceName);
    res.status(httpStatus.OK).json({ success: true, deleted: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting Codespace:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 18. Dependabot Alerts Handlers
// ==========================================
export const listDependabotAlerts = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listDependabotAlerts(
      owner,
      repo,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing Dependabot alerts:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 19. Copilot Handlers
// ==========================================
export const getCopilotBillingForUser = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await GithubService.getCopilotBillingForUser(username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting Copilot details:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 20. Discussions Handlers
// ==========================================
export const listDiscussions = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listDiscussions(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing discussions:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDiscussion = async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const result = await GithubService.getDiscussion(owner, repo, number);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { categoryId, title, body } = req.body;
    const result = await GithubService.createDiscussion(
      owner,
      repo,
      categoryId,
      title,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating discussion:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createDiscussionComment = async (req, res) => {
  try {
    const { owner, repo, discussionId } = req.params;
    const { body } = req.body;
    const result = await GithubService.createDiscussionComment(
      owner,
      repo,
      discussionId,
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error creating discussion comment:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 21. Checks Handlers
// ==========================================
export const createCheckRun = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createCheckRun(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating check run:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateCheckRun = async (req, res) => {
  try {
    const { owner, repo, checkRunId } = req.params;
    const result = await GithubService.updateCheckRun(
      owner,
      repo,
      checkRunId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error updating check run:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCheckRunsForRef = async (req, res) => {
  try {
    const { owner, repo, ref } = req.params;
    const result = await GithubService.listCheckRunsForRef(owner, repo, ref);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing check runs for ref:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCheckSuite = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createCheckSuite(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating check suite:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 22. Deployments & Environments Handlers
// ==========================================
export const listDeployments = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listDeployments(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing deployments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createDeployment = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createDeployment(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error creating deployment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createDeploymentStatus = async (req, res) => {
  try {
    const { owner, repo, deploymentId } = req.params;
    const result = await GithubService.createDeploymentStatus(
      owner,
      repo,
      deploymentId,
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error creating deployment status:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listEnvironments = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listEnvironments(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing environments:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateEnvironment = async (req, res) => {
  try {
    const { owner, repo, environmentName } = req.params;
    const result = await GithubService.createOrUpdateEnvironment(
      owner,
      repo,
      environmentName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error setting environment:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 23. Code & Secret Scanning Handlers
// ==========================================
export const listCodeScanningAlerts = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listCodeScanningAlerts(
      owner,
      repo,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing Code Scanning alerts:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCodeScanningAlert = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const result = await GithubService.getCodeScanningAlert(
      owner,
      repo,
      alertNumber,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting Code Scanning alert:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSecretScanningAlerts = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listSecretScanningAlerts(
      owner,
      repo,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing Secret Scanning alerts:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSecretScanningAlert = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const result = await GithubService.getSecretScanningAlert(
      owner,
      repo,
      alertNumber,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting Secret Scanning alert:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 24. Actions Artifacts & Workflow Jobs Handlers
// ==========================================
export const listWorkflowJobs = async (req, res) => {
  try {
    const { owner, repo, runId } = req.params;
    const result = await GithubService.listWorkflowJobs(
      owner,
      repo,
      runId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing workflow jobs:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listWorkflowRunArtifacts = async (req, res) => {
  try {
    const { owner, repo, runId } = req.params;
    const result = await GithubService.listWorkflowRunArtifacts(
      owner,
      repo,
      runId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing workflow artifacts:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const downloadWorkflowArtifact = async (req, res) => {
  try {
    const { owner, repo, artifactId } = req.params;
    const result = await GithubService.downloadWorkflowArtifact(
      owner,
      repo,
      artifactId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error downloading workflow artifact:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 25. GitHub Apps & Installations Handlers
// ==========================================
export const getAppAuthenticated = async (req, res) => {
  try {
    const result = await GithubService.getAppAuthenticated();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting authenticated app:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAppInstallations = async (req, res) => {
  try {
    const result = await GithubService.listAppInstallations(req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing app installations:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getAppInstallation = async (req, res) => {
  try {
    const { installationId } = req.params;
    const result = await GithubService.getAppInstallation(installationId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting app installation:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAppReposAccessible = async (req, res) => {
  try {
    const { installationId } = req.params;
    const result = await GithubService.listAppReposAccessible(
      installationId,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing accessible app repos:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAppInstallationAccessToken = async (req, res) => {
  try {
    const { installationId } = req.params;
    const result =
      await GithubService.createAppInstallationAccessToken(installationId);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error creating installation access token:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 26. Resource Billing Handlers
// ==========================================
export const getOrgActionsBilling = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgActionsBilling(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting org Actions billing:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgPackagesBilling = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgPackagesBilling(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting org Packages billing:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgSharedStorageBilling = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgSharedStorageBilling(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting org Shared Storage billing:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 27. Enterprise Admin & Auditing Handlers
// ==========================================
export const getEnterpriseAuditLog = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result = await GithubService.getEnterpriseAuditLog(
      enterprise,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting enterprise audit log:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listEnterpriseMembers = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result = await GithubService.listEnterpriseMembers(
      enterprise,
      req.query,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing enterprise members:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 28. Activity Events Handlers
// ==========================================
export const listPublicEvents = async (req, res) => {
  try {
    const result = await GithubService.listPublicEvents(req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing public events:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listRepoEvents = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listRepoEvents(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing repo events:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgEvents = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.listOrgEvents(org, username, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing org events:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 29. Interaction Limits Handlers
// ==========================================
export const getRepoInteractionLimits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getRepoInteractionLimits(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting repo interaction limits:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setRepoInteractionLimits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.setRepoInteractionLimits(
      owner,
      repo,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error setting repo interaction limits:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeRepoInteractionLimits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.removeRepoInteractionLimits(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error removing repo interaction limits:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 30. Code Security (Advisories & Configurations) Handlers
// ==========================================
export const listGlobalAdvisories = async (req, res) => {
  try {
    const result = await GithubService.listGlobalAdvisories(req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing global advisories:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepositoryAdvisory = async (req, res) => {
  try {
    const { owner, repo, ghsaId } = req.params;
    const result = await GithubService.getRepositoryAdvisory(
      owner,
      repo,
      ghsaId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting repository advisory:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgSecurityConfigurations = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgSecurityConfigurations(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting org security configurations:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 31. Dependency Graph (BOM / Manifests) Handlers
// ==========================================
export const exportSbom = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.exportSbom(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error exporting SBOM:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 32. Packages (Registries & Metadata) Handlers
// ==========================================
export const listOrgPackages = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgPackages(org, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing org packages:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPackageVersions = async (req, res) => {
  try {
    const { org, packageName } = req.params;
    const result = await GithubService.getPackageVersions(org, packageName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting package versions:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 33. OIDC (Actions Custom Claims) Handlers
// ==========================================
export const getOidcCustomSubTemplateForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOidcCustomSubTemplateForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting OIDC custom sub template:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateOidcCustomSubTemplateForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.updateOidcCustomSubTemplateForOrg(
      org,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error updating OIDC custom sub template:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 34. Migrations (Import/Export) Handlers
// ==========================================
export const startOrgMigration = async (req, res) => {
  try {
    const { org } = req.params;
    const { repositories } = req.body;
    const result = await GithubService.startOrgMigration(
      org,
      repositories,
      req.body,
    );
    res.status(httpStatus.ACCEPTED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error starting org migration:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgMigrationStatus = async (req, res) => {
  try {
    const { org, migrationId } = req.params;
    const result = await GithubService.getOrgMigrationStatus(org, migrationId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting org migration status:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 35. Emojis, Gitignore templates, Licenses Handlers
// ==========================================
export const getEmojis = async (req, res) => {
  try {
    const result = await GithubService.getEmojis();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting emojis:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGitignoreTemplates = async (req, res) => {
  try {
    const result = await GithubService.getGitignoreTemplates();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting gitignore templates:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getGitignoreTemplate = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await GithubService.getGitignoreTemplate(name);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting gitignore template:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepoLicense = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getRepoLicense(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting repository license:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 36. Rate Limit, Meta, and Markdown Handlers
// ==========================================
export const getRateLimit = async (req, res) => {
  try {
    const result = await GithubService.getRateLimit();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting rate limit:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getMetaServerInfo = async (req, res) => {
  try {
    const result = await GithubService.getMetaServerInfo();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error getting server metadata:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const renderMarkdown = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await GithubService.renderMarkdown(text, req.body);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error rendering markdown:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 37. Codes of Conduct API
// ==========================================
export const getAllCodesOfConduct = async (req, res) => {
  try {
    const result = await GithubService.getAllCodesOfConduct();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting all codes of conduct:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getConductCode = async (req, res) => {
  try {
    const { key } = req.params;
    const result = await GithubService.getConductCode(key);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting conduct code for key ${key}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 38. Private Registries API
// ==========================================
export const listOrgPrivateRegistries = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgPrivateRegistries(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing private registries for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgPrivateRegistry = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.getOrgPrivateRegistry(org, secretName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting private registry configuration ${secretName} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 39. Reactions API
// ==========================================
export const createReactionForIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { content } = req.body;
    const result = await GithubService.createReactionForIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      content,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating reaction for issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listReactionsForIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const result = await GithubService.listReactionsForIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing reactions for issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteReactionForIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber, reactionId } = req.params;
    const result = await GithubService.deleteReactionForIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      parseInt(reactionId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting reaction #${reactionId} for issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 40. Hosted Compute (Org Runner Network settings)
// ==========================================
export const listNetworkConfigurationsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listNetworkConfigurationsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing network configurations for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getNetworkSettingsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getNetworkSettingsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error fetching network settings for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 41. Campaigns
// ==========================================
export const listOrgCampaigns = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgCampaigns(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing campaigns for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const GithubController = {
  getAuthenticatedUser,
  listRepositories,
  createRepository,
  getRepository,
  deleteRepository,
  listBranches,
  listIssues,
  createIssue,
  getIssue,
  updateIssue,
  listPullRequests,
  createPullRequest,
  getPullRequest,
  mergePullRequest,
  listWorkflows,
  triggerWorkflowDispatch,
  listWorkflowRuns,
  listGists,
  createGist,
  deleteGist,
  listProjects,
  createProject,
  graphql,
  searchRepositories,
  searchCode,
  searchIssues,
  searchUsers,
  getFileContent,
  createOrUpdateFile,
  deleteFile,
  listCommits,
  compareCommits,
  listReleases,
  createRelease,
  getLatestRelease,
  listCollaborators,
  addCollaborator,
  removeCollaborator,
  getRef,
  createRef,
  updateRef,
  createBlob,
  createTree,
  createCommit,
  listOrganizations,
  listTeams,
  listTeamMembers,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  getActionsPublicKey,
  createOrUpdateRepoSecret,
  listRepoVariables,
  createRepoVariable,
  updateRepoVariable,
  listCodespaces,
  createCodespace,
  deleteCodespace,
  listDependabotAlerts,
  getCopilotBillingForUser,
  listDiscussions,
  getDiscussion,
  createDiscussion,
  createDiscussionComment,
  createCheckRun,
  updateCheckRun,
  listCheckRunsForRef,
  createCheckSuite,
  listDeployments,
  createDeployment,
  createDeploymentStatus,
  listEnvironments,
  createOrUpdateEnvironment,
  listCodeScanningAlerts,
  getCodeScanningAlert,
  listSecretScanningAlerts,
  getSecretScanningAlert,
  listWorkflowJobs,
  listWorkflowRunArtifacts,
  downloadWorkflowArtifact,
  getAppAuthenticated,
  listAppInstallations,
  getAppInstallation,
  listAppReposAccessible,
  createAppInstallationAccessToken,
  getOrgActionsBilling,
  getOrgPackagesBilling,
  getOrgSharedStorageBilling,
  getEnterpriseAuditLog,
  listEnterpriseMembers,
  listPublicEvents,
  listRepoEvents,
  listOrgEvents,
  getRepoInteractionLimits,
  setRepoInteractionLimits,
  removeRepoInteractionLimits,
  listGlobalAdvisories,
  getRepositoryAdvisory,
  getOrgSecurityConfigurations,
  exportSbom,
  listOrgPackages,
  getPackageVersions,
  getOidcCustomSubTemplateForOrg,
  updateOidcCustomSubTemplateForOrg,
  startOrgMigration,
  getOrgMigrationStatus,
  getEmojis,
  getGitignoreTemplates,
  getGitignoreTemplate,
  getRepoLicense,
  getRateLimit,
  getMetaServerInfo,
  renderMarkdown,
  getAllCodesOfConduct,
  getConductCode,
  listOrgPrivateRegistries,
  getOrgPrivateRegistry,
  createReactionForIssue,
  listReactionsForIssue,
  deleteReactionForIssue,
  listNetworkConfigurationsForOrg,
  getNetworkSettingsForOrg,
  listOrgCampaigns,
};

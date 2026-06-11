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

// ==========================================
// 42. Custom Properties API Handlers
// ==========================================
export const createOrUpdateCustomProperty = async (req, res) => {
  try {
    const { org, propertyName } = req.params;
    const result = await GithubService.createOrUpdateCustomProperty(
      org,
      propertyName,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating custom property ${propertyName} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCustomProperty = async (req, res) => {
  try {
    const { org, propertyName } = req.params;
    const result = await GithubService.getCustomProperty(org, propertyName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting custom property ${propertyName} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeCustomProperty = async (req, res) => {
  try {
    const { org, propertyName } = req.params;
    const result = await GithubService.removeCustomProperty(org, propertyName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing custom property ${propertyName} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCustomProperties = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listCustomProperties(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing custom properties for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateRepoCustomPropertiesValues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { properties } = req.body;
    const result = await GithubService.createOrUpdateRepoCustomPropertiesValues(
      owner,
      repo,
      properties,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting custom properties values for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepoCustomPropertiesValues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getRepoCustomPropertiesValues(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting custom properties values for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 43. Rulesets API Handlers
// ==========================================
export const getRepoRulesets = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getRepoRulesets(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing rulesets for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepoRuleset = async (req, res) => {
  try {
    const { owner, repo, rulesetId } = req.params;
    const result = await GithubService.getRepoRuleset(
      owner,
      repo,
      parseInt(rulesetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting ruleset #${rulesetId} for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createRepoRuleset = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createRepoRuleset(owner, repo, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating ruleset for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRepoRuleset = async (req, res) => {
  try {
    const { owner, repo, rulesetId } = req.params;
    const result = await GithubService.updateRepoRuleset(
      owner,
      repo,
      parseInt(rulesetId, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating ruleset #${rulesetId} for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRepoRuleset = async (req, res) => {
  try {
    const { owner, repo, rulesetId } = req.params;
    const result = await GithubService.deleteRepoRuleset(
      owner,
      repo,
      parseInt(rulesetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting ruleset #${rulesetId} for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgRulesets = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgRulesets(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing rulesets for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgRuleset = async (req, res) => {
  try {
    const { org, rulesetId } = req.params;
    const result = await GithubService.getOrgRuleset(
      org,
      parseInt(rulesetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting ruleset #${rulesetId} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrgRuleset = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.createOrgRuleset(org, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating ruleset for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateOrgRuleset = async (req, res) => {
  try {
    const { org, rulesetId } = req.params;
    const result = await GithubService.updateOrgRuleset(
      org,
      parseInt(rulesetId, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating ruleset #${rulesetId} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgRuleset = async (req, res) => {
  try {
    const { org, rulesetId } = req.params;
    const result = await GithubService.deleteOrgRuleset(
      org,
      parseInt(rulesetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting ruleset #${rulesetId} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 44. Copilot Org Seat Management Handlers
// ==========================================
export const listCopilotSeatsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listCopilotSeatsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Copilot seats for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addCopilotSeatsToOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const { usernames } = req.body;
    const result = await GithubService.addCopilotSeatsToOrg(org, usernames);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding Copilot seats for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeCopilotSeatsFromOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const { usernames } = req.body;
    const result = await GithubService.removeCopilotSeatsFromOrg(
      org,
      usernames,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing Copilot seats for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCopilotSeatDetailsForUser = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.getCopilotSeatDetailsForUser(
      org,
      username,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Copilot seat details for ${username} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 45. Pull Request Reviews API Handlers
// ==========================================
export const listPullRequestReviews = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.listPullRequestReviews(
      owner,
      repo,
      parseInt(pullNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing reviews for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPullRequestReview = async (req, res) => {
  try {
    const { owner, repo, pullNumber, reviewId } = req.params;
    const result = await GithubService.getPullRequestReview(
      owner,
      repo,
      parseInt(pullNumber, 10),
      parseInt(reviewId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createPullRequestReview = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.createPullRequestReview(
      owner,
      repo,
      parseInt(pullNumber, 10),
      req.body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating review for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const submitPullRequestReview = async (req, res) => {
  try {
    const { owner, repo, pullNumber, reviewId } = req.params;
    const result = await GithubService.submitPullRequestReview(
      owner,
      repo,
      parseInt(pullNumber, 10),
      parseInt(reviewId, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error submitting review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const dismissPullRequestReview = async (req, res) => {
  try {
    const { owner, repo, pullNumber, reviewId } = req.params;
    const { message } = req.body;
    const result = await GithubService.dismissPullRequestReview(
      owner,
      repo,
      parseInt(pullNumber, 10),
      parseInt(reviewId, 10),
      message,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error dismissing review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 46. Issue Comments API Handlers
// ==========================================
export const listIssueComments = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const result = await GithubService.listIssueComments(
      owner,
      repo,
      parseInt(issueNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing comments for issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getIssueComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.getIssueComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createIssueComment = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { body } = req.body;
    const result = await GithubService.createIssueComment(
      owner,
      repo,
      parseInt(issueNumber, 10),
      body,
    );
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating comment on issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateIssueComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const { body } = req.body;
    const result = await GithubService.updateIssueComment(
      owner,
      repo,
      parseInt(commentId, 10),
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteIssueComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.deleteIssueComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 47. User Keys & Emails API Handlers
// ==========================================
export const listEmailsForAuthenticatedUser = async (req, res) => {
  try {
    const result = await GithubService.listEmailsForAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing emails for authenticated user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addEmailsForAuthenticatedUser = async (req, res) => {
  try {
    const { emails } = req.body;
    const result = await GithubService.addEmailsForAuthenticatedUser(emails);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error adding emails for authenticated user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteEmailsForAuthenticatedUser = async (req, res) => {
  try {
    const { emails } = req.body;
    const result = await GithubService.deleteEmailsForAuthenticatedUser(emails);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error deleting emails for authenticated user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPublicKeysForAuthenticatedUser = async (req, res) => {
  try {
    const result = await GithubService.listPublicKeysForAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing public keys for authenticated user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addPublicKeyForAuthenticatedUser = async (req, res) => {
  try {
    const { title, key } = req.body;
    const result = await GithubService.addPublicKeyForAuthenticatedUser(
      title,
      key,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error adding public key for authenticated user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deletePublicKeyForAuthenticatedUser = async (req, res) => {
  try {
    const { keyId } = req.params;
    const result = await GithubService.deletePublicKeyForAuthenticatedUser(
      parseInt(keyId, 10),
    );
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting public key #${keyId} for authenticated user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 48. GitHub Classroom API Handlers
// ==========================================
export const listClassrooms = async (req, res) => {
  try {
    const result = await GithubService.listClassrooms();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error listing classrooms:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const result = await GithubService.getClassroom(parseInt(classroomId, 10));
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting classroom ${classroomId}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAssignmentsForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const result = await GithubService.listAssignmentsForClassroom(
      parseInt(classroomId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing assignments for classroom ${classroomId}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const result = await GithubService.getAssignment(
      parseInt(assignmentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting assignment ${assignmentId}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 49. Actions Workflows & Runs API Handlers
// ==========================================
export const listRepoWorkflows = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listRepoWorkflows(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing workflows for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getWorkflow = async (req, res) => {
  try {
    const { owner, repo, workflowId } = req.params;
    const result = await GithubService.getWorkflow(owner, repo, workflowId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting workflow ${workflowId} in ${owner}/${repo}:`,
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
    const result = await GithubService.listWorkflowRuns(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing workflow runs for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getWorkflowRun = async (req, res) => {
  try {
    const { owner, repo, runId } = req.params;
    const result = await GithubService.getWorkflowRun(
      owner,
      repo,
      parseInt(runId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting workflow run ${runId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createWorkflowDispatch = async (req, res) => {
  try {
    const { owner, repo, workflowId } = req.params;
    const { ref, inputs } = req.body;
    const result = await GithubService.createWorkflowDispatch(
      owner,
      repo,
      workflowId,
      ref,
      inputs,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating workflow dispatch for ${workflowId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 50. Self-Hosted Runners API Handlers
// ==========================================
export const listSelfHostedRunnersForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listSelfHostedRunnersForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing self-hosted runners for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSelfHostedRunnersForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listSelfHostedRunnersForRepo(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing self-hosted runners for repo ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSelfHostedRunnerForOrg = async (req, res) => {
  try {
    const { org, runnerId } = req.params;
    const result = await GithubService.getSelfHostedRunnerForOrg(
      org,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting self-hosted runner ${runnerId} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSelfHostedRunnerForRepo = async (req, res) => {
  try {
    const { owner, repo, runnerId } = req.params;
    const result = await GithubService.getSelfHostedRunnerForRepo(
      owner,
      repo,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting self-hosted runner ${runnerId} for repo ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteSelfHostedRunnerFromOrg = async (req, res) => {
  try {
    const { org, runnerId } = req.params;
    const result = await GithubService.deleteSelfHostedRunnerFromOrg(
      org,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting self-hosted runner ${runnerId} from org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteSelfHostedRunnerFromRepo = async (req, res) => {
  try {
    const { owner, repo, runnerId } = req.params;
    const result = await GithubService.deleteSelfHostedRunnerFromRepo(
      owner,
      repo,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting self-hosted runner ${runnerId} from repo ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 51. Issue Labels & Milestones API Handlers
// ==========================================
export const listLabelsForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listLabelsForRepo(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing labels for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getLabel = async (req, res) => {
  try {
    const { owner, repo, name } = req.params;
    const result = await GithubService.getLabel(owner, repo, name);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting label "${name}" in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createLabel = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createLabel(owner, repo, req.body);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating label in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateLabel = async (req, res) => {
  try {
    const { owner, repo, name } = req.params;
    const result = await GithubService.updateLabel(owner, repo, name, req.body);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating label "${name}" in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteLabel = async (req, res) => {
  try {
    const { owner, repo, name } = req.params;
    const result = await GithubService.deleteLabel(owner, repo, name);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting label "${name}" in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addLabelsToIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { labels } = req.body;
    const result = await GithubService.addLabelsToIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      labels,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding labels to issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeLabelFromIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber, name } = req.params;
    const result = await GithubService.removeLabelFromIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      name,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing label "${name}" from issue #${issueNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listMilestones = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listMilestones(owner, repo, req.query);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing milestones for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getMilestone = async (req, res) => {
  try {
    const { owner, repo, milestoneNumber } = req.params;
    const result = await GithubService.getMilestone(
      owner,
      repo,
      parseInt(milestoneNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting milestone #${milestoneNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.createMilestone(owner, repo, req.body);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating milestone in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { owner, repo, milestoneNumber } = req.params;
    const result = await GithubService.updateMilestone(
      owner,
      repo,
      parseInt(milestoneNumber, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating milestone #${milestoneNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const { owner, repo, milestoneNumber } = req.params;
    const result = await GithubService.deleteMilestone(
      owner,
      repo,
      parseInt(milestoneNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting milestone #${milestoneNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 52. Repository Deploy Keys & Commit Statuses API Handlers
// ==========================================
export const listDeployKeys = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listDeployKeys(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing deploy keys for ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDeployKey = async (req, res) => {
  try {
    const { owner, repo, keyId } = req.params;
    const result = await GithubService.getDeployKey(
      owner,
      repo,
      parseInt(keyId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting deploy key #${keyId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addDeployKey = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, key, readOnly } = req.body;
    const result = await GithubService.addDeployKey(
      owner,
      repo,
      title,
      key,
      readOnly,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding deploy key in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteDeployKey = async (req, res) => {
  try {
    const { owner, repo, keyId } = req.params;
    const result = await GithubService.deleteDeployKey(
      owner,
      repo,
      parseInt(keyId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting deploy key #${keyId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCommitStatus = async (req, res) => {
  try {
    const { owner, repo, sha } = req.params;
    const result = await GithubService.createCommitStatus(
      owner,
      repo,
      sha,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating commit status for SHA ${sha} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCommitStatusesForRef = async (req, res) => {
  try {
    const { owner, repo, ref } = req.params;
    const result = await GithubService.listCommitStatusesForRef(
      owner,
      repo,
      ref,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing commit statuses for ref ${ref} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 53. PR Review Comments & Merges API Handlers
// ==========================================
export const listReviewComments = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.listReviewComments(
      owner,
      repo,
      parseInt(pullNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing review comments for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getReviewComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.getReviewComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting review comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createReviewComment = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.createReviewComment(
      owner,
      repo,
      parseInt(pullNumber, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating review comment on PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateReviewComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const { body } = req.body;
    const result = await GithubService.updateReviewComment(
      owner,
      repo,
      parseInt(commentId, 10),
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating review comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteReviewComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.deleteReviewComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting review comment #${commentId} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const mergePullRequest = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.mergePullRequest(
      owner,
      repo,
      parseInt(pullNumber, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error merging PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const checkIfPullRequestMerged = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.checkIfPullRequestMerged(
      owner,
      repo,
      parseInt(pullNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error checking merge status for PR #${pullNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 54. Team Discussions API Handlers
// ==========================================
export const listTeamDiscussions = async (req, res) => {
  try {
    const { org, teamSlug } = req.params;
    const result = await GithubService.listTeamDiscussions(org, teamSlug);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing discussions for team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getTeamDiscussion = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber } = req.params;
    const result = await GithubService.getTeamDiscussion(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTeamDiscussion = async (req, res) => {
  try {
    const { org, teamSlug } = req.params;
    const result = await GithubService.createTeamDiscussion(
      org,
      teamSlug,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating discussion for team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateTeamDiscussion = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber } = req.params;
    const result = await GithubService.updateTeamDiscussion(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteTeamDiscussion = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber } = req.params;
    const result = await GithubService.deleteTeamDiscussion(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listTeamDiscussionComments = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber } = req.params;
    const result = await GithubService.listTeamDiscussionComments(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing comments for discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getTeamDiscussionComment = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber, commentNumber } = req.params;
    const result = await GithubService.getTeamDiscussionComment(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
      parseInt(commentNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createTeamDiscussionComment = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber } = req.params;
    const { body } = req.body;
    const result = await GithubService.createTeamDiscussionComment(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating comment on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateTeamDiscussionComment = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber, commentNumber } = req.params;
    const { body } = req.body;
    const result = await GithubService.updateTeamDiscussionComment(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
      parseInt(commentNumber, 10),
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteTeamDiscussionComment = async (req, res) => {
  try {
    const { org, teamSlug, discussionNumber, commentNumber } = req.params;
    const result = await GithubService.deleteTeamDiscussionComment(
      org,
      teamSlug,
      parseInt(discussionNumber, 10),
      parseInt(commentNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 55. SCIM Organization Member Provisioning Handlers
// ==========================================
export const listProvisionedIdentities = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listProvisionedIdentities(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing SCIM provisioned identities:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const provisionAndInviteUser = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.provisionAndInviteUser(org, req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error provisioning SCIM user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getProvisioningInformation = async (req, res) => {
  try {
    const { org, scimUserId } = req.params;
    const result = await GithubService.getProvisioningInformation(
      org,
      scimUserId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting SCIM provisioning information:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const replaceProvisionedUser = async (req, res) => {
  try {
    const { org, scimUserId } = req.params;
    const result = await GithubService.replaceProvisionedUser(
      org,
      scimUserId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error replacing SCIM user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateProvisionedUser = async (req, res) => {
  try {
    const { org, scimUserId } = req.params;
    const result = await GithubService.updateProvisionedUser(
      org,
      scimUserId,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error updating SCIM user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteUserFromOrg = async (req, res) => {
  try {
    const { org, scimUserId } = req.params;
    const result = await GithubService.deleteUserFromOrg(org, scimUserId);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error('[GitHub Controller] Error deleting SCIM user:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 56. Codespaces Secrets API Handlers
// ==========================================
export const getCodespacesPublicKeyForAuthenticatedUser = async (req, res) => {
  try {
    const result =
      await GithubService.getCodespacesPublicKeyForAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error getting Codespaces public key for user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCodespacesSecretsForAuthenticatedUser = async (req, res) => {
  try {
    const result =
      await GithubService.listCodespacesSecretsForAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      '[GitHub Controller] Error listing Codespaces secrets for user:',
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCodespacesSecretForAuthenticatedUser = async (req, res) => {
  try {
    const { secretName } = req.params;
    const result =
      await GithubService.getCodespacesSecretForAuthenticatedUser(secretName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Codespaces secret "${secretName}" for user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateCodespacesSecretForAuthenticatedUser = async (
  req,
  res,
) => {
  try {
    const { secretName } = req.params;
    const { encrypted_value, key_id } = req.body;
    const result =
      await GithubService.createOrUpdateCodespacesSecretForAuthenticatedUser(
        secretName,
        encrypted_value,
        key_id,
      );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Codespaces secret "${secretName}" for user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteCodespacesSecretForAuthenticatedUser = async (req, res) => {
  try {
    const { secretName } = req.params;
    const result =
      await GithubService.deleteCodespacesSecretForAuthenticatedUser(
        secretName,
      );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Codespaces secret "${secretName}" for user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCodespacesPublicKeyForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getCodespacesPublicKeyForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Codespaces public key for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCodespacesSecretsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listCodespacesSecretsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Codespaces secrets for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCodespacesSecretForOrg = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.getCodespacesSecretForOrg(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Codespaces secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateCodespacesSecretForOrg = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { encrypted_value, key_id, selected_repository_ids } = req.body;
    const result = await GithubService.createOrUpdateCodespacesSecretForOrg(
      org,
      secretName,
      encrypted_value,
      key_id,
      selected_repository_ids,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Codespaces secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteCodespacesSecretForOrg = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.deleteCodespacesSecretForOrg(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Codespaces secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 57. Actions Organization Secrets & Variables Handlers
// ==========================================
export const getActionsPublicKeyForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getActionsPublicKeyForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions public key for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgSecrets = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgSecrets(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Actions secrets for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.getOrgSecret(org, secretName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { encrypted_value, key_id, selected_repository_ids } = req.body;
    const result = await GithubService.createOrUpdateOrgSecret(
      org,
      secretName,
      encrypted_value,
      key_id,
      selected_repository_ids,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Actions secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.deleteOrgSecret(org, secretName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Actions secret "${secretName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgVariables = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgVariables(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Actions variables for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgVariable = async (req, res) => {
  try {
    const { org, variableName } = req.params;
    const result = await GithubService.getOrgVariable(org, variableName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions variable "${variableName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateOrgVariable = async (req, res) => {
  try {
    const { org, variableName } = req.params;
    const { value, selected_repository_ids } = req.body;
    const result = await GithubService.createOrUpdateOrgVariable(
      org,
      variableName,
      value,
      selected_repository_ids,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Actions variable "${variableName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgVariable = async (req, res) => {
  try {
    const { org, variableName } = req.params;
    const result = await GithubService.deleteOrgVariable(org, variableName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Actions variable "${variableName}" for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 58. Actions Environment Secrets & Variables Handlers
// ==========================================
export const getActionsPublicKeyForEnvironment = async (req, res) => {
  try {
    const { repositoryId, environmentName } = req.params;
    const result = await GithubService.getActionsPublicKeyForEnvironment(
      parseInt(repositoryId, 10),
      environmentName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions public key for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listEnvironmentSecrets = async (req, res) => {
  try {
    const { owner, repo, environmentName } = req.params;
    const result = await GithubService.listEnvironmentSecrets(
      owner,
      repo,
      environmentName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Actions secrets for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnvironmentSecret = async (req, res) => {
  try {
    const { owner, repo, environmentName, secretName } = req.params;
    const result = await GithubService.getEnvironmentSecret(
      owner,
      repo,
      environmentName,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions secret "${secretName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateEnvironmentSecret = async (req, res) => {
  try {
    const { owner, repo, environmentName, secretName } = req.params;
    const { encrypted_value, key_id } = req.body;
    const result = await GithubService.createOrUpdateEnvironmentSecret(
      owner,
      repo,
      environmentName,
      secretName,
      encrypted_value,
      key_id,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Actions secret "${secretName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteEnvironmentSecret = async (req, res) => {
  try {
    const { owner, repo, environmentName, secretName } = req.params;
    const result = await GithubService.deleteEnvironmentSecret(
      owner,
      repo,
      environmentName,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Actions secret "${secretName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listEnvironmentVariables = async (req, res) => {
  try {
    const { owner, repo, environmentName } = req.params;
    const result = await GithubService.listEnvironmentVariables(
      owner,
      repo,
      environmentName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Actions variables for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnvironmentVariable = async (req, res) => {
  try {
    const { owner, repo, environmentName, variableName } = req.params;
    const result = await GithubService.getEnvironmentVariable(
      owner,
      repo,
      environmentName,
      variableName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions variable "${variableName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateEnvironmentVariable = async (req, res) => {
  try {
    const { owner, repo, environmentName, variableName } = req.params;
    const { value } = req.body;
    const result = await GithubService.createOrUpdateEnvironmentVariable(
      owner,
      repo,
      environmentName,
      variableName,
      value,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Actions variable "${variableName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteEnvironmentVariable = async (req, res) => {
  try {
    const { owner, repo, environmentName, variableName } = req.params;
    const result = await GithubService.deleteEnvironmentVariable(
      owner,
      repo,
      environmentName,
      variableName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Actions variable "${variableName}" for environment ${environmentName}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 59. Secret Scanning Org Alerts & Locations Handlers
// ==========================================
export const listSecretScanningAlertsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listSecretScanningAlertsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing secret scanning alerts for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSecretScanningAlertForOrg = async (req, res) => {
  try {
    const { org, alertNumber } = req.params;
    const result = await GithubService.getSecretScanningAlertForOrg(
      org,
      parseInt(alertNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting secret scanning alert #${alertNumber} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateSecretScanningAlertForOrg = async (req, res) => {
  try {
    const { org, alertNumber } = req.params;
    const { state, resolution } = req.body;
    const result = await GithubService.updateSecretScanningAlertForOrg(
      org,
      parseInt(alertNumber, 10),
      state,
      resolution,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating secret scanning alert #${alertNumber} for org ${org}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSecretScanningLocations = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const result = await GithubService.listSecretScanningLocations(
      owner,
      repo,
      parseInt(alertNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing secret scanning locations for alert #${alertNumber} in ${owner}/${repo}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 60. Enterprise Admin Policies, Runners & Billing Handlers
// ==========================================
export const getEnterpriseActionsPermissions = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result =
      await GithubService.getEnterpriseActionsPermissions(enterprise);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions permissions for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setEnterpriseActionsPermissions = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result = await GithubService.setEnterpriseActionsPermissions(
      enterprise,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting Actions permissions for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSelfHostedRunnersForEnterprise = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result =
      await GithubService.listSelfHostedRunnersForEnterprise(enterprise);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing self-hosted runners for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getSelfHostedRunnerForEnterprise = async (req, res) => {
  try {
    const { enterprise, runnerId } = req.params;
    const result = await GithubService.getSelfHostedRunnerForEnterprise(
      enterprise,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting self-hosted runner ${runnerId} for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteSelfHostedRunnerFromEnterprise = async (req, res) => {
  try {
    const { enterprise, runnerId } = req.params;
    const result = await GithubService.deleteSelfHostedRunnerFromEnterprise(
      enterprise,
      parseInt(runnerId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting self-hosted runner ${runnerId} from enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnterpriseActionsBilling = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result = await GithubService.getEnterpriseActionsBilling(enterprise);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions billing for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnterprisePackagesBilling = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result = await GithubService.getEnterprisePackagesBilling(enterprise);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Packages billing for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getEnterpriseSharedStorageBilling = async (req, res) => {
  try {
    const { enterprise } = req.params;
    const result =
      await GithubService.getEnterpriseSharedStorageBilling(enterprise);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Shared Storage billing for enterprise ${enterprise}:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 61. Advanced Security Scanning
// ==========================================
export const updateCodeScanningAlert = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const { state, dismissedReason } = req.body;
    const result = await GithubService.updateCodeScanningAlert(
      owner,
      repo,
      parseInt(alertNumber, 10),
      state,
      dismissedReason,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error updating code scanning alert:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCodeScanningAlertInstances = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const result = await GithubService.listCodeScanningAlertInstances(
      owner,
      repo,
      parseInt(alertNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing code scanning alert instances:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listCodeScanningAnalyses = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listCodeScanningAnalyses(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing code scanning analyses:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCodeScanningAnalysis = async (req, res) => {
  try {
    const { owner, repo, analysisId } = req.params;
    const result = await GithubService.getCodeScanningAnalysis(
      owner,
      repo,
      parseInt(analysisId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting code scanning analysis:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteCodeScanningAnalysis = async (req, res) => {
  try {
    const { owner, repo, analysisId } = req.params;
    const result = await GithubService.deleteCodeScanningAnalysis(
      owner,
      repo,
      parseInt(analysisId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting code scanning analysis:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const uploadCodeScanningSarif = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.uploadCodeScanningSarif(
      owner,
      repo,
      req.body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error uploading SARIF file:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSecretScanningBypassApprovals = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const result = await GithubService.listSecretScanningBypassApprovals(
      owner,
      repo,
      parseInt(alertNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing secret scanning bypass approvals:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createSecretScanningBypassApproval = async (req, res) => {
  try {
    const { owner, repo, alertNumber } = req.params;
    const { state, comment } = req.body;
    const result = await GithubService.createSecretScanningBypassApproval(
      owner,
      repo,
      parseInt(alertNumber, 10),
      state,
      comment,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating secret scanning bypass approval:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 62. Commit Comments
// ==========================================
export const listCommitComments = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listCommitComments(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing commit comments:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getCommitComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.getCommitComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting commit comment:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createCommitComment = async (req, res) => {
  try {
    const { owner, repo, commitSha } = req.params;
    const { body, path, position, line } = req.body;
    const result = await GithubService.createCommitComment(
      owner,
      repo,
      commitSha,
      body,
      path,
      position,
      line,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating commit comment:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateCommitComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const { body } = req.body;
    const result = await GithubService.updateCommitComment(
      owner,
      repo,
      parseInt(commentId, 10),
      body,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating commit comment:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteCommitComment = async (req, res) => {
  try {
    const { owner, repo, commentId } = req.params;
    const result = await GithubService.deleteCommitComment(
      owner,
      repo,
      parseInt(commentId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting commit comment:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 63. Repository Forks & Invitations
// ==========================================
export const listForks = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listForks(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing forks:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createFork = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { org, name, defaultBranchOnly } = req.body;
    const result = await GithubService.createFork(
      owner,
      repo,
      org,
      name,
      defaultBranchOnly,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating fork:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listRepoInvitations = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listRepoInvitations(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing repo invitations:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRepoInvitation = async (req, res) => {
  try {
    const { owner, repo, invitationId } = req.params;
    const result = await GithubService.deleteRepoInvitation(
      owner,
      repo,
      parseInt(invitationId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting repo invitation:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateRepoInvitation = async (req, res) => {
  try {
    const { owner, repo, invitationId } = req.params;
    const { permissions } = req.body;
    const result = await GithubService.updateRepoInvitation(
      owner,
      repo,
      parseInt(invitationId, 10),
      permissions,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating repo invitation:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 64. Repository Pages
// ==========================================
export const getPagesInfo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getPagesInfo(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting Pages info:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createPagesSite = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { source } = req.body;
    const result = await GithubService.createPagesSite(owner, repo, source);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating Pages site:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updatePagesSite = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { source } = req.body;
    const result = await GithubService.updatePagesSite(owner, repo, source);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating Pages site:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deletePagesSite = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.deletePagesSite(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting Pages site:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPagesBuilds = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listPagesBuilds(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing Pages builds:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getPagesBuildInfo = async (req, res) => {
  try {
    const { owner, repo, buildId } = req.params;
    const result = await GithubService.getPagesBuildInfo(
      owner,
      repo,
      parseInt(buildId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting Pages build info:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const requestPagesBuild = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.requestPagesBuild(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error requesting Pages build:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 65. Actions Runner Groups & Workflow Permissions
// ==========================================
export const listOrgRunnerGroups = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgRunnerGroups(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing org runner groups:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgRunnerGroup = async (req, res) => {
  try {
    const { org, runnerGroupId } = req.params;
    const result = await GithubService.getOrgRunnerGroup(
      org,
      parseInt(runnerGroupId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting org runner group:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrgRunnerGroup = async (req, res) => {
  try {
    const { org } = req.params;
    const { name, visibility, selectedRepositoryIds } = req.body;
    const result = await GithubService.createOrgRunnerGroup(
      org,
      name,
      visibility,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating org runner group:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateOrgRunnerGroup = async (req, res) => {
  try {
    const { org, runnerGroupId } = req.params;
    const { name, visibility, selectedRepositoryIds } = req.body;
    const result = await GithubService.updateOrgRunnerGroup(
      org,
      parseInt(runnerGroupId, 10),
      name,
      visibility,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating org runner group:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgRunnerGroup = async (req, res) => {
  try {
    const { org, runnerGroupId } = req.params;
    const result = await GithubService.deleteOrgRunnerGroup(
      org,
      parseInt(runnerGroupId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting org runner group:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getActionsPermissionsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getActionsPermissionsForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions permissions for org:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setActionsPermissionsForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const { enabledRepositories, allowedActions } = req.body;
    const result = await GithubService.setActionsPermissionsForOrg(
      org,
      enabledRepositories,
      allowedActions,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting Actions permissions for org:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getActionsPermissionsForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getActionsPermissionsForRepo(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting Actions permissions for repo:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setActionsPermissionsForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { enabled, allowedActions } = req.body;
    const result = await GithubService.setActionsPermissionsForRepo(
      owner,
      repo,
      enabled,
      allowedActions,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting Actions permissions for repo:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

// ==========================================
// 66. Selected Repository Org Secrets & Variables
// ==========================================
export const listSelectedReposForOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.listSelectedReposForOrgSecret(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing selected repos for org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setSelectedReposForOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { selectedRepositoryIds } = req.body;
    const result = await GithubService.setSelectedReposForOrgSecret(
      org,
      secretName,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting selected repos for org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSelectedRepoToOrgSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result = await GithubService.addSelectedRepoToOrgSecret(
      org,
      secretName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding selected repo to org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeSelectedRepoFromOrgSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result = await GithubService.removeSelectedRepoFromOrgSecret(
      org,
      secretName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing selected repo from org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSelectedReposForOrgVariable = async (req, res) => {
  try {
    const { org, variableName } = req.params;
    const result = await GithubService.listSelectedReposForOrgVariable(
      org,
      variableName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing selected repos for org variable:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setSelectedReposForOrgVariable = async (req, res) => {
  try {
    const { org, variableName } = req.params;
    const { selectedRepositoryIds } = req.body;
    const result = await GithubService.setSelectedReposForOrgVariable(
      org,
      variableName,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting selected repos for org variable:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSelectedRepoToOrgVariable = async (req, res) => {
  try {
    const { org, variableName, repositoryId } = req.params;
    const result = await GithubService.addSelectedRepoToOrgVariable(
      org,
      variableName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding selected repo to org variable:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeSelectedRepoFromOrgVariable = async (req, res) => {
  try {
    const { org, variableName, repositoryId } = req.params;
    const result = await GithubService.removeSelectedRepoFromOrgVariable(
      org,
      variableName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing selected repo from org variable:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSelectedReposForOrgCodespacesSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.listSelectedReposForOrgCodespacesSecret(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing selected repos for org Codespaces secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setSelectedReposForOrgCodespacesSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { selectedRepositoryIds } = req.body;
    const result = await GithubService.setSelectedReposForOrgCodespacesSecret(
      org,
      secretName,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting selected repos for org Codespaces secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSelectedRepoToOrgCodespacesSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result = await GithubService.addSelectedRepoToOrgCodespacesSecret(
      org,
      secretName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding selected repo to org Codespaces secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDependabotOrgPublicKey = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getDependabotOrgPublicKey(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error fetching Dependabot org public key:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listDependabotOrgSecrets = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listDependabotOrgSecrets(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Dependabot org secrets:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.getDependabotOrgSecret(org, secretName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error fetching Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { encryptedValue, keyId, visibility, selectedRepositoryIds } =
      req.body;
    const result = await GithubService.createOrUpdateDependabotOrgSecret(
      org,
      secretName,
      encryptedValue,
      keyId,
      visibility,
      selectedRepositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.deleteDependabotOrgSecret(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSelectedReposForDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const result = await GithubService.listSelectedReposForDependabotOrgSecret(
      org,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing selected repos for Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setSelectedReposForDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName } = req.params;
    const { repositoryIds } = req.body;
    const result = await GithubService.setSelectedReposForDependabotOrgSecret(
      org,
      secretName,
      repositoryIds,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting selected repos for Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSelectedRepoToDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result = await GithubService.addSelectedRepoToDependabotOrgSecret(
      org,
      secretName,
      parseInt(repositoryId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding selected repo to Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeSelectedRepoFromDependabotOrgSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result =
      await GithubService.removeSelectedRepoFromDependabotOrgSecret(
        org,
        secretName,
        parseInt(repositoryId, 10),
      );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing selected repo from Dependabot org secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDependabotRepoPublicKey = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getDependabotRepoPublicKey(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error fetching Dependabot repo public key:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listDependabotRepoSecrets = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listDependabotRepoSecrets(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing Dependabot repo secrets:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getDependabotRepoSecret = async (req, res) => {
  try {
    const { owner, repo, secretName } = req.params;
    const result = await GithubService.getDependabotRepoSecret(
      owner,
      repo,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error fetching Dependabot repo secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrUpdateDependabotRepoSecret = async (req, res) => {
  try {
    const { owner, repo, secretName } = req.params;
    const { encryptedValue, keyId } = req.body;
    const result = await GithubService.createOrUpdateDependabotRepoSecret(
      owner,
      repo,
      secretName,
      encryptedValue,
      keyId,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating/updating Dependabot repo secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteDependabotRepoSecret = async (req, res) => {
  try {
    const { owner, repo, secretName } = req.params;
    const result = await GithubService.deleteDependabotRepoSecret(
      owner,
      repo,
      secretName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting Dependabot repo secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgWebhooks = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgWebhooks(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing org webhooks:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrgWebhook = async (req, res) => {
  try {
    const { org } = req.params;
    const { name, config, events, active } = req.body;
    const result = await GithubService.createOrgWebhook(
      org,
      name,
      config,
      events,
      active,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating org webhook:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgWebhook = async (req, res) => {
  try {
    const { org, webhookId } = req.params;
    const result = await GithubService.getOrgWebhook(
      org,
      parseInt(webhookId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error fetching org webhook:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateOrgWebhook = async (req, res) => {
  try {
    const { org, webhookId } = req.params;
    const { config, events, active } = req.body;
    const result = await GithubService.updateOrgWebhook(
      org,
      parseInt(webhookId, 10),
      config,
      events,
      active,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating org webhook:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgWebhook = async (req, res) => {
  try {
    const { org, webhookId } = req.params;
    const result = await GithubService.deleteOrgWebhook(
      org,
      parseInt(webhookId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting org webhook:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const pingOrgWebhook = async (req, res) => {
  try {
    const { org, webhookId } = req.params;
    const result = await GithubService.pingOrgWebhook(
      org,
      parseInt(webhookId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error pinging org webhook:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listRequestedReviewers = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.listRequestedReviewers(
      owner,
      repo,
      parseInt(pullNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing requested reviewers:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const requestReviewersForPullRequest = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const { reviewers, teamReviewers } = req.body;
    const result = await GithubService.requestReviewersForPullRequest(
      owner,
      repo,
      parseInt(pullNumber, 10),
      reviewers,
      teamReviewers,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error requesting PR reviewers:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeRequestedReviewersFromPullRequest = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const { reviewers, teamReviewers } = req.body;
    const result = await GithubService.removeRequestedReviewersFromPullRequest(
      owner,
      repo,
      parseInt(pullNumber, 10),
      reviewers,
      teamReviewers,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing requested PR reviewers:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listPullRequestFiles = async (req, res) => {
  try {
    const { owner, repo, pullNumber } = req.params;
    const result = await GithubService.listPullRequestFiles(
      owner,
      repo,
      parseInt(pullNumber, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing PR files:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAssignees = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listAssignees(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing assignees:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const checkAssignee = async (req, res) => {
  try {
    const { owner, repo, assignee } = req.params;
    const result = await GithubService.checkAssignee(owner, repo, assignee);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error checking assignee:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addAssigneesToIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { assignees } = req.body;
    const result = await GithubService.addAssigneesToIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      assignees,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error adding issue assignees:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeAssigneesFromIssue = async (req, res) => {
  try {
    const { owner, repo, issueNumber } = req.params;
    const { assignees } = req.body;
    const result = await GithubService.removeAssigneesFromIssue(
      owner,
      repo,
      parseInt(issueNumber, 10),
      assignees,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error removing issue assignees:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listReleaseAssets = async (req, res) => {
  try {
    const { owner, repo, releaseId } = req.params;
    const result = await GithubService.listReleaseAssets(
      owner,
      repo,
      parseInt(releaseId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing release assets:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getReleaseAsset = async (req, res) => {
  try {
    const { owner, repo, assetId } = req.params;
    const result = await GithubService.getReleaseAsset(
      owner,
      repo,
      parseInt(assetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error fetching release asset:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateReleaseAsset = async (req, res) => {
  try {
    const { owner, repo, assetId } = req.params;
    const { name, label } = req.body;
    const result = await GithubService.updateReleaseAsset(
      owner,
      repo,
      parseInt(assetId, 10),
      name,
      label,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating release asset:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteReleaseAsset = async (req, res) => {
  try {
    const { owner, repo, assetId } = req.params;
    const result = await GithubService.deleteReleaseAsset(
      owner,
      repo,
      parseInt(assetId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting release asset:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listStargazersForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listStargazersForRepo(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing repository stargazers:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listReposStarredByAuthenticatedUser = async (req, res) => {
  try {
    const result = await GithubService.listReposStarredByAuthenticatedUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing repositories starred by user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const checkIfRepoIsStarredByUser = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.checkIfRepoIsStarredByUser(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error checking if repo starred by user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const starRepoForAuthenticatedUser = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.starRepoForAuthenticatedUser(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error starring repository:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unstarRepoForAuthenticatedUser = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.unstarRepoForAuthenticatedUser(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error unstarring repository:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getRepoSubscription = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.getRepoSubscription(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error getting repository subscription:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const setRepoSubscription = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { subscribed, ignored } = req.body;
    const result = await GithubService.setRepoSubscription(
      owner,
      repo,
      subscribed,
      ignored,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error setting repository subscription:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteRepoSubscription = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.deleteRepoSubscription(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error deleting repository subscription:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const enablePrivateVulnerabilityReporting = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.enablePrivateVulnerabilityReporting(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error enabling private vulnerability reporting:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const disablePrivateVulnerabilityReporting = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.disablePrivateVulnerabilityReporting(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error disabling private vulnerability reporting:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const enableDependabotAlerts = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.enableDependabotAlerts(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error enabling Dependabot alerts:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const disableDependabotAlerts = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.disableDependabotAlerts(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error disabling Dependabot alerts:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const enableDependabotSecurityUpdates = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.enableDependabotSecurityUpdates(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error enabling Dependabot security updates:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const disableDependabotSecurityUpdates = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.disableDependabotSecurityUpdates(
      owner,
      repo,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error disabling Dependabot security updates:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listSecurityManagerTeams = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listSecurityManagerTeams(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing security manager teams:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addSecurityManagerTeam = async (req, res) => {
  try {
    const { org, teamSlug } = req.params;
    const result = await GithubService.addSecurityManagerTeam(org, teamSlug);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding security manager team:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeSecurityManagerTeam = async (req, res) => {
  try {
    const { org, teamSlug } = req.params;
    const result = await GithubService.removeSecurityManagerTeam(org, teamSlug);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing security manager team:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listAutolinks = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const result = await GithubService.listAutolinks(owner, repo);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing autolinks:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createAutolink = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { keyPrefix, urlTemplate, isAlphanumeric } = req.body;
    const result = await GithubService.createAutolink(
      owner,
      repo,
      keyPrefix,
      urlTemplate,
      isAlphanumeric,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error creating autolink:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getAutolink = async (req, res) => {
  try {
    const { owner, repo, autolinkId } = req.params;
    const result = await GithubService.getAutolink(
      owner,
      repo,
      parseInt(autolinkId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting autolink:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteAutolink = async (req, res) => {
  try {
    const { owner, repo, autolinkId } = req.params;
    const result = await GithubService.deleteAutolink(
      owner,
      repo,
      parseInt(autolinkId, 10),
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting autolink:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgInfo = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.getOrgInfo(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting org info:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const updateOrgSettings = async (req, res) => {
  try {
    const { org } = req.params;
    const settingsData = req.body;
    const result = await GithubService.updateOrgSettings(org, settingsData);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error updating org settings:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const getOrgMembership = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.getOrgMembership(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error getting org membership:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const addOrUpdateOrgMembership = async (req, res) => {
  try {
    const { org, username } = req.params;
    const { role } = req.body;
    const result = await GithubService.addOrUpdateOrgMembership(
      org,
      username,
      role,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error adding/updating org membership:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeOrgMember = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.removeOrgMember(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error removing org member:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOutsideCollaborators = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOutsideCollaborators(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing outside collaborators:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeOutsideCollaborator = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.removeOutsideCollaborator(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing outside collaborator:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const convertMemberToOutsideCollaborator = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.convertMemberToOutsideCollaborator(
      org,
      username,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error converting member to outside collaborator:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listBlockedUsersForOrg = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listBlockedUsersForOrg(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing blocked users for org:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const checkIfUserBlockedByOrg = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.checkIfUserBlockedByOrg(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error checking if user blocked by org:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const blockUserForOrg = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.blockUserForOrg(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error blocking user for org:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unblockUserForOrg = async (req, res) => {
  try {
    const { org, username } = req.params;
    const result = await GithubService.unblockUserForOrg(org, username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error unblocking user for org:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listBlockedUsersForUser = async (req, res) => {
  try {
    const result = await GithubService.listBlockedUsersForUser();
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing blocked users for user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const checkIfUserBlockedByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await GithubService.checkIfUserBlockedByUser(username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error checking if user blocked by user:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const blockUserForUser = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await GithubService.blockUserForUser(username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error blocking user:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const unblockUserForUser = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await GithubService.unblockUserForUser(username);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error unblocking user:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgCodespaces = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgCodespaces(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error listing org codespaces:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const stopCodespace = async (req, res) => {
  try {
    const { codespaceName } = req.params;
    const result = await GithubService.stopCodespace(codespaceName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error stopping codespace:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const startCodespace = async (req, res) => {
  try {
    const { codespaceName } = req.params;
    const result = await GithubService.startCodespace(codespaceName);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error starting codespace:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const deleteOrgCodespace = async (req, res) => {
  try {
    const { org, username, codespaceName } = req.params;
    const result = await GithubService.deleteOrgCodespace(
      org,
      username,
      codespaceName,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GitHub Controller] Error deleting org codespace:`, error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const listOrgSecurityAdvisories = async (req, res) => {
  try {
    const { org } = req.params;
    const result = await GithubService.listOrgSecurityAdvisories(org);
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error listing org security advisories:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const createOrgSecurityAdvisory = async (req, res) => {
  try {
    const { org } = req.params;
    const advisoryData = req.body;
    const result = await GithubService.createOrgSecurityAdvisory(
      org,
      advisoryData,
    );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error creating org security advisory:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const removeSelectedRepoFromOrgCodespacesSecret = async (req, res) => {
  try {
    const { org, secretName, repositoryId } = req.params;
    const result =
      await GithubService.removeSelectedRepoFromOrgCodespacesSecret(
        org,
        secretName,
        parseInt(repositoryId, 10),
      );
    res.status(httpStatus.OK).json({ success: true, data: result });
  } catch (error) {
    logger.error(
      `[GitHub Controller] Error removing selected repo from org Codespaces secret:`,
      error,
    );
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

export const GithubController = {
  updateCodeScanningAlert,
  listCodeScanningAlertInstances,
  listCodeScanningAnalyses,
  getCodeScanningAnalysis,
  deleteCodeScanningAnalysis,
  uploadCodeScanningSarif,
  listSecretScanningBypassApprovals,
  createSecretScanningBypassApproval,
  listCommitComments,
  getCommitComment,
  createCommitComment,
  updateCommitComment,
  deleteCommitComment,
  listForks,
  createFork,
  listRepoInvitations,
  deleteRepoInvitation,
  updateRepoInvitation,
  getPagesInfo,
  createPagesSite,
  updatePagesSite,
  deletePagesSite,
  listPagesBuilds,
  getPagesBuildInfo,
  requestPagesBuild,
  listOrgRunnerGroups,
  getOrgRunnerGroup,
  createOrgRunnerGroup,
  updateOrgRunnerGroup,
  deleteOrgRunnerGroup,
  getActionsPermissionsForOrg,
  setActionsPermissionsForOrg,
  getActionsPermissionsForRepo,
  setActionsPermissionsForRepo,
  listSelectedReposForOrgSecret,
  setSelectedReposForOrgSecret,
  addSelectedRepoToOrgSecret,
  removeSelectedRepoFromOrgSecret,
  listSelectedReposForOrgVariable,
  setSelectedReposForOrgVariable,
  addSelectedRepoToOrgVariable,
  removeSelectedRepoFromOrgVariable,
  listSelectedReposForOrgCodespacesSecret,
  setSelectedReposForOrgCodespacesSecret,
  addSelectedRepoToOrgCodespacesSecret,
  getDependabotOrgPublicKey,
  listDependabotOrgSecrets,
  getDependabotOrgSecret,
  createOrUpdateDependabotOrgSecret,
  deleteDependabotOrgSecret,
  listSelectedReposForDependabotOrgSecret,
  setSelectedReposForDependabotOrgSecret,
  addSelectedRepoToDependabotOrgSecret,
  removeSelectedRepoFromDependabotOrgSecret,
  getDependabotRepoPublicKey,
  listDependabotRepoSecrets,
  getDependabotRepoSecret,
  createOrUpdateDependabotRepoSecret,
  deleteDependabotRepoSecret,
  listOrgWebhooks,
  createOrgWebhook,
  getOrgWebhook,
  updateOrgWebhook,
  deleteOrgWebhook,
  pingOrgWebhook,
  listRequestedReviewers,
  requestReviewersForPullRequest,
  removeRequestedReviewersFromPullRequest,
  listPullRequestFiles,
  listAssignees,
  checkAssignee,
  addAssigneesToIssue,
  removeAssigneesFromIssue,
  listReleaseAssets,
  getReleaseAsset,
  updateReleaseAsset,
  deleteReleaseAsset,
  listStargazersForRepo,
  listReposStarredByAuthenticatedUser,
  checkIfRepoIsStarredByUser,
  starRepoForAuthenticatedUser,
  unstarRepoForAuthenticatedUser,
  getRepoSubscription,
  setRepoSubscription,
  deleteRepoSubscription,
  enablePrivateVulnerabilityReporting,
  disablePrivateVulnerabilityReporting,
  enableDependabotAlerts,
  disableDependabotAlerts,
  enableDependabotSecurityUpdates,
  disableDependabotSecurityUpdates,
  listSecurityManagerTeams,
  addSecurityManagerTeam,
  removeSecurityManagerTeam,
  listAutolinks,
  createAutolink,
  getAutolink,
  deleteAutolink,
  getOrgInfo,
  updateOrgSettings,
  getOrgMembership,
  addOrUpdateOrgMembership,
  removeOrgMember,
  listOutsideCollaborators,
  removeOutsideCollaborator,
  convertMemberToOutsideCollaborator,
  listBlockedUsersForOrg,
  checkIfUserBlockedByOrg,
  blockUserForOrg,
  unblockUserForOrg,
  listBlockedUsersForUser,
  checkIfUserBlockedByUser,
  blockUserForUser,
  unblockUserForUser,
  listOrgCodespaces,
  stopCodespace,
  startCodespace,
  deleteOrgCodespace,
  listOrgSecurityAdvisories,
  createOrgSecurityAdvisory,
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
  createOrUpdateCustomProperty,
  getCustomProperty,
  removeCustomProperty,
  listCustomProperties,
  createOrUpdateRepoCustomPropertiesValues,
  getRepoCustomPropertiesValues,
  getRepoRulesets,
  getRepoRuleset,
  createRepoRuleset,
  updateRepoRuleset,
  deleteRepoRuleset,
  getOrgRulesets,
  getOrgRuleset,
  createOrgRuleset,
  updateOrgRuleset,
  deleteOrgRuleset,
  listCopilotSeatsForOrg,
  addCopilotSeatsToOrg,
  removeCopilotSeatsFromOrg,
  getCopilotSeatDetailsForUser,
  listPullRequestReviews,
  getPullRequestReview,
  createPullRequestReview,
  submitPullRequestReview,
  dismissPullRequestReview,
  listIssueComments,
  getIssueComment,
  createIssueComment,
  updateIssueComment,
  deleteIssueComment,
  listEmailsForAuthenticatedUser,
  addEmailsForAuthenticatedUser,
  deleteEmailsForAuthenticatedUser,
  listPublicKeysForAuthenticatedUser,
  addPublicKeyForAuthenticatedUser,
  deletePublicKeyForAuthenticatedUser,
  listClassrooms,
  getClassroom,
  listAssignmentsForClassroom,
  getAssignment,
  listRepoWorkflows,
  getWorkflow,
  listWorkflowRuns,
  getWorkflowRun,
  createWorkflowDispatch,
  listSelfHostedRunnersForOrg,
  listSelfHostedRunnersForRepo,
  getSelfHostedRunnerForOrg,
  getSelfHostedRunnerForRepo,
  deleteSelfHostedRunnerFromOrg,
  deleteSelfHostedRunnerFromRepo,
  listLabelsForRepo,
  getLabel,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelsToIssue,
  removeLabelFromIssue,
  listMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  listDeployKeys,
  getDeployKey,
  addDeployKey,
  deleteDeployKey,
  createCommitStatus,
  listCommitStatusesForRef,
  listReviewComments,
  getReviewComment,
  createReviewComment,
  updateReviewComment,
  deleteReviewComment,
  mergePullRequest,
  checkIfPullRequestMerged,
  listTeamDiscussions,
  getTeamDiscussion,
  createTeamDiscussion,
  updateTeamDiscussion,
  deleteTeamDiscussion,
  listTeamDiscussionComments,
  getTeamDiscussionComment,
  createTeamDiscussionComment,
  updateTeamDiscussionComment,
  deleteTeamDiscussionComment,
  listProvisionedIdentities,
  provisionAndInviteUser,
  getProvisioningInformation,
  replaceProvisionedUser,
  updateProvisionedUser,
  deleteUserFromOrg,
  getCodespacesPublicKeyForAuthenticatedUser,
  listCodespacesSecretsForAuthenticatedUser,
  getCodespacesSecretForAuthenticatedUser,
  createOrUpdateCodespacesSecretForAuthenticatedUser,
  deleteCodespacesSecretForAuthenticatedUser,
  getCodespacesPublicKeyForOrg,
  listCodespacesSecretsForOrg,
  getCodespacesSecretForOrg,
  createOrUpdateCodespacesSecretForOrg,
  deleteCodespacesSecretForOrg,
  getActionsPublicKeyForOrg,
  listOrgSecrets,
  getOrgSecret,
  createOrUpdateOrgSecret,
  deleteOrgSecret,
  listOrgVariables,
  getOrgVariable,
  createOrUpdateOrgVariable,
  deleteOrgVariable,
  getActionsPublicKeyForEnvironment,
  listEnvironmentSecrets,
  getEnvironmentSecret,
  createOrUpdateEnvironmentSecret,
  deleteEnvironmentSecret,
  listEnvironmentVariables,
  getEnvironmentVariable,
  createOrUpdateEnvironmentVariable,
  deleteEnvironmentVariable,
  listSecretScanningAlertsForOrg,
  getSecretScanningAlertForOrg,
  updateSecretScanningAlertForOrg,
  listSecretScanningLocations,
  getEnterpriseActionsPermissions,
  setEnterpriseActionsPermissions,
  listSelfHostedRunnersForEnterprise,
  getSelfHostedRunnerForEnterprise,
  deleteSelfHostedRunnerFromEnterprise,
  getEnterpriseActionsBilling,
  getEnterprisePackagesBilling,
  getEnterpriseSharedStorageBilling,
};

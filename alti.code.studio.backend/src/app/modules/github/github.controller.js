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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const createRepository = async (req, res) => {
    try {
        const repo = await GithubService.createRepository(req.body);
        res.status(httpStatus.CREATED).json({ success: true, data: repo });
    } catch (error) {
        logger.error('[GitHub Controller] Error creating repo:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const getRepository = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const repository = await GithubService.getRepository(owner, repo);
        res.status(httpStatus.OK).json({ success: true, data: repository });
    } catch (error) {
        logger.error('[GitHub Controller] Error getting repo:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const deleteRepository = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const deleted = await GithubService.deleteRepository(owner, repo);
        res.status(httpStatus.OK).json({ success: true, deleted });
    } catch (error) {
        logger.error('[GitHub Controller] Error deleting repo:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const listBranches = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const branches = await GithubService.listBranches(owner, repo);
        res.status(httpStatus.OK).json({ success: true, data: branches });
    } catch (error) {
        logger.error('[GitHub Controller] Error listing branches:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const createIssue = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const issue = await GithubService.createIssue(owner, repo, req.body);
        res.status(httpStatus.CREATED).json({ success: true, data: issue });
    } catch (error) {
        logger.error('[GitHub Controller] Error creating issue:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const getIssue = async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const issue = await GithubService.getIssue(owner, repo, parseInt(number, 10));
        res.status(httpStatus.OK).json({ success: true, data: issue });
    } catch (error) {
        logger.error('[GitHub Controller] Error getting issue:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const updateIssue = async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const issue = await GithubService.updateIssue(owner, repo, parseInt(number, 10), req.body);
        res.status(httpStatus.OK).json({ success: true, data: issue });
    } catch (error) {
        logger.error('[GitHub Controller] Error updating issue:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const createPullRequest = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const pr = await GithubService.createPullRequest(owner, repo, req.body);
        res.status(httpStatus.CREATED).json({ success: true, data: pr });
    } catch (error) {
        logger.error('[GitHub Controller] Error creating PR:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const getPullRequest = async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const pr = await GithubService.getPullRequest(owner, repo, parseInt(number, 10));
        res.status(httpStatus.OK).json({ success: true, data: pr });
    } catch (error) {
        logger.error('[GitHub Controller] Error getting PR:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const mergePullRequest = async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const mergeResult = await GithubService.mergePullRequest(owner, repo, parseInt(number, 10), req.body);
        res.status(httpStatus.OK).json({ success: true, data: mergeResult });
    } catch (error) {
        logger.error('[GitHub Controller] Error merging PR:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const triggerWorkflowDispatch = async (req, res) => {
    try {
        const { owner, repo, workflowId } = req.params;
        const { ref, inputs } = req.body;
        const triggered = await GithubService.triggerWorkflowDispatch(owner, repo, workflowId, ref, inputs);
        res.status(httpStatus.OK).json({ success: true, triggered });
    } catch (error) {
        logger.error('[GitHub Controller] Error triggering workflow dispatch:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const listWorkflowRuns = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const runs = await GithubService.listWorkflowRuns(owner, repo, req.query);
        res.status(httpStatus.OK).json({ success: true, data: runs });
    } catch (error) {
        logger.error('[GitHub Controller] Error listing workflow runs:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const createGist = async (req, res) => {
    try {
        const gist = await GithubService.createGist(req.body);
        res.status(httpStatus.CREATED).json({ success: true, data: gist });
    } catch (error) {
        logger.error('[GitHub Controller] Error creating gist:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const deleteGist = async (req, res) => {
    try {
        const { gistId } = req.params;
        const deleted = await GithubService.deleteGist(gistId);
        res.status(httpStatus.OK).json({ success: true, deleted });
    } catch (error) {
        logger.error('[GitHub Controller] Error deleting gist:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const project = await GithubService.createProject(owner, repo, req.body);
        res.status(httpStatus.CREATED).json({ success: true, data: project });
    } catch (error) {
        logger.error('[GitHub Controller] Error creating project:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
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
    createProject
};

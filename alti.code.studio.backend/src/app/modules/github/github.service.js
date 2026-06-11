import { Octokit } from 'octokit';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

// Initialize Octokit client with direct user-to-server/token credentials
const octokit = new Octokit({
    auth: config.github_token || process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN
});

/**
 * Direct GitHub API Service Wrapper using the official Octokit SDK (No middle layer)
 */
export const GithubService = {
    // ==========================================
    // 1. User Endpoints
    // ==========================================
    async getAuthenticatedUser() {
        logger.info('🐙 [GitHub Service] Fetching authenticated user info');
        try {
            const { data } = await octokit.rest.users.getAuthenticated();
            return data;
        } catch (error) {
            logger.error('Failed to fetch authenticated user:', error);
            throw error;
        }
    },

    // ==========================================
    // 2. Repository Endpoints
    // ==========================================
    async listRepositories(params = {}) {
        logger.info('🐙 [GitHub Service] Listing repositories', params);
        try {
            const { data } = await octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: params.per_page || 30,
                page: params.page || 1,
                visibility: params.visibility
            });
            return data;
        } catch (error) {
            logger.error('Failed to list repositories:', error);
            throw error;
        }
    },

    async createRepository(repoData) {
        logger.info('🐙 [GitHub Service] Creating new repository:', repoData.name);
        try {
            const { data } = await octokit.rest.repos.createForAuthenticatedUser({
                name: repoData.name,
                description: repoData.description,
                private: repoData.private ?? true,
                auto_init: repoData.auto_init ?? true,
                gitignore_template: repoData.gitignore_template,
                license_template: repoData.license_template
            });
            return data;
        } catch (error) {
            logger.error('Failed to create repository:', error);
            throw error;
        }
    },

    async getRepository(owner, repo) {
        logger.info(`🐙 [GitHub Service] Fetching repository: ${owner}/${repo}`);
        try {
            const { data } = await octokit.rest.repos.get({ owner, repo });
            return data;
        } catch (error) {
            logger.error(`Failed to get repository ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async deleteRepository(owner, repo) {
        logger.info(`🐙 [GitHub Service] Deleting repository: ${owner}/${repo}`);
        try {
            const response = await octokit.rest.repos.delete({ owner, repo });
            return response.status === 204;
        } catch (error) {
            logger.error(`Failed to delete repository ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async listBranches(owner, repo) {
        logger.info(`🐙 [GitHub Service] Listing branches for ${owner}/${repo}`);
        try {
            const { data } = await octokit.rest.repos.listBranches({ owner, repo });
            return data;
        } catch (error) {
            logger.error(`Failed to list branches for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    // ==========================================
    // 3. Issue Endpoints
    // ==========================================
    async listIssues(owner, repo, params = {}) {
        logger.info(`🐙 [GitHub Service] Listing issues for ${owner}/${repo}`, params);
        try {
            const { data } = await octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: params.state || 'all',
                per_page: params.per_page || 30,
                page: params.page || 1
            });
            return data;
        } catch (error) {
            logger.error(`Failed to list issues for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async createIssue(owner, repo, issueData) {
        logger.info(`🐙 [GitHub Service] Creating issue in ${owner}/${repo}:`, issueData.title);
        try {
            const { data } = await octokit.rest.issues.create({
                owner,
                repo,
                title: issueData.title,
                body: issueData.body,
                labels: issueData.labels,
                assignees: issueData.assignees
            });
            return data;
        } catch (error) {
            logger.error(`Failed to create issue in ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async getIssue(owner, repo, number) {
        logger.info(`🐙 [GitHub Service] Fetching issue: ${owner}/${repo}#${number}`);
        try {
            const { data } = await octokit.rest.issues.get({ owner, repo, issue_number: number });
            return data;
        } catch (error) {
            logger.error(`Failed to get issue ${owner}/${repo}#${number}:`, error);
            throw error;
        }
    },

    async updateIssue(owner, repo, number, updateData) {
        logger.info(`🐙 [GitHub Service] Updating issue: ${owner}/${repo}#${number}`);
        try {
            const { data } = await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: number,
                title: updateData.title,
                body: updateData.body,
                state: updateData.state,
                labels: updateData.labels,
                assignees: updateData.assignees
            });
            return data;
        } catch (error) {
            logger.error(`Failed to update issue ${owner}/${repo}#${number}:`, error);
            throw error;
        }
    },

    // ==========================================
    // 4. Pull Request Endpoints
    // ==========================================
    async listPullRequests(owner, repo, params = {}) {
        logger.info(`🐙 [GitHub Service] Listing pull requests for ${owner}/${repo}`, params);
        try {
            const { data } = await octokit.rest.pulls.list({
                owner,
                repo,
                state: params.state || 'all',
                per_page: params.per_page || 30,
                page: params.page || 1
            });
            return data;
        } catch (error) {
            logger.error(`Failed to list pull requests for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async createPullRequest(owner, repo, prData) {
        logger.info(`🐙 [GitHub Service] Creating pull request in ${owner}/${repo}:`, prData.title);
        try {
            const { data } = await octokit.rest.pulls.create({
                owner,
                repo,
                title: prData.title,
                head: prData.head,
                base: prData.base || 'main',
                body: prData.body,
                draft: prData.draft
            });
            return data;
        } catch (error) {
            logger.error(`Failed to create pull request in ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async getPullRequest(owner, repo, number) {
        logger.info(`🐙 [GitHub Service] Fetching PR: ${owner}/${repo}#${number}`);
        try {
            const { data } = await octokit.rest.pulls.get({ owner, repo, pull_number: number });
            return data;
        } catch (error) {
            logger.error(`Failed to get pull request ${owner}/${repo}#${number}:`, error);
            throw error;
        }
    },

    async mergePullRequest(owner, repo, number, mergeData = {}) {
        logger.info(`🐙 [GitHub Service] Merging PR: ${owner}/${repo}#${number}`);
        try {
            const { data } = await octokit.rest.pulls.merge({
                owner,
                repo,
                pull_number: number,
                commit_title: mergeData.commit_title,
                commit_message: mergeData.commit_message,
                merge_method: mergeData.merge_method || 'merge'
            });
            return data;
        } catch (error) {
            logger.error(`Failed to merge pull request ${owner}/${repo}#${number}:`, error);
            throw error;
        }
    },

    // ==========================================
    // 5. Actions (Workflow) Endpoints
    // ==========================================
    async listWorkflows(owner, repo) {
        logger.info(`🐙 [GitHub Service] Listing workflows for ${owner}/${repo}`);
        try {
            const { data } = await octokit.rest.actions.listRepoWorkflows({ owner, repo });
            return data;
        } catch (error) {
            logger.error(`Failed to list workflows for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async triggerWorkflowDispatch(owner, repo, workflowId, ref, inputs = {}) {
        logger.info(`🐙 [GitHub Service] Triggering workflow dispatch: ${owner}/${repo} -> ${workflowId} (ref: ${ref})`);
        try {
            const response = await octokit.rest.actions.createWorkflowDispatch({
                owner,
                repo,
                workflow_id: workflowId,
                ref,
                inputs
            });
            return response.status === 204;
        } catch (error) {
            logger.error(`Failed to trigger workflow dispatch for ${owner}/${repo}/${workflowId}:`, error);
            throw error;
        }
    },

    async listWorkflowRuns(owner, repo, params = {}) {
        logger.info(`🐙 [GitHub Service] Listing workflow runs for ${owner}/${repo}`, params);
        try {
            const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
                owner,
                repo,
                branch: params.branch,
                event: params.event,
                status: params.status,
                per_page: params.per_page || 30,
                page: params.page || 1
            });
            return data;
        } catch (error) {
            logger.error(`Failed to list workflow runs for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    // ==========================================
    // 6. Gist Endpoints
    // ==========================================
    async listGists(params = {}) {
        logger.info('🐙 [GitHub Service] Listing gists', params);
        try {
            const { data } = await octokit.rest.gists.list({
                per_page: params.per_page || 30,
                page: params.page || 1
            });
            return data;
        } catch (error) {
            logger.error('Failed to list gists:', error);
            throw error;
        }
    },

    async createGist(gistData) {
        logger.info('🐙 [GitHub Service] Creating new gist');
        try {
            const { data } = await octokit.rest.gists.create({
                files: gistData.files,
                description: gistData.description,
                public: gistData.public ?? false
            });
            return data;
        } catch (error) {
            logger.error('Failed to create gist:', error);
            throw error;
        }
    },

    async deleteGist(gistId) {
        logger.info(`🐙 [GitHub Service] Deleting gist: ${gistId}`);
        try {
            const response = await octokit.rest.gists.delete({ gist_id: gistId });
            return response.status === 204;
        } catch (error) {
            logger.error(`Failed to delete gist ${gistId}:`, error);
            throw error;
        }
    },

    // ==========================================
    // 7. Projects Endpoints
    // ==========================================
    async listProjects(owner, repo, params = {}) {
        logger.info(`🐙 [GitHub Service] Listing projects for ${owner}/${repo}`);
        try {
            const { data } = await octokit.rest.projects.listForRepo({
                owner,
                repo,
                state: params.state || 'open',
                per_page: params.per_page || 30,
                page: params.page || 1
            });
            return data;
        } catch (error) {
            logger.error(`Failed to list projects for ${owner}/${repo}:`, error);
            throw error;
        }
    },

    async createProject(owner, repo, projectData) {
        logger.info(`🐙 [GitHub Service] Creating project in ${owner}/${repo}:`, projectData.name);
        try {
            const { data } = await octokit.rest.projects.createForRepo({
                owner,
                repo,
                name: projectData.name,
                body: projectData.body
            });
            return data;
        } catch (error) {
            logger.error(`Failed to create project in ${owner}/${repo}:`, error);
            throw error;
        }
    }
};

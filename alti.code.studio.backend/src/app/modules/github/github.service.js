import { Octokit } from 'octokit';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

// Initialize Octokit client with direct user-to-server/token credentials
const octokit = new Octokit({
  auth:
    config.github_token ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
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
        visibility: params.visibility,
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
        license_template: repoData.license_template,
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
    logger.info(
      `🐙 [GitHub Service] Listing issues for ${owner}/${repo}`,
      params,
    );
    try {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: params.state || 'all',
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list issues for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createIssue(owner, repo, issueData) {
    logger.info(
      `🐙 [GitHub Service] Creating issue in ${owner}/${repo}:`,
      issueData.title,
    );
    try {
      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels,
        assignees: issueData.assignees,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create issue in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getIssue(owner, repo, number) {
    logger.info(
      `🐙 [GitHub Service] Fetching issue: ${owner}/${repo}#${number}`,
    );
    try {
      const { data } = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: number,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get issue ${owner}/${repo}#${number}:`, error);
      throw error;
    }
  },

  async updateIssue(owner, repo, number, updateData) {
    logger.info(
      `🐙 [GitHub Service] Updating issue: ${owner}/${repo}#${number}`,
    );
    try {
      const { data } = await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: number,
        title: updateData.title,
        body: updateData.body,
        state: updateData.state,
        labels: updateData.labels,
        assignees: updateData.assignees,
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
    logger.info(
      `🐙 [GitHub Service] Listing pull requests for ${owner}/${repo}`,
      params,
    );
    try {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: params.state || 'all',
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list pull requests for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createPullRequest(owner, repo, prData) {
    logger.info(
      `🐙 [GitHub Service] Creating pull request in ${owner}/${repo}:`,
      prData.title,
    );
    try {
      const { data } = await octokit.rest.pulls.create({
        owner,
        repo,
        title: prData.title,
        head: prData.head,
        base: prData.base || 'main',
        body: prData.body,
        draft: prData.draft,
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
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: number,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get pull request ${owner}/${repo}#${number}:`,
        error,
      );
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
        merge_method: mergeData.merge_method || 'merge',
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to merge pull request ${owner}/${repo}#${number}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 5. Actions (Workflow) Endpoints
  // ==========================================
  async listWorkflows(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing workflows for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.actions.listRepoWorkflows({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list workflows for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async triggerWorkflowDispatch(owner, repo, workflowId, ref, inputs = {}) {
    logger.info(
      `🐙 [GitHub Service] Triggering workflow dispatch: ${owner}/${repo} -> ${workflowId} (ref: ${ref})`,
    );
    try {
      const response = await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs,
      });
      return response.status === 204;
    } catch (error) {
      logger.error(
        `Failed to trigger workflow dispatch for ${owner}/${repo}/${workflowId}:`,
        error,
      );
      throw error;
    }
  },

  async listWorkflowRuns(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing workflow runs for ${owner}/${repo}`,
      params,
    );
    try {
      const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch: params.branch,
        event: params.event,
        status: params.status,
        per_page: params.per_page || 30,
        page: params.page || 1,
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
        page: params.page || 1,
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
        public: gistData.public ?? false,
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
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list projects for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createProject(owner, repo, projectData) {
    logger.info(
      `🐙 [GitHub Service] Creating project in ${owner}/${repo}:`,
      projectData.name,
    );
    try {
      const { data } = await octokit.rest.projects.createForRepo({
        owner,
        repo,
        name: projectData.name,
        body: projectData.body,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create project in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 8. GraphQL API
  // ==========================================
  async graphql(query, variables = {}) {
    logger.info('🐙 [GitHub Service] Executing GraphQL query');
    try {
      const data = await octokit.graphql(query, variables);
      return data;
    } catch (error) {
      logger.error('Failed to execute GraphQL query:', error);
      throw error;
    }
  },

  // ==========================================
  // 9. Search API
  // ==========================================
  async searchRepositories(q, params = {}) {
    logger.info('🐙 [GitHub Service] Searching repositories:', q);
    try {
      const { data } = await octokit.rest.search.repos({
        q,
        sort: params.sort,
        order: params.order,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to search repositories:', error);
      throw error;
    }
  },

  async searchCode(q, params = {}) {
    logger.info('🐙 [GitHub Service] Searching code:', q);
    try {
      const { data } = await octokit.rest.search.code({
        q,
        sort: params.sort,
        order: params.order,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to search code:', error);
      throw error;
    }
  },

  async searchIssues(q, params = {}) {
    logger.info('🐙 [GitHub Service] Searching issues:', q);
    try {
      const { data } = await octokit.rest.search.issuesAndPullRequests({
        q,
        sort: params.sort,
        order: params.order,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to search issues:', error);
      throw error;
    }
  },

  async searchUsers(q, params = {}) {
    logger.info('🐙 [GitHub Service] Searching users:', q);
    try {
      const { data } = await octokit.rest.search.users({
        q,
        sort: params.sort,
        order: params.order,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  },

  // ==========================================
  // 10. Git Data / Contents API
  // ==========================================
  async getFileContent(owner, repo, path, ref) {
    logger.info(
      `🐙 [GitHub Service] Fetching file content: ${owner}/${repo}/${path} (ref: ${ref})`,
    );
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch file content for ${owner}/${repo}/${path}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateFile(owner, repo, path, fileData) {
    logger.info(
      `🐙 [GitHub Service] Committing file: ${owner}/${repo}/${path}`,
    );
    try {
      const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: fileData.message,
        content: fileData.content,
        sha: fileData.sha,
        branch: fileData.branch,
        committer: fileData.committer,
        author: fileData.author,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to commit file to ${owner}/${repo}/${path}:`, error);
      throw error;
    }
  },

  async deleteFile(owner, repo, path, fileData) {
    logger.info(`🐙 [GitHub Service] Deleting file: ${owner}/${repo}/${path}`);
    try {
      const { data } = await octokit.rest.repos.deleteFile({
        owner,
        repo,
        path,
        message: fileData.message,
        sha: fileData.sha,
        branch: fileData.branch,
        committer: fileData.committer,
        author: fileData.author,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to delete file from ${owner}/${repo}/${path}:`,
        error,
      );
      throw error;
    }
  },

  async listCommits(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing commits for ${owner}/${repo}`,
      params,
    );
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: params.sha,
        path: params.path,
        author: params.author,
        since: params.since,
        until: params.until,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list commits for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async compareCommits(owner, repo, base, head) {
    logger.info(
      `🐙 [GitHub Service] Comparing ${base}...${head} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to compare commits in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 11. Releases API
  // ==========================================
  async listReleases(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing releases for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list releases for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createRelease(owner, repo, releaseData) {
    logger.info(
      `🐙 [GitHub Service] Creating release in ${owner}/${repo}:`,
      releaseData.tag_name,
    );
    try {
      const { data } = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: releaseData.tag_name,
        target_commitish: releaseData.target_commitish,
        name: releaseData.name,
        body: releaseData.body,
        draft: releaseData.draft,
        prerelease: releaseData.prerelease,
        discussion_category_name: releaseData.discussion_category_name,
        generate_release_notes: releaseData.generate_release_notes,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create release in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getLatestRelease(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Fetching latest release for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.getLatestRelease({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get latest release for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 12. Collaborators API
  // ==========================================
  async listCollaborators(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing collaborators for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.listCollaborators({
        owner,
        repo,
        affiliation: params.affiliation,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list collaborators for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async addCollaborator(owner, repo, username, permission = 'push') {
    logger.info(
      `🐙 [GitHub Service] Adding collaborator ${username} to ${owner}/${repo} (permission: ${permission})`,
    );
    try {
      const { data } = await octokit.rest.repos.addCollaborator({
        owner,
        repo,
        username,
        permission,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to add collaborator ${username} to ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async removeCollaborator(owner, repo, username) {
    logger.info(
      `🐙 [GitHub Service] Removing collaborator ${username} from ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.repos.removeCollaborator({
        owner,
        repo,
        username,
      });
      return response.status === 204;
    } catch (error) {
      logger.error(
        `Failed to remove collaborator ${username} from ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 13. Git Database Plumbing API
  // ==========================================
  async getRef(owner, repo, ref) {
    logger.info(
      `🐙 [GitHub Service] Fetching Git ref: ${ref} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.git.getRef({ owner, repo, ref });
      return data;
    } catch (error) {
      logger.error(`Failed to get ref ${ref} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createRef(owner, repo, refData) {
    logger.info(
      `🐙 [GitHub Service] Creating Git ref: ${refData.ref} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: refData.ref,
        sha: refData.sha,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create ref for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateRef(owner, repo, ref, refData) {
    logger.info(
      `🐙 [GitHub Service] Updating Git ref: ${ref} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.git.updateRef({
        owner,
        repo,
        ref,
        sha: refData.sha,
        force: refData.force ?? false,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update ref ${ref} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createBlob(owner, repo, blobData) {
    logger.info(`🐙 [GitHub Service] Creating Git blob for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: blobData.content,
        encoding: blobData.encoding || 'utf-8',
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create blob for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createTree(owner, repo, treeData) {
    logger.info(`🐙 [GitHub Service] Creating Git tree for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.git.createTree({
        owner,
        repo,
        tree: treeData.tree,
        base_tree: treeData.base_tree,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create tree for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createCommit(owner, repo, commitData) {
    logger.info(`🐙 [GitHub Service] Creating Git commit for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: commitData.message,
        tree: commitData.tree,
        parents: commitData.parents,
        author: commitData.author,
        committer: commitData.committer,
        signature: commitData.signature,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create commit for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 14. Organizations & Teams API
  // ==========================================
  async listOrganizations(params = {}) {
    logger.info('🐙 [GitHub Service] Listing organizations');
    try {
      const { data } = await octokit.rest.orgs.listForAuthenticatedUser({
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to list organizations:', error);
      throw error;
    }
  },

  async listTeams(org, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing teams for organization: ${org}`);
    try {
      const { data } = await octokit.rest.teams.list({
        org,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list teams for ${org}:`, error);
      throw error;
    }
  },

  async listTeamMembers(org, teamSlug) {
    logger.info(`🐙 [GitHub Service] Listing team members: ${org}/${teamSlug}`);
    try {
      const { data } = await octokit.rest.teams.listMembersInOrg({
        org,
        team_slug: teamSlug,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list team members for ${org}/${teamSlug}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 15. Repository Webhooks API
  // ==========================================
  async listWebhooks(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing webhooks for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listWebhooks({
        owner,
        repo,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list webhooks for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createWebhook(owner, repo, hookData) {
    logger.info(`🐙 [GitHub Service] Creating webhook for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        name: hookData.name || 'web',
        config: hookData.config,
        events: hookData.events,
        active: hookData.active ?? true,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create webhook for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteWebhook(owner, repo, hookId) {
    logger.info(
      `🐙 [GitHub Service] Deleting webhook ${hookId} for ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookId,
      });
      return response.status === 204;
    } catch (error) {
      logger.error(
        `Failed to delete webhook ${hookId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 16. Actions Secrets & Variables API
  // ==========================================
  async getActionsPublicKey(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions public key for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getRepoPublicKey({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch Actions public key for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateRepoSecret(owner, repo, secretName, secretData) {
    logger.info(
      `🐙 [GitHub Service] Creating or updating Actions secret ${secretName} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: secretName,
        encrypted_value: secretData.encrypted_value,
        key_id: secretData.key_id,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to set secret ${secretName} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listRepoVariables(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing variables for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.actions.listRepoVariables({
        owner,
        repo,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list variables for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createRepoVariable(owner, repo, name, value) {
    logger.info(
      `🐙 [GitHub Service] Creating variable ${name} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.createRepoVariable({
        owner,
        repo,
        name,
        value,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create variable ${name} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async updateRepoVariable(owner, repo, name, value) {
    logger.info(
      `🐙 [GitHub Service] Updating variable ${name} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.updateRepoVariable({
        owner,
        repo,
        name,
        value,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update variable ${name} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 17. Codespaces API
  // ==========================================
  async listCodespaces(params = {}) {
    logger.info('🐙 [GitHub Service] Listing Codespaces');
    try {
      const { data } = await octokit.rest.codespaces.listForAuthenticatedUser({
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to list Codespaces:', error);
      throw error;
    }
  },

  async createCodespace(owner, repo, codespaceData) {
    logger.info(`🐙 [GitHub Service] Creating Codespace for ${owner}/${repo}`);
    try {
      const { data } =
        await octokit.rest.codespaces.createWithRepoForAuthenticatedUser({
          owner,
          repo,
          ref: codespaceData.ref,
          machine: codespaceData.machine,
          devcontainer_path: codespaceData.devcontainer_path,
          multi_repo_permissions_opt_out:
            codespaceData.multi_repo_permissions_opt_out,
        });
      return data;
    } catch (error) {
      logger.error(`Failed to create Codespace for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteCodespace(codespaceName) {
    logger.info(`🐙 [GitHub Service] Deleting Codespace: ${codespaceName}`);
    try {
      const response = await octokit.rest.codespaces.deleteForAuthenticatedUser(
        {
          codespace_name: codespaceName,
        },
      );
      return response.status === 204;
    } catch (error) {
      logger.error(`Failed to delete Codespace ${codespaceName}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 18. Dependabot Alerts API
  // ==========================================
  async listDependabotAlerts(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing Dependabot alerts for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.dependabot.listAlertsForRepo({
        owner,
        repo,
        state: params.state,
        severity: params.severity,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list Dependabot alerts for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 19. Copilot API
  // ==========================================
  async getCopilotBillingForUser(username) {
    logger.info(
      `🐙 [GitHub Service] Fetching Copilot details for user: ${username}`,
    );
    try {
      const { data } = await octokit.rest.copilot.getBillingDetailsForUser({
        username,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch Copilot billing details for ${username}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 20. Discussions API (GraphQL-backed)
  // ==========================================
  async listDiscussions(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing discussions for ${owner}/${repo}`);
    try {
      const query = `
        query($owner: String!, $repo: String!, $first: Int) {
          repository(owner: $owner, name: $repo) {
            discussions(first: $first) {
              nodes {
                id
                number
                title
                body
                createdAt
                url
              }
            }
          }
        }
      `;
      const result = await octokit.graphql(query, {
        owner,
        repo,
        first: params.per_page || 30,
      });
      return result.repository?.discussions?.nodes || [];
    } catch (error) {
      logger.error(`Failed to list discussions for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getDiscussion(owner, repo, discussionNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching discussion #${discussionNumber} for ${owner}/${repo}`,
    );
    try {
      const query = `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            discussion(number: $number) {
              id
              number
              title
              body
              createdAt
              url
              comments(first: 30) {
                nodes {
                  id
                  body
                  createdAt
                }
              }
            }
          }
        }
      `;
      const result = await octokit.graphql(query, {
        owner,
        repo,
        number: parseInt(discussionNumber, 10),
      });
      return result.repository?.discussion || null;
    } catch (error) {
      logger.error(
        `Failed to get discussion #${discussionNumber} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createDiscussion(owner, repo, categoryId, title, body) {
    logger.info(
      `🐙 [GitHub Service] Creating discussion: "${title}" in ${owner}/${repo}`,
    );
    try {
      // 1. Fetch the Repository Node ID
      const repoQuery = `
        query($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            id
          }
        }
      `;
      const repoResult = await octokit.graphql(repoQuery, { owner, repo });
      const repositoryId = repoResult.repository?.id;

      if (!repositoryId) {
        throw new Error(`Repository ID not found for ${owner}/${repo}`);
      }

      // 2. Create the Discussion
      const mutation = `
        mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
          createDiscussion(input: {repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body}) {
            discussion {
              id
              number
              url
            }
          }
        }
      `;
      const result = await octokit.graphql(mutation, {
        repositoryId,
        categoryId,
        title,
        body,
      });
      return result.createDiscussion?.discussion || null;
    } catch (error) {
      logger.error(`Failed to create discussion for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createDiscussionComment(owner, repo, discussionId, body) {
    logger.info(
      `🐙 [GitHub Service] Creating comment on discussion ID: ${discussionId} in ${owner}/${repo}`,
    );
    try {
      const mutation = `
        mutation($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
            comment {
              id
              body
              createdAt
            }
          }
        }
      `;
      const result = await octokit.graphql(mutation, {
        discussionId,
        body,
      });
      return result.addDiscussionComment?.comment || null;
    } catch (error) {
      logger.error(
        `Failed to create discussion comment in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 21. Checks API
  // ==========================================
  async createCheckRun(owner, repo, checkData) {
    logger.info(
      `🐙 [GitHub Service] Creating check run: "${checkData.name}" for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.checks.create({
        owner,
        repo,
        name: checkData.name,
        head_sha: checkData.head_sha,
        status: checkData.status,
        conclusion: checkData.conclusion,
        completed_at: checkData.completed_at,
        output: checkData.output,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create check run for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateCheckRun(owner, repo, checkRunId, checkData) {
    logger.info(
      `🐙 [GitHub Service] Updating check run #${checkRunId} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.checks.update({
        owner,
        repo,
        check_run_id: checkRunId,
        status: checkData.status,
        conclusion: checkData.conclusion,
        completed_at: checkData.completed_at,
        output: checkData.output,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update check run ${checkRunId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listCheckRunsForRef(owner, repo, ref) {
    logger.info(
      `🐙 [GitHub Service] Listing check runs for ref: ${ref} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.checks.listForRef({
        owner,
        repo,
        ref,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list check runs for ${ref} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createCheckSuite(owner, repo, suiteData) {
    logger.info(
      `🐙 [GitHub Service] Creating check suite for SHA: ${suiteData.head_sha} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.checks.createSuite({
        owner,
        repo,
        head_sha: suiteData.head_sha,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create check suite in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 22. Deployments & Environments API
  // ==========================================
  async listDeployments(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing deployments for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listDeployments({
        owner,
        repo,
        sha: params.sha,
        ref: params.ref,
        task: params.task,
        environment: params.environment,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list deployments for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createDeployment(owner, repo, deploymentData) {
    logger.info(`🐙 [GitHub Service] Creating deployment for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createDeployment({
        owner,
        repo,
        ref: deploymentData.ref,
        task: deploymentData.task,
        auto_merge: deploymentData.auto_merge,
        required_contexts: deploymentData.required_contexts,
        payload: deploymentData.payload,
        environment: deploymentData.environment,
        description: deploymentData.description,
        transient_environment: deploymentData.transient_environment,
        production_environment: deploymentData.production_environment,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create deployment for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createDeploymentStatus(owner, repo, deploymentId, statusData) {
    logger.info(
      `🐙 [GitHub Service] Creating deployment status for deployment #${deploymentId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.createDeploymentStatus({
        owner,
        repo,
        deployment_id: deploymentId,
        state: statusData.state,
        target_url: statusData.target_url,
        log_url: statusData.log_url,
        description: statusData.description,
        environment: statusData.environment,
        environment_url: statusData.environment_url,
        auto_inactive: statusData.auto_inactive,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create deployment status for deployment #${deploymentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listEnvironments(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing environments for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.listEnvironments({
        owner,
        repo,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list environments for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createOrUpdateEnvironment(
    owner,
    repo,
    environmentName,
    environmentData = {},
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating environment "${environmentName}" for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.createOrUpdateEnvironment({
        owner,
        repo,
        environment_name: environmentName,
        wait_timer: environmentData.wait_timer,
        prevent_self_review: environmentData.prevent_self_review,
        reviewers: environmentData.reviewers,
        deployment_branch_policy: environmentData.deployment_branch_policy,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to set environment "${environmentName}" for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 23. Code & Secret Scanning API
  // ==========================================
  async listCodeScanningAlerts(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing Code Scanning alerts for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: params.state,
        severity: params.severity,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list Code Scanning alerts for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getCodeScanningAlert(owner, repo, alertNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching Code Scanning alert #${alertNumber} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.codeScanning.getAlert({
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Code Scanning alert #${alertNumber} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listSecretScanningAlerts(owner, repo, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing Secret Scanning alerts for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.secretScanning.listAlertsForRepo({
        owner,
        repo,
        state: params.state,
        secret_type: params.secret_type,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list Secret Scanning alerts for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getSecretScanningAlert(owner, repo, alertNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching Secret Scanning alert #${alertNumber} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.secretScanning.getAlert({
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Secret Scanning alert #${alertNumber} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 24. Actions Artifacts & Workflow Jobs API
  // ==========================================
  async listWorkflowJobs(owner, repo, runId, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing workflow jobs for run #${runId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: parseInt(runId, 10),
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list workflow jobs for run #${runId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listWorkflowRunArtifacts(owner, repo, runId, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing workflow artifacts for run #${runId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listWorkflowRunArtifacts({
        owner,
        repo,
        run_id: parseInt(runId, 10),
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list workflow artifacts for run #${runId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async downloadWorkflowArtifact(owner, repo, artifactId) {
    logger.info(
      `🐙 [GitHub Service] Downloading workflow artifact #${artifactId} for ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: parseInt(artifactId, 10),
        archive_format: 'zip',
      });
      return { url: response.url };
    } catch (error) {
      logger.error(
        `Failed to download workflow artifact #${artifactId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },
  // ==========================================
  // 25. GitHub Apps & Installations API
  // ==========================================
  async getAppAuthenticated() {
    logger.info('🐙 [GitHub Service] Fetching authenticated GitHub App info');
    try {
      const { data } = await octokit.rest.apps.getAuthenticated();
      return data;
    } catch (error) {
      logger.error('Failed to fetch authenticated GitHub App:', error);
      throw error;
    }
  },

  async listAppInstallations(params = {}) {
    logger.info('🐙 [GitHub Service] Listing GitHub App installations');
    try {
      const { data } = await octokit.rest.apps.listInstallations({
        per_page: params.per_page || 30,
        page: params.page || 1,
        since: params.since,
        outdated: params.outdated,
      });
      return data;
    } catch (error) {
      logger.error('Failed to list GitHub App installations:', error);
      throw error;
    }
  },

  async getAppInstallation(installationId) {
    logger.info(
      `🐙 [GitHub Service] Fetching GitHub App installation #${installationId}`,
    );
    try {
      const { data } = await octokit.rest.apps.getInstallation({
        installation_id: parseInt(installationId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get GitHub App installation #${installationId}:`,
        error,
      );
      throw error;
    }
  },

  async listAppReposAccessible(installationId, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing accessible repositories for installation #${installationId}`,
    );
    try {
      const { data } =
        await octokit.rest.apps.listReposAccessibleToInstallation({
          installation_id: parseInt(installationId, 10),
          per_page: params.per_page || 30,
          page: params.page || 1,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list accessible repositories for installation #${installationId}:`,
        error,
      );
      throw error;
    }
  },

  async createAppInstallationAccessToken(installationId) {
    logger.info(
      `🐙 [GitHub Service] Creating access token for installation #${installationId}`,
    );
    try {
      const { data } = await octokit.rest.apps.createInstallationAccessToken({
        installation_id: parseInt(installationId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create access token for installation #${installationId}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 26. Resource Billing API
  // ==========================================
  async getOrgActionsBilling(org) {
    logger.info(`🐙 [GitHub Service] Fetching Actions billing for org: ${org}`);
    try {
      const { data } = await octokit.rest.billing.getGithubActionsBillingOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to fetch Actions billing for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgPackagesBilling(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching Packages billing for org: ${org}`,
    );
    try {
      const { data } = await octokit.rest.billing.getGithubPackagesBillingOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to fetch Packages billing for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgSharedStorageBilling(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching Shared Storage billing for org: ${org}`,
    );
    try {
      const { data } = await octokit.rest.billing.getSharedStorageBillingOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch Shared Storage billing for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 27. Enterprise Admin & Auditing API
  // ==========================================
  async getEnterpriseAuditLog(enterprise, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Fetching Audit Log for enterprise: ${enterprise}`,
    );
    try {
      const { data } = await octokit.request(
        'GET /enterprises/{enterprise}/audit-log',
        {
          enterprise,
          phrase: params.phrase,
          include: params.include,
          per_page: params.per_page || 30,
          page: params.page || 1,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch Audit Log for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async listEnterpriseMembers(enterprise, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing members for enterprise: ${enterprise}`,
    );
    try {
      const { data } = await octokit.request(
        'GET /enterprises/{enterprise}/members',
        {
          enterprise,
          per_page: params.per_page || 30,
          page: params.page || 1,
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list members for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 28. Activity Events API
  // ==========================================
  async listPublicEvents(params = {}) {
    logger.info('🐙 [GitHub Service] Listing public events');
    try {
      const { data } = await octokit.rest.activity.listPublicEvents({
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error('Failed to list public events:', error);
      throw error;
    }
  },

  async listRepoEvents(owner, repo, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing events for repo ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.activity.listRepoEvents({
        owner,
        repo,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list events for repo ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listOrgEvents(org, username, params = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing events for org ${org} and user ${username}`,
    );
    try {
      const { data } =
        await octokit.rest.activity.listOrgEventsForAuthenticatedUser({
          org,
          username,
          per_page: params.per_page || 30,
          page: params.page || 1,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list events for org ${org} and user ${username}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 29. Interaction Limits API
  // ==========================================
  async getRepoInteractionLimits(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Fetching interaction limits for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.interactions.getRestrictionsForRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get interaction limits for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async setRepoInteractionLimits(owner, repo, limitData = {}) {
    logger.info(
      `🐙 [GitHub Service] Setting interaction limits for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.interactions.setRestrictionsForRepo({
        owner,
        repo,
        limit: limitData.limit,
        expiry: limitData.expiry,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to set interaction limits for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async removeRepoInteractionLimits(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Removing interaction limits for ${owner}/${repo}`,
    );
    try {
      const { data } =
        await octokit.rest.interactions.removeRestrictionsForRepo({
          owner,
          repo,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to remove interaction limits for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },
};

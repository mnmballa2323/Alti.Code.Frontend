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

  // ==========================================
  // 30. Code Security (Advisories & Configurations)
  // ==========================================
  async listGlobalAdvisories(params = {}) {
    logger.info('🐙 [GitHub Service] Listing global security advisories');
    try {
      const { data } =
        await octokit.rest.securityAdvisories.listGlobalAdvisories({
          per_page: params.per_page || 30,
          page: params.page || 1,
          severity: params.severity,
          cve: params.cve,
          ghsa_id: params.ghsa_id,
        });
      return data;
    } catch (error) {
      logger.error('Failed to list global advisories:', error);
      throw error;
    }
  },

  async getRepositoryAdvisory(owner, repo, ghsaId) {
    logger.info(
      `🐙 [GitHub Service] Fetching repository advisory ${ghsaId} for ${owner}/${repo}`,
    );
    try {
      const { data } =
        await octokit.rest.securityAdvisories.getRepositoryAdvisory({
          owner,
          repo,
          ghsa_id: ghsaId,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get repository advisory ${ghsaId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getOrgSecurityConfigurations(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching security configurations for org: ${org}`,
    );
    try {
      const { data } = await octokit.rest.codeSecurity.getConfigurationsForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch security configurations for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 31. Dependency Graph (BOM / Manifests)
  // ==========================================
  async exportSbom(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Exporting SBOM for repository ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.dependencyGraph.exportSbom({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to export SBOM for repository ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 32. Packages (Registries & Metadata)
  // ==========================================
  async listOrgPackages(org, params = {}) {
    logger.info(`🐙 [GitHub Service] Listing packages for organization ${org}`);
    try {
      const { data } = await octokit.rest.packages.listPackagesForOrganization({
        org,
        package_type: params.package_type,
        visibility: params.visibility,
        per_page: params.per_page || 30,
        page: params.page || 1,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list packages for org ${org}:`, error);
      throw error;
    }
  },

  async getPackageVersions(org, packageName) {
    logger.info(
      `🐙 [GitHub Service] Fetching package versions for ${packageName} under org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
          org,
          package_name: packageName,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch versions for package ${packageName} under org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 33. OIDC (Actions Custom Claims)
  // ==========================================
  async getOidcCustomSubTemplateForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Getting OIDC custom sub template for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.oidc.getOidcCustomSubTemplateForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get OIDC sub template for org ${org}:`, error);
      throw error;
    }
  },

  async updateOidcCustomSubTemplateForOrg(org, template = {}) {
    logger.info(
      `🐙 [GitHub Service] Updating OIDC custom sub template for org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.oidc.updateOidcCustomSubTemplateForOrg({
          org,
          include_claim_keys: template.include_claim_keys,
        });
      return data;
    } catch (error) {
      logger.error(`Failed to update OIDC sub template for org ${org}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 34. Migrations (Import/Export)
  // ==========================================
  async startOrgMigration(org, repositories, params = {}) {
    logger.info(`🐙 [GitHub Service] Starting migration for org ${org}`);
    try {
      const { data } = await octokit.rest.migrations.startForOrg({
        org,
        repositories,
        lock_repositories: params.lock_repositories,
        exclude_attachments: params.exclude_attachments,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to start migration for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgMigrationStatus(org, migrationId) {
    logger.info(
      `🐙 [GitHub Service] Getting status of migration #${migrationId} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.migrations.getStatusForOrg({
        org,
        migration_id: parseInt(migrationId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get migration #${migrationId} status for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 35. Emojis, Gitignore templates, Licenses
  // ==========================================
  async getEmojis() {
    logger.info('🐙 [GitHub Service] Fetching emojis');
    try {
      const { data } = await octokit.rest.emojis.get();
      return data;
    } catch (error) {
      logger.error('Failed to fetch emojis:', error);
      throw error;
    }
  },

  async getGitignoreTemplates() {
    logger.info('🐙 [GitHub Service] Fetching gitignore templates');
    try {
      const { data } = await octokit.rest.gitignore.getAllTemplates();
      return data;
    } catch (error) {
      logger.error('Failed to fetch gitignore templates:', error);
      throw error;
    }
  },

  async getGitignoreTemplate(name) {
    logger.info(`🐙 [GitHub Service] Fetching gitignore template: ${name}`);
    try {
      const { data } = await octokit.rest.gitignore.getTemplate({
        name,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get gitignore template ${name}:`, error);
      throw error;
    }
  },

  async getRepoLicense(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Fetching repository license for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.licenses.getForRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get license for repository ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 36. Rate Limit, Meta, and Markdown
  // ==========================================
  async getRateLimit() {
    logger.info('🐙 [GitHub Service] Fetching rate limit status');
    try {
      const { data } = await octokit.rest.rateLimit.get();
      return data;
    } catch (error) {
      logger.error('Failed to fetch rate limit status:', error);
      throw error;
    }
  },

  async getMetaServerInfo() {
    logger.info('🐙 [GitHub Service] Fetching server metadata');
    try {
      const { data } = await octokit.rest.meta.get();
      return data;
    } catch (error) {
      logger.error('Failed to fetch server metadata:', error);
      throw error;
    }
  },

  async renderMarkdown(text, params = {}) {
    logger.info('🐙 [GitHub Service] Rendering markdown text');
    try {
      const { data } = await octokit.rest.markdown.render({
        text,
        mode: params.mode,
        context: params.context,
      });
      return data;
    } catch (error) {
      logger.error('Failed to render markdown text:', error);
      throw error;
    }
  },

  // ==========================================
  // 37. Codes of Conduct API
  // ==========================================
  async getAllCodesOfConduct() {
    logger.info('🐙 [GitHub Service] Fetching all Codes of Conduct');
    try {
      const { data } = await octokit.rest.codesOfConduct.getAllCodesOfConduct();
      return data;
    } catch (error) {
      logger.error('Failed to get all Codes of Conduct:', error);
      throw error;
    }
  },

  async getConductCode(key) {
    logger.info(`🐙 [GitHub Service] Fetching conduct code: ${key}`);
    try {
      const { data } = await octokit.rest.codesOfConduct.getConductCode({
        key,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get conduct code ${key}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 38. Private Registries API
  // ==========================================
  async listOrgPrivateRegistries(org) {
    logger.info(
      `🐙 [GitHub Service] Listing private registries for org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.privateRegistries.listOrgPrivateRegistries({
          org,
        });
      return data;
    } catch (error) {
      logger.error(`Failed to list private registries for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgPrivateRegistry(org, secretName) {
    logger.info(
      `🐙 [GitHub Service] Fetching private registry configuration ${secretName} for org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.privateRegistries.getOrgPrivateRegistry({
          org,
          secret_name: secretName,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get private registry configuration ${secretName} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 39. Reactions API
  // ==========================================
  async createReactionForIssue(owner, repo, issueNumber, content) {
    logger.info(
      `🐙 [GitHub Service] Creating reaction "${content}" on issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.reactions.createForIssue({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
        content,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create reaction on issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listReactionsForIssue(owner, repo, issueNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing reactions on issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.reactions.listForIssue({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list reactions on issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteReactionForIssue(owner, repo, issueNumber, reactionId) {
    logger.info(
      `🐙 [GitHub Service] Deleting reaction #${reactionId} on issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.reactions.deleteForIssue({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
        reaction_id: parseInt(reactionId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to delete reaction #${reactionId} on issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 40. Hosted Compute (Org Runner Network settings)
  // ==========================================
  async listNetworkConfigurationsForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Listing network configurations for hosted compute in org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.hostedCompute.listNetworkConfigurationsForOrg({
          org,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list network configurations for hosted compute in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getNetworkSettingsForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching network settings for hosted compute in org ${org}`,
    );
    try {
      const { data } =
        await octokit.rest.hostedCompute.getNetworkSettingsForOrg({
          org,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch network settings for hosted compute in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 41. Campaigns
  // ==========================================
  async listOrgCampaigns(org) {
    logger.info(`🐙 [GitHub Service] Listing campaigns for org ${org}`);
    try {
      const { data } = await octokit.rest.campaigns.listOrgCampaigns({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list campaigns for org ${org}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 42. Custom Properties API
  // ==========================================
  async createOrUpdateCustomProperty(org, propertyName, attributes) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating custom property ${propertyName} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.orgs.createOrUpdateCustomProperty({
        org,
        custom_property_name: propertyName,
        ...attributes,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create/update custom property ${propertyName} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getCustomProperty(org, propertyName) {
    logger.info(
      `🐙 [GitHub Service] Fetching custom property ${propertyName} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.orgs.getCustomProperty({
        org,
        custom_property_name: propertyName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get custom property ${propertyName} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async removeCustomProperty(org, propertyName) {
    logger.info(
      `🐙 [GitHub Service] Removing custom property ${propertyName} for org ${org}`,
    );
    try {
      const response = await octokit.rest.orgs.removeCustomProperty({
        org,
        custom_property_name: propertyName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to remove custom property ${propertyName} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async listCustomProperties(org) {
    logger.info(`🐙 [GitHub Service] Listing custom properties for org ${org}`);
    try {
      const { data } = await octokit.rest.orgs.listCustomProperties({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list custom properties for org ${org}:`, error);
      throw error;
    }
  },

  async createOrUpdateRepoCustomPropertiesValues(owner, repo, properties) {
    logger.info(
      `🐙 [GitHub Service] Setting custom properties values for ${owner}/${repo}`,
    );
    try {
      const { data } =
        await octokit.rest.repos.createOrUpdateCustomPropertiesValues({
          owner,
          repo,
          properties,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to set custom properties values for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getRepoCustomPropertiesValues(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Fetching custom properties values for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.getCustomPropertiesValues({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch custom properties values for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 43. Rulesets API
  // ==========================================
  async getRepoRulesets(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing rulesets for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.getRepoRulesets({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list rulesets for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getRepoRuleset(owner, repo, rulesetId) {
    logger.info(
      `🐙 [GitHub Service] Fetching ruleset #${rulesetId} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.getRepoRuleset({
        owner,
        repo,
        ruleset_id: parseInt(rulesetId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get ruleset #${rulesetId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createRepoRuleset(owner, repo, ruleset) {
    logger.info(`🐙 [GitHub Service] Creating ruleset for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createRepoRuleset({
        owner,
        repo,
        ...ruleset,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create ruleset for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateRepoRuleset(owner, repo, rulesetId, ruleset) {
    logger.info(
      `🐙 [GitHub Service] Updating ruleset #${rulesetId} for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.updateRepoRuleset({
        owner,
        repo,
        ruleset_id: parseInt(rulesetId, 10),
        ...ruleset,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update ruleset #${rulesetId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteRepoRuleset(owner, repo, rulesetId) {
    logger.info(
      `🐙 [GitHub Service] Deleting ruleset #${rulesetId} for ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.repos.deleteRepoRuleset({
        owner,
        repo,
        ruleset_id: parseInt(rulesetId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete ruleset #${rulesetId} for ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getOrgRulesets(org) {
    logger.info(`🐙 [GitHub Service] Listing rulesets for org ${org}`);
    try {
      const { data } = await octokit.rest.orgs.getOrgRulesets({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list rulesets for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgRuleset(org, rulesetId) {
    logger.info(
      `🐙 [GitHub Service] Fetching ruleset #${rulesetId} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.orgs.getOrgRuleset({
        org,
        ruleset_id: parseInt(rulesetId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get ruleset #${rulesetId} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createOrgRuleset(org, ruleset) {
    logger.info(`🐙 [GitHub Service] Creating ruleset for org ${org}`);
    try {
      const { data } = await octokit.rest.orgs.createOrgRuleset({
        org,
        ...ruleset,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create ruleset for org ${org}:`, error);
      throw error;
    }
  },

  async updateOrgRuleset(org, rulesetId, ruleset) {
    logger.info(
      `🐙 [GitHub Service] Updating ruleset #${rulesetId} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.orgs.updateOrgRuleset({
        org,
        ruleset_id: parseInt(rulesetId, 10),
        ...ruleset,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update ruleset #${rulesetId} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteOrgRuleset(org, rulesetId) {
    logger.info(
      `🐙 [GitHub Service] Deleting ruleset #${rulesetId} for org ${org}`,
    );
    try {
      const response = await octokit.rest.orgs.deleteOrgRuleset({
        org,
        ruleset_id: parseInt(rulesetId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete ruleset #${rulesetId} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 44. Copilot Org Seat Management
  // ==========================================
  async listCopilotSeatsForOrg(org) {
    logger.info(`🐙 [GitHub Service] Listing Copilot seats for org ${org}`);
    try {
      const { data } = await octokit.rest.copilot.listSeatsForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list Copilot seats for org ${org}:`, error);
      throw error;
    }
  },

  async addCopilotSeatsToOrg(org, usernames) {
    logger.info(`🐙 [GitHub Service] Adding Copilot seats to org ${org}`);
    try {
      const { data } = await octokit.rest.copilot.addSeatsToOrg({
        org,
        selected_usernames: usernames,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to add Copilot seats for org ${org}:`, error);
      throw error;
    }
  },

  async removeCopilotSeatsFromOrg(org, usernames) {
    logger.info(`🐙 [GitHub Service] Removing Copilot seats from org ${org}`);
    try {
      const { data } = await octokit.rest.copilot.removeSeatsFromOrg({
        org,
        selected_usernames: usernames,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to remove Copilot seats for org ${org}:`, error);
      throw error;
    }
  },

  async getCopilotSeatDetailsForUser(org, username) {
    logger.info(
      `🐙 [GitHub Service] Fetching Copilot seat details for ${username} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.copilot.getSeatDetailsForUser({
        org,
        username,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to fetch Copilot seat details for ${username} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 45. Pull Request Reviews API
  // ==========================================
  async listPullRequestReviews(owner, repo, pullNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing reviews for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list reviews for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getPullRequestReview(owner, repo, pullNumber, reviewId) {
    logger.info(
      `🐙 [GitHub Service] Fetching review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.getReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        review_id: parseInt(reviewId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createPullRequestReview(owner, repo, pullNumber, reviewData) {
    logger.info(
      `🐙 [GitHub Service] Creating review for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        ...reviewData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create review for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async submitPullRequestReview(owner, repo, pullNumber, reviewId, reviewData) {
    logger.info(
      `🐙 [GitHub Service] Submitting review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.submitReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        review_id: parseInt(reviewId, 10),
        ...reviewData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to submit review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async dismissPullRequestReview(owner, repo, pullNumber, reviewId, message) {
    logger.info(
      `🐙 [GitHub Service] Dismissing review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.dismissReview({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        review_id: parseInt(reviewId, 10),
        message,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to dismiss review #${reviewId} for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 46. Issue Comments API
  // ==========================================
  async listIssueComments(owner, repo, issueNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing comments for issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list comments for issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getIssueComment(owner, repo, commentId) {
    logger.info(
      `🐙 [GitHub Service] Fetching comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.getComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createIssueComment(owner, repo, issueNumber, body) {
    logger.info(
      `🐙 [GitHub Service] Creating comment on issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create comment on issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async updateIssueComment(owner, repo, commentId, body) {
    logger.info(
      `🐙 [GitHub Service] Updating comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteIssueComment(owner, repo, commentId) {
    logger.info(
      `🐙 [GitHub Service] Deleting comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.issues.deleteComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 47. User Keys & Emails API
  // ==========================================
  async listEmailsForAuthenticatedUser() {
    logger.info('🐙 [GitHub Service] Listing emails for authenticated user');
    try {
      const { data } =
        await octokit.rest.users.listEmailsForAuthenticatedUser();
      return data;
    } catch (error) {
      logger.error('Failed to list emails for authenticated user:', error);
      throw error;
    }
  },

  async addEmailsForAuthenticatedUser(emails) {
    logger.info('🐙 [GitHub Service] Adding emails for authenticated user');
    try {
      const { data } = await octokit.rest.users.addEmailsForAuthenticatedUser({
        emails,
      });
      return data;
    } catch (error) {
      logger.error('Failed to add emails for authenticated user:', error);
      throw error;
    }
  },

  async deleteEmailsForAuthenticatedUser(emails) {
    logger.info('🐙 [GitHub Service] Deleting emails for authenticated user');
    try {
      const response =
        await octokit.rest.users.deleteEmailsForAuthenticatedUser({
          emails,
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error('Failed to delete emails for authenticated user:', error);
      throw error;
    }
  },

  async listPublicKeysForAuthenticatedUser() {
    logger.info(
      '🐙 [GitHub Service] Listing public SSH keys for authenticated user',
    );
    try {
      const { data } =
        await octokit.rest.users.listPublicKeysForAuthenticatedUser();
      return data;
    } catch (error) {
      logger.error('Failed to list public keys for authenticated user:', error);
      throw error;
    }
  },

  async addPublicKeyForAuthenticatedUser(title, key) {
    logger.info(
      '🐙 [GitHub Service] Adding public SSH key for authenticated user',
    );
    try {
      const { data } =
        await octokit.rest.users.addPublicKeyForAuthenticatedUser({
          title,
          key,
        });
      return data;
    } catch (error) {
      logger.error('Failed to add public key for authenticated user:', error);
      throw error;
    }
  },

  async deletePublicKeyForAuthenticatedUser(keyId) {
    logger.info(
      `🐙 [GitHub Service] Deleting public SSH key #${keyId} for authenticated user`,
    );
    try {
      const response =
        await octokit.rest.users.deletePublicKeyForAuthenticatedUser({
          key_id: parseInt(keyId, 10),
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete public key #${keyId} for authenticated user:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 48. GitHub Classroom API
  // ==========================================
  async listClassrooms() {
    logger.info('🐙 [GitHub Service] Listing classrooms');
    try {
      const { data } = await octokit.rest.classroom.listClassrooms();
      return data;
    } catch (error) {
      logger.error('Failed to list classrooms:', error);
      throw error;
    }
  },

  async getClassroom(classroomId) {
    logger.info(`🐙 [GitHub Service] Fetching classroom ${classroomId}`);
    try {
      const { data } = await octokit.rest.classroom.getClassroom({
        classroom_id: parseInt(classroomId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get classroom ${classroomId}:`, error);
      throw error;
    }
  },

  async listAssignmentsForClassroom(classroomId) {
    logger.info(
      `🐙 [GitHub Service] Listing assignments for classroom ${classroomId}`,
    );
    try {
      const { data } = await octokit.rest.classroom.listAssignmentsForClassroom(
        {
          classroom_id: parseInt(classroomId, 10),
        },
      );
      return data;
    } catch (error) {
      logger.error(
        `Failed to list assignments for classroom ${classroomId}:`,
        error,
      );
      throw error;
    }
  },

  async getAssignment(assignmentId) {
    logger.info(`🐙 [GitHub Service] Fetching assignment ${assignmentId}`);
    try {
      const { data } = await octokit.rest.classroom.getAssignment({
        assignment_id: parseInt(assignmentId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get assignment ${assignmentId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 49. Actions Workflows & Runs API
  // ==========================================
  async listRepoWorkflows(owner, repo) {
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

  async getWorkflow(owner, repo, workflowId) {
    logger.info(
      `🐙 [GitHub Service] Fetching workflow ${workflowId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getWorkflow({
        owner,
        repo,
        workflow_id: workflowId,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get workflow ${workflowId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listWorkflowRuns(owner, repo, queryParams = {}) {
    logger.info(
      `🐙 [GitHub Service] Listing workflow runs for ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        ...queryParams,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list workflow runs for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getWorkflowRun(owner, repo, runId) {
    logger.info(
      `🐙 [GitHub Service] Fetching workflow run ${runId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getWorkflowRun({
        owner,
        repo,
        run_id: parseInt(runId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get workflow run ${runId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createWorkflowDispatch(owner, repo, workflowId, ref, inputs = {}) {
    logger.info(
      `🐙 [GitHub Service] Creating workflow dispatch for ${workflowId} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to create workflow dispatch for ${workflowId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 50. Self-Hosted Runners API
  // ==========================================
  async listSelfHostedRunnersForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Listing self-hosted runners for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.actions.listSelfHostedRunnersForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list self-hosted runners for org ${org}:`, error);
      throw error;
    }
  },

  async listSelfHostedRunnersForRepo(owner, repo) {
    logger.info(
      `🐙 [GitHub Service] Listing self-hosted runners for repo ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listSelfHostedRunnersForRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list self-hosted runners for repo ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getSelfHostedRunnerForOrg(org, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Fetching self-hosted runner ${runnerId} for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.actions.getSelfHostedRunnerForOrg({
        org,
        runner_id: parseInt(runnerId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get self-hosted runner ${runnerId} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getSelfHostedRunnerForRepo(owner, repo, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Fetching self-hosted runner ${runnerId} for repo ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getSelfHostedRunnerForRepo({
        owner,
        repo,
        runner_id: parseInt(runnerId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get self-hosted runner ${runnerId} for repo ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteSelfHostedRunnerFromOrg(org, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Deleting self-hosted runner ${runnerId} from org ${org}`,
    );
    try {
      const response = await octokit.rest.actions.deleteSelfHostedRunnerFromOrg(
        {
          org,
          runner_id: parseInt(runnerId, 10),
        },
      );
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete self-hosted runner ${runnerId} from org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteSelfHostedRunnerFromRepo(owner, repo, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Deleting self-hosted runner ${runnerId} from repo ${owner}/${repo}`,
    );
    try {
      const response =
        await octokit.rest.actions.deleteSelfHostedRunnerFromRepo({
          owner,
          repo,
          runner_id: parseInt(runnerId, 10),
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete self-hosted runner ${runnerId} from repo ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 51. Issue Labels & Milestones API
  // ==========================================
  async listLabelsForRepo(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing labels for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.issues.listLabelsForRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list labels for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getLabel(owner, repo, name) {
    logger.info(
      `🐙 [GitHub Service] Fetching label "${name}" in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.getLabel({
        owner,
        repo,
        name,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get label "${name}" in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createLabel(owner, repo, labelData) {
    logger.info(`🐙 [GitHub Service] Creating label in ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.issues.createLabel({
        owner,
        repo,
        ...labelData,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create label in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateLabel(owner, repo, name, labelData) {
    logger.info(
      `🐙 [GitHub Service] Updating label "${name}" in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.updateLabel({
        owner,
        repo,
        name,
        ...labelData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update label "${name}" in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteLabel(owner, repo, name) {
    logger.info(
      `🐙 [GitHub Service] Deleting label "${name}" in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.issues.deleteLabel({
        owner,
        repo,
        name,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete label "${name}" in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async addLabelsToIssue(owner, repo, issueNumber, labels) {
    logger.info(
      `🐙 [GitHub Service] Adding labels to issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
        labels,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to add labels to issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async removeLabelFromIssue(owner, repo, issueNumber, name) {
    logger.info(
      `🐙 [GitHub Service] Removing label "${name}" from issue #${issueNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: parseInt(issueNumber, 10),
        name,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to remove label "${name}" from issue #${issueNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listMilestones(owner, repo, queryParams = {}) {
    logger.info(`🐙 [GitHub Service] Listing milestones for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.issues.listMilestones({
        owner,
        repo,
        ...queryParams,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list milestones for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getMilestone(owner, repo, milestoneNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching milestone #${milestoneNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.getMilestone({
        owner,
        repo,
        milestone_number: parseInt(milestoneNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get milestone #${milestoneNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createMilestone(owner, repo, milestoneData) {
    logger.info(`🐙 [GitHub Service] Creating milestone in ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.issues.createMilestone({
        owner,
        repo,
        ...milestoneData,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create milestone in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateMilestone(owner, repo, milestoneNumber, milestoneData) {
    logger.info(
      `🐙 [GitHub Service] Updating milestone #${milestoneNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.issues.updateMilestone({
        owner,
        repo,
        milestone_number: parseInt(milestoneNumber, 10),
        ...milestoneData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update milestone #${milestoneNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteMilestone(owner, repo, milestoneNumber) {
    logger.info(
      `🐙 [GitHub Service] Deleting milestone #${milestoneNumber} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.issues.deleteMilestone({
        owner,
        repo,
        milestone_number: parseInt(milestoneNumber, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete milestone #${milestoneNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 52. Repository Deploy Keys & Commit Statuses API
  // ==========================================
  async listDeployKeys(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing deploy keys for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listDeployKeys({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list deploy keys for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getDeployKey(owner, repo, keyId) {
    logger.info(
      `🐙 [GitHub Service] Fetching deploy key #${keyId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.getDeployKey({
        owner,
        repo,
        key_id: parseInt(keyId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get deploy key #${keyId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async addDeployKey(owner, repo, title, key, readOnly = true) {
    logger.info(`🐙 [GitHub Service] Adding deploy key in ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createDeployKey({
        owner,
        repo,
        title,
        key,
        read_only: readOnly,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to add deploy key in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteDeployKey(owner, repo, keyId) {
    logger.info(
      `🐙 [GitHub Service] Deleting deploy key #${keyId} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.repos.deleteDeployKey({
        owner,
        repo,
        key_id: parseInt(keyId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete deploy key #${keyId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createCommitStatus(owner, repo, sha, statusData) {
    logger.info(
      `🐙 [GitHub Service] Creating commit status for SHA ${sha} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        sha,
        ...statusData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create commit status for SHA ${sha} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listCommitStatusesForRef(owner, repo, ref) {
    logger.info(
      `🐙 [GitHub Service] Listing commit statuses for ref ${ref} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.repos.listStatusesForRef({
        owner,
        repo,
        ref,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list commit statuses for ref ${ref} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 53. PR Review Comments & Merges API
  // ==========================================
  async listReviewComments(owner, repo, pullNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing review comments for PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list review comments for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getReviewComment(owner, repo, commentId) {
    logger.info(
      `🐙 [GitHub Service] Fetching review comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.getReviewComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get review comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createReviewComment(owner, repo, pullNumber, commentData) {
    logger.info(
      `🐙 [GitHub Service] Creating review comment on PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        ...commentData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create review comment on PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async updateReviewComment(owner, repo, commentId, body) {
    logger.info(
      `🐙 [GitHub Service] Updating review comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.updateReviewComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update review comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteReviewComment(owner, repo, commentId) {
    logger.info(
      `🐙 [GitHub Service] Deleting review comment #${commentId} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.pulls.deleteReviewComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete review comment #${commentId} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async mergePullRequest(owner, repo, pullNumber, mergeData = {}) {
    logger.info(
      `🐙 [GitHub Service] Merging PR #${pullNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
        ...mergeData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to merge PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async checkIfPullRequestMerged(owner, repo, pullNumber) {
    logger.info(
      `🐙 [GitHub Service] Checking if PR #${pullNumber} in ${owner}/${repo} is merged`,
    );
    try {
      const response = await octokit.rest.pulls.checkIfMerged({
        owner,
        repo,
        pull_number: parseInt(pullNumber, 10),
      });
      // Octokit returns 204 if merged, 404 if not merged.
      // Response status will indicate. If it succeeds, it's merged.
      return { merged: response.status === 204 };
    } catch (error) {
      if (error.status === 404) {
        return { merged: false };
      }
      logger.error(
        `Failed to check merge status for PR #${pullNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 54. Team Discussions API
  // ==========================================
  async listTeamDiscussions(org, teamSlug) {
    logger.info(
      `🐙 [GitHub Service] Listing discussions for team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.listDiscussionsInOrg({
        org,
        team_slug: teamSlug,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list discussions for team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getTeamDiscussion(org, teamSlug, discussionNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching discussion #${discussionNumber} for team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.getDiscussionInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createTeamDiscussion(org, teamSlug, discussionData) {
    logger.info(
      `🐙 [GitHub Service] Creating discussion for team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.createDiscussionInOrg({
        org,
        team_slug: teamSlug,
        ...discussionData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create discussion for team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async updateTeamDiscussion(org, teamSlug, discussionNumber, discussionData) {
    logger.info(
      `🐙 [GitHub Service] Updating discussion #${discussionNumber} for team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.updateDiscussionInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
        ...discussionData,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteTeamDiscussion(org, teamSlug, discussionNumber) {
    logger.info(
      `🐙 [GitHub Service] Deleting discussion #${discussionNumber} for team ${teamSlug} in org ${org}`,
    );
    try {
      const response = await octokit.rest.teams.deleteDiscussionInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete discussion #${discussionNumber} for team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async listTeamDiscussionComments(org, teamSlug, discussionNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing comments for discussion #${discussionNumber} on team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.listDiscussionCommentsInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list comments for discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getTeamDiscussionComment(
    org,
    teamSlug,
    discussionNumber,
    commentNumber,
  ) {
    logger.info(
      `🐙 [GitHub Service] Fetching comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.getDiscussionCommentInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
        comment_number: parseInt(commentNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createTeamDiscussionComment(org, teamSlug, discussionNumber, body) {
    logger.info(
      `🐙 [GitHub Service] Creating comment on discussion #${discussionNumber} on team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.createDiscussionCommentInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to create comment on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async updateTeamDiscussionComment(
    org,
    teamSlug,
    discussionNumber,
    commentNumber,
    body,
  ) {
    logger.info(
      `🐙 [GitHub Service] Updating comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}`,
    );
    try {
      const { data } = await octokit.rest.teams.updateDiscussionCommentInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
        comment_number: parseInt(commentNumber, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to update comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteTeamDiscussionComment(
    org,
    teamSlug,
    discussionNumber,
    commentNumber,
  ) {
    logger.info(
      `🐙 [GitHub Service] Deleting comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}`,
    );
    try {
      const response = await octokit.rest.teams.deleteDiscussionCommentInOrg({
        org,
        team_slug: teamSlug,
        discussion_number: parseInt(discussionNumber, 10),
        comment_number: parseInt(commentNumber, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete comment #${commentNumber} on discussion #${discussionNumber} on team ${teamSlug} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 55. SCIM Organization Member Provisioning
  // ==========================================
  async listProvisionedIdentities(org) {
    logger.info(
      `🐙 [GitHub Service] Listing SCIM provisioned identities for org ${org}`,
    );
    try {
      const response = await octokit.request(
        'GET /scim/v2/organizations/{org}/Users',
        {
          org,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to list SCIM provisioned identities for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async provisionAndInviteUser(org, scimData) {
    logger.info(`🐙 [GitHub Service] Provisioning SCIM user for org ${org}`);
    try {
      const response = await octokit.request(
        'POST /scim/v2/organizations/{org}/Users',
        {
          org,
          data: scimData,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to provision SCIM user for org ${org}:`, error);
      throw error;
    }
  },

  async getProvisioningInformation(org, scimUserId) {
    logger.info(
      `🐙 [GitHub Service] Fetching SCIM user ${scimUserId} for org ${org}`,
    );
    try {
      const response = await octokit.request(
        'GET /scim/v2/organizations/{org}/Users/{scim_user_id}',
        {
          org,
          scim_user_id: scimUserId,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get SCIM provisioning info for user ${scimUserId} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async replaceProvisionedUser(org, scimUserId, scimData) {
    logger.info(
      `🐙 [GitHub Service] Replacing SCIM user ${scimUserId} for org ${org}`,
    );
    try {
      const response = await octokit.request(
        'PUT /scim/v2/organizations/{org}/Users/{scim_user_id}',
        {
          org,
          scim_user_id: scimUserId,
          data: scimData,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to replace SCIM user ${scimUserId} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async updateProvisionedUser(org, scimUserId, scimData) {
    logger.info(
      `🐙 [GitHub Service] Updating SCIM user ${scimUserId} for org ${org}`,
    );
    try {
      const response = await octokit.request(
        'PATCH /scim/v2/organizations/{org}/Users/{scim_user_id}',
        {
          org,
          scim_user_id: scimUserId,
          data: scimData,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to update SCIM user ${scimUserId} in org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteUserFromOrg(org, scimUserId) {
    logger.info(
      `🐙 [GitHub Service] Deleting SCIM user ${scimUserId} from org ${org}`,
    );
    try {
      const response = await octokit.request(
        'DELETE /scim/v2/organizations/{org}/Users/{scim_user_id}',
        {
          org,
          scim_user_id: scimUserId,
        },
      );
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete SCIM user ${scimUserId} from org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 56. Codespaces Secrets API
  // ==========================================
  async getCodespacesPublicKeyForAuthenticatedUser() {
    logger.info(
      '🐙 [GitHub Service] Fetching Codespaces public key for authenticated user',
    );
    try {
      const { data } =
        await octokit.rest.codespaces.getPublicKeyForAuthenticatedUser();
      return data;
    } catch (error) {
      logger.error('Failed to get Codespaces public key for user:', error);
      throw error;
    }
  },

  async listCodespacesSecretsForAuthenticatedUser() {
    logger.info(
      '🐙 [GitHub Service] Listing Codespaces secrets for authenticated user',
    );
    try {
      const { data } =
        await octokit.rest.codespaces.listSecretsForAuthenticatedUser();
      return data;
    } catch (error) {
      logger.error('Failed to list Codespaces secrets for user:', error);
      throw error;
    }
  },

  async getCodespacesSecretForAuthenticatedUser(secretName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Codespaces secret "${secretName}" for authenticated user`,
    );
    try {
      const { data } =
        await octokit.rest.codespaces.getSecretForAuthenticatedUser({
          secret_name: secretName,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Codespaces secret "${secretName}" for user:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateCodespacesSecretForAuthenticatedUser(
    secretName,
    encryptedValue,
    keyId,
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Codespaces secret "${secretName}" for authenticated user`,
    );
    try {
      const response =
        await octokit.rest.codespaces.createOrUpdateSecretForAuthenticatedUser({
          secret_name: secretName,
          encrypted_value: encryptedValue,
          key_id: keyId,
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to create/update Codespaces secret "${secretName}" for user:`,
        error,
      );
      throw error;
    }
  },

  async deleteCodespacesSecretForAuthenticatedUser(secretName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Codespaces secret "${secretName}" for authenticated user`,
    );
    try {
      const response =
        await octokit.rest.codespaces.deleteSecretForAuthenticatedUser({
          secret_name: secretName,
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Codespaces secret "${secretName}" for user:`,
        error,
      );
      throw error;
    }
  },

  async getCodespacesPublicKeyForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching Codespaces public key for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.codespaces.getOrgPublicKey({
        org,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Codespaces public key for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async listCodespacesSecretsForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Listing Codespaces secrets for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.codespaces.listOrgSecrets({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list Codespaces secrets for org ${org}:`, error);
      throw error;
    }
  },

  async getCodespacesSecretForOrg(org, secretName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Codespaces secret "${secretName}" for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.codespaces.getOrgSecret({
        org,
        secret_name: secretName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Codespaces secret "${secretName}" for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateCodespacesSecretForOrg(
    org,
    secretName,
    encryptedValue,
    keyId,
    selectedRepositoryIds = [],
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Codespaces secret "${secretName}" for org ${org}`,
    );
    try {
      const response = await octokit.rest.codespaces.createOrUpdateOrgSecret({
        org,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: keyId,
        visibility: selectedRepositoryIds.length > 0 ? 'selected' : 'all',
        selected_repository_ids: selectedRepositoryIds.map(id =>
          parseInt(id, 10),
        ),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to create/update Codespaces secret "${secretName}" for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteCodespacesSecretForOrg(org, secretName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Codespaces secret "${secretName}" from org ${org}`,
    );
    try {
      const response = await octokit.rest.codespaces.deleteOrgSecret({
        org,
        secret_name: secretName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Codespaces secret "${secretName}" from org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 57. Actions Organization Secrets & Variables
  // ==========================================
  async getActionsPublicKeyForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions public key for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.actions.getOrgPublicKey({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get Actions public key for org ${org}:`, error);
      throw error;
    }
  },

  async listOrgSecrets(org) {
    logger.info(`🐙 [GitHub Service] Listing Actions secrets for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.listOrgSecrets({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list Actions secrets for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgSecret(org, secretName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions secret "${secretName}" for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.actions.getOrgSecret({
        org,
        secret_name: secretName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions secret "${secretName}" for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateOrgSecret(
    org,
    secretName,
    encryptedValue,
    keyId,
    selectedRepositoryIds = [],
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Actions secret "${secretName}" for org ${org}`,
    );
    try {
      const response = await octokit.rest.actions.createOrUpdateOrgSecret({
        org,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: keyId,
        visibility: selectedRepositoryIds.length > 0 ? 'selected' : 'all',
        selected_repository_ids: selectedRepositoryIds.map(id =>
          parseInt(id, 10),
        ),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to create/update Actions secret "${secretName}" for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async deleteOrgSecret(org, secretName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Actions secret "${secretName}" from org ${org}`,
    );
    try {
      const response = await octokit.rest.actions.deleteOrgSecret({
        org,
        secret_name: secretName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Actions secret "${secretName}" from org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async listOrgVariables(org) {
    logger.info(`🐙 [GitHub Service] Listing Actions variables for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.listOrgVariables({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list Actions variables for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgVariable(org, variableName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions variable "${variableName}" for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.actions.getOrgVariable({
        org,
        variable_name: variableName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions variable "${variableName}" for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateOrgVariable(
    org,
    variableName,
    value,
    selectedRepositoryIds = [],
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Actions variable "${variableName}" for org ${org}`,
    );
    try {
      const response = await octokit.rest.actions.createOrgVariable({
        org,
        name: variableName,
        value,
        visibility: selectedRepositoryIds.length > 0 ? 'selected' : 'all',
        selected_repository_ids: selectedRepositoryIds.map(id =>
          parseInt(id, 10),
        ),
      });
      return response.data || { success: true };
    } catch (error) {
      // If variable exists, we might need to update it
      try {
        const updateResponse = await octokit.rest.actions.updateOrgVariable({
          org,
          variable_name: variableName,
          name: variableName,
          value,
          visibility: selectedRepositoryIds.length > 0 ? 'selected' : 'all',
          selected_repository_ids: selectedRepositoryIds.map(id =>
            parseInt(id, 10),
          ),
        });
        return updateResponse.data || { success: true };
      } catch (updateError) {
        logger.error(
          `Failed to create/update Actions variable "${variableName}" for org ${org}:`,
          error,
        );
        throw updateError;
      }
    }
  },

  async deleteOrgVariable(org, variableName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Actions variable "${variableName}" from org ${org}`,
    );
    try {
      const response = await octokit.rest.actions.deleteOrgVariable({
        org,
        variable_name: variableName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Actions variable "${variableName}" from org ${org}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 58. Actions Environment Secrets & Variables
  // ==========================================
  async getActionsPublicKeyForEnvironment(repositoryId, environmentName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions public key for env ${environmentName} in repo ID ${repositoryId}`,
    );
    try {
      const { data } = await octokit.rest.actions.getEnvironmentPublicKey({
        repository_id: parseInt(repositoryId, 10),
        environment_name: environmentName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions public key for env ${environmentName} in repo ID ${repositoryId}:`,
        error,
      );
      throw error;
    }
  },

  async listEnvironmentSecrets(owner, repo, environmentName) {
    logger.info(
      `🐙 [GitHub Service] Listing Actions secrets for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listEnvironmentSecrets({
        owner,
        repo,
        environment_name: environmentName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list Actions secrets for env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getEnvironmentSecret(owner, repo, environmentName, secretName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions secret "${secretName}" for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getEnvironmentSecret({
        owner,
        repo,
        environment_name: environmentName,
        secret_name: secretName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions secret "${secretName}" for env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateEnvironmentSecret(
    owner,
    repo,
    environmentName,
    secretName,
    encryptedValue,
    keyId,
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Actions secret "${secretName}" for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const response =
        await octokit.rest.actions.createOrUpdateEnvironmentSecret({
          owner,
          repo,
          environment_name: environmentName,
          secret_name: secretName,
          encrypted_value: encryptedValue,
          key_id: keyId,
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to create/update Actions secret "${secretName}" for env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async deleteEnvironmentSecret(owner, repo, environmentName, secretName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Actions secret "${secretName}" from env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.actions.deleteEnvironmentSecret({
        owner,
        repo,
        environment_name: environmentName,
        secret_name: secretName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Actions secret "${secretName}" from env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async listEnvironmentVariables(owner, repo, environmentName) {
    logger.info(
      `🐙 [GitHub Service] Listing Actions variables for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.listEnvironmentVariables({
        owner,
        repo,
        environment_name: environmentName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list Actions variables for env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async getEnvironmentVariable(owner, repo, environmentName, variableName) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions variable "${variableName}" for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.actions.getEnvironmentVariable({
        owner,
        repo,
        environment_name: environmentName,
        variable_name: variableName,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions variable "${variableName}" for env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  async createOrUpdateEnvironmentVariable(
    owner,
    repo,
    environmentName,
    variableName,
    value,
  ) {
    logger.info(
      `🐙 [GitHub Service] Creating/updating Actions variable "${variableName}" for env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.actions.createEnvironmentVariable({
        owner,
        repo,
        environment_name: environmentName,
        name: variableName,
        value,
      });
      return response.data || { success: true };
    } catch (error) {
      try {
        const updateResponse =
          await octokit.rest.actions.updateEnvironmentVariable({
            owner,
            repo,
            environment_name: environmentName,
            variable_name: variableName,
            name: variableName,
            value,
          });
        return updateResponse.data || { success: true };
      } catch (updateError) {
        logger.error(
          `Failed to create/update Actions variable "${variableName}" for env ${environmentName} in ${owner}/${repo}:`,
          error,
        );
        throw updateError;
      }
    }
  },

  async deleteEnvironmentVariable(owner, repo, environmentName, variableName) {
    logger.info(
      `🐙 [GitHub Service] Deleting Actions variable "${variableName}" from env ${environmentName} in ${owner}/${repo}`,
    );
    try {
      const response = await octokit.rest.actions.deleteEnvironmentVariable({
        owner,
        repo,
        environment_name: environmentName,
        variable_name: variableName,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete Actions variable "${variableName}" from env ${environmentName} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 59. Secret Scanning Org Alerts & Locations
  // ==========================================
  async listSecretScanningAlertsForOrg(org) {
    logger.info(
      `🐙 [GitHub Service] Listing secret scanning alerts for org ${org}`,
    );
    try {
      const { data } = await octokit.rest.secretScanning.listAlertsForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list secret scanning alerts for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async getSecretScanningAlertForOrg(org, alertNumber) {
    logger.info(
      `🐙 [GitHub Service] Fetching secret scanning alert #${alertNumber} for org ${org}`,
    );
    try {
      // Standard Octokit does not have a separate getAlertForOrg, we use standard endpoint via request or getAlert.
      // GitHub REST API: GET /orgs/{org}/secret-scanning/alerts/{alert_number}
      const response = await octokit.request(
        'GET /orgs/{org}/secret-scanning/alerts/{alert_number}',
        {
          org,
          alert_number: parseInt(alertNumber, 10),
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get secret scanning alert #${alertNumber} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async updateSecretScanningAlertForOrg(
    org,
    alertNumber,
    state,
    resolution = null,
  ) {
    logger.info(
      `🐙 [GitHub Service] Updating secret scanning alert #${alertNumber} for org ${org}`,
    );
    try {
      // GitHub REST API: PATCH /orgs/{org}/secret-scanning/alerts/{alert_number}
      const response = await octokit.request(
        'PATCH /orgs/{org}/secret-scanning/alerts/{alert_number}',
        {
          org,
          alert_number: parseInt(alertNumber, 10),
          state,
          resolution,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to update secret scanning alert #${alertNumber} for org ${org}:`,
        error,
      );
      throw error;
    }
  },

  async listSecretScanningLocations(owner, repo, alertNumber) {
    logger.info(
      `🐙 [GitHub Service] Listing locations for secret scanning alert #${alertNumber} in ${owner}/${repo}`,
    );
    try {
      const { data } = await octokit.rest.secretScanning.listLocationsForAlert({
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list locations for secret scanning alert #${alertNumber} in ${owner}/${repo}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 60. Enterprise Admin Policies, Runners & Billing
  // ==========================================
  async getEnterpriseActionsPermissions(enterprise) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions permissions for enterprise ${enterprise}`,
    );
    try {
      const { data } =
        await octokit.rest.enterpriseAdmin.getActionsPermissionsEnterprise({
          enterprise,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get Actions permissions for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async setEnterpriseActionsPermissions(enterprise, permissionsData) {
    logger.info(
      `🐙 [GitHub Service] Setting Actions permissions for enterprise ${enterprise}`,
    );
    try {
      const response =
        await octokit.rest.enterpriseAdmin.setActionsPermissionsEnterprise({
          enterprise,
          ...permissionsData,
        });
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to set Actions permissions for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async listSelfHostedRunnersForEnterprise(enterprise) {
    logger.info(
      `🐙 [GitHub Service] Listing self-hosted runners for enterprise ${enterprise}`,
    );
    try {
      const { data } =
        await octokit.rest.enterpriseAdmin.listSelfHostedRunnersForEnterprise({
          enterprise,
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to list self-hosted runners for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async getSelfHostedRunnerForEnterprise(enterprise, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Fetching self-hosted runner ${runnerId} for enterprise ${enterprise}`,
    );
    try {
      const { data } =
        await octokit.rest.enterpriseAdmin.getSelfHostedRunnerForEnterprise({
          enterprise,
          runner_id: parseInt(runnerId, 10),
        });
      return data;
    } catch (error) {
      logger.error(
        `Failed to get self-hosted runner ${runnerId} for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async deleteSelfHostedRunnerFromEnterprise(enterprise, runnerId) {
    logger.info(
      `🐙 [GitHub Service] Deleting self-hosted runner ${runnerId} from enterprise ${enterprise}`,
    );
    try {
      const response =
        await octokit.rest.enterpriseAdmin.deleteSelfHostedRunnerFromEnterprise(
          {
            enterprise,
            runner_id: parseInt(runnerId, 10),
          },
        );
      return response.data || { success: true };
    } catch (error) {
      logger.error(
        `Failed to delete self-hosted runner ${runnerId} from enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async getEnterpriseSharedStorageBilling(enterprise) {
    logger.info(
      `🐙 [GitHub Service] Fetching Shared Storage billing for enterprise ${enterprise}`,
    );
    try {
      // GET /enterprises/{enterprise}/settings/billing/shared-storage
      const response = await octokit.request(
        'GET /enterprises/{enterprise}/settings/billing/shared-storage',
        {
          enterprise,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get Shared Storage billing for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async getEnterpriseActionsBilling(enterprise) {
    logger.info(
      `🐙 [GitHub Service] Fetching Actions billing for enterprise ${enterprise}`,
    );
    try {
      // GET /enterprises/{enterprise}/settings/billing/actions
      const response = await octokit.request(
        'GET /enterprises/{enterprise}/settings/billing/actions',
        {
          enterprise,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get Actions billing for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  async getEnterprisePackagesBilling(enterprise) {
    logger.info(
      `🐙 [GitHub Service] Fetching Packages billing for enterprise ${enterprise}`,
    );
    try {
      // GET /enterprises/{enterprise}/settings/billing/packages
      const response = await octokit.request(
        'GET /enterprises/{enterprise}/settings/billing/packages',
        {
          enterprise,
        },
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Failed to get Packages billing for enterprise ${enterprise}:`,
        error,
      );
      throw error;
    }
  },

  // ==========================================
  // 61. Advanced Security Scanning
  // ==========================================
  async updateCodeScanningAlert(owner, repo, alertNumber, state, dismissedReason = null) {
    logger.info(`🐙 [GitHub Service] Updating code scanning alert #${alertNumber} for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.codeScanning.updateAlert({
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
        state,
        dismissed_reason: dismissedReason,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update code scanning alert #${alertNumber} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listCodeScanningAlertInstances(owner, repo, alertNumber) {
    logger.info(`🐙 [GitHub Service] Listing instances of code scanning alert #${alertNumber} for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.codeScanning.listAlertInstances({
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list code scanning alert #${alertNumber} instances for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listCodeScanningAnalyses(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing code scanning analyses for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.codeScanning.listAnalysesForRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list code scanning analyses for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getCodeScanningAnalysis(owner, repo, analysisId) {
    logger.info(`🐙 [GitHub Service] Fetching code scanning analysis #${analysisId} for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.codeScanning.getAnalysis({
        owner,
        repo,
        analysis_id: parseInt(analysisId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get code scanning analysis #${analysisId} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteCodeScanningAnalysis(owner, repo, analysisId) {
    logger.info(`🐙 [GitHub Service] Deleting code scanning analysis #${analysisId} from ${owner}/${repo}`);
    try {
      const response = await octokit.rest.codeScanning.deleteAnalysis({
        owner,
        repo,
        analysis_id: parseInt(analysisId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to delete code scanning analysis #${analysisId} from ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async uploadCodeScanningSarif(owner, repo, sarifData) {
    logger.info(`🐙 [GitHub Service] Uploading SARIF format static analysis file for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.codeScanning.uploadSarif({
        owner,
        repo,
        ...sarifData,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to upload SARIF file for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listSecretScanningBypassApprovals(owner, repo, alertNumber) {
    logger.info(`🐙 [GitHub Service] Listing bypass approvals for secret scanning alert #${alertNumber} in ${owner}/${repo}`);
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/bypass-approvals', {
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to list secret scanning bypass approvals for alert #${alertNumber} in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createSecretScanningBypassApproval(owner, repo, alertNumber, state, comment = null) {
    logger.info(`🐙 [GitHub Service] Creating bypass approval for secret scanning alert #${alertNumber} in ${owner}/${repo}`);
    try {
      const response = await octokit.request('POST /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/bypass-approvals', {
        owner,
        repo,
        alert_number: parseInt(alertNumber, 10),
        data: { state, comment },
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to create secret scanning bypass approval for alert #${alertNumber} in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 62. Commit Comments
  // ==========================================
  async listCommitComments(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing commit comments for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listCommitComments({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list commit comments for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getCommitComment(owner, repo, commentId) {
    logger.info(`🐙 [GitHub Service] Fetching commit comment #${commentId} for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.getCommitComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get commit comment #${commentId} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createCommitComment(owner, repo, commitSha, body, path = null, position = null, line = null) {
    logger.info(`🐙 [GitHub Service] Creating commit comment on commit ${commitSha} in ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: commitSha,
        body,
        path,
        position: position !== null ? parseInt(position, 10) : undefined,
        line: line !== null ? parseInt(line, 10) : undefined,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create commit comment on commit ${commitSha} in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateCommitComment(owner, repo, commentId, body) {
    logger.info(`🐙 [GitHub Service] Updating commit comment #${commentId} in ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.updateCommitComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
        body,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update commit comment #${commentId} in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteCommitComment(owner, repo, commentId) {
    logger.info(`🐙 [GitHub Service] Deleting commit comment #${commentId} in ${owner}/${repo}`);
    try {
      const response = await octokit.rest.repos.deleteCommitComment({
        owner,
        repo,
        comment_id: parseInt(commentId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to delete commit comment #${commentId} in ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 63. Repository Forks & Invitations
  // ==========================================
  async listForks(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing forks for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listForks({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list forks for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createFork(owner, repo, org = null, name = null, defaultBranchOnly = false) {
    logger.info(`🐙 [GitHub Service] Forking repository ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createFork({
        owner,
        repo,
        organization: org || undefined,
        name: name || undefined,
        default_branch_only: defaultBranchOnly,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to fork repository ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listRepoInvitations(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing pending invitations for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listInvitations({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list pending invitations for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deleteRepoInvitation(owner, repo, invitationId) {
    logger.info(`🐙 [GitHub Service] Revoking pending invitation #${invitationId} for ${owner}/${repo}`);
    try {
      const response = await octokit.rest.repos.deleteInvitation({
        owner,
        repo,
        invitation_id: parseInt(invitationId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to revoke invitation #${invitationId} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updateRepoInvitation(owner, repo, invitationId, permissions) {
    logger.info(`🐙 [GitHub Service] Updating permissions of invitation #${invitationId} for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.updateInvitation({
        owner,
        repo,
        invitation_id: parseInt(invitationId, 10),
        permissions,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update invitation #${invitationId} for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 64. Repository Pages
  // ==========================================
  async getPagesInfo(owner, repo) {
    logger.info(`🐙 [GitHub Service] Fetching Pages info for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.getPages({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get Pages info for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async createPagesSite(owner, repo, source) {
    logger.info(`🐙 [GitHub Service] Creating Pages site for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.createPagesSite({
        owner,
        repo,
        source,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create Pages site for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async updatePagesSite(owner, repo, source) {
    logger.info(`🐙 [GitHub Service] Updating Pages config for ${owner}/${repo}`);
    try {
      const response = await octokit.rest.repos.updatePagesSite({
        owner,
        repo,
        source,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to update Pages config for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async deletePagesSite(owner, repo) {
    logger.info(`🐙 [GitHub Service] Deleting Pages site for ${owner}/${repo}`);
    try {
      const response = await octokit.rest.repos.deletePagesSite({
        owner,
        repo,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to delete Pages site for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async listPagesBuilds(owner, repo) {
    logger.info(`🐙 [GitHub Service] Listing Pages builds for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.listPagesBuilds({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list Pages builds for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getPagesBuildInfo(owner, repo, buildId) {
    logger.info(`🐙 [GitHub Service] Fetching Pages build #${buildId} details for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.getPagesBuild({
        owner,
        repo,
        build_id: parseInt(buildId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get Pages build #${buildId} details for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async requestPagesBuild(owner, repo) {
    logger.info(`🐙 [GitHub Service] Requesting manual Pages build for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.repos.requestPagesBuild({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to request Pages build for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 65. Actions Runner Groups & Workflow Permissions
  // ==========================================
  async listOrgRunnerGroups(org) {
    logger.info(`🐙 [GitHub Service] Listing runner groups for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.listSelfHostedRunnerGroupsForOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list runner groups for org ${org}:`, error);
      throw error;
    }
  },

  async getOrgRunnerGroup(org, runnerGroupId) {
    logger.info(`🐙 [GitHub Service] Fetching runner group #${runnerGroupId} for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.getSelfHostedRunnerGroupForOrg({
        org,
        runner_group_id: parseInt(runnerGroupId, 10),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get runner group #${runnerGroupId} for org ${org}:`, error);
      throw error;
    }
  },

  async createOrgRunnerGroup(org, name, visibility, selectedRepositoryIds = []) {
    logger.info(`🐙 [GitHub Service] Creating runner group "${name}" for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.createSelfHostedRunnerGroupForOrg({
        org,
        name,
        visibility,
        selected_repository_ids: selectedRepositoryIds.map(id => parseInt(id, 10)),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to create runner group "${name}" for org ${org}:`, error);
      throw error;
    }
  },

  async updateOrgRunnerGroup(org, runnerGroupId, name, visibility, selectedRepositoryIds = []) {
    logger.info(`🐙 [GitHub Service] Updating runner group #${runnerGroupId} for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.updateSelfHostedRunnerGroupForOrg({
        org,
        runner_group_id: parseInt(runnerGroupId, 10),
        name,
        visibility,
        selected_repository_ids: selectedRepositoryIds.map(id => parseInt(id, 10)),
      });
      return data;
    } catch (error) {
      logger.error(`Failed to update runner group #${runnerGroupId} for org ${org}:`, error);
      throw error;
    }
  },

  async deleteOrgRunnerGroup(org, runnerGroupId) {
    logger.info(`🐙 [GitHub Service] Deleting runner group #${runnerGroupId} from org ${org}`);
    try {
      const response = await octokit.rest.actions.deleteSelfHostedRunnerGroupFromOrg({
        org,
        runner_group_id: parseInt(runnerGroupId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to delete runner group #${runnerGroupId} from org ${org}:`, error);
      throw error;
    }
  },

  async getActionsPermissionsForOrg(org) {
    logger.info(`🐙 [GitHub Service] Fetching default Actions permissions for org ${org}`);
    try {
      const { data } = await octokit.rest.actions.getActionsPermissionsOrg({
        org,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get Actions permissions for org ${org}:`, error);
      throw error;
    }
  },

  async setActionsPermissionsForOrg(org, enabledRepositories, allowedActions) {
    logger.info(`🐙 [GitHub Service] Setting Actions permissions for org ${org}`);
    try {
      const response = await octokit.rest.actions.setActionsPermissionsOrg({
        org,
        enabled_repositories: enabledRepositories,
        allowed_actions: allowedActions,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to set Actions permissions for org ${org}:`, error);
      throw error;
    }
  },

  async getActionsPermissionsForRepo(owner, repo) {
    logger.info(`🐙 [GitHub Service] Fetching Actions permissions for ${owner}/${repo}`);
    try {
      const { data } = await octokit.rest.actions.getActionsPermissionsRepo({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get Actions permissions for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async setActionsPermissionsForRepo(owner, repo, enabled, allowedActions) {
    logger.info(`🐙 [GitHub Service] Setting Actions permissions for ${owner}/${repo}`);
    try {
      const response = await octokit.rest.actions.setActionsPermissionsRepo({
        owner,
        repo,
        enabled,
        allowed_actions: allowedActions,
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to set Actions permissions for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  // ==========================================
  // 66. Selected Repository Org Secrets & Variables
  // ==========================================
  async listSelectedReposForOrgSecret(org, secretName) {
    logger.info(`🐙 [GitHub Service] Listing repos for org secret "${secretName}" in org ${org}`);
    try {
      const { data } = await octokit.rest.actions.listSelectedRepositoriesEnabledGatewayForOrganizationSecret({
        org,
        secret_name: secretName,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list repos for org secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async setSelectedReposForOrgSecret(org, secretName, selectedRepositoryIds = []) {
    logger.info(`🐙 [GitHub Service] Setting repos access for org secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.setSelectedRepositoriesEnabledGatewayForOrganizationSecret({
        org,
        secret_name: secretName,
        selected_repository_ids: selectedRepositoryIds.map(id => parseInt(id, 10)),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to set repos access for org secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async addSelectedRepoToOrgSecret(org, secretName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Adding repo ID ${repositoryId} access for org secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.addSelectedRepositoryEnabledGatewayForOrganizationSecret({
        org,
        secret_name: secretName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to add repo ID ${repositoryId} access for org secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async removeSelectedRepoFromOrgSecret(org, secretName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Removing repo ID ${repositoryId} access for org secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.removeSelectedRepositoryEnabledGatewayForOrganizationSecret({
        org,
        secret_name: secretName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to remove repo ID ${repositoryId} access for org secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async listSelectedReposForOrgVariable(org, variableName) {
    logger.info(`🐙 [GitHub Service] Listing repos for org variable "${variableName}" in org ${org}`);
    try {
      const { data } = await octokit.rest.actions.listSelectedReposForOrgVariable({
        org,
        variable_name: variableName,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list repos for org variable "${variableName}" in org ${org}:`, error);
      throw error;
    }
  },

  async setSelectedReposForOrgVariable(org, variableName, selectedRepositoryIds = []) {
    logger.info(`🐙 [GitHub Service] Setting repos access for org variable "${variableName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.setSelectedReposForOrgVariable({
        org,
        variable_name: variableName,
        selected_repository_ids: selectedRepositoryIds.map(id => parseInt(id, 10)),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to set repos access for org variable "${variableName}" in org ${org}:`, error);
      throw error;
    }
  },

  async addSelectedRepoToOrgVariable(org, variableName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Adding repo ID ${repositoryId} access for org variable "${variableName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.addSelectedRepoToOrgVariable({
        org,
        variable_name: variableName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to add repo ID ${repositoryId} access for org variable "${variableName}" in org ${org}:`, error);
      throw error;
    }
  },

  async removeSelectedRepoFromOrgVariable(org, variableName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Removing repo ID ${repositoryId} access for org variable "${variableName}" in org ${org}`);
    try {
      const response = await octokit.rest.actions.removeSelectedRepoFromOrgVariable({
        org,
        variable_name: variableName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to remove repo ID ${repositoryId} access for org variable "${variableName}" in org ${org}:`, error);
      throw error;
    }
  },

  async listSelectedReposForOrgCodespacesSecret(org, secretName) {
    logger.info(`🐙 [GitHub Service] Listing repos for org Codespaces secret "${secretName}" in org ${org}`);
    try {
      const { data } = await octokit.rest.codespaces.listSelectedReposForOrgSecret({
        org,
        secret_name: secretName,
      });
      return data;
    } catch (error) {
      logger.error(`Failed to list repos for org Codespaces secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async setSelectedReposForOrgCodespacesSecret(org, secretName, selectedRepositoryIds = []) {
    logger.info(`🐙 [GitHub Service] Setting repos access for org Codespaces secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.codespaces.setSelectedReposForOrgSecret({
        org,
        secret_name: secretName,
        selected_repository_ids: selectedRepositoryIds.map(id => parseInt(id, 10)),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to set repos access for org Codespaces secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async addSelectedRepoToOrgCodespacesSecret(org, secretName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Adding repo ID ${repositoryId} access for org Codespaces secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.codespaces.addSelectedRepoToOrgSecret({
        org,
        secret_name: secretName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to add repo ID ${repositoryId} access for org Codespaces secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },

  async removeSelectedRepoFromOrgCodespacesSecret(org, secretName, repositoryId) {
    logger.info(`🐙 [GitHub Service] Removing repo ID ${repositoryId} access for org Codespaces secret "${secretName}" in org ${org}`);
    try {
      const response = await octokit.rest.codespaces.removeSelectedRepoFromOrgSecret({
        org,
        secret_name: secretName,
        repository_id: parseInt(repositoryId, 10),
      });
      return response.data || { success: true };
    } catch (error) {
      logger.error(`Failed to remove repo ID ${repositoryId} access for org Codespaces secret "${secretName}" in org ${org}:`, error);
      throw error;
    }
  },
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the mock inside the hoisted block to avoid ReferenceError on hoisting
vi.mock('octokit', () => {
  const mockOctokitInstance = {
    graphql: vi.fn(),
    request: vi.fn(),
    rest: {
      classroom: {
        listClassrooms: vi.fn(),
        getClassroom: vi.fn(),
        listAssignmentsForClassroom: vi.fn(),
        getAssignment: vi.fn(),
      },
      users: {
        getAuthenticated: vi.fn(),
        listEmailsForAuthenticatedUser: vi.fn(),
        addEmailsForAuthenticatedUser: vi.fn(),
        deleteEmailsForAuthenticatedUser: vi.fn(),
        listPublicKeysForAuthenticatedUser: vi.fn(),
        addPublicKeyForAuthenticatedUser: vi.fn(),
        deletePublicKeyForAuthenticatedUser: vi.fn(),
        listBlockedForAuthenticatedUser: vi.fn(),
        checkBlockedForAuthenticatedUser: vi.fn(),
        block: vi.fn(),
        unblock: vi.fn(),
        listGpgKeysForAuthenticatedUser: vi.fn(),
        getGpgKeyForAuthenticatedUser: vi.fn(),
        createGpgKeyForAuthenticatedUser: vi.fn(),
        deleteGpgKeyForAuthenticatedUser: vi.fn(),
        listSocialAccountsForAuthenticatedUser: vi.fn(),
        addSocialAccountsForAuthenticatedUser: vi.fn(),
        deleteSocialAccountsForAuthenticatedUser: vi.fn(),
        listFollowersForAuthenticatedUser: vi.fn(),
        listFollowingForAuthenticatedUser: vi.fn(),
        checkIfFollowingForTokenUser: vi.fn(),
        followUserForAuthenticatedUser: vi.fn(),
        unfollowUserForAuthenticatedUser: vi.fn(),
        listFollowersForUser: vi.fn(),
        listFollowingForUser: vi.fn(),
        listPublicKeysForUser: vi.fn(),
        listGpgKeysForUser: vi.fn(),
      },
      repos: {
        listForAuthenticatedUser: vi.fn(),
        createForAuthenticatedUser: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        listBranches: vi.fn(),
        getContent: vi.fn(),
        createOrUpdateFileContents: vi.fn(),
        deleteFile: vi.fn(),
        listCommits: vi.fn(),
        compareCommits: vi.fn(),
        listReleases: vi.fn(),
        createRelease: vi.fn(),
        getLatestRelease: vi.fn(),
        listCollaborators: vi.fn(),
        addCollaborator: vi.fn(),
        removeCollaborator: vi.fn(),
        listWebhooks: vi.fn(),
        createWebhook: vi.fn(),
        deleteWebhook: vi.fn(),
        listDeployments: vi.fn(),
        createDeployment: vi.fn(),
        createDeploymentStatus: vi.fn(),
        listEnvironments: vi.fn(),
        createOrUpdateEnvironment: vi.fn(),
        createOrUpdateCustomPropertiesValues: vi.fn(),
        getCustomPropertiesValues: vi.fn(),
        getRepoRulesets: vi.fn(),
        getRepoRuleset: vi.fn(),
        createRepoRuleset: vi.fn(),
        updateRepoRuleset: vi.fn(),
        deleteRepoRuleset: vi.fn(),
        listDeployKeys: vi.fn(),
        getDeployKey: vi.fn(),
        createDeployKey: vi.fn(),
        deleteDeployKey: vi.fn(),
        createCommitStatus: vi.fn(),
        listStatusesForRef: vi.fn(),
        listCommitComments: vi.fn(),
        getCommitComment: vi.fn(),
        createCommitComment: vi.fn(),
        updateCommitComment: vi.fn(),
        deleteCommitComment: vi.fn(),
        listForks: vi.fn(),
        createFork: vi.fn(),
        listInvitations: vi.fn(),
        deleteInvitation: vi.fn(),
        updateInvitation: vi.fn(),
        getPages: vi.fn(),
        createPagesSite: vi.fn(),
        updatePagesSite: vi.fn(),
        deletePagesSite: vi.fn(),
        listPagesBuilds: vi.fn(),
        getPagesBuild: vi.fn(),
        requestPagesBuild: vi.fn(),
        enablePrivateVulnerabilityReporting: vi.fn(),
        disablePrivateVulnerabilityReporting: vi.fn(),
        enableDependabotAlerts: vi.fn(),
        disableDependabotAlerts: vi.fn(),
        enableAutomatedSecurityFixes: vi.fn(),
        disableAutomatedSecurityFixes: vi.fn(),
        listAutolinks: vi.fn(),
        createAutolink: vi.fn(),
        getAutolink: vi.fn(),
        deleteAutolink: vi.fn(),
        listReleaseAssets: vi.fn(),
        getReleaseAsset: vi.fn(),
        updateReleaseAsset: vi.fn(),
        deleteReleaseAsset: vi.fn(),
        getBranch: vi.fn(),
        getBranchProtection: vi.fn(),
        updateBranchProtection: vi.fn(),
        deleteBranchProtection: vi.fn(),
        getAdminBranchProtection: vi.fn(),
        setAdminBranchProtection: vi.fn(),
        deleteAdminBranchProtection: vi.fn(),
        getPullRequestReviewProtection: vi.fn(),
        updatePullRequestReviewProtection: vi.fn(),
        deletePullRequestReviewProtection: vi.fn(),
        getCommitSignatureProtection: vi.fn(),
        createCommitSignatureProtection: vi.fn(),
        deleteCommitSignatureProtection: vi.fn(),
        getAccessRestrictions: vi.fn(),
        deleteAccessRestrictions: vi.fn(),
        listAppsWithAccessToProtectedBranch: vi.fn(),
        addAppsAccessRestrictions: vi.fn(),
        setAppsAccessRestrictions: vi.fn(),
        removeAppsAccessRestrictions: vi.fn(),
        listTeamsWithAccessToProtectedBranch: vi.fn(),
        addTeamsAccessRestrictions: vi.fn(),
        setTeamsAccessRestrictions: vi.fn(),
        removeTeamsAccessRestrictions: vi.fn(),
        listUsersWithAccessToProtectedBranch: vi.fn(),
        addUsersAccessRestrictions: vi.fn(),
        setUsersAccessRestrictions: vi.fn(),
        removeUsersAccessRestrictions: vi.fn(),
        listTeams: vi.fn(),
        listTags: vi.fn(),
        renameBranch: vi.fn(),
        mergeUpstream: vi.fn(),
        update: vi.fn(),
        getRequiredStatusChecks: vi.fn(),
        updateRequiredStatusChecks: vi.fn(),
        removeRequiredStatusChecks: vi.fn(),
        getAllStatusCheckContexts: vi.fn(),
        addStatusCheckContexts: vi.fn(),
        setStatusCheckContexts: vi.fn(),
        removeStatusCheckContexts: vi.fn(),
        getAppsAndTeamsRequestReviewBypassers: vi.fn(),
        addAppsAndTeamsRequestReviewBypassers: vi.fn(),
        setAppsAndTeamsRequestReviewBypassers: vi.fn(),
        removeAppsAndTeamsRequestReviewBypassers: vi.fn(),
      },
      issues: {
        listForRepo: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        listComments: vi.fn(),
        getComment: vi.fn(),
        createComment: vi.fn(),
        updateComment: vi.fn(),
        deleteComment: vi.fn(),
        listLabelsForRepo: vi.fn(),
        getLabel: vi.fn(),
        createLabel: vi.fn(),
        updateLabel: vi.fn(),
        deleteLabel: vi.fn(),
        addLabels: vi.fn(),
        removeLabel: vi.fn(),
        listMilestones: vi.fn(),
        getMilestone: vi.fn(),
        createMilestone: vi.fn(),
        updateMilestone: vi.fn(),
        deleteMilestone: vi.fn(),
        listAssignees: vi.fn(),
        checkUserCanBeAssigned: vi.fn(),
        addAssignees: vi.fn(),
        removeAssignees: vi.fn(),
      },
      pulls: {
        list: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
        merge: vi.fn(),
        listReviews: vi.fn(),
        getReview: vi.fn(),
        createReview: vi.fn(),
        submitReview: vi.fn(),
        dismissReview: vi.fn(),
        listReviewComments: vi.fn(),
        getReviewComment: vi.fn(),
        createReviewComment: vi.fn(),
        updateReviewComment: vi.fn(),
        deleteReviewComment: vi.fn(),
        checkIfMerged: vi.fn(),
        listRequestedReviewers: vi.fn(),
        requestReviewers: vi.fn(),
        removeRequestedReviewers: vi.fn(),
        listFiles: vi.fn(),
      },
      actions: {
        listRepoWorkflows: vi.fn(),
        createWorkflowDispatch: vi.fn(),
        listWorkflowRunsForRepo: vi.fn(),
        getRepoPublicKey: vi.fn(),
        createOrUpdateRepoSecret: vi.fn(),
        listRepoVariables: vi.fn(),
        createRepoVariable: vi.fn(),
        updateRepoVariable: vi.fn(),
        listJobsForWorkflowRun: vi.fn(),
        listWorkflowRunArtifacts: vi.fn(),
        downloadArtifact: vi.fn(),
        listWorkflowRuns: vi.fn(),
        getWorkflow: vi.fn(),
        getWorkflowRun: vi.fn(),
        listSelfHostedRunnersForOrg: vi.fn(),
        listSelfHostedRunnersForRepo: vi.fn(),
        getSelfHostedRunnerForOrg: vi.fn(),
        getSelfHostedRunnerForRepo: vi.fn(),
        deleteSelfHostedRunnerFromOrg: vi.fn(),
        deleteSelfHostedRunnerFromRepo: vi.fn(),
        getOrgPublicKey: vi.fn(),
        listOrgSecrets: vi.fn(),
        getOrgSecret: vi.fn(),
        createOrUpdateOrgSecret: vi.fn(),
        deleteOrgSecret: vi.fn(),
        listOrgVariables: vi.fn(),
        getOrgVariable: vi.fn(),
        createOrgVariable: vi.fn(),
        updateOrgVariable: vi.fn(),
        deleteOrgVariable: vi.fn(),
        getEnvironmentPublicKey: vi.fn(),
        listEnvironmentSecrets: vi.fn(),
        getEnvironmentSecret: vi.fn(),
        createOrUpdateEnvironmentSecret: vi.fn(),
        deleteEnvironmentSecret: vi.fn(),
        listEnvironmentVariables: vi.fn(),
        getEnvironmentVariable: vi.fn(),
        createEnvironmentVariable: vi.fn(),
        updateEnvironmentVariable: vi.fn(),
        deleteEnvironmentVariable: vi.fn(),
        listSelfHostedRunnerGroupsForOrg: vi.fn(),
        getSelfHostedRunnerGroupForOrg: vi.fn(),
        createSelfHostedRunnerGroupForOrg: vi.fn(),
        updateSelfHostedRunnerGroupForOrg: vi.fn(),
        deleteSelfHostedRunnerGroupFromOrg: vi.fn(),
        getActionsPermissionsOrg: vi.fn(),
        setActionsPermissionsOrg: vi.fn(),
        getActionsPermissionsRepo: vi.fn(),
        setActionsPermissionsRepo: vi.fn(),
        getAllowedActionsRepository: vi.fn(),
        setAllowedActionsRepository: vi.fn(),
        getAllowedActionsOrganization: vi.fn(),
        setAllowedActionsOrganization: vi.fn(),
        listSelectedRepositoriesEnabledGatewayForOrganizationSecret: vi.fn(),
        setSelectedRepositoriesEnabledGatewayForOrganizationSecret: vi.fn(),
        addSelectedRepositoryEnabledGatewayForOrganizationSecret: vi.fn(),
        removeSelectedRepositoryEnabledGatewayForOrganizationSecret: vi.fn(),
        listSelectedReposForOrgVariable: vi.fn(),
        setSelectedReposForOrgVariable: vi.fn(),
        addSelectedRepoToOrgVariable: vi.fn(),
        removeSelectedRepoFromOrgVariable: vi.fn(),
      },
      gists: {
        list: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      projects: {
        listForRepo: vi.fn(),
        createForRepo: vi.fn(),
      },
      search: {
        repos: vi.fn(),
        code: vi.fn(),
        issuesAndPullRequests: vi.fn(),
        users: vi.fn(),
      },
      git: {
        getRef: vi.fn(),
        createRef: vi.fn(),
        updateRef: vi.fn(),
        createBlob: vi.fn(),
        createTree: vi.fn(),
        createCommit: vi.fn(),
      },
      orgs: {
        listForAuthenticatedUser: vi.fn(),
        createOrUpdateCustomProperty: vi.fn(),
        getCustomProperty: vi.fn(),
        removeCustomProperty: vi.fn(),
        listCustomProperties: vi.fn(),
        getOrgRulesets: vi.fn(),
        getOrgRuleset: vi.fn(),
        createOrgRuleset: vi.fn(),
        updateOrgRuleset: vi.fn(),
        deleteOrgRuleset: vi.fn(),
        listSecurityManagerTeams: vi.fn(),
        addSecurityManagerTeam: vi.fn(),
        removeSecurityManagerTeam: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        getMembershipForUser: vi.fn(),
        setMembershipForUser: vi.fn(),
        removeMember: vi.fn(),
        listOutsideCollaborators: vi.fn(),
        removeOutsideCollaborator: vi.fn(),
        convertMemberToOutsideCollaborator: vi.fn(),
        listBlockedUsers: vi.fn(),
        checkBlockedUser: vi.fn(),
        blockUser: vi.fn(),
        unblockUser: vi.fn(),
        listSecurityAdvisories: vi.fn(),
        createSecurityAdvisory: vi.fn(),
        listWebhooks: vi.fn(),
        createWebhook: vi.fn(),
        getWebhook: vi.fn(),
        updateWebhook: vi.fn(),
        deleteWebhook: vi.fn(),
        pingWebhook: vi.fn(),
        listPendingInvitations: vi.fn(),
        createInvitation: vi.fn(),
        cancelInvitation: vi.fn(),
        listInvitationTeams: vi.fn(),
        listPatGrantRequests: vi.fn(),
        reviewPatGrantRequest: vi.fn(),
        listPatGrants: vi.fn(),
        revokePatGrant: vi.fn(),
        reviewPatGrantRequests: vi.fn(),
      },
      teams: {
        list: vi.fn(),
        listMembersInOrg: vi.fn(),
        listDiscussionsInOrg: vi.fn(),
        getDiscussionInOrg: vi.fn(),
        createDiscussionInOrg: vi.fn(),
        updateDiscussionInOrg: vi.fn(),
        deleteDiscussionInOrg: vi.fn(),
        listDiscussionCommentsInOrg: vi.fn(),
        getDiscussionCommentInOrg: vi.fn(),
        createDiscussionCommentInOrg: vi.fn(),
        updateDiscussionCommentInOrg: vi.fn(),
        deleteDiscussionCommentInOrg: vi.fn(),
        addOrUpdateTeamPermissionsInOrg: vi.fn(),
        removeTeam: vi.fn(),
        getByName: vi.fn(),
        addOrUpdateMembershipForUserInOrg: vi.fn(),
        removeMembershipForUserInOrg: vi.fn(),
        listReposInOrg: vi.fn(),
        checkPermissionsForRepoInOrg: vi.fn(),
        addOrUpdateRepoPermissionsInOrg: vi.fn(),
        removeRepoInOrg: vi.fn(),
        listChildInOrg: vi.fn(),
      },
      codespaces: {
        listForAuthenticatedUser: vi.fn(),
        createWithRepoForAuthenticatedUser: vi.fn(),
        deleteForAuthenticatedUser: vi.fn(),
        getPublicKeyForAuthenticatedUser: vi.fn(),
        listSecretsForAuthenticatedUser: vi.fn(),
        getSecretForAuthenticatedUser: vi.fn(),
        createOrUpdateSecretForAuthenticatedUser: vi.fn(),
        deleteSecretForAuthenticatedUser: vi.fn(),
        getOrgPublicKey: vi.fn(),
        listOrgSecrets: vi.fn(),
        getOrgSecret: vi.fn(),
        createOrUpdateOrgSecret: vi.fn(),
        deleteOrgSecret: vi.fn(),
        listSelectedReposForOrgSecret: vi.fn(),
        setSelectedReposForOrgSecret: vi.fn(),
        addSelectedRepoToOrgSecret: vi.fn(),
        removeSelectedRepoFromOrgSecret: vi.fn(),
        listInOrg: vi.fn(),
        stopForAuthenticatedUser: vi.fn(),
        startForAuthenticatedUser: vi.fn(),
        deleteFromOrg: vi.fn(),
      },
      dependabot: {
        listAlertsForRepo: vi.fn(),
        getOrgPublicKey: vi.fn(),
        listOrgSecrets: vi.fn(),
        getOrgSecret: vi.fn(),
        createOrUpdateOrgSecret: vi.fn(),
        deleteOrgSecret: vi.fn(),
        listSelectedReposForOrgSecret: vi.fn(),
        setSelectedReposForOrgSecret: vi.fn(),
        addSelectedRepoToOrgSecret: vi.fn(),
        removeSelectedRepoFromOrgSecret: vi.fn(),
        getRepoPublicKey: vi.fn(),
        listRepoSecrets: vi.fn(),
        getRepoSecret: vi.fn(),
        createOrUpdateRepoSecret: vi.fn(),
        deleteRepoSecret: vi.fn(),
      },
      copilot: {
        getBillingDetailsForUser: vi.fn(),
        listSeatsForOrg: vi.fn(),
        addSeatsToOrg: vi.fn(),
        removeSeatsFromOrg: vi.fn(),
        getSeatDetailsForUser: vi.fn(),
      },
      checks: {
        create: vi.fn(),
        update: vi.fn(),
        listForRef: vi.fn(),
        createSuite: vi.fn(),
      },
      codeScanning: {
        listAlertsForRepo: vi.fn(),
        getAlert: vi.fn(),
        updateAlert: vi.fn(),
        listAlertInstances: vi.fn(),
        listAnalysesForRepo: vi.fn(),
        getAnalysis: vi.fn(),
        deleteAnalysis: vi.fn(),
        uploadSarif: vi.fn(),
      },
      secretScanning: {
        listAlertsForRepo: vi.fn(),
        getAlert: vi.fn(),
        listAlertsForOrg: vi.fn(),
        listLocationsForAlert: vi.fn(),
      },
      apps: {
        getAuthenticated: vi.fn(),
        listInstallations: vi.fn(),
        getInstallation: vi.fn(),
        listReposAccessibleToInstallation: vi.fn(),
        createInstallationAccessToken: vi.fn(),
        deleteInstallation: vi.fn(),
        suspendInstallation: vi.fn(),
        unsuspendInstallation: vi.fn(),
        getWebhookConfigForApp: vi.fn(),
        updateWebhookConfigForApp: vi.fn(),
        listWebhookDeliveries: vi.fn(),
        getWebhookDelivery: vi.fn(),
        redeliverWebhookDelivery: vi.fn(),
      },
      billing: {
        getGithubActionsBillingOrg: vi.fn(),
        getGithubPackagesBillingOrg: vi.fn(),
        getSharedStorageBillingOrg: vi.fn(),
      },
      enterpriseAdmin: {
        getActionsPermissionsEnterprise: vi.fn(),
        setActionsPermissionsEnterprise: vi.fn(),
        listSelfHostedRunnersForEnterprise: vi.fn(),
        getSelfHostedRunnerForEnterprise: vi.fn(),
        deleteSelfHostedRunnerFromEnterprise: vi.fn(),
      },
      activity: {
        listPublicEvents: vi.fn(),
        listRepoEvents: vi.fn(),
        listOrgEventsForAuthenticatedUser: vi.fn(),
        listStargazersForRepo: vi.fn(),
        listReposStarredByAuthenticatedUser: vi.fn(),
        checkRepoIsStarredByAuthenticatedUser: vi.fn(),
        starRepoForAuthenticatedUser: vi.fn(),
        unstarRepoForAuthenticatedUser: vi.fn(),
        getRepoSubscription: vi.fn(),
        setRepoSubscription: vi.fn(),
        deleteRepoSubscription: vi.fn(),
        listNotificationsForAuthenticatedUser: vi.fn(),
        markNotificationsAsRead: vi.fn(),
        listRepoNotifications: vi.fn(),
        markRepoNotificationsAsRead: vi.fn(),
        getThread: vi.fn(),
        markThreadAsRead: vi.fn(),
        getThreadSubscription: vi.fn(),
        setThreadSubscription: vi.fn(),
        deleteThreadSubscription: vi.fn(),
      },
      interactions: {
        getRestrictionsForRepo: vi.fn(),
        setRestrictionsForRepo: vi.fn(),
        removeRestrictionsForRepo: vi.fn(),
      },
      securityAdvisories: {
        listGlobalAdvisories: vi.fn(),
        getRepositoryAdvisory: vi.fn(),
      },
      codeSecurity: {
        getConfigurationsForOrg: vi.fn(),
        createConfigurationForOrg: vi.fn(),
        updateConfigurationForOrg: vi.fn(),
        deleteConfiguration: vi.fn(),
        attachConfiguration: vi.fn(),
        getRepoConfiguration: vi.fn(),
      },
      dependencyGraph: {
        exportSbom: vi.fn(),
      },
      packages: {
        listPackagesForOrganization: vi.fn(),
        getAllPackageVersionsForPackageOwnedByOrg: vi.fn(),
      },
      oidc: {
        getOidcCustomSubTemplateForOrg: vi.fn(),
        updateOidcCustomSubTemplateForOrg: vi.fn(),
      },
      migrations: {
        startForOrg: vi.fn(),
        getStatusForOrg: vi.fn(),
      },
      emojis: {
        get: vi.fn(),
      },
      gitignore: {
        getAllTemplates: vi.fn(),
        getTemplate: vi.fn(),
      },
      licenses: {
        getForRepo: vi.fn(),
      },
      rateLimit: {
        get: vi.fn(),
      },
      meta: {
        get: vi.fn(),
      },
      markdown: {
        render: vi.fn(),
      },
      codesOfConduct: {
        getAllCodesOfConduct: vi.fn(),
        getConductCode: vi.fn(),
      },
      privateRegistries: {
        listOrgPrivateRegistries: vi.fn(),
        getOrgPrivateRegistry: vi.fn(),
      },
      reactions: {
        createForIssue: vi.fn(),
        listForIssue: vi.fn(),
        deleteForIssue: vi.fn(),
      },
      hostedCompute: {
        listNetworkConfigurationsForOrg: vi.fn(),
        getNetworkSettingsForOrg: vi.fn(),
      },
      campaigns: {
        listOrgCampaigns: vi.fn(),
      },
    },
  };
  globalThis.__mockOctokit = mockOctokitInstance;
  return {
    Octokit: class {
      constructor() {
        return mockOctokitInstance;
      }
    },
  };
});

// Import service after mock setup
import { GithubService } from './github.service.js';

describe('GithubService - Direct GitHub API Wrapper', () => {
  let mockOctokit;

  beforeEach(() => {
    mockOctokit = globalThis.__mockOctokit;
    vi.clearAllMocks();
  });

  // 1. User
  it('should fetch authenticated user details', async () => {
    const mockUser = { login: 'octocat', id: 1 };
    mockOctokit.rest.users.getAuthenticated.mockResolvedValue({
      data: mockUser,
    });

    const result = await GithubService.getAuthenticatedUser();
    expect(result).toEqual(mockUser);
    expect(mockOctokit.rest.users.getAuthenticated).toHaveBeenCalled();
  });

  // 2. Repositories
  it('should list repositories for authenticated user', async () => {
    const mockRepos = [{ id: 1, name: 'repo-1' }];
    mockOctokit.rest.repos.listForAuthenticatedUser.mockResolvedValue({
      data: mockRepos,
    });

    const result = await GithubService.listRepositories({
      visibility: 'public',
    });
    expect(result).toEqual(mockRepos);
    expect(
      mockOctokit.rest.repos.listForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      sort: 'updated',
      per_page: 30,
      page: 1,
      visibility: 'public',
    });
  });

  it('should create repository for authenticated user', async () => {
    const mockRepo = { id: 2, name: 'new-repo' };
    mockOctokit.rest.repos.createForAuthenticatedUser.mockResolvedValue({
      data: mockRepo,
    });

    const result = await GithubService.createRepository({
      name: 'new-repo',
      private: true,
    });
    expect(result).toEqual(mockRepo);
    expect(
      mockOctokit.rest.repos.createForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      name: 'new-repo',
      description: undefined,
      private: true,
      auto_init: true,
      gitignore_template: undefined,
      license_template: undefined,
    });
  });

  it('should fetch repository details', async () => {
    const mockRepo = { id: 3, name: 'existing-repo' };
    mockOctokit.rest.repos.get.mockResolvedValue({ data: mockRepo });

    const result = await GithubService.getRepository('owner', 'repo');
    expect(result).toEqual(mockRepo);
    expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should delete repository and return success status', async () => {
    mockOctokit.rest.repos.delete.mockResolvedValue({ status: 204 });

    const result = await GithubService.deleteRepository('owner', 'repo');
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.delete).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 3. Issues
  it('should create issue in repository', async () => {
    const mockIssue = { number: 42, title: 'Bug report' };
    mockOctokit.rest.issues.create.mockResolvedValue({ data: mockIssue });

    const result = await GithubService.createIssue('owner', 'repo', {
      title: 'Bug report',
      body: 'Error details',
    });
    expect(result).toEqual(mockIssue);
    expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'Bug report',
      body: 'Error details',
      labels: undefined,
      assignees: undefined,
    });
  });

  // 4. Pull Requests
  it('should list pull requests', async () => {
    const mockPrs = [{ number: 1, title: 'Add feature' }];
    mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPrs });

    const result = await GithubService.listPullRequests('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockPrs);
    expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      per_page: 30,
      page: 1,
    });
  });

  // 5. Actions
  it('should trigger workflow dispatch', async () => {
    mockOctokit.rest.actions.createWorkflowDispatch.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.triggerWorkflowDispatch(
      'owner',
      'repo',
      'build.yml',
      'main',
      { env: 'prod' },
    );
    expect(result).toBe(true);
    expect(
      mockOctokit.rest.actions.createWorkflowDispatch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      workflow_id: 'build.yml',
      ref: 'main',
      inputs: { env: 'prod' },
    });
  });

  // 6. Gists
  it('should create gist', async () => {
    const mockGist = { id: 'gist123' };
    mockOctokit.rest.gists.create.mockResolvedValue({ data: mockGist });

    const result = await GithubService.createGist({
      description: 'test gist',
      files: { 'test.js': { content: 'test' } },
    });
    expect(result).toEqual(mockGist);
    expect(mockOctokit.rest.gists.create).toHaveBeenCalledWith({
      description: 'test gist',
      files: { 'test.js': { content: 'test' } },
      public: false,
    });
  });

  // 7. Projects
  it('should list projects for a repository', async () => {
    const mockProjects = [{ id: 1, name: 'Project 1' }];
    mockOctokit.rest.projects.listForRepo.mockResolvedValue({
      data: mockProjects,
    });

    const result = await GithubService.listProjects('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockProjects);
    expect(mockOctokit.rest.projects.listForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      per_page: 30,
      page: 1,
    });
  });

  it('should create a project in a repository', async () => {
    const mockProject = { id: 2, name: 'New Project' };
    mockOctokit.rest.projects.createForRepo.mockResolvedValue({
      data: mockProject,
    });

    const result = await GithubService.createProject('owner', 'repo', {
      name: 'New Project',
      body: 'Desc',
    });
    expect(result).toEqual(mockProject);
    expect(mockOctokit.rest.projects.createForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'New Project',
      body: 'Desc',
    });
  });

  // 8. GraphQL
  it('should execute GraphQL queries', async () => {
    const mockResponse = { repository: { name: 'test' } };
    mockOctokit.graphql.mockResolvedValue(mockResponse);

    const result = await GithubService.graphql('query { repo }', {
      var1: 'val',
    });
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.graphql).toHaveBeenCalledWith('query { repo }', {
      var1: 'val',
    });
  });

  // 9. Search
  it('should search repositories', async () => {
    const mockRes = { items: [{ name: 'matched' }] };
    mockOctokit.rest.search.repos.mockResolvedValue({ data: mockRes });

    const result = await GithubService.searchRepositories('vitest', {
      page: 2,
    });
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.search.repos).toHaveBeenCalledWith({
      q: 'vitest',
      sort: undefined,
      order: undefined,
      per_page: 30,
      page: 2,
    });
  });

  it('should search code', async () => {
    const mockRes = { items: [{ path: 'matched.js' }] };
    mockOctokit.rest.search.code.mockResolvedValue({ data: mockRes });

    const result = await GithubService.searchCode('import x', {
      sort: 'indexed',
    });
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.search.code).toHaveBeenCalledWith({
      q: 'import x',
      sort: 'indexed',
      order: undefined,
      per_page: 30,
      page: 1,
    });
  });

  // 10. Git Data / Contents
  it('should fetch file content', async () => {
    const mockContent = { type: 'file', content: 'base64' };
    mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockContent });

    const result = await GithubService.getFileContent(
      'owner',
      'repo',
      'src/index.js',
      'main',
    );
    expect(result).toEqual(mockContent);
    expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'src/index.js',
      ref: 'main',
    });
  });

  it('should commit or update a file', async () => {
    const mockCommit = { commit: { sha: 'commitsha' } };
    mockOctokit.rest.repos.createOrUpdateFileContents.mockResolvedValue({
      data: mockCommit,
    });

    const fileData = {
      message: 'update',
      content: 'dGVzdA==',
      sha: 'oldsha',
      branch: 'main',
    };
    const result = await GithubService.createOrUpdateFile(
      'owner',
      'repo',
      'src/index.js',
      fileData,
    );
    expect(result).toEqual(mockCommit);
    expect(
      mockOctokit.rest.repos.createOrUpdateFileContents,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'src/index.js',
      message: 'update',
      content: 'dGVzdA==',
      sha: 'oldsha',
      branch: 'main',
      committer: undefined,
      author: undefined,
    });
  });

  it('should list commits for a repository', async () => {
    const mockCommits = [{ sha: 'sha1' }];
    mockOctokit.rest.repos.listCommits.mockResolvedValue({ data: mockCommits });

    const result = await GithubService.listCommits('owner', 'repo', {
      path: 'src/index.js',
    });
    expect(result).toEqual(mockCommits);
    expect(mockOctokit.rest.repos.listCommits).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      sha: undefined,
      path: 'src/index.js',
      author: undefined,
      since: undefined,
      until: undefined,
      per_page: 30,
      page: 1,
    });
  });

  // 11. Releases
  it('should list releases', async () => {
    const mockReleases = [{ tag_name: 'v1.0.0' }];
    mockOctokit.rest.repos.listReleases.mockResolvedValue({
      data: mockReleases,
    });

    const result = await GithubService.listReleases('owner', 'repo', {
      page: 3,
    });
    expect(result).toEqual(mockReleases);
    expect(mockOctokit.rest.repos.listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 30,
      page: 3,
    });
  });

  it('should fetch the latest release', async () => {
    const mockRelease = { tag_name: 'v2.0.0' };
    mockOctokit.rest.repos.getLatestRelease.mockResolvedValue({
      data: mockRelease,
    });

    const result = await GithubService.getLatestRelease('owner', 'repo');
    expect(result).toEqual(mockRelease);
    expect(mockOctokit.rest.repos.getLatestRelease).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 12. Collaborators
  it('should add a collaborator', async () => {
    const mockRes = { invite_id: 123 };
    mockOctokit.rest.repos.addCollaborator.mockResolvedValue({ data: mockRes });

    const result = await GithubService.addCollaborator(
      'owner',
      'repo',
      'user1',
      'admin',
    );
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.repos.addCollaborator).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      username: 'user1',
      permission: 'admin',
    });
  });

  it('should remove a collaborator', async () => {
    mockOctokit.rest.repos.removeCollaborator.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.removeCollaborator(
      'owner',
      'repo',
      'user1',
    );
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.removeCollaborator).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      username: 'user1',
    });
  });

  // 13. Git Database Plumbing
  it('should get git reference', async () => {
    const mockRef = { ref: 'refs/heads/main', object: { sha: 'sha123' } };
    mockOctokit.rest.git.getRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.getRef('owner', 'repo', 'heads/main');
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.getRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'heads/main',
    });
  });

  it('should create git reference', async () => {
    const mockRef = {
      ref: 'refs/heads/new-feature',
      object: { sha: 'sha123' },
    };
    mockOctokit.rest.git.createRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.createRef('owner', 'repo', {
      ref: 'refs/heads/new-feature',
      sha: 'sha123',
    });
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'refs/heads/new-feature',
      sha: 'sha123',
    });
  });

  it('should update git reference', async () => {
    const mockRef = { ref: 'refs/heads/main', object: { sha: 'sha456' } };
    mockOctokit.rest.git.updateRef.mockResolvedValue({ data: mockRef });

    const result = await GithubService.updateRef(
      'owner',
      'repo',
      'heads/main',
      { sha: 'sha456', force: true },
    );
    expect(result).toEqual(mockRef);
    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'heads/main',
      sha: 'sha456',
      force: true,
    });
  });

  it('should create git blob', async () => {
    const mockBlob = { sha: 'blobsha123', url: 'http://...' };
    mockOctokit.rest.git.createBlob.mockResolvedValue({ data: mockBlob });

    const result = await GithubService.createBlob('owner', 'repo', {
      content: 'content',
      encoding: 'utf-8',
    });
    expect(result).toEqual(mockBlob);
    expect(mockOctokit.rest.git.createBlob).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      content: 'content',
      encoding: 'utf-8',
    });
  });

  it('should create git tree', async () => {
    const mockTree = { sha: 'treesha123', tree: [] };
    mockOctokit.rest.git.createTree.mockResolvedValue({ data: mockTree });

    const treeData = {
      tree: [
        { path: 'file.js', mode: '100644', type: 'blob', sha: 'blobsha123' },
      ],
      base_tree: 'basesha',
    };
    const result = await GithubService.createTree('owner', 'repo', treeData);
    expect(result).toEqual(mockTree);
    expect(mockOctokit.rest.git.createTree).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      tree: treeData.tree,
      base_tree: 'basesha',
    });
  });

  it('should create git commit', async () => {
    const mockCommit = { sha: 'commitsha123', message: 'test commit' };
    mockOctokit.rest.git.createCommit.mockResolvedValue({ data: mockCommit });

    const commitData = {
      message: 'test commit',
      tree: 'treesha123',
      parents: ['parentsha'],
      author: { name: 'Author', email: 'author@test.com' },
      committer: { name: 'Committer', email: 'committer@test.com' },
      signature: 'sig',
    };
    const result = await GithubService.createCommit(
      'owner',
      'repo',
      commitData,
    );
    expect(result).toEqual(mockCommit);
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      message: 'test commit',
      tree: 'treesha123',
      parents: ['parentsha'],
      author: commitData.author,
      committer: commitData.committer,
      signature: 'sig',
    });
  });

  // 14. Organizations & Teams API
  it('should list organizations for the authenticated user', async () => {
    const mockOrgs = [{ login: 'org1', id: 10 }];
    mockOctokit.rest.orgs.listForAuthenticatedUser.mockResolvedValue({
      data: mockOrgs,
    });

    const result = await GithubService.listOrganizations({
      per_page: 10,
      page: 2,
    });
    expect(result).toEqual(mockOrgs);
    expect(mockOctokit.rest.orgs.listForAuthenticatedUser).toHaveBeenCalledWith(
      {
        per_page: 10,
        page: 2,
      },
    );
  });

  it('should list teams in an organization', async () => {
    const mockTeams = [{ name: 'team1', slug: 'team-1' }];
    mockOctokit.rest.teams.list.mockResolvedValue({ data: mockTeams });

    const result = await GithubService.listTeams('org1', { per_page: 15 });
    expect(result).toEqual(mockTeams);
    expect(mockOctokit.rest.teams.list).toHaveBeenCalledWith({
      org: 'org1',
      per_page: 15,
      page: 1,
    });
  });

  it('should list team members in an organization', async () => {
    const mockMembers = [{ login: 'member1' }];
    mockOctokit.rest.teams.listMembersInOrg.mockResolvedValue({
      data: mockMembers,
    });

    const result = await GithubService.listTeamMembers('org1', 'team-1');
    expect(result).toEqual(mockMembers);
    expect(mockOctokit.rest.teams.listMembersInOrg).toHaveBeenCalledWith({
      org: 'org1',
      team_slug: 'team-1',
    });
  });

  // 15. Repository Webhooks API
  it('should list webhooks in a repository', async () => {
    const mockHooks = [{ id: 1, name: 'web' }];
    mockOctokit.rest.repos.listWebhooks.mockResolvedValue({ data: mockHooks });

    const result = await GithubService.listWebhooks('owner', 'repo', {
      page: 3,
    });
    expect(result).toEqual(mockHooks);
    expect(mockOctokit.rest.repos.listWebhooks).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 30,
      page: 3,
    });
  });

  it('should create a webhook in a repository', async () => {
    const mockHook = { id: 2, active: true };
    mockOctokit.rest.repos.createWebhook.mockResolvedValue({ data: mockHook });

    const hookData = {
      config: { url: 'https://webhook.com' },
      events: ['push'],
      active: true,
    };
    const result = await GithubService.createWebhook('owner', 'repo', hookData);
    expect(result).toEqual(mockHook);
    expect(mockOctokit.rest.repos.createWebhook).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'web',
      config: hookData.config,
      events: hookData.events,
      active: true,
    });
  });

  it('should delete a webhook in a repository', async () => {
    mockOctokit.rest.repos.deleteWebhook.mockResolvedValue({ status: 204 });

    const result = await GithubService.deleteWebhook('owner', 'repo', 123);
    expect(result).toBe(true);
    expect(mockOctokit.rest.repos.deleteWebhook).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      hook_id: 123,
    });
  });

  // 16. Actions Secrets & Variables API
  it('should fetch actions public key for a repository', async () => {
    const mockKey = { key_id: 'key123', key: 'base64key' };
    mockOctokit.rest.actions.getRepoPublicKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.getActionsPublicKey('owner', 'repo');
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.actions.getRepoPublicKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should create or update a repository secret', async () => {
    const mockSecret = { status: 201 };
    mockOctokit.rest.actions.createOrUpdateRepoSecret.mockResolvedValue({
      data: mockSecret,
    });

    const secretData = { encrypted_value: 'encval', key_id: 'key123' };
    const result = await GithubService.createOrUpdateRepoSecret(
      'owner',
      'repo',
      'MY_SECRET',
      secretData,
    );
    expect(result).toEqual(mockSecret);
    expect(
      mockOctokit.rest.actions.createOrUpdateRepoSecret,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      secret_name: 'MY_SECRET',
      encrypted_value: 'encval',
      key_id: 'key123',
    });
  });

  it('should list repository variables', async () => {
    const mockVars = [{ name: 'VAR1', value: 'val1' }];
    mockOctokit.rest.actions.listRepoVariables.mockResolvedValue({
      data: mockVars,
    });

    const result = await GithubService.listRepoVariables('owner', 'repo', {
      per_page: 10,
    });
    expect(result).toEqual(mockVars);
    expect(mockOctokit.rest.actions.listRepoVariables).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 10,
      page: 1,
    });
  });

  it('should create a repository variable', async () => {
    const mockVar = { name: 'VAR1' };
    mockOctokit.rest.actions.createRepoVariable.mockResolvedValue({
      data: mockVar,
    });

    const result = await GithubService.createRepoVariable(
      'owner',
      'repo',
      'VAR1',
      'val1',
    );
    expect(result).toEqual(mockVar);
    expect(mockOctokit.rest.actions.createRepoVariable).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'VAR1',
      value: 'val1',
    });
  });

  it('should update a repository variable', async () => {
    const mockVar = { name: 'VAR1' };
    mockOctokit.rest.actions.updateRepoVariable.mockResolvedValue({
      data: mockVar,
    });

    const result = await GithubService.updateRepoVariable(
      'owner',
      'repo',
      'VAR1',
      'val2',
    );
    expect(result).toEqual(mockVar);
    expect(mockOctokit.rest.actions.updateRepoVariable).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'VAR1',
      value: 'val2',
    });
  });

  // 17. Codespaces API
  it('should list codespaces for authenticated user', async () => {
    const mockCodespaces = [{ id: 1, name: 'codespace-1' }];
    mockOctokit.rest.codespaces.listForAuthenticatedUser.mockResolvedValue({
      data: mockCodespaces,
    });

    const result = await GithubService.listCodespaces({ per_page: 5 });
    expect(result).toEqual(mockCodespaces);
    expect(
      mockOctokit.rest.codespaces.listForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      per_page: 5,
      page: 1,
    });
  });

  it('should create a codespace for a repository', async () => {
    const mockCodespace = { id: 2, name: 'codespace-2' };
    mockOctokit.rest.codespaces.createWithRepoForAuthenticatedUser.mockResolvedValue(
      { data: mockCodespace },
    );

    const codespaceData = { ref: 'main', machine: 'standardLinux32gb' };
    const result = await GithubService.createCodespace(
      'owner',
      'repo',
      codespaceData,
    );
    expect(result).toEqual(mockCodespace);
    expect(
      mockOctokit.rest.codespaces.createWithRepoForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
      machine: 'standardLinux32gb',
      devcontainer_path: undefined,
      multi_repo_permissions_opt_out: undefined,
    });
  });

  it('should delete a codespace', async () => {
    mockOctokit.rest.codespaces.deleteForAuthenticatedUser.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.deleteCodespace('codespace-2');
    expect(result).toBe(true);
    expect(
      mockOctokit.rest.codespaces.deleteForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      codespace_name: 'codespace-2',
    });
  });

  // 18. Dependabot Alerts API
  it('should list dependabot alerts for repository', async () => {
    const mockAlerts = [{ number: 1, security_advisory: {} }];
    mockOctokit.rest.dependabot.listAlertsForRepo.mockResolvedValue({
      data: mockAlerts,
    });

    const result = await GithubService.listDependabotAlerts('owner', 'repo', {
      state: 'open',
      severity: 'high',
    });
    expect(result).toEqual(mockAlerts);
    expect(mockOctokit.rest.dependabot.listAlertsForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      severity: 'high',
      per_page: 30,
      page: 1,
    });
  });

  // 19. Copilot API
  it('should get copilot billing details for a user', async () => {
    const mockBilling = { seat_breakdown: {} };
    mockOctokit.rest.copilot.getBillingDetailsForUser.mockResolvedValue({
      data: mockBilling,
    });

    const result = await GithubService.getCopilotBillingForUser('user1');
    expect(result).toEqual(mockBilling);
    expect(
      mockOctokit.rest.copilot.getBillingDetailsForUser,
    ).toHaveBeenCalledWith({
      username: 'user1',
    });
  });

  // 20. Discussions API (GraphQL-backed)
  it('should list discussions via GraphQL', async () => {
    const mockNodes = [{ id: 'disc1', title: 'Disc 1' }];
    mockOctokit.graphql.mockResolvedValue({
      repository: { discussions: { nodes: mockNodes } },
    });

    const result = await GithubService.listDiscussions('owner', 'repo', {
      per_page: 10,
    });
    expect(result).toEqual(mockNodes);
    expect(mockOctokit.graphql).toHaveBeenCalledWith(
      expect.stringContaining(
        'query($owner: String!, $repo: String!, $first: Int)',
      ),
      { owner: 'owner', repo: 'repo', first: 10 },
    );
  });

  it('should get discussion by number via GraphQL', async () => {
    const mockDisc = { id: 'disc1', number: 42, title: 'Disc 1' };
    mockOctokit.graphql.mockResolvedValue({
      repository: { discussion: mockDisc },
    });

    const result = await GithubService.getDiscussion('owner', 'repo', 42);
    expect(result).toEqual(mockDisc);
    expect(mockOctokit.graphql).toHaveBeenCalledWith(
      expect.stringContaining(
        'query($owner: String!, $repo: String!, $number: Int!)',
      ),
      { owner: 'owner', repo: 'repo', number: 42 },
    );
  });

  it('should create discussion via GraphQL', async () => {
    const mockDisc = { id: 'disc2', number: 43 };
    // GraphQL mock resolved value for repo ID query first, then the mutation
    mockOctokit.graphql
      .mockResolvedValueOnce({ repository: { id: 'repo123' } })
      .mockResolvedValueOnce({ createDiscussion: { discussion: mockDisc } });

    const result = await GithubService.createDiscussion(
      'owner',
      'repo',
      'cat123',
      'new title',
      'new body',
    );
    expect(result).toEqual(mockDisc);
    expect(mockOctokit.graphql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('query($owner: String!, $repo: String!)'),
      { owner: 'owner', repo: 'repo' },
    );
    expect(mockOctokit.graphql).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        'mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!)',
      ),
      {
        repositoryId: 'repo123',
        categoryId: 'cat123',
        title: 'new title',
        body: 'new body',
      },
    );
  });

  it('should create discussion comment via GraphQL', async () => {
    const mockComment = { id: 'comment123', body: 'nice post' };
    mockOctokit.graphql.mockResolvedValue({
      addDiscussionComment: { comment: mockComment },
    });

    const result = await GithubService.createDiscussionComment(
      'owner',
      'repo',
      'disc123',
      'nice post',
    );
    expect(result).toEqual(mockComment);
    expect(mockOctokit.graphql).toHaveBeenCalledWith(
      expect.stringContaining('mutation($discussionId: ID!, $body: String!)'),
      { discussionId: 'disc123', body: 'nice post' },
    );
  });

  // 21. Checks API
  it('should create a check run', async () => {
    const mockCheck = { id: 1, name: 'linter' };
    mockOctokit.rest.checks.create.mockResolvedValue({ data: mockCheck });

    const checkData = {
      name: 'linter',
      head_sha: 'sha123',
      status: 'completed',
      conclusion: 'success',
    };
    const result = await GithubService.createCheckRun(
      'owner',
      'repo',
      checkData,
    );
    expect(result).toEqual(mockCheck);
    expect(mockOctokit.rest.checks.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'linter',
      head_sha: 'sha123',
      status: 'completed',
      conclusion: 'success',
      completed_at: undefined,
      output: undefined,
    });
  });

  it('should update a check run', async () => {
    const mockCheck = { id: 1, status: 'completed' };
    mockOctokit.rest.checks.update.mockResolvedValue({ data: mockCheck });

    const checkData = { status: 'completed', conclusion: 'success' };
    const result = await GithubService.updateCheckRun(
      'owner',
      'repo',
      101,
      checkData,
    );
    expect(result).toEqual(mockCheck);
    expect(mockOctokit.rest.checks.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      check_run_id: 101,
      status: 'completed',
      conclusion: 'success',
      completed_at: undefined,
      output: undefined,
    });
  });

  it('should list check runs for reference', async () => {
    const mockRuns = { total_count: 1, check_runs: [{ id: 1 }] };
    mockOctokit.rest.checks.listForRef.mockResolvedValue({ data: mockRuns });

    const result = await GithubService.listCheckRunsForRef(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockRuns);
    expect(mockOctokit.rest.checks.listForRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
    });
  });

  it('should create a check suite', async () => {
    const mockSuite = { id: 2, head_sha: 'sha123' };
    mockOctokit.rest.checks.createSuite.mockResolvedValue({ data: mockSuite });

    const result = await GithubService.createCheckSuite('owner', 'repo', {
      head_sha: 'sha123',
    });
    expect(result).toEqual(mockSuite);
    expect(mockOctokit.rest.checks.createSuite).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      head_sha: 'sha123',
    });
  });

  // 22. Deployments & Environments API
  it('should list deployments', async () => {
    const mockDeployments = [{ id: 1, environment: 'production' }];
    mockOctokit.rest.repos.listDeployments.mockResolvedValue({
      data: mockDeployments,
    });

    const result = await GithubService.listDeployments('owner', 'repo', {
      environment: 'production',
    });
    expect(result).toEqual(mockDeployments);
    expect(mockOctokit.rest.repos.listDeployments).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      sha: undefined,
      ref: undefined,
      task: undefined,
      environment: 'production',
      per_page: 30,
      page: 1,
    });
  });

  it('should create deployment', async () => {
    const mockDeployment = { id: 2 };
    mockOctokit.rest.repos.createDeployment.mockResolvedValue({
      data: mockDeployment,
    });

    const deploymentData = {
      ref: 'main',
      environment: 'production',
      task: 'deploy',
    };
    const result = await GithubService.createDeployment(
      'owner',
      'repo',
      deploymentData,
    );
    expect(result).toEqual(mockDeployment);
    expect(mockOctokit.rest.repos.createDeployment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
      task: 'deploy',
      auto_merge: undefined,
      required_contexts: undefined,
      payload: undefined,
      environment: 'production',
      description: undefined,
      transient_environment: undefined,
      production_environment: undefined,
    });
  });

  it('should create deployment status', async () => {
    const mockStatus = { id: 3, state: 'success' };
    mockOctokit.rest.repos.createDeploymentStatus.mockResolvedValue({
      data: mockStatus,
    });

    const statusData = { state: 'success', environment: 'production' };
    const result = await GithubService.createDeploymentStatus(
      'owner',
      'repo',
      505,
      statusData,
    );
    expect(result).toEqual(mockStatus);
    expect(mockOctokit.rest.repos.createDeploymentStatus).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      deployment_id: 505,
      state: 'success',
      target_url: undefined,
      log_url: undefined,
      description: undefined,
      environment: 'production',
      environment_url: undefined,
      auto_inactive: undefined,
    });
  });

  it('should list environments', async () => {
    const mockEnvironments = {
      total_count: 1,
      environments: [{ id: 1, name: 'production' }],
    };
    mockOctokit.rest.repos.listEnvironments.mockResolvedValue({
      data: mockEnvironments,
    });

    const result = await GithubService.listEnvironments('owner', 'repo', {
      page: 2,
    });
    expect(result).toEqual(mockEnvironments);
    expect(mockOctokit.rest.repos.listEnvironments).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 30,
      page: 2,
    });
  });

  it('should create or update environment', async () => {
    const mockEnv = { name: 'production' };
    mockOctokit.rest.repos.createOrUpdateEnvironment.mockResolvedValue({
      data: mockEnv,
    });

    const result = await GithubService.createOrUpdateEnvironment(
      'owner',
      'repo',
      'production',
      { wait_timer: 30 },
    );
    expect(result).toEqual(mockEnv);
    expect(
      mockOctokit.rest.repos.createOrUpdateEnvironment,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'production',
      wait_timer: 30,
      prevent_self_review: undefined,
      reviewers: undefined,
      deployment_branch_policy: undefined,
    });
  });

  // 23. Code & Secret Scanning API
  it('should list code scanning alerts', async () => {
    const mockAlerts = [{ number: 1, rule: { id: 'xss' } }];
    mockOctokit.rest.codeScanning.listAlertsForRepo.mockResolvedValue({
      data: mockAlerts,
    });

    const result = await GithubService.listCodeScanningAlerts('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockAlerts);
    expect(
      mockOctokit.rest.codeScanning.listAlertsForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      severity: undefined,
      per_page: 30,
      page: 1,
    });
  });

  it('should get code scanning alert details', async () => {
    const mockAlert = { number: 45, rule: {} };
    mockOctokit.rest.codeScanning.getAlert.mockResolvedValue({
      data: mockAlert,
    });

    const result = await GithubService.getCodeScanningAlert(
      'owner',
      'repo',
      45,
    );
    expect(result).toEqual(mockAlert);
    expect(mockOctokit.rest.codeScanning.getAlert).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      alert_number: 45,
    });
  });

  it('should list secret scanning alerts', async () => {
    const mockAlerts = [{ number: 2, secret_type: 'slack_token' }];
    mockOctokit.rest.secretScanning.listAlertsForRepo.mockResolvedValue({
      data: mockAlerts,
    });

    const result = await GithubService.listSecretScanningAlerts(
      'owner',
      'repo',
      { state: 'open' },
    );
    expect(result).toEqual(mockAlerts);
    expect(
      mockOctokit.rest.secretScanning.listAlertsForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
      secret_type: undefined,
      per_page: 30,
      page: 1,
    });
  });

  it('should get secret scanning alert details', async () => {
    const mockAlert = { number: 88, secret_type: 'slack_token' };
    mockOctokit.rest.secretScanning.getAlert.mockResolvedValue({
      data: mockAlert,
    });

    const result = await GithubService.getSecretScanningAlert(
      'owner',
      'repo',
      88,
    );
    expect(result).toEqual(mockAlert);
    expect(mockOctokit.rest.secretScanning.getAlert).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      alert_number: 88,
    });
  });

  // 24. Actions Artifacts & Workflow Jobs API
  it('should list workflow run jobs', async () => {
    const mockJobs = { jobs: [{ id: 1, name: 'build' }] };
    mockOctokit.rest.actions.listJobsForWorkflowRun.mockResolvedValue({
      data: mockJobs,
    });

    const result = await GithubService.listWorkflowJobs('owner', 'repo', 7788, {
      page: 3,
    });
    expect(result).toEqual(mockJobs);
    expect(
      mockOctokit.rest.actions.listJobsForWorkflowRun,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      run_id: 7788,
      per_page: 30,
      page: 3,
    });
  });

  it('should list workflow run artifacts', async () => {
    const mockArtifacts = { artifacts: [{ id: 1, name: 'build-zip' }] };
    mockOctokit.rest.actions.listWorkflowRunArtifacts.mockResolvedValue({
      data: mockArtifacts,
    });

    const result = await GithubService.listWorkflowRunArtifacts(
      'owner',
      'repo',
      7788,
      { per_page: 10 },
    );
    expect(result).toEqual(mockArtifacts);
    expect(
      mockOctokit.rest.actions.listWorkflowRunArtifacts,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      run_id: 7788,
      per_page: 10,
      page: 1,
    });
  });

  it('should download workflow artifact', async () => {
    const mockResponse = { url: 'http://redirect-url-to-zip.com' };
    mockOctokit.rest.actions.downloadArtifact.mockResolvedValue(mockResponse);

    const result = await GithubService.downloadWorkflowArtifact(
      'owner',
      'repo',
      12345,
    );
    expect(result).toEqual({ url: 'http://redirect-url-to-zip.com' });
    expect(mockOctokit.rest.actions.downloadArtifact).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      artifact_id: 12345,
      archive_format: 'zip',
    });
  });

  // ==========================================
  // 25. GitHub Apps & Installations API
  // ==========================================
  it('should get authenticated app details', async () => {
    const mockApp = { id: 1, name: 'My App' };
    mockOctokit.rest.apps.getAuthenticated.mockResolvedValue({ data: mockApp });

    const result = await GithubService.getAppAuthenticated();
    expect(result).toEqual(mockApp);
    expect(mockOctokit.rest.apps.getAuthenticated).toHaveBeenCalled();
  });

  it('should list app installations', async () => {
    const mockInstallations = [{ id: 10, account: { login: 'user' } }];
    mockOctokit.rest.apps.listInstallations.mockResolvedValue({
      data: mockInstallations,
    });

    const result = await GithubService.listAppInstallations({
      per_page: 5,
      page: 2,
    });
    expect(result).toEqual(mockInstallations);
    expect(mockOctokit.rest.apps.listInstallations).toHaveBeenCalledWith({
      per_page: 5,
      page: 2,
      since: undefined,
      outdated: undefined,
    });
  });

  it('should get app installation detail', async () => {
    const mockInstallation = { id: 10, account: { login: 'user' } };
    mockOctokit.rest.apps.getInstallation.mockResolvedValue({
      data: mockInstallation,
    });

    const result = await GithubService.getAppInstallation(10);
    expect(result).toEqual(mockInstallation);
    expect(mockOctokit.rest.apps.getInstallation).toHaveBeenCalledWith({
      installation_id: 10,
    });
  });

  it('should list repos accessible to installation', async () => {
    const mockRepos = {
      total_count: 1,
      repositories: [{ id: 101, name: 'repo' }],
    };
    mockOctokit.rest.apps.listReposAccessibleToInstallation.mockResolvedValue({
      data: mockRepos,
    });

    const result = await GithubService.listAppReposAccessible(10, {
      per_page: 10,
      page: 1,
    });
    expect(result).toEqual(mockRepos);
    expect(
      mockOctokit.rest.apps.listReposAccessibleToInstallation,
    ).toHaveBeenCalledWith({
      installation_id: 10,
      per_page: 10,
      page: 1,
    });
  });

  it('should create app installation access token', async () => {
    const mockToken = { token: 'v1.1234567890' };
    mockOctokit.rest.apps.createInstallationAccessToken.mockResolvedValue({
      data: mockToken,
    });

    const result = await GithubService.createAppInstallationAccessToken(10);
    expect(result).toEqual(mockToken);
    expect(
      mockOctokit.rest.apps.createInstallationAccessToken,
    ).toHaveBeenCalledWith({
      installation_id: 10,
    });
  });

  // ==========================================
  // 26. Resource Billing API
  // ==========================================
  it('should get org Actions billing', async () => {
    const mockBilling = { total_minutes_used: 120 };
    mockOctokit.rest.billing.getGithubActionsBillingOrg.mockResolvedValue({
      data: mockBilling,
    });

    const result = await GithubService.getOrgActionsBilling('my-org');
    expect(result).toEqual(mockBilling);
    expect(
      mockOctokit.rest.billing.getGithubActionsBillingOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get org Packages billing', async () => {
    const mockBilling = { total_gigabytes_bandwidth_used: 15 };
    mockOctokit.rest.billing.getGithubPackagesBillingOrg.mockResolvedValue({
      data: mockBilling,
    });

    const result = await GithubService.getOrgPackagesBilling('my-org');
    expect(result).toEqual(mockBilling);
    expect(
      mockOctokit.rest.billing.getGithubPackagesBillingOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get org Shared Storage billing', async () => {
    const mockBilling = { estimated_paid_storage_for_month: 2.5 };
    mockOctokit.rest.billing.getSharedStorageBillingOrg.mockResolvedValue({
      data: mockBilling,
    });

    const result = await GithubService.getOrgSharedStorageBilling('my-org');
    expect(result).toEqual(mockBilling);
    expect(
      mockOctokit.rest.billing.getSharedStorageBillingOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  // ==========================================
  // 27. Enterprise Admin & Auditing API
  // ==========================================
  it('should get enterprise audit log', async () => {
    const mockAuditLog = [
      { '@timestamp': '2026-06-11T00:00:00Z', action: 'repo.create' },
    ];
    mockOctokit.request.mockResolvedValue({ data: mockAuditLog });

    const result = await GithubService.getEnterpriseAuditLog('my-ent', {
      phrase: 'actor:octocat',
      per_page: 5,
    });
    expect(result).toEqual(mockAuditLog);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /enterprises/{enterprise}/audit-log',
      {
        enterprise: 'my-ent',
        phrase: 'actor:octocat',
        include: undefined,
        per_page: 5,
        page: 1,
      },
    );
  });

  it('should list enterprise members', async () => {
    const mockMembers = [{ login: 'admin-user' }];
    mockOctokit.request.mockResolvedValue({ data: mockMembers });

    const result = await GithubService.listEnterpriseMembers('my-ent', {
      per_page: 10,
      page: 2,
    });
    expect(result).toEqual(mockMembers);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /enterprises/{enterprise}/members',
      {
        enterprise: 'my-ent',
        per_page: 10,
        page: 2,
      },
    );
  });

  // ==========================================
  // 28. Activity Events API
  // ==========================================
  it('should list public events', async () => {
    const mockEvents = [{ id: '1', type: 'WatchEvent' }];
    mockOctokit.rest.activity.listPublicEvents.mockResolvedValue({
      data: mockEvents,
    });

    const result = await GithubService.listPublicEvents({ per_page: 10 });
    expect(result).toEqual(mockEvents);
    expect(mockOctokit.rest.activity.listPublicEvents).toHaveBeenCalledWith({
      per_page: 10,
      page: 1,
    });
  });

  it('should list repo events', async () => {
    const mockEvents = [{ id: '2', type: 'PushEvent' }];
    mockOctokit.rest.activity.listRepoEvents.mockResolvedValue({
      data: mockEvents,
    });

    const result = await GithubService.listRepoEvents('owner', 'repo', {
      per_page: 5,
    });
    expect(result).toEqual(mockEvents);
    expect(mockOctokit.rest.activity.listRepoEvents).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      per_page: 5,
      page: 1,
    });
  });

  it('should list org events for authenticated user', async () => {
    const mockEvents = [{ id: '3', type: 'CreateEvent' }];
    mockOctokit.rest.activity.listOrgEventsForAuthenticatedUser.mockResolvedValue(
      { data: mockEvents },
    );

    const result = await GithubService.listOrgEvents('my-org', 'octocat', {
      page: 3,
    });
    expect(result).toEqual(mockEvents);
    expect(
      mockOctokit.rest.activity.listOrgEventsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      username: 'octocat',
      per_page: 30,
      page: 3,
    });
  });

  // ==========================================
  // 29. Interaction Limits API
  // ==========================================
  it('should get repo interaction limits', async () => {
    const mockLimits = { limit: 'collaborators_only' };
    mockOctokit.rest.interactions.getRestrictionsForRepo.mockResolvedValue({
      data: mockLimits,
    });

    const result = await GithubService.getRepoInteractionLimits(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockLimits);
    expect(
      mockOctokit.rest.interactions.getRestrictionsForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should set repo interaction limits', async () => {
    const mockLimits = { limit: 'collaborators_only', expiry: 'one_day' };
    mockOctokit.rest.interactions.setRestrictionsForRepo.mockResolvedValue({
      data: mockLimits,
    });

    const result = await GithubService.setRepoInteractionLimits(
      'owner',
      'repo',
      {
        limit: 'collaborators_only',
        expiry: 'one_day',
      },
    );
    expect(result).toEqual(mockLimits);
    expect(
      mockOctokit.rest.interactions.setRestrictionsForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      limit: 'collaborators_only',
      expiry: 'one_day',
    });
  });

  it('should remove repo interaction limits', async () => {
    mockOctokit.rest.interactions.removeRestrictionsForRepo.mockResolvedValue({
      data: null,
    });

    const result = await GithubService.removeRepoInteractionLimits(
      'owner',
      'repo',
    );
    expect(result).toBeNull();
    expect(
      mockOctokit.rest.interactions.removeRestrictionsForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should propagate errors when getEnterpriseAuditLog fails', async () => {
    const mockError = new Error('API Rate Limit Exceeded');
    mockOctokit.request.mockRejectedValue(mockError);

    await expect(GithubService.getEnterpriseAuditLog('my-ent')).rejects.toThrow(
      'API Rate Limit Exceeded',
    );
  });

  // ==========================================
  // 30. Code Security (Advisories & Configurations)
  // ==========================================
  it('should list global security advisories', async () => {
    const mockAdvisories = [{ ghsa_id: 'GHSA-1' }];
    mockOctokit.rest.securityAdvisories.listGlobalAdvisories.mockResolvedValue({
      data: mockAdvisories,
    });

    const result = await GithubService.listGlobalAdvisories({
      severity: 'high',
    });
    expect(result).toEqual(mockAdvisories);
    expect(
      mockOctokit.rest.securityAdvisories.listGlobalAdvisories,
    ).toHaveBeenCalledWith({
      per_page: 30,
      page: 1,
      severity: 'high',
      cve: undefined,
      ghsa_id: undefined,
    });
  });

  it('should get repository advisory', async () => {
    const mockAdvisory = { ghsa_id: 'GHSA-2' };
    mockOctokit.rest.securityAdvisories.getRepositoryAdvisory.mockResolvedValue(
      {
        data: mockAdvisory,
      },
    );

    const result = await GithubService.getRepositoryAdvisory(
      'owner',
      'repo',
      'GHSA-2',
    );
    expect(result).toEqual(mockAdvisory);
    expect(
      mockOctokit.rest.securityAdvisories.getRepositoryAdvisory,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ghsa_id: 'GHSA-2',
    });
  });

  it('should get org security configurations', async () => {
    const mockConfigs = [{ id: 1, name: 'default' }];
    mockOctokit.rest.codeSecurity.getConfigurationsForOrg.mockResolvedValue({
      data: mockConfigs,
    });

    const result = await GithubService.getOrgSecurityConfigurations('my-org');
    expect(result).toEqual(mockConfigs);
    expect(
      mockOctokit.rest.codeSecurity.getConfigurationsForOrg,
    ).toHaveBeenCalledWith({ org: 'my-org' });
  });

  // ==========================================
  // 31. Dependency Graph (BOM / Manifests)
  // ==========================================
  it('should export SBOM for repository', async () => {
    const mockSbom = { sbom: { name: 'my-repo' } };
    mockOctokit.rest.dependencyGraph.exportSbom.mockResolvedValue({
      data: mockSbom,
    });

    const result = await GithubService.exportSbom('owner', 'repo');
    expect(result).toEqual(mockSbom);
    expect(mockOctokit.rest.dependencyGraph.exportSbom).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // ==========================================
  // 32. Packages (Registries & Metadata)
  // ==========================================
  it('should list org packages', async () => {
    const mockPackages = [{ name: 'my-pkg' }];
    mockOctokit.rest.packages.listPackagesForOrganization.mockResolvedValue({
      data: mockPackages,
    });

    const result = await GithubService.listOrgPackages('my-org', {
      package_type: 'npm',
    });
    expect(result).toEqual(mockPackages);
    expect(
      mockOctokit.rest.packages.listPackagesForOrganization,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      package_type: 'npm',
      visibility: undefined,
      per_page: 30,
      page: 1,
    });
  });

  it('should get package versions', async () => {
    const mockVersions = [{ id: 1, version: '1.0.0' }];
    mockOctokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg.mockResolvedValue(
      {
        data: mockVersions,
      },
    );

    const result = await GithubService.getPackageVersions('my-org', 'my-pkg');
    expect(result).toEqual(mockVersions);
    expect(
      mockOctokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      package_name: 'my-pkg',
    });
  });

  // ==========================================
  // 33. OIDC (Actions Custom Claims)
  // ==========================================
  it('should get OIDC custom sub template for org', async () => {
    const mockTemplate = { include_claim_keys: ['repo'] };
    mockOctokit.rest.oidc.getOidcCustomSubTemplateForOrg.mockResolvedValue({
      data: mockTemplate,
    });

    const result = await GithubService.getOidcCustomSubTemplateForOrg('my-org');
    expect(result).toEqual(mockTemplate);
    expect(
      mockOctokit.rest.oidc.getOidcCustomSubTemplateForOrg,
    ).toHaveBeenCalledWith({ org: 'my-org' });
  });

  it('should update OIDC custom sub template for org', async () => {
    const mockResponse = { status: 'success' };
    mockOctokit.rest.oidc.updateOidcCustomSubTemplateForOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.updateOidcCustomSubTemplateForOrg(
      'my-org',
      {
        include_claim_keys: ['repo', 'context'],
      },
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.oidc.updateOidcCustomSubTemplateForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      include_claim_keys: ['repo', 'context'],
    });
  });

  // ==========================================
  // 34. Migrations (Import/Export)
  // ==========================================
  it('should start organization migration', async () => {
    const mockMigration = { id: 101, status: 'pending' };
    mockOctokit.rest.migrations.startForOrg.mockResolvedValue({
      data: mockMigration,
    });

    const result = await GithubService.startOrgMigration('my-org', ['repo1'], {
      lock_repositories: true,
    });
    expect(result).toEqual(mockMigration);
    expect(mockOctokit.rest.migrations.startForOrg).toHaveBeenCalledWith({
      org: 'my-org',
      repositories: ['repo1'],
      lock_repositories: true,
      exclude_attachments: undefined,
    });
  });

  it('should get org migration status', async () => {
    const mockStatus = { id: 101, status: 'exported' };
    mockOctokit.rest.migrations.getStatusForOrg.mockResolvedValue({
      data: mockStatus,
    });

    const result = await GithubService.getOrgMigrationStatus('my-org', 101);
    expect(result).toEqual(mockStatus);
    expect(mockOctokit.rest.migrations.getStatusForOrg).toHaveBeenCalledWith({
      org: 'my-org',
      migration_id: 101,
    });
  });

  // ==========================================
  // 35. Emojis, Gitignore templates, Licenses
  // ==========================================
  it('should fetch emojis list', async () => {
    const mockEmojis = { '+1': 'https://github.com/emoji' };
    mockOctokit.rest.emojis.get.mockResolvedValue({ data: mockEmojis });

    const result = await GithubService.getEmojis();
    expect(result).toEqual(mockEmojis);
    expect(mockOctokit.rest.emojis.get).toHaveBeenCalled();
  });

  it('should fetch gitignore templates list', async () => {
    const mockTemplates = ['Node', 'Python'];
    mockOctokit.rest.gitignore.getAllTemplates.mockResolvedValue({
      data: mockTemplates,
    });

    const result = await GithubService.getGitignoreTemplates();
    expect(result).toEqual(mockTemplates);
    expect(mockOctokit.rest.gitignore.getAllTemplates).toHaveBeenCalled();
  });

  it('should fetch specific gitignore template', async () => {
    const mockTemplate = { name: 'Node', source: 'node_modules' };
    mockOctokit.rest.gitignore.getTemplate.mockResolvedValue({
      data: mockTemplate,
    });

    const result = await GithubService.getGitignoreTemplate('Node');
    expect(result).toEqual(mockTemplate);
    expect(mockOctokit.rest.gitignore.getTemplate).toHaveBeenCalledWith({
      name: 'Node',
    });
  });

  it('should fetch repository license info', async () => {
    const mockLicense = { license: { key: 'mit' } };
    mockOctokit.rest.licenses.getForRepo.mockResolvedValue({
      data: mockLicense,
    });

    const result = await GithubService.getRepoLicense('owner', 'repo');
    expect(result).toEqual(mockLicense);
    expect(mockOctokit.rest.licenses.getForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // ==========================================
  // 36. Rate Limit, Meta, and Markdown
  // ==========================================
  it('should get rate limit state', async () => {
    const mockRate = { resources: { core: { limit: 5000 } } };
    mockOctokit.rest.rateLimit.get.mockResolvedValue({ data: mockRate });

    const result = await GithubService.getRateLimit();
    expect(result).toEqual(mockRate);
    expect(mockOctokit.rest.rateLimit.get).toHaveBeenCalled();
  });

  it('should get server metadata', async () => {
    const mockMeta = { verapdf: true };
    mockOctokit.rest.meta.get.mockResolvedValue({ data: mockMeta });

    const result = await GithubService.getMetaServerInfo();
    expect(result).toEqual(mockMeta);
    expect(mockOctokit.rest.meta.get).toHaveBeenCalled();
  });

  it('should render markdown text to HTML', async () => {
    const mockHtml = '<p>hello</p>';
    mockOctokit.rest.markdown.render.mockResolvedValue({ data: mockHtml });

    const result = await GithubService.renderMarkdown('# hello', {
      mode: 'markdown',
    });
    expect(result).toEqual(mockHtml);
    expect(mockOctokit.rest.markdown.render).toHaveBeenCalledWith({
      text: '# hello',
      mode: 'markdown',
      context: undefined,
    });
  });

  // ==========================================
  // 37. Codes of Conduct API
  // ==========================================
  it('should get all Codes of Conduct', async () => {
    const mockConducts = [
      { key: 'contributor_covenant', name: 'Contributor Covenant' },
    ];
    mockOctokit.rest.codesOfConduct.getAllCodesOfConduct.mockResolvedValue({
      data: mockConducts,
    });

    const result = await GithubService.getAllCodesOfConduct();
    expect(result).toEqual(mockConducts);
    expect(
      mockOctokit.rest.codesOfConduct.getAllCodesOfConduct,
    ).toHaveBeenCalled();
  });

  it('should get a specific Code of Conduct by key', async () => {
    const mockConduct = {
      key: 'contributor_covenant',
      name: 'Contributor Covenant',
    };
    mockOctokit.rest.codesOfConduct.getConductCode.mockResolvedValue({
      data: mockConduct,
    });

    const result = await GithubService.getConductCode('contributor_covenant');
    expect(result).toEqual(mockConduct);
    expect(mockOctokit.rest.codesOfConduct.getConductCode).toHaveBeenCalledWith(
      {
        key: 'contributor_covenant',
      },
    );
  });

  it('should propagate errors when getAllCodesOfConduct fails', async () => {
    const mockError = new Error('API Failure');
    mockOctokit.rest.codesOfConduct.getAllCodesOfConduct.mockRejectedValue(
      mockError,
    );

    await expect(GithubService.getAllCodesOfConduct()).rejects.toThrow(
      'API Failure',
    );
  });

  // ==========================================
  // 38. Private Registries API
  // ==========================================
  it('should list private registries for organization', async () => {
    const mockRegistries = { total_count: 1, registries: [{ name: 'npm' }] };
    mockOctokit.rest.privateRegistries.listOrgPrivateRegistries.mockResolvedValue(
      {
        data: mockRegistries,
      },
    );

    const result = await GithubService.listOrgPrivateRegistries('my-org');
    expect(result).toEqual(mockRegistries);
    expect(
      mockOctokit.rest.privateRegistries.listOrgPrivateRegistries,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get a specific private registry for organization', async () => {
    const mockRegistry = { name: 'npm', created_at: '2026-06-11T00:00:00Z' };
    mockOctokit.rest.privateRegistries.getOrgPrivateRegistry.mockResolvedValue({
      data: mockRegistry,
    });

    const result = await GithubService.getOrgPrivateRegistry('my-org', 'npm');
    expect(result).toEqual(mockRegistry);
    expect(
      mockOctokit.rest.privateRegistries.getOrgPrivateRegistry,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'npm',
    });
  });

  // ==========================================
  // 39. Reactions API
  // ==========================================
  it('should create reaction for an issue', async () => {
    const mockReaction = { id: 1, content: 'heart' };
    mockOctokit.rest.reactions.createForIssue.mockResolvedValue({
      data: mockReaction,
    });

    const result = await GithubService.createReactionForIssue(
      'owner',
      'repo',
      42,
      'heart',
    );
    expect(result).toEqual(mockReaction);
    expect(mockOctokit.rest.reactions.createForIssue).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 42,
      content: 'heart',
    });
  });

  it('should list reactions for an issue', async () => {
    const mockReactions = [{ id: 1, content: 'heart' }];
    mockOctokit.rest.reactions.listForIssue.mockResolvedValue({
      data: mockReactions,
    });

    const result = await GithubService.listReactionsForIssue(
      'owner',
      'repo',
      42,
    );
    expect(result).toEqual(mockReactions);
    expect(mockOctokit.rest.reactions.listForIssue).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 42,
    });
  });

  it('should delete reaction for an issue', async () => {
    const mockDeleteResult = { success: true };
    mockOctokit.rest.reactions.deleteForIssue.mockResolvedValue({
      data: mockDeleteResult,
    });

    const result = await GithubService.deleteReactionForIssue(
      'owner',
      'repo',
      42,
      99,
    );
    expect(result).toEqual(mockDeleteResult);
    expect(mockOctokit.rest.reactions.deleteForIssue).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 42,
      reaction_id: 99,
    });
  });

  // ==========================================
  // 40. Hosted Compute (Org Runner Network settings)
  // ==========================================
  it('should list network configurations for hosted compute in organization', async () => {
    const mockConfigs = { network_configurations: [{ id: 'net-1' }] };
    mockOctokit.rest.hostedCompute.listNetworkConfigurationsForOrg.mockResolvedValue(
      {
        data: mockConfigs,
      },
    );

    const result =
      await GithubService.listNetworkConfigurationsForOrg('my-org');
    expect(result).toEqual(mockConfigs);
    expect(
      mockOctokit.rest.hostedCompute.listNetworkConfigurationsForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should fetch network settings for hosted compute in organization', async () => {
    const mockSettings = { network_settings: { id: 'net-1' } };
    mockOctokit.rest.hostedCompute.getNetworkSettingsForOrg.mockResolvedValue({
      data: mockSettings,
    });

    const result = await GithubService.getNetworkSettingsForOrg('my-org');
    expect(result).toEqual(mockSettings);
    expect(
      mockOctokit.rest.hostedCompute.getNetworkSettingsForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  // ==========================================
  // 41. Campaigns
  // ==========================================
  it('should list campaigns for organization', async () => {
    const mockCampaigns = { campaigns: [{ id: 'camp-1' }] };
    mockOctokit.rest.campaigns.listOrgCampaigns.mockResolvedValue({
      data: mockCampaigns,
    });

    const result = await GithubService.listOrgCampaigns('my-org');
    expect(result).toEqual(mockCampaigns);
    expect(mockOctokit.rest.campaigns.listOrgCampaigns).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  // ==========================================
  // 42. Custom Properties API
  // ==========================================
  it('should create or update custom property for organization', async () => {
    const mockProperty = { name: 'env', value_type: 'string' };
    mockOctokit.rest.orgs.createOrUpdateCustomProperty.mockResolvedValue({
      data: mockProperty,
    });

    const result = await GithubService.createOrUpdateCustomProperty(
      'my-org',
      'env',
      {
        value_type: 'string',
      },
    );
    expect(result).toEqual(mockProperty);
    expect(
      mockOctokit.rest.orgs.createOrUpdateCustomProperty,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      custom_property_name: 'env',
      value_type: 'string',
    });
  });

  it('should get custom property details', async () => {
    const mockProperty = { name: 'env', value_type: 'string' };
    mockOctokit.rest.orgs.getCustomProperty.mockResolvedValue({
      data: mockProperty,
    });

    const result = await GithubService.getCustomProperty('my-org', 'env');
    expect(result).toEqual(mockProperty);
    expect(mockOctokit.rest.orgs.getCustomProperty).toHaveBeenCalledWith({
      org: 'my-org',
      custom_property_name: 'env',
    });
  });

  it('should remove custom property definition', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.orgs.removeCustomProperty.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.removeCustomProperty('my-org', 'env');
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.orgs.removeCustomProperty).toHaveBeenCalledWith({
      org: 'my-org',
      custom_property_name: 'env',
    });
  });

  it('should list organization custom properties', async () => {
    const mockProperties = [{ name: 'env' }];
    mockOctokit.rest.orgs.listCustomProperties.mockResolvedValue({
      data: mockProperties,
    });

    const result = await GithubService.listCustomProperties('my-org');
    expect(result).toEqual(mockProperties);
    expect(mockOctokit.rest.orgs.listCustomProperties).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should set custom properties values for a repository', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.repos.createOrUpdateCustomPropertiesValues.mockResolvedValue(
      {
        data: mockResponse,
      },
    );

    const result = await GithubService.createOrUpdateRepoCustomPropertiesValues(
      'owner',
      'repo',
      [{ property_name: 'env', value: 'production' }],
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.repos.createOrUpdateCustomPropertiesValues,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      properties: [{ property_name: 'env', value: 'production' }],
    });
  });

  it('should get custom properties values configured on a repository', async () => {
    const mockValues = [{ property_name: 'env', value: 'production' }];
    mockOctokit.rest.repos.getCustomPropertiesValues.mockResolvedValue({
      data: mockValues,
    });

    const result = await GithubService.getRepoCustomPropertiesValues(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockValues);
    expect(
      mockOctokit.rest.repos.getCustomPropertiesValues,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // ==========================================
  // 43. Rulesets API
  // ==========================================
  it('should list repository rulesets', async () => {
    const mockRulesets = [{ id: 1, name: 'main-branch-rules' }];
    mockOctokit.rest.repos.getRepoRulesets.mockResolvedValue({
      data: mockRulesets,
    });

    const result = await GithubService.getRepoRulesets('owner', 'repo');
    expect(result).toEqual(mockRulesets);
    expect(mockOctokit.rest.repos.getRepoRulesets).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get repository ruleset details', async () => {
    const mockRuleset = { id: 1, name: 'main-branch-rules' };
    mockOctokit.rest.repos.getRepoRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.getRepoRuleset('owner', 'repo', 1);
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.repos.getRepoRuleset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ruleset_id: 1,
    });
  });

  it('should create repository ruleset', async () => {
    const mockRuleset = { id: 1, name: 'main-branch-rules' };
    mockOctokit.rest.repos.createRepoRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.createRepoRuleset('owner', 'repo', {
      name: 'main-branch-rules',
    });
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.repos.createRepoRuleset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'main-branch-rules',
    });
  });

  it('should update repository ruleset', async () => {
    const mockRuleset = { id: 1, name: 'main-branch-rules-v2' };
    mockOctokit.rest.repos.updateRepoRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.updateRepoRuleset('owner', 'repo', 1, {
      name: 'main-branch-rules-v2',
    });
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.repos.updateRepoRuleset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ruleset_id: 1,
      name: 'main-branch-rules-v2',
    });
  });

  it('should delete repository ruleset', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.repos.deleteRepoRuleset.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteRepoRuleset('owner', 'repo', 1);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.repos.deleteRepoRuleset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ruleset_id: 1,
    });
  });

  it('should list organization rulesets', async () => {
    const mockRulesets = [{ id: 2, name: 'org-wide-rules' }];
    mockOctokit.rest.orgs.getOrgRulesets.mockResolvedValue({
      data: mockRulesets,
    });

    const result = await GithubService.getOrgRulesets('my-org');
    expect(result).toEqual(mockRulesets);
    expect(mockOctokit.rest.orgs.getOrgRulesets).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get organization ruleset details', async () => {
    const mockRuleset = { id: 2, name: 'org-wide-rules' };
    mockOctokit.rest.orgs.getOrgRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.getOrgRuleset('my-org', 2);
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.orgs.getOrgRuleset).toHaveBeenCalledWith({
      org: 'my-org',
      ruleset_id: 2,
    });
  });

  it('should create organization ruleset', async () => {
    const mockRuleset = { id: 2, name: 'org-wide-rules' };
    mockOctokit.rest.orgs.createOrgRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.createOrgRuleset('my-org', {
      name: 'org-wide-rules',
    });
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.orgs.createOrgRuleset).toHaveBeenCalledWith({
      org: 'my-org',
      name: 'org-wide-rules',
    });
  });

  it('should update organization ruleset', async () => {
    const mockRuleset = { id: 2, name: 'org-wide-rules-v2' };
    mockOctokit.rest.orgs.updateOrgRuleset.mockResolvedValue({
      data: mockRuleset,
    });

    const result = await GithubService.updateOrgRuleset('my-org', 2, {
      name: 'org-wide-rules-v2',
    });
    expect(result).toEqual(mockRuleset);
    expect(mockOctokit.rest.orgs.updateOrgRuleset).toHaveBeenCalledWith({
      org: 'my-org',
      ruleset_id: 2,
      name: 'org-wide-rules-v2',
    });
  });

  it('should delete organization ruleset', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.orgs.deleteOrgRuleset.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteOrgRuleset('my-org', 2);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.orgs.deleteOrgRuleset).toHaveBeenCalledWith({
      org: 'my-org',
      ruleset_id: 2,
    });
  });

  // ==========================================
  // 44. Copilot Org Seat Management
  // ==========================================
  it('should list Copilot seats for organization', async () => {
    const mockSeats = {
      total_seats: 2,
      seats: [{ assignee: { login: 'user1' } }],
    };
    mockOctokit.rest.copilot.listSeatsForOrg.mockResolvedValue({
      data: mockSeats,
    });

    const result = await GithubService.listCopilotSeatsForOrg('my-org');
    expect(result).toEqual(mockSeats);
    expect(mockOctokit.rest.copilot.listSeatsForOrg).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should add Copilot seats to organization', async () => {
    const mockResponse = { seats_created: 1 };
    mockOctokit.rest.copilot.addSeatsToOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.addCopilotSeatsToOrg('my-org', [
      'user1',
    ]);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.copilot.addSeatsToOrg).toHaveBeenCalledWith({
      org: 'my-org',
      selected_usernames: ['user1'],
    });
  });

  it('should remove Copilot seats from organization', async () => {
    const mockResponse = { seats_cancelled: 1 };
    mockOctokit.rest.copilot.removeSeatsFromOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.removeCopilotSeatsFromOrg('my-org', [
      'user1',
    ]);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.copilot.removeSeatsFromOrg).toHaveBeenCalledWith({
      org: 'my-org',
      selected_usernames: ['user1'],
    });
  });

  it('should get Copilot seat details for user', async () => {
    const mockDetails = {
      assignee: { login: 'user1' },
      created_at: '2026-06-11T00:00:00Z',
    };
    mockOctokit.rest.copilot.getSeatDetailsForUser.mockResolvedValue({
      data: mockDetails,
    });

    const result = await GithubService.getCopilotSeatDetailsForUser(
      'my-org',
      'user1',
    );
    expect(result).toEqual(mockDetails);
    expect(mockOctokit.rest.copilot.getSeatDetailsForUser).toHaveBeenCalledWith(
      {
        org: 'my-org',
        username: 'user1',
      },
    );
  });

  // ==========================================
  // 45. Pull Request Reviews API
  // ==========================================
  it('should list pull request reviews', async () => {
    const mockReviews = [{ id: 10, state: 'APPROVED' }];
    mockOctokit.rest.pulls.listReviews.mockResolvedValue({
      data: mockReviews,
    });

    const result = await GithubService.listPullRequestReviews(
      'owner',
      'repo',
      5,
    );
    expect(result).toEqual(mockReviews);
    expect(mockOctokit.rest.pulls.listReviews).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
    });
  });

  it('should get specific pull request review', async () => {
    const mockReview = { id: 10, state: 'APPROVED' };
    mockOctokit.rest.pulls.getReview.mockResolvedValue({
      data: mockReview,
    });

    const result = await GithubService.getPullRequestReview(
      'owner',
      'repo',
      5,
      10,
    );
    expect(result).toEqual(mockReview);
    expect(mockOctokit.rest.pulls.getReview).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      review_id: 10,
    });
  });

  it('should create pull request review', async () => {
    const mockReview = { id: 10, state: 'PENDING' };
    mockOctokit.rest.pulls.createReview.mockResolvedValue({
      data: mockReview,
    });

    const result = await GithubService.createPullRequestReview(
      'owner',
      'repo',
      5,
      {
        event: 'COMMENT',
        body: 'Looks good',
      },
    );
    expect(result).toEqual(mockReview);
    expect(mockOctokit.rest.pulls.createReview).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      event: 'COMMENT',
      body: 'Looks good',
    });
  });

  it('should submit pull request review', async () => {
    const mockReview = { id: 10, state: 'APPROVED' };
    mockOctokit.rest.pulls.submitReview.mockResolvedValue({
      data: mockReview,
    });

    const result = await GithubService.submitPullRequestReview(
      'owner',
      'repo',
      5,
      10,
      {
        event: 'APPROVE',
        body: 'Approved indeed',
      },
    );
    expect(result).toEqual(mockReview);
    expect(mockOctokit.rest.pulls.submitReview).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      review_id: 10,
      event: 'APPROVE',
      body: 'Approved indeed',
    });
  });

  it('should dismiss pull request review', async () => {
    const mockReview = { id: 10, state: 'DISMISSED' };
    mockOctokit.rest.pulls.dismissReview.mockResolvedValue({
      data: mockReview,
    });

    const result = await GithubService.dismissPullRequestReview(
      'owner',
      'repo',
      5,
      10,
      'Outdated',
    );
    expect(result).toEqual(mockReview);
    expect(mockOctokit.rest.pulls.dismissReview).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      review_id: 10,
      message: 'Outdated',
    });
  });

  // ==========================================
  // 46. Issue Comments API
  // ==========================================
  it('should list issue comments', async () => {
    const mockComments = [{ id: 100, body: 'a comment' }];
    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: mockComments,
    });

    const result = await GithubService.listIssueComments('owner', 'repo', 12);
    expect(result).toEqual(mockComments);
    expect(mockOctokit.rest.issues.listComments).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 12,
    });
  });

  it('should get specific issue comment', async () => {
    const mockComment = { id: 100, body: 'a comment' };
    mockOctokit.rest.issues.getComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.getIssueComment('owner', 'repo', 100);
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.issues.getComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 100,
    });
  });

  it('should create issue comment', async () => {
    const mockComment = { id: 100, body: 'new comment' };
    mockOctokit.rest.issues.createComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.createIssueComment(
      'owner',
      'repo',
      12,
      'new comment',
    );
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 12,
      body: 'new comment',
    });
  });

  it('should update issue comment', async () => {
    const mockComment = { id: 100, body: 'updated comment' };
    mockOctokit.rest.issues.updateComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.updateIssueComment(
      'owner',
      'repo',
      100,
      'updated comment',
    );
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 100,
      body: 'updated comment',
    });
  });

  it('should delete issue comment', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.issues.deleteComment.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteIssueComment('owner', 'repo', 100);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.issues.deleteComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 100,
    });
  });

  // ==========================================
  // 47. User Keys & Emails API
  // ==========================================
  it('should list emails for authenticated user', async () => {
    const mockEmails = [{ email: 'user@example.com', primary: true }];
    mockOctokit.rest.users.listEmailsForAuthenticatedUser.mockResolvedValue({
      data: mockEmails,
    });

    const result = await GithubService.listEmailsForAuthenticatedUser();
    expect(result).toEqual(mockEmails);
    expect(
      mockOctokit.rest.users.listEmailsForAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should add emails for authenticated user', async () => {
    const mockEmails = [{ email: 'new@example.com', primary: false }];
    mockOctokit.rest.users.addEmailsForAuthenticatedUser.mockResolvedValue({
      data: mockEmails,
    });

    const result = await GithubService.addEmailsForAuthenticatedUser([
      'new@example.com',
    ]);
    expect(result).toEqual(mockEmails);
    expect(
      mockOctokit.rest.users.addEmailsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      emails: ['new@example.com'],
    });
  });

  it('should delete emails for authenticated user', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.users.deleteEmailsForAuthenticatedUser.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteEmailsForAuthenticatedUser([
      'new@example.com',
    ]);
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.users.deleteEmailsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      emails: ['new@example.com'],
    });
  });

  it('should list public SSH keys for authenticated user', async () => {
    const mockKeys = [{ id: 123, key: 'ssh-rsa AAA...' }];
    mockOctokit.rest.users.listPublicKeysForAuthenticatedUser.mockResolvedValue(
      {
        data: mockKeys,
      },
    );

    const result = await GithubService.listPublicKeysForAuthenticatedUser();
    expect(result).toEqual(mockKeys);
    expect(
      mockOctokit.rest.users.listPublicKeysForAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should add public SSH key for authenticated user', async () => {
    const mockKey = { id: 123, key: 'ssh-rsa AAA...', title: 'work-mac' };
    mockOctokit.rest.users.addPublicKeyForAuthenticatedUser.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.addPublicKeyForAuthenticatedUser(
      'work-mac',
      'ssh-rsa AAA...',
    );
    expect(result).toEqual(mockKey);
    expect(
      mockOctokit.rest.users.addPublicKeyForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      title: 'work-mac',
      key: 'ssh-rsa AAA...',
    });
  });

  it('should delete public SSH key for authenticated user', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.users.deletePublicKeyForAuthenticatedUser.mockResolvedValue(
      {
        data: mockResponse,
      },
    );

    const result = await GithubService.deletePublicKeyForAuthenticatedUser(123);
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.users.deletePublicKeyForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      key_id: 123,
    });
  });

  it('should propagate errors when getCustomProperty fails', async () => {
    const mockError = new Error('API Failure');
    mockOctokit.rest.orgs.getCustomProperty.mockRejectedValue(mockError);

    await expect(
      GithubService.getCustomProperty('my-org', 'env'),
    ).rejects.toThrow('API Failure');
  });

  // ==========================================
  // 48. GitHub Classroom API Tests
  // ==========================================
  it('should list classrooms', async () => {
    const mockClassrooms = [{ id: 1, name: 'Class 1' }];
    mockOctokit.rest.classroom.listClassrooms.mockResolvedValue({
      data: mockClassrooms,
    });

    const result = await GithubService.listClassrooms();
    expect(result).toEqual(mockClassrooms);
    expect(mockOctokit.rest.classroom.listClassrooms).toHaveBeenCalled();
  });

  it('should get classroom by ID', async () => {
    const mockClassroom = { id: 1, name: 'Class 1' };
    mockOctokit.rest.classroom.getClassroom.mockResolvedValue({
      data: mockClassroom,
    });

    const result = await GithubService.getClassroom(1);
    expect(result).toEqual(mockClassroom);
    expect(mockOctokit.rest.classroom.getClassroom).toHaveBeenCalledWith({
      classroom_id: 1,
    });
  });

  it('should list assignments for classroom', async () => {
    const mockAssignments = [{ id: 10, title: 'HW 1' }];
    mockOctokit.rest.classroom.listAssignmentsForClassroom.mockResolvedValue({
      data: mockAssignments,
    });

    const result = await GithubService.listAssignmentsForClassroom(1);
    expect(result).toEqual(mockAssignments);
    expect(
      mockOctokit.rest.classroom.listAssignmentsForClassroom,
    ).toHaveBeenCalledWith({
      classroom_id: 1,
    });
  });

  it('should get assignment details', async () => {
    const mockAssignment = { id: 10, title: 'HW 1' };
    mockOctokit.rest.classroom.getAssignment.mockResolvedValue({
      data: mockAssignment,
    });

    const result = await GithubService.getAssignment(10);
    expect(result).toEqual(mockAssignment);
    expect(mockOctokit.rest.classroom.getAssignment).toHaveBeenCalledWith({
      assignment_id: 10,
    });
  });

  // ==========================================
  // 49. Actions Workflows & Runs API Tests
  // ==========================================
  it('should list repo workflows', async () => {
    const mockWorkflows = {
      total_count: 1,
      workflows: [{ id: 123, name: 'CI' }],
    };
    mockOctokit.rest.actions.listRepoWorkflows.mockResolvedValue({
      data: mockWorkflows,
    });

    const result = await GithubService.listRepoWorkflows('owner', 'repo');
    expect(result).toEqual(mockWorkflows);
    expect(mockOctokit.rest.actions.listRepoWorkflows).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get workflow details', async () => {
    const mockWorkflow = { id: 123, name: 'CI' };
    mockOctokit.rest.actions.getWorkflow.mockResolvedValue({
      data: mockWorkflow,
    });

    const result = await GithubService.getWorkflow('owner', 'repo', 'ci.yml');
    expect(result).toEqual(mockWorkflow);
    expect(mockOctokit.rest.actions.getWorkflow).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      workflow_id: 'ci.yml',
    });
  });

  it('should list workflow runs', async () => {
    const mockRuns = { total_count: 1, workflow_runs: [{ id: 999 }] };
    mockOctokit.rest.actions.listWorkflowRuns.mockResolvedValue({
      data: mockRuns,
    });

    const result = await GithubService.listWorkflowRuns('owner', 'repo', {
      event: 'push',
    });
    expect(result).toEqual(mockRuns);
    expect(mockOctokit.rest.actions.listWorkflowRuns).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      event: 'push',
    });
  });

  it('should get workflow run details', async () => {
    const mockRun = { id: 999, status: 'completed' };
    mockOctokit.rest.actions.getWorkflowRun.mockResolvedValue({
      data: mockRun,
    });

    const result = await GithubService.getWorkflowRun('owner', 'repo', 999);
    expect(result).toEqual(mockRun);
    expect(mockOctokit.rest.actions.getWorkflowRun).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      run_id: 999,
    });
  });

  it('should create workflow dispatch', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.actions.createWorkflowDispatch.mockResolvedValue({
      data: mockResponse,
      status: 204,
    });

    const result = await GithubService.createWorkflowDispatch(
      'owner',
      'repo',
      'ci.yml',
      'main',
      { env: 'prod' },
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.actions.createWorkflowDispatch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      workflow_id: 'ci.yml',
      ref: 'main',
      inputs: { env: 'prod' },
    });
  });

  // ==========================================
  // 50. Self-Hosted Runners API Tests
  // ==========================================
  it('should list self-hosted runners for organization', async () => {
    const mockRunners = {
      total_count: 1,
      runners: [{ id: 1, name: 'Runner 1' }],
    };
    mockOctokit.rest.actions.listSelfHostedRunnersForOrg.mockResolvedValue({
      data: mockRunners,
    });

    const result = await GithubService.listSelfHostedRunnersForOrg('my-org');
    expect(result).toEqual(mockRunners);
    expect(
      mockOctokit.rest.actions.listSelfHostedRunnersForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should list self-hosted runners for repository', async () => {
    const mockRunners = {
      total_count: 1,
      runners: [{ id: 1, name: 'Runner 1' }],
    };
    mockOctokit.rest.actions.listSelfHostedRunnersForRepo.mockResolvedValue({
      data: mockRunners,
    });

    const result = await GithubService.listSelfHostedRunnersForRepo(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockRunners);
    expect(
      mockOctokit.rest.actions.listSelfHostedRunnersForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get self-hosted runner for organization', async () => {
    const mockRunner = { id: 1, name: 'Runner 1' };
    mockOctokit.rest.actions.getSelfHostedRunnerForOrg.mockResolvedValue({
      data: mockRunner,
    });

    const result = await GithubService.getSelfHostedRunnerForOrg('my-org', 1);
    expect(result).toEqual(mockRunner);
    expect(
      mockOctokit.rest.actions.getSelfHostedRunnerForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      runner_id: 1,
    });
  });

  it('should get self-hosted runner for repository', async () => {
    const mockRunner = { id: 1, name: 'Runner 1' };
    mockOctokit.rest.actions.getSelfHostedRunnerForRepo.mockResolvedValue({
      data: mockRunner,
    });

    const result = await GithubService.getSelfHostedRunnerForRepo(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockRunner);
    expect(
      mockOctokit.rest.actions.getSelfHostedRunnerForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      runner_id: 1,
    });
  });

  it('should delete self-hosted runner from organization', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.actions.deleteSelfHostedRunnerFromOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteSelfHostedRunnerFromOrg(
      'my-org',
      1,
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.actions.deleteSelfHostedRunnerFromOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      runner_id: 1,
    });
  });

  it('should delete self-hosted runner from repository', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.actions.deleteSelfHostedRunnerFromRepo.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteSelfHostedRunnerFromRepo(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.actions.deleteSelfHostedRunnerFromRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      runner_id: 1,
    });
  });

  // ==========================================
  // 51. Issue Labels & Milestones API Tests
  // ==========================================
  it('should list labels for repository', async () => {
    const mockLabels = [{ id: 1, name: 'bug', color: 'red' }];
    mockOctokit.rest.issues.listLabelsForRepo.mockResolvedValue({
      data: mockLabels,
    });

    const result = await GithubService.listLabelsForRepo('owner', 'repo');
    expect(result).toEqual(mockLabels);
    expect(mockOctokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get specific label', async () => {
    const mockLabel = { id: 1, name: 'bug', color: 'red' };
    mockOctokit.rest.issues.getLabel.mockResolvedValue({
      data: mockLabel,
    });

    const result = await GithubService.getLabel('owner', 'repo', 'bug');
    expect(result).toEqual(mockLabel);
    expect(mockOctokit.rest.issues.getLabel).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'bug',
    });
  });

  it('should create label', async () => {
    const mockLabel = { id: 1, name: 'bug', color: 'red' };
    mockOctokit.rest.issues.createLabel.mockResolvedValue({
      data: mockLabel,
    });

    const result = await GithubService.createLabel('owner', 'repo', {
      name: 'bug',
      color: 'red',
    });
    expect(result).toEqual(mockLabel);
    expect(mockOctokit.rest.issues.createLabel).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'bug',
      color: 'red',
    });
  });

  it('should update label', async () => {
    const mockLabel = { id: 1, name: 'bug', color: 'blue' };
    mockOctokit.rest.issues.updateLabel.mockResolvedValue({
      data: mockLabel,
    });

    const result = await GithubService.updateLabel('owner', 'repo', 'bug', {
      color: 'blue',
    });
    expect(result).toEqual(mockLabel);
    expect(mockOctokit.rest.issues.updateLabel).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'bug',
      color: 'blue',
    });
  });

  it('should delete label', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.issues.deleteLabel.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteLabel('owner', 'repo', 'bug');
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.issues.deleteLabel).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      name: 'bug',
    });
  });

  it('should add labels to issue', async () => {
    const mockLabels = [{ name: 'bug' }];
    mockOctokit.rest.issues.addLabels.mockResolvedValue({
      data: mockLabels,
    });

    const result = await GithubService.addLabelsToIssue('owner', 'repo', 5, [
      'bug',
    ]);
    expect(result).toEqual(mockLabels);
    expect(mockOctokit.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 5,
      labels: ['bug'],
    });
  });

  it('should remove label from issue', async () => {
    const mockLabels = [];
    mockOctokit.rest.issues.removeLabel.mockResolvedValue({
      data: mockLabels,
    });

    const result = await GithubService.removeLabelFromIssue(
      'owner',
      'repo',
      5,
      'bug',
    );
    expect(result).toEqual(mockLabels);
    expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 5,
      name: 'bug',
    });
  });

  it('should list milestones', async () => {
    const mockMilestones = [{ id: 1, title: 'v1.0' }];
    mockOctokit.rest.issues.listMilestones.mockResolvedValue({
      data: mockMilestones,
    });

    const result = await GithubService.listMilestones('owner', 'repo', {
      state: 'open',
    });
    expect(result).toEqual(mockMilestones);
    expect(mockOctokit.rest.issues.listMilestones).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      state: 'open',
    });
  });

  it('should get specific milestone', async () => {
    const mockMilestone = { id: 1, title: 'v1.0' };
    mockOctokit.rest.issues.getMilestone.mockResolvedValue({
      data: mockMilestone,
    });

    const result = await GithubService.getMilestone('owner', 'repo', 1);
    expect(result).toEqual(mockMilestone);
    expect(mockOctokit.rest.issues.getMilestone).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      milestone_number: 1,
    });
  });

  it('should create milestone', async () => {
    const mockMilestone = { id: 1, title: 'v1.0' };
    mockOctokit.rest.issues.createMilestone.mockResolvedValue({
      data: mockMilestone,
    });

    const result = await GithubService.createMilestone('owner', 'repo', {
      title: 'v1.0',
    });
    expect(result).toEqual(mockMilestone);
    expect(mockOctokit.rest.issues.createMilestone).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'v1.0',
    });
  });

  it('should update milestone', async () => {
    const mockMilestone = { id: 1, title: 'v1.1' };
    mockOctokit.rest.issues.updateMilestone.mockResolvedValue({
      data: mockMilestone,
    });

    const result = await GithubService.updateMilestone('owner', 'repo', 1, {
      title: 'v1.1',
    });
    expect(result).toEqual(mockMilestone);
    expect(mockOctokit.rest.issues.updateMilestone).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      milestone_number: 1,
      title: 'v1.1',
    });
  });

  it('should delete milestone', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.issues.deleteMilestone.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteMilestone('owner', 'repo', 1);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.issues.deleteMilestone).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      milestone_number: 1,
    });
  });

  // ==========================================
  // 52. Repository Deploy Keys & Commit Statuses API Tests
  // ==========================================
  it('should list deploy keys', async () => {
    const mockKeys = [{ id: 1, title: 'deploy' }];
    mockOctokit.rest.repos.listDeployKeys.mockResolvedValue({
      data: mockKeys,
    });

    const result = await GithubService.listDeployKeys('owner', 'repo');
    expect(result).toEqual(mockKeys);
    expect(mockOctokit.rest.repos.listDeployKeys).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get specific deploy key', async () => {
    const mockKey = { id: 1, title: 'deploy' };
    mockOctokit.rest.repos.getDeployKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.getDeployKey('owner', 'repo', 1);
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.repos.getDeployKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      key_id: 1,
    });
  });

  it('should add deploy key', async () => {
    const mockKey = { id: 1, title: 'deploy' };
    mockOctokit.rest.repos.createDeployKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.addDeployKey(
      'owner',
      'repo',
      'deploy',
      'ssh-rsa AAA...',
      false,
    );
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.repos.createDeployKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'deploy',
      key: 'ssh-rsa AAA...',
      read_only: false,
    });
  });

  it('should delete deploy key', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.repos.deleteDeployKey.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteDeployKey('owner', 'repo', 1);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.repos.deleteDeployKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      key_id: 1,
    });
  });

  it('should create commit status', async () => {
    const mockStatus = { id: 1, state: 'success' };
    mockOctokit.rest.repos.createCommitStatus.mockResolvedValue({
      data: mockStatus,
    });

    const result = await GithubService.createCommitStatus(
      'owner',
      'repo',
      'sha123',
      { state: 'success', context: 'ci' },
    );
    expect(result).toEqual(mockStatus);
    expect(mockOctokit.rest.repos.createCommitStatus).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      sha: 'sha123',
      state: 'success',
      context: 'ci',
    });
  });

  it('should list commit statuses for ref', async () => {
    const mockStatuses = [{ id: 1, state: 'success' }];
    mockOctokit.rest.repos.listStatusesForRef.mockResolvedValue({
      data: mockStatuses,
    });

    const result = await GithubService.listCommitStatusesForRef(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockStatuses);
    expect(mockOctokit.rest.repos.listStatusesForRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'main',
    });
  });

  // ==========================================
  // 53. PR Review Comments & Merges API Tests
  // ==========================================
  it('should list PR review comments', async () => {
    const mockComments = [{ id: 1, body: 'comment' }];
    mockOctokit.rest.pulls.listReviewComments.mockResolvedValue({
      data: mockComments,
    });

    const result = await GithubService.listReviewComments('owner', 'repo', 5);
    expect(result).toEqual(mockComments);
    expect(mockOctokit.rest.pulls.listReviewComments).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
    });
  });

  it('should get PR review comment', async () => {
    const mockComment = { id: 1, body: 'comment' };
    mockOctokit.rest.pulls.getReviewComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.getReviewComment('owner', 'repo', 1);
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.pulls.getReviewComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
    });
  });

  it('should create PR review comment', async () => {
    const mockComment = { id: 1, body: 'comment' };
    mockOctokit.rest.pulls.createReviewComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.createReviewComment('owner', 'repo', 5, {
      body: 'comment',
    });
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.pulls.createReviewComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      body: 'comment',
    });
  });

  it('should update PR review comment', async () => {
    const mockComment = { id: 1, body: 'updated' };
    mockOctokit.rest.pulls.updateReviewComment.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.updateReviewComment(
      'owner',
      'repo',
      1,
      'updated',
    );
    expect(result).toEqual(mockComment);
    expect(mockOctokit.rest.pulls.updateReviewComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
      body: 'updated',
    });
  });

  it('should delete PR review comment', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.pulls.deleteReviewComment.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteReviewComment('owner', 'repo', 1);
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.pulls.deleteReviewComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
    });
  });

  it('should merge pull request', async () => {
    const mockResponse = { merged: true };
    mockOctokit.rest.pulls.merge.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.mergePullRequest('owner', 'repo', 5, {
      commit_title: 'merge',
    });
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.pulls.merge).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
      commit_title: 'merge',
    });
  });

  it('should check if PR is merged', async () => {
    mockOctokit.rest.pulls.checkIfMerged.mockResolvedValue({
      status: 204,
    });

    const result = await GithubService.checkIfPullRequestMerged(
      'owner',
      'repo',
      5,
    );
    expect(result).toEqual({ merged: true });
    expect(mockOctokit.rest.pulls.checkIfMerged).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 5,
    });
  });

  it('should return merged false if checkIfMerged returns 404', async () => {
    const error = new Error('Not Found');
    error.status = 404;
    mockOctokit.rest.pulls.checkIfMerged.mockRejectedValue(error);

    const result = await GithubService.checkIfPullRequestMerged(
      'owner',
      'repo',
      5,
    );
    expect(result).toEqual({ merged: false });
  });

  // ==========================================
  // 54. Team Discussions API Tests
  // ==========================================
  it('should list team discussions', async () => {
    const mockDiscussions = [{ id: 1, title: 'discussion' }];
    mockOctokit.rest.teams.listDiscussionsInOrg.mockResolvedValue({
      data: mockDiscussions,
    });

    const result = await GithubService.listTeamDiscussions('my-org', 'my-team');
    expect(result).toEqual(mockDiscussions);
    expect(mockOctokit.rest.teams.listDiscussionsInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
    });
  });

  it('should get team discussion', async () => {
    const mockDiscussion = { id: 1, title: 'discussion' };
    mockOctokit.rest.teams.getDiscussionInOrg.mockResolvedValue({
      data: mockDiscussion,
    });

    const result = await GithubService.getTeamDiscussion(
      'my-org',
      'my-team',
      1,
    );
    expect(result).toEqual(mockDiscussion);
    expect(mockOctokit.rest.teams.getDiscussionInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
    });
  });

  it('should create team discussion', async () => {
    const mockDiscussion = { id: 1, title: 'discussion' };
    mockOctokit.rest.teams.createDiscussionInOrg.mockResolvedValue({
      data: mockDiscussion,
    });

    const result = await GithubService.createTeamDiscussion(
      'my-org',
      'my-team',
      { title: 'discussion', body: 'hello' },
    );
    expect(result).toEqual(mockDiscussion);
    expect(mockOctokit.rest.teams.createDiscussionInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      title: 'discussion',
      body: 'hello',
    });
  });

  it('should update team discussion', async () => {
    const mockDiscussion = { id: 1, title: 'updated' };
    mockOctokit.rest.teams.updateDiscussionInOrg.mockResolvedValue({
      data: mockDiscussion,
    });

    const result = await GithubService.updateTeamDiscussion(
      'my-org',
      'my-team',
      1,
      { title: 'updated' },
    );
    expect(result).toEqual(mockDiscussion);
    expect(mockOctokit.rest.teams.updateDiscussionInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
      title: 'updated',
    });
  });

  it('should delete team discussion', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.teams.deleteDiscussionInOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteTeamDiscussion(
      'my-org',
      'my-team',
      1,
    );
    expect(result).toEqual(mockResponse);
    expect(mockOctokit.rest.teams.deleteDiscussionInOrg).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
    });
  });

  it('should list team discussion comments', async () => {
    const mockComments = [{ id: 1, body: 'comment' }];
    mockOctokit.rest.teams.listDiscussionCommentsInOrg.mockResolvedValue({
      data: mockComments,
    });

    const result = await GithubService.listTeamDiscussionComments(
      'my-org',
      'my-team',
      1,
    );
    expect(result).toEqual(mockComments);
    expect(
      mockOctokit.rest.teams.listDiscussionCommentsInOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
    });
  });

  it('should get team discussion comment', async () => {
    const mockComment = { id: 1, body: 'comment' };
    mockOctokit.rest.teams.getDiscussionCommentInOrg.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.getTeamDiscussionComment(
      'my-org',
      'my-team',
      1,
      10,
    );
    expect(result).toEqual(mockComment);
    expect(
      mockOctokit.rest.teams.getDiscussionCommentInOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
      comment_number: 10,
    });
  });

  it('should create team discussion comment', async () => {
    const mockComment = { id: 1, body: 'comment' };
    mockOctokit.rest.teams.createDiscussionCommentInOrg.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.createTeamDiscussionComment(
      'my-org',
      'my-team',
      1,
      'comment',
    );
    expect(result).toEqual(mockComment);
    expect(
      mockOctokit.rest.teams.createDiscussionCommentInOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
      body: 'comment',
    });
  });

  it('should update team discussion comment', async () => {
    const mockComment = { id: 1, body: 'updated' };
    mockOctokit.rest.teams.updateDiscussionCommentInOrg.mockResolvedValue({
      data: mockComment,
    });

    const result = await GithubService.updateTeamDiscussionComment(
      'my-org',
      'my-team',
      1,
      10,
      'updated',
    );
    expect(result).toEqual(mockComment);
    expect(
      mockOctokit.rest.teams.updateDiscussionCommentInOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
      comment_number: 10,
      body: 'updated',
    });
  });

  it('should delete team discussion comment', async () => {
    const mockResponse = { success: true };
    mockOctokit.rest.teams.deleteDiscussionCommentInOrg.mockResolvedValue({
      data: mockResponse,
    });

    const result = await GithubService.deleteTeamDiscussionComment(
      'my-org',
      'my-team',
      1,
      10,
    );
    expect(result).toEqual(mockResponse);
    expect(
      mockOctokit.rest.teams.deleteDiscussionCommentInOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      team_slug: 'my-team',
      discussion_number: 1,
      comment_number: 10,
    });
  });

  // ==========================================
  // 55. SCIM Organization Member Provisioning
  // ==========================================
  it('should list SCIM provisioned identities', async () => {
    const mockIdentities = [{ id: 'scim-1' }];
    mockOctokit.request.mockResolvedValue({ data: mockIdentities });

    const result = await GithubService.listProvisionedIdentities('my-org');
    expect(result).toEqual(mockIdentities);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /scim/v2/organizations/{org}/Users',
      { org: 'my-org' },
    );
  });

  it('should provision and invite SCIM user', async () => {
    const mockUser = { id: 'scim-1' };
    const scimData = { userName: 'user' };
    mockOctokit.request.mockResolvedValue({ data: mockUser });

    const result = await GithubService.provisionAndInviteUser(
      'my-org',
      scimData,
    );
    expect(result).toEqual(mockUser);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'POST /scim/v2/organizations/{org}/Users',
      { org: 'my-org', data: scimData },
    );
  });

  it('should get SCIM provisioning information', async () => {
    const mockUser = { id: 'scim-1' };
    mockOctokit.request.mockResolvedValue({ data: mockUser });

    const result = await GithubService.getProvisioningInformation(
      'my-org',
      'scim-1',
    );
    expect(result).toEqual(mockUser);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /scim/v2/organizations/{org}/Users/{scim_user_id}',
      { org: 'my-org', scim_user_id: 'scim-1' },
    );
  });

  it('should replace SCIM provisioned user', async () => {
    const mockUser = { id: 'scim-1' };
    const scimData = { userName: 'user' };
    mockOctokit.request.mockResolvedValue({ data: mockUser });

    const result = await GithubService.replaceProvisionedUser(
      'my-org',
      'scim-1',
      scimData,
    );
    expect(result).toEqual(mockUser);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'PUT /scim/v2/organizations/{org}/Users/{scim_user_id}',
      { org: 'my-org', scim_user_id: 'scim-1', data: scimData },
    );
  });

  it('should update SCIM provisioned user', async () => {
    const mockUser = { id: 'scim-1' };
    const scimData = { userName: 'user' };
    mockOctokit.request.mockResolvedValue({ data: mockUser });

    const result = await GithubService.updateProvisionedUser(
      'my-org',
      'scim-1',
      scimData,
    );
    expect(result).toEqual(mockUser);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'PATCH /scim/v2/organizations/{org}/Users/{scim_user_id}',
      { org: 'my-org', scim_user_id: 'scim-1', data: scimData },
    );
  });

  it('should delete SCIM user from organization', async () => {
    const mockRes = { success: true };
    mockOctokit.request.mockResolvedValue({ data: mockRes });

    const result = await GithubService.deleteUserFromOrg('my-org', 'scim-1');
    expect(result).toEqual(mockRes);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'DELETE /scim/v2/organizations/{org}/Users/{scim_user_id}',
      { org: 'my-org', scim_user_id: 'scim-1' },
    );
  });

  // ==========================================
  // 56. Codespaces Secrets API
  // ==========================================
  it('should get Codespaces public key for user', async () => {
    const mockKey = { key_id: 'key1' };
    mockOctokit.rest.codespaces.getPublicKeyForAuthenticatedUser.mockResolvedValue(
      { data: mockKey },
    );

    const result =
      await GithubService.getCodespacesPublicKeyForAuthenticatedUser();
    expect(result).toEqual(mockKey);
    expect(
      mockOctokit.rest.codespaces.getPublicKeyForAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should list Codespaces secrets for user', async () => {
    const mockSecrets = [{ name: 'sec1' }];
    mockOctokit.rest.codespaces.listSecretsForAuthenticatedUser.mockResolvedValue(
      { data: mockSecrets },
    );

    const result =
      await GithubService.listCodespacesSecretsForAuthenticatedUser();
    expect(result).toEqual(mockSecrets);
    expect(
      mockOctokit.rest.codespaces.listSecretsForAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should get Codespaces secret for user', async () => {
    const mockSecret = { name: 'sec1' };
    mockOctokit.rest.codespaces.getSecretForAuthenticatedUser.mockResolvedValue(
      { data: mockSecret },
    );

    const result =
      await GithubService.getCodespacesSecretForAuthenticatedUser('sec1');
    expect(result).toEqual(mockSecret);
    expect(
      mockOctokit.rest.codespaces.getSecretForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      secret_name: 'sec1',
    });
  });

  it('should create or update Codespaces secret for user', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.codespaces.createOrUpdateSecretForAuthenticatedUser.mockResolvedValue(
      { data: mockRes },
    );

    const result =
      await GithubService.createOrUpdateCodespacesSecretForAuthenticatedUser(
        'sec1',
        'enc1',
        'key1',
      );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.codespaces.createOrUpdateSecretForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      secret_name: 'sec1',
      encrypted_value: 'enc1',
      key_id: 'key1',
    });
  });

  it('should delete Codespaces secret for user', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.codespaces.deleteSecretForAuthenticatedUser.mockResolvedValue(
      { data: mockRes },
    );

    const result =
      await GithubService.deleteCodespacesSecretForAuthenticatedUser('sec1');
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.codespaces.deleteSecretForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      secret_name: 'sec1',
    });
  });

  it('should get Codespaces public key for org', async () => {
    const mockKey = { key_id: 'key1' };
    mockOctokit.rest.codespaces.getOrgPublicKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.getCodespacesPublicKeyForOrg('my-org');
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.codespaces.getOrgPublicKey).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should list Codespaces secrets for org', async () => {
    const mockSecrets = [{ name: 'sec1' }];
    mockOctokit.rest.codespaces.listOrgSecrets.mockResolvedValue({
      data: mockSecrets,
    });

    const result = await GithubService.listCodespacesSecretsForOrg('my-org');
    expect(result).toEqual(mockSecrets);
    expect(mockOctokit.rest.codespaces.listOrgSecrets).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get Codespaces secret for org', async () => {
    const mockSecret = { name: 'sec1' };
    mockOctokit.rest.codespaces.getOrgSecret.mockResolvedValue({
      data: mockSecret,
    });

    const result = await GithubService.getCodespacesSecretForOrg(
      'my-org',
      'sec1',
    );
    expect(result).toEqual(mockSecret);
    expect(mockOctokit.rest.codespaces.getOrgSecret).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
    });
  });

  it('should create or update Codespaces secret for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.codespaces.createOrUpdateOrgSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateCodespacesSecretForOrg(
      'my-org',
      'sec1',
      'enc1',
      'key1',
      ['123'],
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.codespaces.createOrUpdateOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
      encrypted_value: 'enc1',
      key_id: 'key1',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should delete Codespaces secret for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.codespaces.deleteOrgSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.deleteCodespacesSecretForOrg(
      'my-org',
      'sec1',
    );
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.codespaces.deleteOrgSecret).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
    });
  });

  // ==========================================
  // 57. Actions Organization Secrets & Variables
  // ==========================================
  it('should get Actions public key for org', async () => {
    const mockKey = { key_id: 'key1' };
    mockOctokit.rest.actions.getOrgPublicKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.getActionsPublicKeyForOrg('my-org');
    expect(result).toEqual(mockKey);
    expect(mockOctokit.rest.actions.getOrgPublicKey).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should list Actions secrets for org', async () => {
    const mockSecrets = [{ name: 'sec1' }];
    mockOctokit.rest.actions.listOrgSecrets.mockResolvedValue({
      data: mockSecrets,
    });

    const result = await GithubService.listOrgSecrets('my-org');
    expect(result).toEqual(mockSecrets);
    expect(mockOctokit.rest.actions.listOrgSecrets).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get Actions secret for org', async () => {
    const mockSecret = { name: 'sec1' };
    mockOctokit.rest.actions.getOrgSecret.mockResolvedValue({
      data: mockSecret,
    });

    const result = await GithubService.getOrgSecret('my-org', 'sec1');
    expect(result).toEqual(mockSecret);
    expect(mockOctokit.rest.actions.getOrgSecret).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
    });
  });

  it('should create Actions secret for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createOrUpdateOrgSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateOrgSecret(
      'my-org',
      'sec1',
      'enc1',
      'key1',
      ['123'],
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.createOrUpdateOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
      encrypted_value: 'enc1',
      key_id: 'key1',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should delete Actions secret for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.deleteOrgSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.deleteOrgSecret('my-org', 'sec1');
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.actions.deleteOrgSecret).toHaveBeenCalledWith({
      org: 'my-org',
      secret_name: 'sec1',
    });
  });

  it('should list Actions variables for org', async () => {
    const mockVars = [{ name: 'var1' }];
    mockOctokit.rest.actions.listOrgVariables.mockResolvedValue({
      data: mockVars,
    });

    const result = await GithubService.listOrgVariables('my-org');
    expect(result).toEqual(mockVars);
    expect(mockOctokit.rest.actions.listOrgVariables).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should get Actions variable for org', async () => {
    const mockVar = { name: 'var1' };
    mockOctokit.rest.actions.getOrgVariable.mockResolvedValue({
      data: mockVar,
    });

    const result = await GithubService.getOrgVariable('my-org', 'var1');
    expect(result).toEqual(mockVar);
    expect(mockOctokit.rest.actions.getOrgVariable).toHaveBeenCalledWith({
      org: 'my-org',
      variable_name: 'var1',
    });
  });

  it('should create Actions variable for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createOrgVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateOrgVariable(
      'my-org',
      'var1',
      'val1',
      ['123'],
    );
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.actions.createOrgVariable).toHaveBeenCalledWith({
      org: 'my-org',
      name: 'var1',
      value: 'val1',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should update Actions variable for org when creation fails (fallback)', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createOrgVariable.mockRejectedValue(
      new Error('Variable already exists'),
    );
    mockOctokit.rest.actions.updateOrgVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateOrgVariable(
      'my-org',
      'var1',
      'val1',
      ['123'],
    );
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.actions.createOrgVariable).toHaveBeenCalled();
    expect(mockOctokit.rest.actions.updateOrgVariable).toHaveBeenCalledWith({
      org: 'my-org',
      variable_name: 'var1',
      name: 'var1',
      value: 'val1',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should delete Actions variable for org', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.deleteOrgVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.deleteOrgVariable('my-org', 'var1');
    expect(result).toEqual(mockRes);
    expect(mockOctokit.rest.actions.deleteOrgVariable).toHaveBeenCalledWith({
      org: 'my-org',
      variable_name: 'var1',
    });
  });

  // ==========================================
  // 58. Actions Environment Secrets & Variables
  // ==========================================
  it('should get Actions public key for environment', async () => {
    const mockKey = { key_id: 'key1' };
    mockOctokit.rest.actions.getEnvironmentPublicKey.mockResolvedValue({
      data: mockKey,
    });

    const result = await GithubService.getActionsPublicKeyForEnvironment(
      123,
      'prod',
    );
    expect(result).toEqual(mockKey);
    expect(
      mockOctokit.rest.actions.getEnvironmentPublicKey,
    ).toHaveBeenCalledWith({
      repository_id: 123,
      environment_name: 'prod',
    });
  });

  it('should list Actions secrets for environment', async () => {
    const mockSecrets = [{ name: 'sec1' }];
    mockOctokit.rest.actions.listEnvironmentSecrets.mockResolvedValue({
      data: mockSecrets,
    });

    const result = await GithubService.listEnvironmentSecrets(
      'owner',
      'repo',
      'prod',
    );
    expect(result).toEqual(mockSecrets);
    expect(
      mockOctokit.rest.actions.listEnvironmentSecrets,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
    });
  });

  it('should get Actions secret for environment', async () => {
    const mockSecret = { name: 'sec1' };
    mockOctokit.rest.actions.getEnvironmentSecret.mockResolvedValue({
      data: mockSecret,
    });

    const result = await GithubService.getEnvironmentSecret(
      'owner',
      'repo',
      'prod',
      'sec1',
    );
    expect(result).toEqual(mockSecret);
    expect(mockOctokit.rest.actions.getEnvironmentSecret).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      secret_name: 'sec1',
    });
  });

  it('should create or update Actions secret for environment', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createOrUpdateEnvironmentSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateEnvironmentSecret(
      'owner',
      'repo',
      'prod',
      'sec1',
      'enc1',
      'key1',
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.createOrUpdateEnvironmentSecret,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      secret_name: 'sec1',
      encrypted_value: 'enc1',
      key_id: 'key1',
    });
  });

  it('should delete Actions secret for environment', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.deleteEnvironmentSecret.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.deleteEnvironmentSecret(
      'owner',
      'repo',
      'prod',
      'sec1',
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.deleteEnvironmentSecret,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      secret_name: 'sec1',
    });
  });

  it('should list Actions variables for environment', async () => {
    const mockVars = [{ name: 'var1' }];
    mockOctokit.rest.actions.listEnvironmentVariables.mockResolvedValue({
      data: mockVars,
    });

    const result = await GithubService.listEnvironmentVariables(
      'owner',
      'repo',
      'prod',
    );
    expect(result).toEqual(mockVars);
    expect(
      mockOctokit.rest.actions.listEnvironmentVariables,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
    });
  });

  it('should get Actions variable for environment', async () => {
    const mockVar = { name: 'var1' };
    mockOctokit.rest.actions.getEnvironmentVariable.mockResolvedValue({
      data: mockVar,
    });

    const result = await GithubService.getEnvironmentVariable(
      'owner',
      'repo',
      'prod',
      'var1',
    );
    expect(result).toEqual(mockVar);
    expect(
      mockOctokit.rest.actions.getEnvironmentVariable,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      variable_name: 'var1',
    });
  });

  it('should create Actions variable for environment', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createEnvironmentVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateEnvironmentVariable(
      'owner',
      'repo',
      'prod',
      'var1',
      'val1',
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.createEnvironmentVariable,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      name: 'var1',
      value: 'val1',
    });
  });

  it('should update Actions variable for environment when creation fails (fallback)', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.createEnvironmentVariable.mockRejectedValue(
      new Error('Variable already exists'),
    );
    mockOctokit.rest.actions.updateEnvironmentVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.createOrUpdateEnvironmentVariable(
      'owner',
      'repo',
      'prod',
      'var1',
      'val1',
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.createEnvironmentVariable,
    ).toHaveBeenCalled();
    expect(
      mockOctokit.rest.actions.updateEnvironmentVariable,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      variable_name: 'var1',
      name: 'var1',
      value: 'val1',
    });
  });

  it('should delete Actions variable for environment', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.actions.deleteEnvironmentVariable.mockResolvedValue({
      data: mockRes,
    });

    const result = await GithubService.deleteEnvironmentVariable(
      'owner',
      'repo',
      'prod',
      'var1',
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.actions.deleteEnvironmentVariable,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      environment_name: 'prod',
      variable_name: 'var1',
    });
  });

  // ==========================================
  // 59. Secret Scanning Org Alerts & Locations
  // ==========================================
  it('should list secret scanning alerts for org', async () => {
    const mockAlerts = [{ number: 1 }];
    mockOctokit.rest.secretScanning.listAlertsForOrg.mockResolvedValue({
      data: mockAlerts,
    });

    const result = await GithubService.listSecretScanningAlertsForOrg('my-org');
    expect(result).toEqual(mockAlerts);
    expect(
      mockOctokit.rest.secretScanning.listAlertsForOrg,
    ).toHaveBeenCalledWith({ org: 'my-org' });
  });

  it('should get secret scanning alert for org', async () => {
    const mockAlert = { number: 1 };
    mockOctokit.request.mockResolvedValue({ data: mockAlert });

    const result = await GithubService.getSecretScanningAlertForOrg(
      'my-org',
      1,
    );
    expect(result).toEqual(mockAlert);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /orgs/{org}/secret-scanning/alerts/{alert_number}',
      { org: 'my-org', alert_number: 1 },
    );
  });

  it('should update secret scanning alert for org', async () => {
    const mockAlert = { number: 1, state: 'resolved' };
    mockOctokit.request.mockResolvedValue({ data: mockAlert });

    const result = await GithubService.updateSecretScanningAlertForOrg(
      'my-org',
      1,
      'resolved',
      'false_positive',
    );
    expect(result).toEqual(mockAlert);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'PATCH /orgs/{org}/secret-scanning/alerts/{alert_number}',
      {
        org: 'my-org',
        alert_number: 1,
        state: 'resolved',
        resolution: 'false_positive',
      },
    );
  });

  it('should list secret scanning locations', async () => {
    const mockLocations = [{ path: 'README.md' }];
    mockOctokit.rest.secretScanning.listLocationsForAlert.mockResolvedValue({
      data: mockLocations,
    });

    const result = await GithubService.listSecretScanningLocations(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockLocations);
    expect(
      mockOctokit.rest.secretScanning.listLocationsForAlert,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      alert_number: 1,
    });
  });

  // ==========================================
  // 60. Enterprise Admin Policies, Runners & Billing
  // ==========================================
  it('should get enterprise Actions permissions', async () => {
    const mockPerms = { enabled_organizations: 'all' };
    mockOctokit.rest.enterpriseAdmin.getActionsPermissionsEnterprise.mockResolvedValue(
      { data: mockPerms },
    );

    const result =
      await GithubService.getEnterpriseActionsPermissions('my-ent');
    expect(result).toEqual(mockPerms);
    expect(
      mockOctokit.rest.enterpriseAdmin.getActionsPermissionsEnterprise,
    ).toHaveBeenCalledWith({
      enterprise: 'my-ent',
    });
  });

  it('should set enterprise Actions permissions', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.enterpriseAdmin.setActionsPermissionsEnterprise.mockResolvedValue(
      { data: mockRes },
    );

    const result = await GithubService.setEnterpriseActionsPermissions(
      'my-ent',
      { enabled_organizations: 'all' },
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.enterpriseAdmin.setActionsPermissionsEnterprise,
    ).toHaveBeenCalledWith({
      enterprise: 'my-ent',
      enabled_organizations: 'all',
    });
  });

  it('should list self-hosted runners for enterprise', async () => {
    const mockRunners = [{ id: 1 }];
    mockOctokit.rest.enterpriseAdmin.listSelfHostedRunnersForEnterprise.mockResolvedValue(
      { data: mockRunners },
    );

    const result =
      await GithubService.listSelfHostedRunnersForEnterprise('my-ent');
    expect(result).toEqual(mockRunners);
    expect(
      mockOctokit.rest.enterpriseAdmin.listSelfHostedRunnersForEnterprise,
    ).toHaveBeenCalledWith({
      enterprise: 'my-ent',
    });
  });

  it('should get self-hosted runner for enterprise', async () => {
    const mockRunner = { id: 1 };
    mockOctokit.rest.enterpriseAdmin.getSelfHostedRunnerForEnterprise.mockResolvedValue(
      { data: mockRunner },
    );

    const result = await GithubService.getSelfHostedRunnerForEnterprise(
      'my-ent',
      1,
    );
    expect(result).toEqual(mockRunner);
    expect(
      mockOctokit.rest.enterpriseAdmin.getSelfHostedRunnerForEnterprise,
    ).toHaveBeenCalledWith({
      enterprise: 'my-ent',
      runner_id: 1,
    });
  });

  it('should delete self-hosted runner from enterprise', async () => {
    const mockRes = { success: true };
    mockOctokit.rest.enterpriseAdmin.deleteSelfHostedRunnerFromEnterprise.mockResolvedValue(
      { data: mockRes },
    );

    const result = await GithubService.deleteSelfHostedRunnerFromEnterprise(
      'my-ent',
      1,
    );
    expect(result).toEqual(mockRes);
    expect(
      mockOctokit.rest.enterpriseAdmin.deleteSelfHostedRunnerFromEnterprise,
    ).toHaveBeenCalledWith({
      enterprise: 'my-ent',
      runner_id: 1,
    });
  });

  it('should get Actions billing for enterprise', async () => {
    const mockBilling = { total_minutes_used: 500 };
    mockOctokit.request.mockResolvedValue({ data: mockBilling });

    const result = await GithubService.getEnterpriseActionsBilling('my-ent');
    expect(result).toEqual(mockBilling);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /enterprises/{enterprise}/settings/billing/actions',
      { enterprise: 'my-ent' },
    );
  });

  it('should get Packages billing for enterprise', async () => {
    const mockBilling = { total_gigabytes_bandwidth_used: 100 };
    mockOctokit.request.mockResolvedValue({ data: mockBilling });

    const result = await GithubService.getEnterprisePackagesBilling('my-ent');
    expect(result).toEqual(mockBilling);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /enterprises/{enterprise}/settings/billing/packages',
      { enterprise: 'my-ent' },
    );
  });

  it('should get Shared Storage billing for enterprise', async () => {
    const mockBilling = { estimated_paid_storage_for_month: 10.5 };
    mockOctokit.request.mockResolvedValue({ data: mockBilling });

    const result =
      await GithubService.getEnterpriseSharedStorageBilling('my-ent');
    expect(result).toEqual(mockBilling);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /enterprises/{enterprise}/settings/billing/shared-storage',
      { enterprise: 'my-ent' },
    );
  });

  // ==========================================
  // 61. Advanced Security Scanning
  // ==========================================
  it('should update code scanning alert state', async () => {
    const mockData = { id: 1, state: 'dismissed' };
    mockOctokit.rest.codeScanning.updateAlert.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateCodeScanningAlert(
      'owner',
      'repo',
      123,
      'dismissed',
      'false_positive',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codeScanning.updateAlert).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      alert_number: 123,
      state: 'dismissed',
      dismissed_reason: 'false_positive',
    });
  });

  it('should list code scanning alert instances', async () => {
    const mockData = [{ commit_sha: 'sha' }];
    mockOctokit.rest.codeScanning.listAlertInstances.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listCodeScanningAlertInstances(
      'owner',
      'repo',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeScanning.listAlertInstances,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      alert_number: 123,
    });
  });

  it('should list code scanning analyses', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.codeScanning.listAnalysesForRepo.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listCodeScanningAnalyses(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeScanning.listAnalysesForRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get code scanning analysis details', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.codeScanning.getAnalysis.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getCodeScanningAnalysis(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codeScanning.getAnalysis).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      analysis_id: 1,
    });
  });

  it('should delete code scanning analysis', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codeScanning.deleteAnalysis.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteCodeScanningAnalysis(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codeScanning.deleteAnalysis).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      analysis_id: 1,
    });
  });

  it('should upload SARIF file', async () => {
    const mockData = { id: 'upload-id' };
    mockOctokit.rest.codeScanning.uploadSarif.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.uploadCodeScanningSarif(
      'owner',
      'repo',
      { sarif: 'base64' },
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codeScanning.uploadSarif).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      sarif: 'base64',
    });
  });

  it('should list secret scanning bypass approvals', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.request.mockResolvedValue({ data: mockData });
    const result = await GithubService.listSecretScanningBypassApprovals(
      'owner',
      'repo',
      123,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/bypass-approvals',
      { owner: 'owner', repo: 'repo', alert_number: 123 },
    );
  });

  it('should create secret scanning bypass approval', async () => {
    const mockData = { id: 1 };
    mockOctokit.request.mockResolvedValue({ data: mockData });
    const result = await GithubService.createSecretScanningBypassApproval(
      'owner',
      'repo',
      123,
      'approved',
      'Looks good',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.request).toHaveBeenCalledWith(
      'POST /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/bypass-approvals',
      {
        owner: 'owner',
        repo: 'repo',
        alert_number: 123,
        data: { state: 'approved', comment: 'Looks good' },
      },
    );
  });

  // ==========================================
  // 62. Commit Comments
  // ==========================================
  it('should list commit comments', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.repos.listCommitComments.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listCommitComments('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listCommitComments).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get commit comment details', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.getCommitComment.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getCommitComment('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getCommitComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
    });
  });

  it('should create commit comment', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.createCommitComment.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createCommitComment(
      'owner',
      'repo',
      'sha',
      'body',
      'path',
      2,
      3,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.createCommitComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      commit_sha: 'sha',
      body: 'body',
      path: 'path',
      position: 2,
      line: 3,
    });
  });

  it('should update commit comment', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.updateCommitComment.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateCommitComment(
      'owner',
      'repo',
      1,
      'body',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.updateCommitComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
      body: 'body',
    });
  });

  it('should delete commit comment', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteCommitComment.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteCommitComment('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deleteCommitComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 1,
    });
  });

  // ==========================================
  // 63. Repository Forks & Invitations
  // ==========================================
  it('should list forks', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.repos.listForks.mockResolvedValue({ data: mockData });
    const result = await GithubService.listForks('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listForks).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should create fork', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.createFork.mockResolvedValue({ data: mockData });
    const result = await GithubService.createFork(
      'owner',
      'repo',
      'org',
      'name',
      true,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.createFork).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      organization: 'org',
      name: 'name',
      default_branch_only: true,
    });
  });

  it('should list repo invitations', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.repos.listInvitations.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listRepoInvitations('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listInvitations).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should delete repo invitation', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteInvitation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteRepoInvitation('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deleteInvitation).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      invitation_id: 1,
    });
  });

  it('should update repo invitation', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.updateInvitation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateRepoInvitation(
      'owner',
      'repo',
      1,
      'write',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.updateInvitation).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      invitation_id: 1,
      permissions: 'write',
    });
  });

  // ==========================================
  // 64. Repository Pages
  // ==========================================
  it('should get Pages info', async () => {
    const mockData = { cname: 'example.com' };
    mockOctokit.rest.repos.getPages.mockResolvedValue({ data: mockData });
    const result = await GithubService.getPagesInfo('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getPages).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should create Pages site', async () => {
    const mockData = { status: 'built' };
    mockOctokit.rest.repos.createPagesSite.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createPagesSite('owner', 'repo', {
      branch: 'main',
    });
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.createPagesSite).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      source: { branch: 'main' },
    });
  });

  it('should update Pages site', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.updatePagesSite.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updatePagesSite('owner', 'repo', {
      branch: 'main',
    });
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.updatePagesSite).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      source: { branch: 'main' },
    });
  });

  it('should delete Pages site', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deletePagesSite.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deletePagesSite('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deletePagesSite).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should list Pages builds', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.repos.listPagesBuilds.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listPagesBuilds('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listPagesBuilds).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get Pages build info', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.repos.getPagesBuild.mockResolvedValue({ data: mockData });
    const result = await GithubService.getPagesBuildInfo('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getPagesBuild).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      build_id: 1,
    });
  });

  it('should request Pages build', async () => {
    const mockData = { status: 'queued' };
    mockOctokit.rest.repos.requestPagesBuild.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.requestPagesBuild('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.requestPagesBuild).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // ==========================================
  // 65. Actions Runner Groups & Workflow Permissions
  // ==========================================
  it('should list org runner groups', async () => {
    const mockData = { runner_groups: [] };
    mockOctokit.rest.actions.listSelfHostedRunnerGroupsForOrg.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listOrgRunnerGroups('org');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.listSelfHostedRunnerGroupsForOrg,
    ).toHaveBeenCalledWith({ org: 'org' });
  });

  it('should get org runner group', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.actions.getSelfHostedRunnerGroupForOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getOrgRunnerGroup('org', 1);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.getSelfHostedRunnerGroupForOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      runner_group_id: 1,
    });
  });

  it('should create org runner group', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.actions.createSelfHostedRunnerGroupForOrg.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.createOrgRunnerGroup(
      'org',
      'name',
      'selected',
      [123],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.createSelfHostedRunnerGroupForOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      name: 'name',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should update org runner group', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.actions.updateSelfHostedRunnerGroupForOrg.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.updateOrgRunnerGroup(
      'org',
      1,
      'name',
      'selected',
      [123],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.updateSelfHostedRunnerGroupForOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      runner_group_id: 1,
      name: 'name',
      visibility: 'selected',
      selected_repository_ids: [123],
    });
  });

  it('should delete org runner group', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.deleteSelfHostedRunnerGroupFromOrg.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.deleteOrgRunnerGroup('org', 1);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.deleteSelfHostedRunnerGroupFromOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      runner_group_id: 1,
    });
  });

  it('should get Actions permissions for org', async () => {
    const mockData = { enabled_repositories: 'all' };
    mockOctokit.rest.actions.getActionsPermissionsOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getActionsPermissionsForOrg('org');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.getActionsPermissionsOrg,
    ).toHaveBeenCalledWith({ org: 'org' });
  });

  it('should set Actions permissions for org', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.setActionsPermissionsOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setActionsPermissionsForOrg(
      'org',
      'all',
      'all',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.setActionsPermissionsOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      enabled_repositories: 'all',
      allowed_actions: 'all',
    });
  });

  it('should get Actions permissions for repo', async () => {
    const mockData = { enabled: true };
    mockOctokit.rest.actions.getActionsPermissionsRepo.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getActionsPermissionsForRepo(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.getActionsPermissionsRepo,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should set Actions permissions for repo', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.setActionsPermissionsRepo.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setActionsPermissionsForRepo(
      'owner',
      'repo',
      true,
      'all',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.setActionsPermissionsRepo,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      enabled: true,
      allowed_actions: 'all',
    });
  });

  // ==========================================
  // 66. Selected Repository Org Secrets & Variables
  // ==========================================
  it('should list selected repos for org secret', async () => {
    const mockData = { repositories: [] };
    mockOctokit.rest.actions.listSelectedRepositoriesEnabledGatewayForOrganizationSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listSelectedReposForOrgSecret(
      'org',
      'secret',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions
        .listSelectedRepositoriesEnabledGatewayForOrganizationSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
    });
  });

  it('should set selected repos for org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.setSelectedRepositoriesEnabledGatewayForOrganizationSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.setSelectedReposForOrgSecret(
      'org',
      'secret',
      [123],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions
        .setSelectedRepositoriesEnabledGatewayForOrganizationSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      selected_repository_ids: [123],
    });
  });

  it('should add selected repo to org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.addSelectedRepositoryEnabledGatewayForOrganizationSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.addSelectedRepoToOrgSecret(
      'org',
      'secret',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions
        .addSelectedRepositoryEnabledGatewayForOrganizationSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      repository_id: 123,
    });
  });

  it('should remove selected repo from org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.removeSelectedRepositoryEnabledGatewayForOrganizationSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.removeSelectedRepoFromOrgSecret(
      'org',
      'secret',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions
        .removeSelectedRepositoryEnabledGatewayForOrganizationSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      repository_id: 123,
    });
  });

  it('should list selected repos for org variable', async () => {
    const mockData = { repositories: [] };
    mockOctokit.rest.actions.listSelectedReposForOrgVariable.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listSelectedReposForOrgVariable(
      'org',
      'var',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.listSelectedReposForOrgVariable,
    ).toHaveBeenCalledWith({
      org: 'org',
      variable_name: 'var',
    });
  });

  it('should set selected repos for org variable', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.setSelectedReposForOrgVariable.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setSelectedReposForOrgVariable(
      'org',
      'var',
      [123],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.setSelectedReposForOrgVariable,
    ).toHaveBeenCalledWith({
      org: 'org',
      variable_name: 'var',
      selected_repository_ids: [123],
    });
  });

  it('should add selected repo to org variable', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.addSelectedRepoToOrgVariable.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addSelectedRepoToOrgVariable(
      'org',
      'var',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.addSelectedRepoToOrgVariable,
    ).toHaveBeenCalledWith({
      org: 'org',
      variable_name: 'var',
      repository_id: 123,
    });
  });

  it('should remove selected repo from org variable', async () => {
    const mockData = { success: true };
    mockOctokit.rest.actions.removeSelectedRepoFromOrgVariable.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.removeSelectedRepoFromOrgVariable(
      'org',
      'var',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.removeSelectedRepoFromOrgVariable,
    ).toHaveBeenCalledWith({
      org: 'org',
      variable_name: 'var',
      repository_id: 123,
    });
  });

  it('should list selected repos for org Codespaces secret', async () => {
    const mockData = { repositories: [] };
    mockOctokit.rest.codespaces.listSelectedReposForOrgSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listSelectedReposForOrgCodespacesSecret(
      'org',
      'secret',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.listSelectedReposForOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
    });
  });

  it('should set selected repos for org Codespaces secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.setSelectedReposForOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setSelectedReposForOrgCodespacesSecret(
      'org',
      'secret',
      [123],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.setSelectedReposForOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      selected_repository_ids: [123],
    });
  });

  it('should add selected repo to org Codespaces secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.addSelectedRepoToOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addSelectedRepoToOrgCodespacesSecret(
      'org',
      'secret',
      123,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.addSelectedRepoToOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      repository_id: 123,
    });
  });

  it('should remove selected repo from org Codespaces secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.removeSelectedRepoFromOrgSecret.mockResolvedValue(
      { data: mockData },
    );
    const result =
      await GithubService.removeSelectedRepoFromOrgCodespacesSecret(
        'org',
        'secret',
        123,
      );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.removeSelectedRepoFromOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'secret',
      repository_id: 123,
    });
  });

  // 67. Repository Security & Private Reporting
  it('should enable private vulnerability reporting', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.enablePrivateVulnerabilityReporting.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.enablePrivateVulnerabilityReporting(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.enablePrivateVulnerabilityReporting,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should disable private vulnerability reporting', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.disablePrivateVulnerabilityReporting.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.disablePrivateVulnerabilityReporting(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.disablePrivateVulnerabilityReporting,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 68. Dependabot Configurations
  it('should enable Dependabot alerts', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.enableDependabotAlerts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.enableDependabotAlerts('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.enableDependabotAlerts).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should disable Dependabot alerts', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.disableDependabotAlerts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.disableDependabotAlerts('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.disableDependabotAlerts).toHaveBeenCalledWith(
      {
        owner: 'owner',
        repo: 'repo',
      },
    );
  });

  it('should enable Dependabot security updates', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.enableAutomatedSecurityFixes.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.enableDependabotSecurityUpdates(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.enableAutomatedSecurityFixes,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should disable Dependabot security updates', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.disableAutomatedSecurityFixes.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.disableDependabotSecurityUpdates(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.disableAutomatedSecurityFixes,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 69. Organization Security Managers
  it('should list security manager teams', async () => {
    const mockData = [{ id: 1, name: 'Security' }];
    mockOctokit.rest.orgs.listSecurityManagerTeams.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listSecurityManagerTeams('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listSecurityManagerTeams).toHaveBeenCalledWith(
      { org: 'org' },
    );
  });

  it('should add a security manager team', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.addSecurityManagerTeam.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addSecurityManagerTeam(
      'org',
      'team-slug',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.addSecurityManagerTeam).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-slug',
    });
  });

  it('should remove a security manager team', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.removeSecurityManagerTeam.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeSecurityManagerTeam(
      'org',
      'team-slug',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.orgs.removeSecurityManagerTeam,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-slug',
    });
  });

  // 70. Repository Autolinks
  it('should list autolinks', async () => {
    const mockData = [{ id: 1, key_prefix: 'TICKET-' }];
    mockOctokit.rest.repos.listAutolinks.mockResolvedValue({ data: mockData });
    const result = await GithubService.listAutolinks('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listAutolinks).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should create an autolink', async () => {
    const mockData = { id: 1, key_prefix: 'TICKET-' };
    mockOctokit.rest.repos.createAutolink.mockResolvedValue({ data: mockData });
    const result = await GithubService.createAutolink(
      'owner',
      'repo',
      'TICKET-',
      'https://example.com/<num>',
      true,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.createAutolink).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      key_prefix: 'TICKET-',
      url_template: 'https://example.com/<num>',
      is_alphanumeric: true,
    });
  });

  it('should get an autolink', async () => {
    const mockData = { id: 1, key_prefix: 'TICKET-' };
    mockOctokit.rest.repos.getAutolink.mockResolvedValue({ data: mockData });
    const result = await GithubService.getAutolink('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getAutolink).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      autolink_id: 1,
    });
  });

  it('should delete an autolink', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteAutolink.mockResolvedValue({ data: mockData });
    const result = await GithubService.deleteAutolink('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deleteAutolink).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      autolink_id: 1,
    });
  });

  // 71. Organization Profile, Membership & Outside Collaborators
  it('should get org info', async () => {
    const mockData = { id: 1, login: 'org' };
    mockOctokit.rest.orgs.get.mockResolvedValue({ data: mockData });
    const result = await GithubService.getOrgInfo('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.get).toHaveBeenCalledWith({ org: 'org' });
  });

  it('should update org settings', async () => {
    const mockData = { id: 1, login: 'org' };
    mockOctokit.rest.orgs.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.updateOrgSettings('org', {
      description: 'Updated',
    });
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.update).toHaveBeenCalledWith({
      org: 'org',
      description: 'Updated',
    });
  });

  it('should get org membership', async () => {
    const mockData = { state: 'active', role: 'admin' };
    mockOctokit.rest.orgs.getMembershipForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getOrgMembership('org', 'username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.getMembershipForUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should add or update org membership', async () => {
    const mockData = { state: 'pending', role: 'member' };
    mockOctokit.rest.orgs.setMembershipForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addOrUpdateOrgMembership(
      'org',
      'username',
      'member',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.setMembershipForUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
      role: 'member',
    });
  });

  it('should remove org member', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.removeMember.mockResolvedValue({ data: mockData });
    const result = await GithubService.removeOrgMember('org', 'username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.removeMember).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should list outside collaborators', async () => {
    const mockData = [{ id: 1, login: 'collab' }];
    mockOctokit.rest.orgs.listOutsideCollaborators.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listOutsideCollaborators('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listOutsideCollaborators).toHaveBeenCalledWith(
      { org: 'org' },
    );
  });

  it('should remove outside collaborator', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.removeOutsideCollaborator.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeOutsideCollaborator(
      'org',
      'username',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.orgs.removeOutsideCollaborator,
    ).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should convert member to outside collaborator', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.convertMemberToOutsideCollaborator.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.convertMemberToOutsideCollaborator(
      'org',
      'username',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.orgs.convertMemberToOutsideCollaborator,
    ).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  // 72. Organization Blocks
  it('should list blocked users for org', async () => {
    const mockData = [{ id: 1, login: 'blocked' }];
    mockOctokit.rest.orgs.listBlockedUsers.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listBlockedUsersForOrg('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listBlockedUsers).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should check if user blocked by org (blocked)', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.checkBlockedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.checkIfUserBlockedByOrg(
      'org',
      'username',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.checkBlockedUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should check if user blocked by org (not blocked 404)', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.orgs.checkBlockedUser.mockRejectedValue(error404);
    const result = await GithubService.checkIfUserBlockedByOrg(
      'org',
      'username',
    );
    expect(result).toEqual({ blocked: false });
    expect(mockOctokit.rest.orgs.checkBlockedUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should block user for org', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.blockUser.mockResolvedValue({ data: mockData });
    const result = await GithubService.blockUserForOrg('org', 'username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.blockUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  it('should unblock user for org', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.unblockUser.mockResolvedValue({ data: mockData });
    const result = await GithubService.unblockUserForOrg('org', 'username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.unblockUser).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
    });
  });

  // 73. Authenticated User Blocks
  it('should list blocked users for user', async () => {
    const mockData = [{ id: 1, login: 'blocked' }];
    mockOctokit.rest.users.listBlockedForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listBlockedUsersForUser();
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listBlockedForAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should check if user blocked by user (blocked)', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.checkBlockedForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.checkIfUserBlockedByUser('username');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.checkBlockedForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      username: 'username',
    });
  });

  it('should check if user blocked by user (not blocked 404)', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.users.checkBlockedForAuthenticatedUser.mockRejectedValue(
      error404,
    );
    const result = await GithubService.checkIfUserBlockedByUser('username');
    expect(result).toEqual({ blocked: false });
    expect(
      mockOctokit.rest.users.checkBlockedForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      username: 'username',
    });
  });

  it('should block user for user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.block.mockResolvedValue({ data: mockData });
    const result = await GithubService.blockUserForUser('username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.block).toHaveBeenCalledWith({
      username: 'username',
    });
  });

  it('should unblock user for user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.unblock.mockResolvedValue({ data: mockData });
    const result = await GithubService.unblockUserForUser('username');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.unblock).toHaveBeenCalledWith({
      username: 'username',
    });
  });

  // 74. Codespaces Admin & Stop/Start Lifecycle
  it('should list org codespaces', async () => {
    const mockData = [{ id: 1, name: 'codespace' }];
    mockOctokit.rest.codespaces.listInOrg.mockResolvedValue({ data: mockData });
    const result = await GithubService.listOrgCodespaces('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codespaces.listInOrg).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should stop a codespace', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.stopForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.stopCodespace('codespace');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.stopForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      codespace_name: 'codespace',
    });
  });

  it('should start a codespace', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.startForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.startCodespace('codespace');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codespaces.startForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      codespace_name: 'codespace',
    });
  });

  it('should delete org codespace', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codespaces.deleteFromOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteOrgCodespace(
      'org',
      'username',
      'codespace',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.codespaces.deleteFromOrg).toHaveBeenCalledWith({
      org: 'org',
      username: 'username',
      codespace_name: 'codespace',
    });
  });

  // 75. Organization Security Advisories
  it('should list org security advisories', async () => {
    const mockData = [{ id: 1, ghsa_id: 'GHSA-xxx' }];
    mockOctokit.rest.orgs.listSecurityAdvisories.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listOrgSecurityAdvisories('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listSecurityAdvisories).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should create org security advisory', async () => {
    const mockData = { id: 1, ghsa_id: 'GHSA-xxx' };
    mockOctokit.rest.orgs.createSecurityAdvisory.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createOrgSecurityAdvisory('org', {
      summary: 'S1',
    });
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.createSecurityAdvisory).toHaveBeenCalledWith({
      org: 'org',
      summary: 'S1',
    });
  });

  // 76. Dependabot Organization Secrets
  it('should get dependabot org public key', async () => {
    const mockData = { key_id: 'key-123', key: 'pk-123' };
    mockOctokit.rest.dependabot.getOrgPublicKey.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getDependabotOrgPublicKey('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.getOrgPublicKey).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should list dependabot org secrets', async () => {
    const mockData = { total_count: 1, secrets: [{ name: 'S1' }] };
    mockOctokit.rest.dependabot.listOrgSecrets.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listDependabotOrgSecrets('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.listOrgSecrets).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should get dependabot org secret', async () => {
    const mockData = { name: 'S1', visibility: 'all' };
    mockOctokit.rest.dependabot.getOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getDependabotOrgSecret('org', 'S1');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.getOrgSecret).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
    });
  });

  it('should create or update dependabot org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.createOrUpdateOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createOrUpdateDependabotOrgSecret(
      'org',
      'S1',
      'val',
      'key',
      'all',
      [1],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.createOrUpdateOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
      encrypted_value: 'val',
      key_id: 'key',
      visibility: 'all',
      selected_repository_ids: [1],
    });
  });

  it('should delete dependabot org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.deleteOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteDependabotOrgSecret('org', 'S1');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.deleteOrgSecret).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
    });
  });

  it('should list selected repos for dependabot org secret', async () => {
    const mockData = { total_count: 1, repositories: [{ id: 1 }] };
    mockOctokit.rest.dependabot.listSelectedReposForOrgSecret.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listSelectedReposForDependabotOrgSecret(
      'org',
      'S1',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.listSelectedReposForOrgSecret,
    ).toHaveBeenCalledWith({ org: 'org', secret_name: 'S1' });
  });

  it('should set selected repos for dependabot org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.setSelectedReposForOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setSelectedReposForDependabotOrgSecret(
      'org',
      'S1',
      [1, 2],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.setSelectedReposForOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
      selected_repository_ids: [1, 2],
    });
  });

  it('should add selected repo to dependabot org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.addSelectedRepoToOrgSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addSelectedRepoToDependabotOrgSecret(
      'org',
      'S1',
      1,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.addSelectedRepoToOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
      repository_id: 1,
    });
  });

  it('should remove selected repo from dependabot org secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.removeSelectedRepoFromOrgSecret.mockResolvedValue(
      { data: mockData },
    );
    const result =
      await GithubService.removeSelectedRepoFromDependabotOrgSecret(
        'org',
        'S1',
        1,
      );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.removeSelectedRepoFromOrgSecret,
    ).toHaveBeenCalledWith({
      org: 'org',
      secret_name: 'S1',
      repository_id: 1,
    });
  });

  // 77. Dependabot Repository Secrets
  it('should get dependabot repo public key', async () => {
    const mockData = { key_id: 'key-123', key: 'pk-123' };
    mockOctokit.rest.dependabot.getRepoPublicKey.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getDependabotRepoPublicKey(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.getRepoPublicKey).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should list dependabot repo secrets', async () => {
    const mockData = { total_count: 1, secrets: [{ name: 'S1' }] };
    mockOctokit.rest.dependabot.listRepoSecrets.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listDependabotRepoSecrets(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.listRepoSecrets).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should get dependabot repo secret', async () => {
    const mockData = { name: 'S1' };
    mockOctokit.rest.dependabot.getRepoSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getDependabotRepoSecret(
      'owner',
      'repo',
      'S1',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.getRepoSecret).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      secret_name: 'S1',
    });
  });

  it('should create or update dependabot repo secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.createOrUpdateRepoSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createOrUpdateDependabotRepoSecret(
      'owner',
      'repo',
      'S1',
      'val',
      'key',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.dependabot.createOrUpdateRepoSecret,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      secret_name: 'S1',
      encrypted_value: 'val',
      key_id: 'key',
    });
  });

  it('should delete dependabot repo secret', async () => {
    const mockData = { success: true };
    mockOctokit.rest.dependabot.deleteRepoSecret.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteDependabotRepoSecret(
      'owner',
      'repo',
      'S1',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.dependabot.deleteRepoSecret).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      secret_name: 'S1',
    });
  });

  // 78. Organization Webhooks
  it('should list org webhooks', async () => {
    const mockData = [{ id: 1, name: 'web' }];
    mockOctokit.rest.orgs.listWebhooks.mockResolvedValue({ data: mockData });
    const result = await GithubService.listOrgWebhooks('org');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listWebhooks).toHaveBeenCalledWith({
      org: 'org',
    });
  });

  it('should create org webhook', async () => {
    const mockData = { id: 1, name: 'web' };
    mockOctokit.rest.orgs.createWebhook.mockResolvedValue({ data: mockData });
    const result = await GithubService.createOrgWebhook(
      'org',
      'web',
      { url: 'url' },
      ['push'],
      true,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.createWebhook).toHaveBeenCalledWith({
      org: 'org',
      name: 'web',
      config: { url: 'url' },
      events: ['push'],
      active: true,
    });
  });

  it('should get org webhook', async () => {
    const mockData = { id: 1, name: 'web' };
    mockOctokit.rest.orgs.getWebhook.mockResolvedValue({ data: mockData });
    const result = await GithubService.getOrgWebhook('org', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.getWebhook).toHaveBeenCalledWith({
      org: 'org',
      webhook_id: 1,
    });
  });

  it('should update org webhook', async () => {
    const mockData = { id: 1, name: 'web' };
    mockOctokit.rest.orgs.updateWebhook.mockResolvedValue({ data: mockData });
    const result = await GithubService.updateOrgWebhook(
      'org',
      1,
      { url: 'new' },
      ['push'],
      false,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.updateWebhook).toHaveBeenCalledWith({
      org: 'org',
      webhook_id: 1,
      config: { url: 'new' },
      events: ['push'],
      active: false,
    });
  });

  it('should delete org webhook', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.deleteWebhook.mockResolvedValue({ data: mockData });
    const result = await GithubService.deleteOrgWebhook('org', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.deleteWebhook).toHaveBeenCalledWith({
      org: 'org',
      webhook_id: 1,
    });
  });

  it('should ping org webhook', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.pingWebhook.mockResolvedValue({ data: mockData });
    const result = await GithubService.pingOrgWebhook('org', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.pingWebhook).toHaveBeenCalledWith({
      org: 'org',
      webhook_id: 1,
    });
  });

  // 79. Pull Request Review Requests & Files
  it('should list requested reviewers', async () => {
    const mockData = { users: [], teams: [] };
    mockOctokit.rest.pulls.listRequestedReviewers.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listRequestedReviewers(
      'owner',
      'repo',
      1,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.pulls.listRequestedReviewers).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 1,
    });
  });

  it('should request reviewers for pull request', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.pulls.requestReviewers.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.requestReviewersForPullRequest(
      'owner',
      'repo',
      1,
      ['rev'],
      ['team'],
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.pulls.requestReviewers).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 1,
      reviewers: ['rev'],
      team_reviewers: ['team'],
    });
  });

  it('should remove requested reviewers from pull request', async () => {
    const mockData = { success: true };
    mockOctokit.rest.pulls.removeRequestedReviewers.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeRequestedReviewersFromPullRequest(
      'owner',
      'repo',
      1,
      ['rev'],
      ['team'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.pulls.removeRequestedReviewers,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 1,
      reviewers: ['rev'],
      team_reviewers: ['team'],
    });
  });

  it('should list pull request files', async () => {
    const mockData = [{ filename: 'file.js' }];
    mockOctokit.rest.pulls.listFiles.mockResolvedValue({ data: mockData });
    const result = await GithubService.listPullRequestFiles('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.pulls.listFiles).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 1,
    });
  });

  // 80. Issue Assignees
  it('should list assignees', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.issues.listAssignees.mockResolvedValue({ data: mockData });
    const result = await GithubService.listAssignees('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.issues.listAssignees).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should check if user can be assigned (assignable)', async () => {
    mockOctokit.rest.issues.checkUserCanBeAssigned.mockResolvedValue({
      data: {},
    });
    const result = await GithubService.checkAssignee('owner', 'repo', 'user');
    expect(result).toEqual({ assignable: true });
    expect(mockOctokit.rest.issues.checkUserCanBeAssigned).toHaveBeenCalledWith(
      { owner: 'owner', repo: 'repo', assignee: 'user' },
    );
  });

  it('should check if user can be assigned (not assignable 404)', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.issues.checkUserCanBeAssigned.mockRejectedValue(error404);
    const result = await GithubService.checkAssignee('owner', 'repo', 'user');
    expect(result).toEqual({ assignable: false });
    expect(mockOctokit.rest.issues.checkUserCanBeAssigned).toHaveBeenCalledWith(
      { owner: 'owner', repo: 'repo', assignee: 'user' },
    );
  });

  it('should add assignees to issue', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.issues.addAssignees.mockResolvedValue({ data: mockData });
    const result = await GithubService.addAssigneesToIssue('owner', 'repo', 1, [
      'user',
    ]);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.issues.addAssignees).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 1,
      assignees: ['user'],
    });
  });

  it('should remove assignees from issue', async () => {
    const mockData = { id: 1 };
    mockOctokit.rest.issues.removeAssignees.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeAssigneesFromIssue(
      'owner',
      'repo',
      1,
      ['user'],
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.issues.removeAssignees).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 1,
      assignees: ['user'],
    });
  });

  // 81. Release Assets
  it('should list release assets', async () => {
    const mockData = [{ id: 1, name: 'asset' }];
    mockOctokit.rest.repos.listReleaseAssets.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listReleaseAssets('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listReleaseAssets).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      release_id: 1,
    });
  });

  it('should get release asset', async () => {
    const mockData = { id: 1, name: 'asset' };
    mockOctokit.rest.repos.getReleaseAsset.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getReleaseAsset('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getReleaseAsset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      asset_id: 1,
    });
  });

  it('should update release asset', async () => {
    const mockData = { id: 1, name: 'asset' };
    mockOctokit.rest.repos.updateReleaseAsset.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateReleaseAsset(
      'owner',
      'repo',
      1,
      'new',
      'label',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.updateReleaseAsset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      asset_id: 1,
      name: 'new',
      label: 'label',
    });
  });

  it('should delete release asset', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteReleaseAsset.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteReleaseAsset('owner', 'repo', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deleteReleaseAsset).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      asset_id: 1,
    });
  });

  // 82. Repository Starring & Subscriptions
  it('should list stargazers for repo', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.activity.listStargazersForRepo.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listStargazersForRepo('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listStargazersForRepo,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should list repos starred by authenticated user', async () => {
    const mockData = [{ id: 1, name: 'repo' }];
    mockOctokit.rest.activity.listReposStarredByAuthenticatedUser.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listReposStarredByAuthenticatedUser();
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listReposStarredByAuthenticatedUser,
    ).toHaveBeenCalled();
  });

  it('should check if repo is starred by user (starred)', async () => {
    mockOctokit.rest.activity.checkRepoIsStarredByAuthenticatedUser.mockResolvedValue(
      { data: {} },
    );
    const result = await GithubService.checkIfRepoIsStarredByUser(
      'owner',
      'repo',
    );
    expect(result).toEqual({ starred: true });
    expect(
      mockOctokit.rest.activity.checkRepoIsStarredByAuthenticatedUser,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should check if repo is starred by user (not starred 404)', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.activity.checkRepoIsStarredByAuthenticatedUser.mockRejectedValue(
      error404,
    );
    const result = await GithubService.checkIfRepoIsStarredByUser(
      'owner',
      'repo',
    );
    expect(result).toEqual({ starred: false });
    expect(
      mockOctokit.rest.activity.checkRepoIsStarredByAuthenticatedUser,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should star repo for authenticated user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.starRepoForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.starRepoForAuthenticatedUser(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.starRepoForAuthenticatedUser,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should unstar repo for authenticated user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.unstarRepoForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.unstarRepoForAuthenticatedUser(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.unstarRepoForAuthenticatedUser,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  it('should get repo subscription', async () => {
    const mockData = { subscribed: true, ignored: false };
    mockOctokit.rest.activity.getRepoSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getRepoSubscription('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.activity.getRepoSubscription).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should set repo subscription', async () => {
    const mockData = { subscribed: true, ignored: false };
    mockOctokit.rest.activity.setRepoSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setRepoSubscription(
      'owner',
      'repo',
      true,
      false,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.activity.setRepoSubscription).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      subscribed: true,
      ignored: false,
    });
  });

  it('should delete repo subscription', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.deleteRepoSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteRepoSubscription('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.deleteRepoSubscription,
    ).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' });
  });

  // 83. Repository Branches & Branch Protection
  it('should get branch', async () => {
    const mockData = { name: 'main', protected: true };
    mockOctokit.rest.repos.getBranch.mockResolvedValue({ data: mockData });
    const result = await GithubService.getBranch('owner', 'repo', 'main');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getBranch).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should get branch protection', async () => {
    const mockData = { enforce_admins: { enabled: true } };
    mockOctokit.rest.repos.getBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getBranchProtection).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should intercept 404 on get branch protection', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getBranchProtection.mockRejectedValue(error404);
    const result = await GithubService.getBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ protected: false });
  });

  it('should update branch protection', async () => {
    const mockData = { enforce_admins: { enabled: true } };
    mockOctokit.rest.repos.updateBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateBranchProtection(
      'owner',
      'repo',
      'main',
      { required: true },
      true,
      { reviews: 1 },
      { restrictions: true },
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.updateBranchProtection).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      required_status_checks: { required: true },
      enforce_admins: true,
      required_pull_request_reviews: { reviews: 1 },
      restrictions: { restrictions: true },
    });
  });

  it('should delete branch protection', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.deleteBranchProtection).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should get admin branch protection', async () => {
    const mockData = { enabled: true };
    mockOctokit.rest.repos.getAdminBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getAdminBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.getAdminBranchProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should intercept 404 on get admin branch protection', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getAdminBranchProtection.mockRejectedValue(error404);
    const result = await GithubService.getAdminBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ enforced: false });
  });

  it('should set admin branch protection', async () => {
    const mockData = { enabled: true };
    mockOctokit.rest.repos.setAdminBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setAdminBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.setAdminBranchProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should delete admin branch protection', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteAdminBranchProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteAdminBranchProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.deleteAdminBranchProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  // 84. PR Review & Commit Signature Protection
  it('should get pull request review protection', async () => {
    const mockData = { dismiss_stale_reviews: true };
    mockOctokit.rest.repos.getPullRequestReviewProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getPullRequestReviewProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.getPullRequestReviewProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should intercept 404 on get pull request review protection', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getPullRequestReviewProtection.mockRejectedValue(
      error404,
    );
    const result = await GithubService.getPullRequestReviewProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ enabled: false });
  });

  it('should update pull request review protection', async () => {
    const mockData = { dismiss_stale_reviews: true };
    mockOctokit.rest.repos.updatePullRequestReviewProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updatePullRequestReviewProtection(
      'owner',
      'repo',
      'main',
      true,
      true,
      2,
      { users: [] },
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.updatePullRequestReviewProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      required_approving_review_count: 2,
      bypass_pull_request_allowances: { users: [] },
    });
  });

  it('should delete pull request review protection', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deletePullRequestReviewProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deletePullRequestReviewProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.deletePullRequestReviewProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should get commit signature protection', async () => {
    const mockData = { enabled: true };
    mockOctokit.rest.repos.getCommitSignatureProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getCommitSignatureProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.getCommitSignatureProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should intercept 404 on get commit signature protection', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getCommitSignatureProtection.mockRejectedValue(
      error404,
    );
    const result = await GithubService.getCommitSignatureProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ enabled: false });
  });

  it('should create commit signature protection', async () => {
    const mockData = { enabled: true };
    mockOctokit.rest.repos.createCommitSignatureProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createCommitSignatureProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.createCommitSignatureProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should delete commit signature protection', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteCommitSignatureProtection.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteCommitSignatureProtection(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.deleteCommitSignatureProtection,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  // 85. Branch Access Restrictions
  it('should get access restrictions', async () => {
    const mockData = { users: [], teams: [] };
    mockOctokit.rest.repos.getAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getAccessRestrictions(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getAccessRestrictions).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should intercept 404 on get access restrictions', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getAccessRestrictions.mockRejectedValue(error404);
    const result = await GithubService.getAccessRestrictions(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ enabled: false });
  });

  it('should delete access restrictions', async () => {
    const mockData = { success: true };
    mockOctokit.rest.repos.deleteAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteAccessRestrictions(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.deleteAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should list apps with access to protected branch', async () => {
    const mockData = [{ name: 'app' }];
    mockOctokit.rest.repos.listAppsWithAccessToProtectedBranch.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listAppsWithAccessToProtectedBranch(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.listAppsWithAccessToProtectedBranch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should add apps access restrictions', async () => {
    const mockData = [{ name: 'app' }];
    mockOctokit.rest.repos.addAppsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addAppsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['app'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.addAppsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      apps: ['app'],
    });
  });

  it('should set apps access restrictions', async () => {
    const mockData = [{ name: 'app' }];
    mockOctokit.rest.repos.setAppsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setAppsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['app'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.setAppsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      apps: ['app'],
    });
  });

  it('should remove apps access restrictions', async () => {
    const mockData = [{ name: 'app' }];
    mockOctokit.rest.repos.removeAppsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeAppsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['app'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.removeAppsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      apps: ['app'],
    });
  });

  it('should list teams with access to protected branch', async () => {
    const mockData = [{ slug: 'team' }];
    mockOctokit.rest.repos.listTeamsWithAccessToProtectedBranch.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listTeamsWithAccessToProtectedBranch(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.listTeamsWithAccessToProtectedBranch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should add teams access restrictions', async () => {
    const mockData = [{ slug: 'team' }];
    mockOctokit.rest.repos.addTeamsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addTeamsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['team'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.addTeamsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      teams: ['team'],
    });
  });

  it('should set teams access restrictions', async () => {
    const mockData = [{ slug: 'team' }];
    mockOctokit.rest.repos.setTeamsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setTeamsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['team'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.setTeamsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      teams: ['team'],
    });
  });

  it('should remove teams access restrictions', async () => {
    const mockData = [{ slug: 'team' }];
    mockOctokit.rest.repos.removeTeamsAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeTeamsAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['team'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.removeTeamsAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      teams: ['team'],
    });
  });

  it('should list users with access to protected branch', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.repos.listUsersWithAccessToProtectedBranch.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.listUsersWithAccessToProtectedBranch(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.listUsersWithAccessToProtectedBranch,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should add users access restrictions', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.repos.addUsersAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addUsersAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['user'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.addUsersAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      users: ['user'],
    });
  });

  it('should set users access restrictions', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.repos.setUsersAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setUsersAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['user'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.setUsersAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      users: ['user'],
    });
  });

  it('should remove users access restrictions', async () => {
    const mockData = [{ login: 'user' }];
    mockOctokit.rest.repos.removeUsersAccessRestrictions.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeUsersAccessRestrictions(
      'owner',
      'repo',
      'main',
      ['user'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.removeUsersAccessRestrictions,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      users: ['user'],
    });
  });

  // 86. Repository Teams, Tags & Management
  it('should list repo teams', async () => {
    const mockData = [{ slug: 'team' }];
    mockOctokit.rest.repos.listTeams.mockResolvedValue({ data: mockData });
    const result = await GithubService.listRepoTeams('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listTeams).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should add or update team permissions for repo', async () => {
    const mockData = { success: true };
    mockOctokit.rest.teams.addOrUpdateTeamPermissionsInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addOrUpdateTeamPermissionsForRepo(
      'owner',
      'repo',
      'org',
      'team',
      'push',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.teams.addOrUpdateTeamPermissionsInOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team',
      owner: 'owner',
      repo: 'repo',
      permission: 'push',
    });
  });

  it('should remove team from repo', async () => {
    const mockData = { success: true };
    mockOctokit.rest.teams.removeTeam.mockResolvedValue({ data: mockData });
    const result = await GithubService.removeTeamFromRepo(
      'owner',
      'repo',
      'org',
      'team',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.teams.removeTeam).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team',
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should list repo tags', async () => {
    const mockData = [{ name: 'v1.0.0' }];
    mockOctokit.rest.repos.listTags.mockResolvedValue({ data: mockData });
    const result = await GithubService.listRepoTags('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.listTags).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should rename branch', async () => {
    const mockData = { name: 'new-name' };
    mockOctokit.rest.repos.renameBranch.mockResolvedValue({ data: mockData });
    const result = await GithubService.renameBranch(
      'owner',
      'repo',
      'main',
      'new-name',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.renameBranch).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      new_name: 'new-name',
    });
  });

  it('should merge upstream', async () => {
    const mockData = { message: 'Merged successfully' };
    mockOctokit.rest.repos.mergeUpstream.mockResolvedValue({ data: mockData });
    const result = await GithubService.mergeUpstream('owner', 'repo', 'main');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.mergeUpstream).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  // 87. GitHub Notifications
  it('should list notifications for authenticated user', async () => {
    const mockData = [{ id: '1' }];
    mockOctokit.rest.activity.listNotificationsForAuthenticatedUser.mockResolvedValue(
      {
        data: mockData,
      },
    );
    const result = await GithubService.listNotificationsForAuthenticatedUser();
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      all: undefined,
      participating: undefined,
      since: undefined,
      before: undefined,
      page: 1,
      per_page: 30,
    });
  });

  it('should list notifications for authenticated user with params', async () => {
    const mockData = [{ id: '1' }];
    mockOctokit.rest.activity.listNotificationsForAuthenticatedUser.mockResolvedValue(
      {
        data: mockData,
      },
    );
    const result = await GithubService.listNotificationsForAuthenticatedUser(
      true,
      false,
      '2026-06-11T00:00:00Z',
      '2026-06-12T00:00:00Z',
      2,
      50,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listNotificationsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      all: true,
      participating: false,
      since: '2026-06-11T00:00:00Z',
      before: '2026-06-12T00:00:00Z',
      page: 2,
      per_page: 50,
    });
  });

  it('should mark notifications as read', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.markNotificationsAsRead.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.markNotificationsAsRead(
      '2026-06-12T00:00:00Z',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.markNotificationsAsRead,
    ).toHaveBeenCalledWith({
      last_read_at: '2026-06-12T00:00:00Z',
    });
  });

  it('should list repo notifications', async () => {
    const mockData = [{ id: '2' }];
    mockOctokit.rest.activity.listRepoNotifications.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listRepoNotifications('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listRepoNotifications,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      all: undefined,
      participating: undefined,
      since: undefined,
      before: undefined,
      page: 1,
      per_page: 30,
    });
  });

  it('should list repo notifications with params', async () => {
    const mockData = [{ id: '2' }];
    mockOctokit.rest.activity.listRepoNotifications.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listRepoNotifications(
      'owner',
      'repo',
      false,
      true,
      '2026-06-11T00:00:00Z',
      undefined,
      3,
      15,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.listRepoNotifications,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      all: false,
      participating: true,
      since: '2026-06-11T00:00:00Z',
      before: undefined,
      page: 3,
      per_page: 15,
    });
  });

  it('should mark repo notifications as read', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.markRepoNotificationsAsRead.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.markRepoNotificationsAsRead(
      'owner',
      'repo',
      '2026-06-12T00:00:00Z',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.markRepoNotificationsAsRead,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      last_read_at: '2026-06-12T00:00:00Z',
    });
  });

  it('should get thread details', async () => {
    const mockData = { id: 'thread-123', subject: {} };
    mockOctokit.rest.activity.getThread.mockResolvedValue({ data: mockData });
    const result = await GithubService.getThread('thread-123');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.activity.getThread).toHaveBeenCalledWith({
      thread_id: 'thread-123',
    });
  });

  it('should mark thread as read', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.markThreadAsRead.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.markThreadAsRead('thread-123');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.activity.markThreadAsRead).toHaveBeenCalledWith({
      thread_id: 'thread-123',
    });
  });

  it('should get thread subscription status', async () => {
    const mockData = { subscribed: true, ignored: false };
    mockOctokit.rest.activity.getThreadSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getThreadSubscription('thread-123');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.getThreadSubscription,
    ).toHaveBeenCalledWith({
      thread_id: 'thread-123',
    });
  });

  it('should intercept 404 on get thread subscription status', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.activity.getThreadSubscription.mockRejectedValue(error404);
    const result = await GithubService.getThreadSubscription('thread-123');
    expect(result).toEqual({ subscribed: false });
  });

  it('should set thread subscription', async () => {
    const mockData = { subscribed: true };
    mockOctokit.rest.activity.setThreadSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setThreadSubscription(
      'thread-123',
      true,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.setThreadSubscription,
    ).toHaveBeenCalledWith({
      thread_id: 'thread-123',
      ignored: true,
    });
  });

  it('should delete thread subscription', async () => {
    const mockData = { success: true };
    mockOctokit.rest.activity.deleteThreadSubscription.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteThreadSubscription('thread-123');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.activity.deleteThreadSubscription,
    ).toHaveBeenCalledWith({
      thread_id: 'thread-123',
    });
  });

  // 88. GPG Keys
  it('should list GPG keys for authenticated user', async () => {
    const mockData = [{ id: 1, key: 'gpg-key' }];
    mockOctokit.rest.users.listGpgKeysForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listGpgKeysForAuthenticatedUser();
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listGpgKeysForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      page: 1,
      per_page: 30,
    });
  });

  it('should list GPG keys with page and perPage', async () => {
    const mockData = [{ id: 1 }];
    mockOctokit.rest.users.listGpgKeysForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listGpgKeysForAuthenticatedUser(2, 10);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listGpgKeysForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      page: 2,
      per_page: 10,
    });
  });

  it('should get GPG key details', async () => {
    const mockData = { id: 1, key: 'gpg-key' };
    mockOctokit.rest.users.getGpgKeyForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getGpgKeyForAuthenticatedUser(1);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.getGpgKeyForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      gpg_key_id: 1,
    });
  });

  it('should add GPG key', async () => {
    const mockData = { id: 1, key: 'gpg-key' };
    mockOctokit.rest.users.createGpgKeyForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result =
      await GithubService.addGpgKeyForAuthenticatedUser('armored-key');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.createGpgKeyForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      armored_public_key: 'armored-key',
    });
  });

  it('should delete GPG key', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.deleteGpgKeyForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteGpgKeyForAuthenticatedUser(1);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.deleteGpgKeyForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      gpg_key_id: 1,
    });
  });

  // 89. User Social Profiles
  it('should list social accounts', async () => {
    const mockData = [{ provider: 'twitter', url: 'https://twitter.com' }];
    mockOctokit.rest.users.listSocialAccountsForAuthenticatedUser.mockResolvedValue(
      {
        data: mockData,
      },
    );
    const result = await GithubService.listSocialAccountsForAuthenticatedUser();
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listSocialAccountsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      page: 1,
      per_page: 30,
    });
  });

  it('should add social accounts', async () => {
    const mockData = [{ provider: 'twitter' }];
    mockOctokit.rest.users.addSocialAccountsForAuthenticatedUser.mockResolvedValue(
      {
        data: mockData,
      },
    );
    const result = await GithubService.addSocialAccountsForAuthenticatedUser([
      'url',
    ]);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.addSocialAccountsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      account_urls: ['url'],
    });
  });

  it('should delete social accounts', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.deleteSocialAccountsForAuthenticatedUser.mockResolvedValue(
      {
        data: mockData,
      },
    );
    const result = await GithubService.deleteSocialAccountsForAuthenticatedUser(
      ['url'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.deleteSocialAccountsForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      account_urls: ['url'],
    });
  });

  // 90. User Followers & Following
  it('should list followers for authenticated user', async () => {
    const mockData = [{ id: 1, login: 'follower1' }];
    mockOctokit.rest.users.listFollowersForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listFollowersForAuthenticatedUser(2, 10);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listFollowersForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      page: 2,
      per_page: 10,
    });
  });

  it('should list following for authenticated user', async () => {
    const mockData = [{ id: 2, login: 'following1' }];
    mockOctokit.rest.users.listFollowingForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listFollowingForAuthenticatedUser(3, 20);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.listFollowingForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      page: 3,
      per_page: 20,
    });
  });

  it('should check if user is followed by authenticated user (204 response)', async () => {
    mockOctokit.rest.users.checkIfFollowingForTokenUser.mockResolvedValue({
      status: 204,
    });
    const result = await GithubService.checkIfUserFollowing('octocat');
    expect(result).toEqual({ following: true });
    expect(
      mockOctokit.rest.users.checkIfFollowingForTokenUser,
    ).toHaveBeenCalledWith({
      username: 'octocat',
    });
  });

  it('should check if user is followed by authenticated user (404 response status)', async () => {
    mockOctokit.rest.users.checkIfFollowingForTokenUser.mockResolvedValue({
      status: 404,
    });
    const result = await GithubService.checkIfUserFollowing('octocat');
    expect(result).toEqual({ following: false });
    expect(
      mockOctokit.rest.users.checkIfFollowingForTokenUser,
    ).toHaveBeenCalledWith({
      username: 'octocat',
    });
  });

  it('should check if user is followed by authenticated user (404 error thrown)', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.users.checkIfFollowingForTokenUser.mockRejectedValue(
      error404,
    );
    const result = await GithubService.checkIfUserFollowing('octocat');
    expect(result).toEqual({ following: false });
  });

  it('should check if user is followed by authenticated user and rethrow other errors', async () => {
    const error500 = new Error('Server Error');
    error500.status = 500;
    mockOctokit.rest.users.checkIfFollowingForTokenUser.mockRejectedValue(
      error500,
    );
    await expect(GithubService.checkIfUserFollowing('octocat')).rejects.toThrow(
      'Server Error',
    );
  });

  it('should follow a user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.followUserForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.followUser('octocat');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.followUserForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      username: 'octocat',
    });
  });

  it('should unfollow a user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.users.unfollowUserForAuthenticatedUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.unfollowUser('octocat');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.users.unfollowUserForAuthenticatedUser,
    ).toHaveBeenCalledWith({
      username: 'octocat',
    });
  });

  it('should list followers for a specific user', async () => {
    const mockData = [{ id: 3, login: 'user1' }];
    mockOctokit.rest.users.listFollowersForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listFollowersForUser('octocat', 1, 5);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.listFollowersForUser).toHaveBeenCalledWith({
      username: 'octocat',
      page: 1,
      per_page: 5,
    });
  });

  it('should list following for a specific user', async () => {
    const mockData = [{ id: 4, login: 'user2' }];
    mockOctokit.rest.users.listFollowingForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listFollowingForUser('octocat', 2, 8);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.listFollowingForUser).toHaveBeenCalledWith({
      username: 'octocat',
      page: 2,
      per_page: 8,
    });
  });

  // 91. Organization Invitations
  it('should list pending org invitations', async () => {
    const mockData = [{ id: 1, email: 'invite@test.com' }];
    mockOctokit.rest.orgs.listPendingInvitations.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listPendingOrgInvitations('org', 1, 10);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listPendingInvitations).toHaveBeenCalledWith({
      org: 'org',
      page: 1,
      per_page: 10,
    });
  });

  it('should create an org invitation', async () => {
    const mockData = { id: 2, email: 'invite2@test.com' };
    mockOctokit.rest.orgs.createInvitation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createOrgInvitation(
      'org',
      123,
      'invite2@test.com',
      'direct_member',
      [456],
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.createInvitation).toHaveBeenCalledWith({
      org: 'org',
      invitee_id: 123,
      email: 'invite2@test.com',
      role: 'direct_member',
      team_ids: [456],
    });
  });

  it('should cancel an org invitation', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.cancelInvitation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.cancelOrgInvitation('org', 1);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.cancelInvitation).toHaveBeenCalledWith({
      org: 'org',
      invitation_id: 1,
    });
  });

  it('should list teams for an org invitation', async () => {
    const mockData = [{ id: 1, name: 'team1' }];
    mockOctokit.rest.orgs.listInvitationTeams.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listOrgInvitationTeams('org', 1, 2, 5);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listInvitationTeams).toHaveBeenCalledWith({
      org: 'org',
      invitation_id: 1,
      page: 2,
      per_page: 5,
    });
  });

  // 92. User Public Security Keys
  it('should list public SSH keys for a user', async () => {
    const mockData = [{ id: 1, key: 'ssh-rsa' }];
    mockOctokit.rest.users.listPublicKeysForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listPublicKeysForUser('octocat', 1, 10);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.listPublicKeysForUser).toHaveBeenCalledWith({
      username: 'octocat',
      page: 1,
      per_page: 10,
    });
  });

  it('should list GPG keys for a user', async () => {
    const mockData = [{ id: 1, primary_key_id: 'gpg-key' }];
    mockOctokit.rest.users.listGpgKeysForUser.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listGpgKeysForUser('octocat', 2, 20);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.users.listGpgKeysForUser).toHaveBeenCalledWith({
      username: 'octocat',
      page: 2,
      per_page: 20,
    });
  });

  // 93. Repository Settings & Secret Scanning
  it('should update repository settings', async () => {
    const mockData = { id: 1, name: 'repo', description: 'updated' };
    mockOctokit.rest.repos.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.updateRepository('owner', 'repo', {
      description: 'updated',
    });
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      description: 'updated',
    });
  });

  it('should enable secret scanning', async () => {
    const mockData = { id: 1, name: 'repo' };
    mockOctokit.rest.repos.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.enableSecretScanning('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      security_and_analysis: {
        secret_scanning: {
          status: 'enabled',
        },
      },
    });
  });

  it('should disable secret scanning', async () => {
    const mockData = { id: 1, name: 'repo' };
    mockOctokit.rest.repos.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.disableSecretScanning('owner', 'repo');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      security_and_analysis: {
        secret_scanning: {
          status: 'disabled',
        },
      },
    });
  });

  it('should enable secret scanning push protection', async () => {
    const mockData = { id: 1, name: 'repo' };
    mockOctokit.rest.repos.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.enableSecretScanningPushProtection(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      security_and_analysis: {
        secret_scanning_push_protection: {
          status: 'enabled',
        },
      },
    });
  });

  it('should disable secret scanning push protection', async () => {
    const mockData = { id: 1, name: 'repo' };
    mockOctokit.rest.repos.update.mockResolvedValue({ data: mockData });
    const result = await GithubService.disableSecretScanningPushProtection(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      security_and_analysis: {
        secret_scanning_push_protection: {
          status: 'disabled',
        },
      },
    });
  });

  // 94. Granular Required Status Checks & Bypass Restrictions
  it('should get required status checks settings (success)', async () => {
    const mockData = { strict: true, contexts: ['ci'] };
    mockOctokit.rest.repos.getRequiredStatusChecks.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getRequiredStatusChecks(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.getRequiredStatusChecks).toHaveBeenCalledWith(
      {
        owner: 'owner',
        repo: 'repo',
        branch: 'main',
      },
    );
  });

  it('should return default object on get required status checks 404 error', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getRequiredStatusChecks.mockRejectedValue(error404);
    const result = await GithubService.getRequiredStatusChecks(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ checks: [], contexts: [] });
  });

  it('should update required status checks', async () => {
    const mockData = { strict: true };
    mockOctokit.rest.repos.updateRequiredStatusChecks.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateRequiredStatusChecks(
      'owner',
      'repo',
      'main',
      ['check'],
      ['ctx'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.updateRequiredStatusChecks,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      checks: ['check'],
      contexts: ['ctx'],
    });
  });

  it('should list required status checks contexts', async () => {
    const mockData = ['ci'];
    mockOctokit.rest.repos.getAllStatusCheckContexts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listRequiredStatusChecksContexts(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.getAllStatusCheckContexts,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should add required status checks contexts', async () => {
    const mockData = ['ci', 'new'];
    mockOctokit.rest.repos.addStatusCheckContexts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addRequiredStatusChecksContexts(
      'owner',
      'repo',
      'main',
      ['new'],
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.addStatusCheckContexts).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      contexts: ['new'],
    });
  });

  it('should set required status checks contexts', async () => {
    const mockData = ['new'];
    mockOctokit.rest.repos.setStatusCheckContexts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setRequiredStatusChecksContexts(
      'owner',
      'repo',
      'main',
      ['new'],
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.repos.setStatusCheckContexts).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      contexts: ['new'],
    });
  });

  it('should remove required status checks contexts', async () => {
    const mockData = [];
    mockOctokit.rest.repos.removeStatusCheckContexts.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeRequiredStatusChecksContexts(
      'owner',
      'repo',
      'main',
      ['ci'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.removeStatusCheckContexts,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      contexts: ['ci'],
    });
  });

  it('should get PR review bypass restrictions (success)', async () => {
    const mockData = { users: [], teams: [] };
    mockOctokit.rest.repos.getAppsAndTeamsRequestReviewBypassers.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.getPullRequestReviewBypassRestrictions(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.getAppsAndTeamsRequestReviewBypassers,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
    });
  });

  it('should return default object on get PR review bypass restrictions 404 error', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.repos.getAppsAndTeamsRequestReviewBypassers.mockRejectedValue(
      error404,
    );
    const result = await GithubService.getPullRequestReviewBypassRestrictions(
      'owner',
      'repo',
      'main',
    );
    expect(result).toEqual({ users: [], teams: [], apps: [] });
  });

  it('should add PR review bypass restrictions', async () => {
    const mockData = { users: [{ login: 'u' }] };
    mockOctokit.rest.repos.addAppsAndTeamsRequestReviewBypassers.mockResolvedValue(
      { data: mockData },
    );
    const result = await GithubService.addPullRequestReviewBypassRestrictions(
      'owner',
      'repo',
      'main',
      ['u'],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.repos.addAppsAndTeamsRequestReviewBypassers,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      users: ['u'],
      teams: [],
      apps: [],
    });
  });

  // 95. Organization Teams & Membership Management
  it('should get team details by slug name', async () => {
    const mockData = { id: 1, name: 'Team Alpha' };
    mockOctokit.rest.teams.getByName.mockResolvedValue({ data: mockData });
    const result = await GithubService.getTeamByName('org', 'team-alpha');
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.teams.getByName).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
    });
  });

  it('should add or update team membership for a user', async () => {
    const mockData = { state: 'active', role: 'member' };
    mockOctokit.rest.teams.addOrUpdateMembershipForUserInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addOrUpdateTeamMembershipForUser(
      'org',
      'team-alpha',
      'user1',
      'maintainer',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.teams.addOrUpdateMembershipForUserInOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      username: 'user1',
      role: 'maintainer',
    });
  });

  it('should remove team membership for a user', async () => {
    const mockData = { success: true };
    mockOctokit.rest.teams.removeMembershipForUserInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeTeamMembershipForUser(
      'org',
      'team-alpha',
      'user1',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.teams.removeMembershipForUserInOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      username: 'user1',
    });
  });

  it('should list team repositories', async () => {
    const mockData = [{ id: 1, name: 'repo' }];
    mockOctokit.rest.teams.listReposInOrg.mockResolvedValue({ data: mockData });
    const result = await GithubService.listTeamRepos(
      'org',
      'team-alpha',
      2,
      10,
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.teams.listReposInOrg).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      page: 2,
      per_page: 10,
    });
  });

  it('should check team permissions for a repository (success)', async () => {
    const mockData = { permissions: { push: true } };
    mockOctokit.rest.teams.checkPermissionsForRepoInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.checkTeamPermissionsForRepo(
      'org',
      'team-alpha',
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.teams.checkPermissionsForRepoInOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should return belongs: false on check team permissions 404 error', async () => {
    const error404 = new Error('Not Found');
    error404.status = 404;
    mockOctokit.rest.teams.checkPermissionsForRepoInOrg.mockRejectedValue(
      error404,
    );
    const result = await GithubService.checkTeamPermissionsForRepo(
      'org',
      'team-alpha',
      'owner',
      'repo',
    );
    expect(result).toEqual({ belongs: false });
  });

  it('should add or update team repo permissions', async () => {
    const mockData = { success: true };
    mockOctokit.rest.teams.addOrUpdateRepoPermissionsInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.addOrUpdateTeamRepoPermissions(
      'org',
      'team-alpha',
      'owner',
      'repo',
      'admin',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.teams.addOrUpdateRepoPermissionsInOrg,
    ).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      owner: 'owner',
      repo: 'repo',
      permission: 'admin',
    });
  });

  it('should remove team repository access', async () => {
    const mockData = { success: true };
    mockOctokit.rest.teams.removeRepoInOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.removeTeamRepo(
      'org',
      'team-alpha',
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.teams.removeRepoInOrg).toHaveBeenCalledWith({
      org: 'org',
      team_slug: 'team-alpha',
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 96. GitHub Apps Lifecycle
  it('should delete app installation', async () => {
    const mockData = { success: true };
    mockOctokit.rest.apps.deleteInstallation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteAppInstallation(123);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.deleteInstallation).toHaveBeenCalledWith({
      installation_id: 123,
    });
  });

  it('should suspend app installation', async () => {
    const mockData = { success: true };
    mockOctokit.rest.apps.suspendInstallation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.suspendAppInstallation(123);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.suspendInstallation).toHaveBeenCalledWith({
      installation_id: 123,
    });
  });

  it('should unsuspend app installation', async () => {
    const mockData = { success: true };
    mockOctokit.rest.apps.unsuspendInstallation.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.unsuspendAppInstallation(123);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.unsuspendInstallation).toHaveBeenCalledWith({
      installation_id: 123,
    });
  });

  // 97. GitHub App Webhook Deliveries & Configuration
  it('should get webhook config for App', async () => {
    const mockData = { url: 'https://example.com/webhook' };
    mockOctokit.rest.apps.getWebhookConfigForApp.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getWebhookConfigForApp();
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.getWebhookConfigForApp).toHaveBeenCalled();
  });

  it('should update webhook config for App', async () => {
    const mockData = { url: 'https://example.com/webhook' };
    const config = { url: 'https://example.com/webhook', content_type: 'json' };
    mockOctokit.rest.apps.updateWebhookConfigForApp.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateWebhookConfigForApp(config);
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.apps.updateWebhookConfigForApp,
    ).toHaveBeenCalledWith(config);
  });

  it('should list webhook deliveries', async () => {
    const mockData = [{ id: 1, event: 'push' }];
    mockOctokit.rest.apps.listWebhookDeliveries.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listWebhookDeliveries(2, 50);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.listWebhookDeliveries).toHaveBeenCalledWith({
      page: 2,
      per_page: 50,
    });
  });

  it('should get webhook delivery', async () => {
    const mockData = { id: 1, event: 'push', guid: 'abc-123' };
    mockOctokit.rest.apps.getWebhookDelivery.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getWebhookDelivery(12345);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.getWebhookDelivery).toHaveBeenCalledWith({
      delivery_id: 12345,
    });
  });

  it('should redeliver webhook delivery', async () => {
    const mockData = { success: true };
    mockOctokit.rest.apps.redeliverWebhookDelivery.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.redeliverWebhookDelivery(12345);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.apps.redeliverWebhookDelivery).toHaveBeenCalledWith(
      {
        delivery_id: 12345,
      },
    );
  });

  // 98. Organization Fine-Grained Personal Access Tokens (PATs)
  it('should list PAT grant requests', async () => {
    const mockData = [{ id: 1, owner: { login: 'user' } }];
    mockOctokit.rest.orgs.listPatGrantRequests.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listPatGrantRequests(
      'my-org',
      1,
      30,
      'repo',
      'owner',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listPatGrantRequests).toHaveBeenCalledWith({
      org: 'my-org',
      page: 1,
      per_page: 30,
      repository: 'repo',
      owner: 'owner',
    });
  });

  it('should review PAT grant request', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.reviewPatGrantRequest.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.reviewPatGrantRequest(
      'my-org',
      123,
      'approve',
      'approved',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.reviewPatGrantRequest).toHaveBeenCalledWith({
      org: 'my-org',
      pat_request_id: 123,
      action: 'approve',
      reason: 'approved',
    });
  });

  it('should list PAT grants', async () => {
    const mockData = [{ id: 1, owner: { login: 'user' } }];
    mockOctokit.rest.orgs.listPatGrants.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.listPatGrants(
      'my-org',
      1,
      30,
      'repo',
      'owner',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.listPatGrants).toHaveBeenCalledWith({
      org: 'my-org',
      page: 1,
      per_page: 30,
      repository: 'repo',
      owner: 'owner',
    });
  });

  it('should revoke PAT grant', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.revokePatGrant.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.revokePatGrant('my-org', 123);
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.revokePatGrant).toHaveBeenCalledWith({
      org: 'my-org',
      pat_id: 123,
    });
  });

  it('should bulk review PAT grant requests', async () => {
    const mockData = { success: true };
    mockOctokit.rest.orgs.reviewPatGrantRequests.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.reviewPatGrantRequests(
      'my-org',
      [123, 456],
      'approve',
      'approved',
    );
    expect(result).toEqual(mockData);
    expect(mockOctokit.rest.orgs.reviewPatGrantRequests).toHaveBeenCalledWith({
      org: 'my-org',
      pat_request_ids: [123, 456],
      action: 'approve',
      reason: 'approved',
    });
  });

  // 99. Organization Code Security Configurations
  it('should create org security configuration', async () => {
    const mockData = { id: 1, name: 'config-name' };
    const settings = { dependency_graph: 'enabled' };
    mockOctokit.rest.codeSecurity.createConfigurationForOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.createOrgSecurityConfiguration(
      'my-org',
      'config-name',
      'desc',
      settings,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeSecurity.createConfigurationForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      name: 'config-name',
      description: 'desc',
      dependency_graph: 'enabled',
    });
  });

  it('should update org security configuration', async () => {
    const mockData = { id: 1, name: 'config-name' };
    const settings = { dependency_graph: 'disabled' };
    mockOctokit.rest.codeSecurity.updateConfigurationForOrg.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.updateOrgSecurityConfiguration(
      'my-org',
      1,
      settings,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeSecurity.updateConfigurationForOrg,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      security_configuration_id: 1,
      dependency_graph: 'disabled',
    });
  });

  it('should delete org security configuration', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codeSecurity.deleteConfiguration.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.deleteOrgSecurityConfiguration(
      'my-org',
      1,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeSecurity.deleteConfiguration,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      security_configuration_id: 1,
    });
  });

  it('should attach org security configuration', async () => {
    const mockData = { success: true };
    mockOctokit.rest.codeSecurity.attachConfiguration.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.attachOrgSecurityConfiguration(
      'my-org',
      1,
      'selected',
      [10, 20],
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeSecurity.attachConfiguration,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      security_configuration_id: 1,
      scope: 'selected',
      selected_repository_ids: [10, 20],
    });
  });

  it('should get repo security configuration assignment', async () => {
    const mockData = { status: 'attached', security_configuration: { id: 1 } };
    mockOctokit.rest.codeSecurity.getRepoConfiguration.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getRepoSecurityConfigurationAssignment(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.codeSecurity.getRepoConfiguration,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  // 100. Allowed Actions Configuration
  it('should get allowed actions settings for repository', async () => {
    const mockData = { github_owned_allowed: true };
    mockOctokit.rest.actions.getAllowedActionsRepository.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getAllowedActionsRepository(
      'owner',
      'repo',
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.getAllowedActionsRepository,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should set allowed actions settings for repository', async () => {
    const mockData = { success: true };
    const settings = { github_owned_allowed: true };
    mockOctokit.rest.actions.setAllowedActionsRepository.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setAllowedActionsRepository(
      'owner',
      'repo',
      settings,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.setAllowedActionsRepository,
    ).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      github_owned_allowed: true,
    });
  });

  it('should get allowed actions settings for organization', async () => {
    const mockData = { github_owned_allowed: true };
    mockOctokit.rest.actions.getAllowedActionsOrganization.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.getAllowedActionsOrganization('my-org');
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.getAllowedActionsOrganization,
    ).toHaveBeenCalledWith({
      org: 'my-org',
    });
  });

  it('should set allowed actions settings for organization', async () => {
    const mockData = { success: true };
    const settings = { github_owned_allowed: true };
    mockOctokit.rest.actions.setAllowedActionsOrganization.mockResolvedValue({
      data: mockData,
    });
    const result = await GithubService.setAllowedActionsOrganization(
      'my-org',
      settings,
    );
    expect(result).toEqual(mockData);
    expect(
      mockOctokit.rest.actions.setAllowedActionsOrganization,
    ).toHaveBeenCalledWith({
      org: 'my-org',
      github_owned_allowed: true,
    });
  });
});

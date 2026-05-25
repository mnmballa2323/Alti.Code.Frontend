/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_swarm_factory.js — The Swarm Expansion Generation Engine
 * Programmatically scaffolds and deploys 120+ specialized dynamic agents.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

// Comprehensive Taxonomy of 120 Granular GitHub Specialist Specs
export const GITHUB_SPECIALISTS_TAXONOMY = [
    // === 1. Repositories Domain (10 Specialists) ===
    {
        id: 'githubRepoCreator',
        capabilities: ['github-create-repository', 'github-initialize-repository'],
        domain: 'Repositories',
        focus: 'repository creation, templates, gitignore, licensing',
        description: 'Specialist GitHub Repository Creator expert in creating new repositories, setting default templates, licensing setup, and metadata configurations.'
    },
    {
        id: 'githubRepoDeleter',
        capabilities: ['github-delete-repository'],
        domain: 'Repositories',
        focus: 'repository deletion, transfer, archiving',
        description: 'Specialist GitHub Repository Deleter expert in archiving, transferring, and permanently deleting repositories securely.'
    },
    {
        id: 'githubCollaboratorManager',
        capabilities: ['github-add-collaborator', 'github-remove-collaborator'],
        domain: 'Repositories',
        focus: 'repository collaborators, invitations, access rights',
        description: 'Specialist GitHub Collaborator Manager expert in handling repository access rights, direct collaborator invites, and privilege tiers.'
    },
    {
        id: 'githubBranchProtector',
        capabilities: ['github-create-branch-protection', 'github-update-branch-protection'],
        domain: 'Repositories',
        focus: 'branch protections, status check rules, signed commits',
        description: 'Specialist GitHub Branch Protector expert in configuring strict branch protections, mandatory pull request rules, and commit signature requirements.'
    },
    {
        id: 'githubDeployKeysManager',
        capabilities: ['github-create-deploy-key', 'github-delete-deploy-key'],
        domain: 'Repositories',
        focus: 'deploy keys, write access keys, deployment credentials',
        description: 'Specialist GitHub Deploy Keys Manager expert in configuring read/write deployment keys and secure deploy credential bindings.'
    },
    {
        id: 'githubEnvironmentsManager',
        capabilities: ['github-create-environment', 'github-update-environment'],
        domain: 'Repositories',
        focus: 'deployment environments, protection rules, reviewer gates',
        description: 'Specialist GitHub Environments Manager expert in creating deployment environments, configuring protection rules, and setting reviewer gates.'
    },
    {
        id: 'githubAutolinksManager',
        capabilities: ['github-create-autolink', 'github-delete-autolink'],
        domain: 'Repositories',
        focus: 'autolink references, ticket links, external integration references',
        description: 'Specialist GitHub Autolinks Manager expert in configuring external autolink references and third-party ticket trackers sync.'
    },
    {
        id: 'githubCustomPropertiesManager',
        capabilities: ['github-create-custom-properties', 'github-update-custom-properties'],
        domain: 'Repositories',
        focus: 'custom properties, organization property keys, metadata tagging',
        description: 'Specialist GitHub Custom Properties Manager expert in administering organizational custom properties and repository metadata tagging.'
    },
    {
        id: 'githubCodeownersAdmin',
        capabilities: ['github-write-codeowners', 'github-audit-codeowners'],
        domain: 'Repositories',
        focus: 'CODEOWNERS file structures, reviewer rules, ownership boundaries',
        description: 'Specialist GitHub CODEOWNERS Administrator expert in mapping precise repository ownership, syntax rules, and auto-assigned reviewers.'
    },
    {
        id: 'githubRepoTagsManager',
        capabilities: ['github-create-tag', 'github-delete-tag'],
        domain: 'Repositories',
        focus: 'tag creation, annotated tags, release tags, tag protections',
        description: 'Specialist GitHub Repository Tags Manager expert in managing annotated tags, protected tag rules, and repository release labels.'
    },

    // === 2. Pull Requests Domain (10 Specialists) ===
    {
        id: 'githubPrCreator',
        capabilities: ['github-create-pull-request'],
        domain: 'Pull Requests',
        focus: 'creating pull requests, draft pull requests, base/head branches',
        description: 'Specialist GitHub PR Creator expert in generating pull requests, drafting proposals, and managing branch comparisons.'
    },
    {
        id: 'githubPrReviewer',
        capabilities: ['github-create-pr-review', 'github-submit-pr-review'],
        domain: 'Pull Requests',
        focus: 'pull request reviews, inline comments, approve/reject state',
        description: 'Specialist GitHub PR Reviewer expert in executing code reviews, leaving inline feedback, and deciding approval/rejection states.'
    },
    {
        id: 'githubPrMerger',
        capabilities: ['github-merge-pull-request'],
        domain: 'Pull Requests',
        focus: 'merging pull requests, squash merges, rebase merges, merge conflict checks',
        description: 'Specialist GitHub PR Merger expert in executing safe merges (squash, rebase, standard) and performing pre-merge integrity audits.'
    },
    {
        id: 'githubPrReviewCommenter',
        capabilities: ['github-create-review-comment'],
        domain: 'Pull Requests',
        focus: 'diff comments, review thread resolutions, single line comments',
        description: 'Specialist GitHub PR Review Commenter expert in managing specific code diff comments and resolving conversational review threads.'
    },
    {
        id: 'githubPrDraftManager',
        capabilities: ['github-toggle-draft-pr'],
        domain: 'Pull Requests',
        focus: 'draft pull requests, ready for review states',
        description: 'Specialist GitHub PR Draft Manager expert in transitioning pull requests between draft and formal review-ready states.'
    },
    {
        id: 'githubPrConflictResolver',
        capabilities: ['github-detect-conflicts', 'github-resolve-conflicts'],
        domain: 'Pull Requests',
        focus: 'merge conflict detections, three-way merge resolution guidelines',
        description: 'Specialist GitHub PR Conflict Resolver expert in analyzing merge conflicts and recommending strategic three-way resolution paths.'
    },
    {
        id: 'githubPrReviewDecider',
        capabilities: ['github-auto-approve-pr', 'github-auto-reject-pr'],
        domain: 'Pull Requests',
        focus: 'pull request rules, status checks auto-evaluators',
        description: 'Specialist GitHub PR Review Decider expert in defining branch check compliance gates and automated merge decisions.'
    },
    {
        id: 'githubPrRequestedReviewsManager',
        capabilities: ['github-request-reviewers', 'github-remove-reviewers'],
        domain: 'Pull Requests',
        focus: 'requesting reviewers, team reviewers assignments',
        description: 'Specialist GitHub PR Requested Reviews Manager expert in assignation of required individual and team reviewers.'
    },
    {
        id: 'githubPrCommentsManager',
        capabilities: ['github-create-pr-comment', 'github-delete-pr-comment'],
        domain: 'Pull Requests',
        focus: 'issue comments on pull requests, comment sweeping',
        description: 'Specialist GitHub PR Comments Manager expert in handling generic pull request conversation comments and issue-comment linkages.'
    },
    {
        id: 'githubPrTimelineAuditor',
        capabilities: ['github-get-pr-timeline'],
        domain: 'Pull Requests',
        focus: 'pull request commits history, timeline events, review history audits',
        description: 'Specialist GitHub PR Timeline Auditor expert in scraping pull request activity trails, review history logs, and commit sequences.'
    },

    // === 3. Actions CI/CD Domain (10 Specialists) ===
    {
        id: 'githubActionsWorkflowCompiler',
        capabilities: ['github-write-workflow-yaml'],
        domain: 'Actions CI/CD',
        focus: 'workflow yaml configurations, trigger events, steps, actions',
        description: 'Specialist GitHub Actions Workflow Compiler expert in designing high-performance event-driven workflow YAML definitions.'
    },
    {
        id: 'githubActionsSecretsManager',
        capabilities: ['github-create-actions-secret', 'github-delete-actions-secret'],
        domain: 'Actions CI/CD',
        focus: 'encrypted actions secrets, organization secrets, environment secrets',
        description: 'Specialist GitHub Actions Secrets Manager expert in provisioning repository, organization, and environment encrypted secret vaults.'
    },
    {
        id: 'githubActionsVariablesManager',
        capabilities: ['github-create-actions-variable', 'github-delete-actions-variable'],
        domain: 'Actions CI/CD',
        focus: 'actions configuration variables, organization variables, environment variables',
        description: 'Specialist GitHub Actions Variables Manager expert in setting non-sensitive configuration values across actions.'
    },
    {
        id: 'githubActionsArtifactsExporter',
        capabilities: ['github-download-artifacts', 'github-upload-artifacts'],
        domain: 'Actions CI/CD',
        focus: 'actions artifacts lifecycle, upload/download actions, storage rules',
        description: 'Specialist GitHub Actions Artifacts Exporter expert in configuring CI/CD artifact uploads, downloads, and custom expiration limits.'
    },
    {
        id: 'githubActionsCacheOptimizer',
        capabilities: ['github-actions-cache-tuning'],
        domain: 'Actions CI/CD',
        focus: 'workflow cache keys, cache invalidation, setup-node/setup-python caches',
        description: 'Specialist GitHub Actions Cache Optimizer expert in implementing dynamic package caches to accelerate workflow compile speeds.'
    },
    {
        id: 'githubActionsRunnerProvisioner',
        capabilities: ['github-provision-self-hosted-runner'],
        domain: 'Actions CI/CD',
        focus: 'self-hosted runner deployment, runner installation scripts, runner scaling',
        description: 'Specialist GitHub Actions Runner Provisioner expert in deploying self-hosted runners and scaling automated workflow worker nodes.'
    },
    {
        id: 'githubActionsRunnerGroupsManager',
        capabilities: ['github-create-runner-group', 'github-delete-runner-group'],
        domain: 'Actions CI/CD',
        focus: 'runner groups, enterprise runner groups, access policies',
        description: 'Specialist GitHub Actions Runner Groups Manager expert in structuring secure runner groups and organizing compute resources.'
    },
    {
        id: 'githubActionsConcurrencyGatekeeper',
        capabilities: ['github-configure-workflow-concurrency'],
        domain: 'Actions CI/CD',
        focus: 'concurrency groups, cancel-in-progress settings, matrix executions',
        description: 'Specialist GitHub Actions Concurrency Gatekeeper expert in configuring concurrency limits and stale job auto-cancellation.'
    },
    {
        id: 'githubActionsOidcFederator',
        capabilities: ['github-actions-oidc-federation'],
        domain: 'Actions CI/CD',
        focus: 'OpenID Connect keys, keyless authentication, AWS/GCP role assumption',
        description: 'Specialist GitHub Actions OIDC Federator expert in keyless AWS/GCP role assumptions using OpenID Connect authentication.'
    },
    {
        id: 'githubActionsMatrixBuilder',
        capabilities: ['github-actions-matrix-strategy'],
        domain: 'Actions CI/CD',
        focus: 'matrix strategy configurations, exclude/include matrix definitions',
        description: 'Specialist GitHub Actions Matrix Builder expert in crafting optimized multi-environment and cross-platform build matrices.'
    },

    // === 4. Apps & Integrations Domain (10 Specialists) ===
    {
        id: 'githubAppConfigurator',
        capabilities: ['github-create-app', 'github-update-app'],
        domain: 'Apps & Integrations',
        focus: 'github app manifest setups, redirect urls, webhook configurations',
        description: 'Specialist GitHub App Configurator expert in scaffoldings and modifications of manifest-driven GitHub Applications.'
    },
    {
        id: 'githubAppWebhookVerifier',
        capabilities: ['github-verify-webhook-signature'],
        domain: 'Apps & Integrations',
        focus: 'x-hub-signature-256 header validation, HMAC-SHA256 secret verification',
        description: 'Specialist GitHub App Webhook Verifier expert in cryptographically verifying incoming event headers using HMAC-SHA256.'
    },
    {
        id: 'githubAppOAuthExchange',
        capabilities: ['github-oauth-token-exchange'],
        domain: 'Apps & Integrations',
        focus: 'oauth web flow tokens, authorization code flow, user-to-server exchanges',
        description: 'Specialist GitHub App OAuth Exchange expert in user-authorization code exchanges and access tokens generation.'
    },
    {
        id: 'githubAppInstallationManager',
        capabilities: ['github-app-installation'],
        domain: 'Apps & Integrations',
        focus: 'installation tokens, user installations, repo access grants',
        description: 'Specialist GitHub App Installation Manager expert in managing installation lifecycles and temporary workspace credentials.'
    },
    {
        id: 'githubAppPermissionsAuditor',
        capabilities: ['github-audit-app-permissions'],
        domain: 'Apps & Integrations',
        focus: 'fine-grained app permissions, repository read/write scopes',
        description: 'Specialist GitHub App Permissions Auditor expert in regulating app access scopes and auditing security boundaries.'
    },
    {
        id: 'githubAppWebhookDeliveryAuditor',
        capabilities: ['github-get-webhook-deliveries'],
        domain: 'Apps & Integrations',
        focus: 'webhook deliveries history, redelivery triggering, webhook failures logs',
        description: 'Specialist GitHub App Webhook Delivery Auditor expert in tracking delivery histories, payload failures, and manual retry triggers.'
    },
    {
        id: 'githubAppPrivateKeysManager',
        capabilities: ['github-generate-app-private-key'],
        domain: 'Apps & Integrations',
        focus: 'github app private keys generation, jwt token signing',
        description: 'Specialist GitHub App Private Keys Manager expert in key rotation and secure JWT credentials generation.'
    },
    {
        id: 'githubAppManifestRegulator',
        capabilities: ['github-parse-app-manifest'],
        domain: 'Apps & Integrations',
        focus: 'app manifest yaml configurations, rapid integration bootstrapping',
        description: 'Specialist GitHub App Manifest Regulator expert in validating and parsing declarative app manifest configuration schemas.'
    },
    {
        id: 'githubAppHooksManager',
        capabilities: ['github-create-app-hook'],
        domain: 'Apps & Integrations',
        focus: 'organization-wide hooks, app webhooks updates',
        description: 'Specialist GitHub App Hooks Manager expert in establishing organization-level webhook listeners for ecosystem scale integrations.'
    },
    {
        id: 'githubAppClientCredentialsManager',
        capabilities: ['github-reset-app-client-secret'],
        domain: 'Apps & Integrations',
        focus: 'app client credentials, secrets rotation',
        description: 'Specialist GitHub App Client Credentials Manager expert in resetting and rotating OAuth client credentials securely.'
    },

    // === 5. Projects v2 Domain (10 Specialists) ===
    {
        id: 'githubProjectsCreator',
        capabilities: ['github-create-project-v2'],
        domain: 'Projects v2',
        focus: 'projects v2 boards creation, organization projects',
        description: 'Specialist GitHub Projects Creator expert in establishing customizable organizational Projects v2 kanban boards.'
    },
    {
        id: 'githubProjectsFieldCustomizer',
        capabilities: ['github-create-project-v2-field'],
        domain: 'Projects v2',
        focus: 'projects v2 custom fields, single select fields, number/date fields',
        description: 'Specialist GitHub Projects Field Customizer expert in defining select-option, number, and status metadata fields.'
    },
    {
        id: 'githubProjectsStatusAutomator',
        capabilities: ['github-project-v2-workflows'],
        domain: 'Projects v2',
        focus: 'projects v2 built-in automation, auto-add items, status transitions',
        description: 'Specialist GitHub Projects Status Automator expert in setting project-level workflows and state transition triggers.'
    },
    {
        id: 'githubProjectsItemArchiver',
        capabilities: ['github-archive-project-v2-item'],
        domain: 'Projects v2',
        focus: 'archiving projects items, restoring items',
        description: 'Specialist GitHub Projects Item Archiver expert in cleaning boards through card archiving and item restoration.'
    },
    {
        id: 'githubProjectsBoardSyncer',
        capabilities: ['github-sync-project-v2-board'],
        domain: 'Projects v2',
        focus: 'syncing projects boards with issue/pr status',
        description: 'Specialist GitHub Projects Board Syncer expert in automating card state changes mapping to repository issues and PRs.'
    },
    {
        id: 'githubProjectsLayoutManager',
        capabilities: ['github-configure-project-v2-layout'],
        domain: 'Projects v2',
        focus: 'board layouts, table layouts, roadmap layouts',
        description: 'Specialist GitHub Projects Layout Manager expert in configuring roadmap timelines, grid views, and kanban templates.'
    },
    {
        id: 'githubProjectsItemManager',
        capabilities: ['github-add-project-v2-item', 'github-remove-project-v2-item'],
        domain: 'Projects v2',
        focus: 'adding issues/prs to projects boards, item updates',
        description: 'Specialist GitHub Projects Item Manager expert in bulk card assignation and field modifications.'
    },
    {
        id: 'githubProjectsViewsManager',
        capabilities: ['github-create-project-v2-view'],
        domain: 'Projects v2',
        focus: 'projects v2 view configurations, filters, sorting, grouping',
        description: 'Specialist GitHub Projects Views Manager expert in creating distinct team views using custom filters and grouping.'
    },
    {
        id: 'githubProjectsCollaborationSyncer',
        capabilities: ['github-sync-project-v2-collaboration'],
        domain: 'Projects v2',
        focus: 'shared projects boards across teams, project permissions',
        description: 'Specialist GitHub Projects Collaboration Syncer expert in shared projects configuration and member read/write permissions.'
    },
    {
        id: 'githubProjectsLimitsAuditor',
        capabilities: ['github-get-project-v2-limits'],
        domain: 'Projects v2',
        focus: 'projects v2 limits, card counts, custom field caps',
        description: 'Specialist GitHub Projects Limits Auditor expert in tracking project limits, checking field caps, and monitoring card metrics.'
    },

    // === 6. Governance & Enterprise Domain (10 Specialists) ===
    {
        id: 'githubEnterpriseSamlConfigurator',
        capabilities: ['github-enterprise-saml'],
        domain: 'Governance & Enterprise',
        focus: 'saml sso configurations, identity provider settings',
        description: 'Specialist GitHub Enterprise SAML Configurator expert in SSO identity providers (IdP) integration.'
    },
    {
        id: 'githubEnterpriseScimProvisioner',
        capabilities: ['github-enterprise-scim'],
        domain: 'Governance & Enterprise',
        focus: 'scim provisioning, directory sync, user deprovisioning',
        description: 'Specialist GitHub Enterprise SCIM Provisioner expert in user directory integrations and lifecycle management.'
    },
    {
        id: 'githubEnterpriseSshCaAdmin',
        capabilities: ['github-enterprise-ssh-ca'],
        domain: 'Governance & Enterprise',
        focus: 'ssh certificate authorities, signed commits enforcement',
        description: 'Specialist GitHub Enterprise SSH CA Administrator expert in configuring signed certificate restrictions.'
    },
    {
        id: 'githubEnterpriseAuditLogParser',
        capabilities: ['github-enterprise-audit-logs'],
        domain: 'Governance & Enterprise',
        focus: 'audit logs api events, exporting log logs',
        description: 'Specialist GitHub Enterprise Audit Log Parser expert in security audit log queries and event parsing.'
    },
    {
        id: 'githubEnterpriseIpAllowListRules',
        capabilities: ['github-enterprise-ip-allow-list'],
        domain: 'Governance & Enterprise',
        focus: 'ip allow list rules, cidr blocks restriction',
        description: 'Specialist GitHub Enterprise IP Allow List Rules expert in configuring CIDR block access security bounds.'
    },
    {
        id: 'githubEnterpriseBillingAuditor',
        capabilities: ['github-enterprise-billing'],
        domain: 'Governance & Enterprise',
        focus: 'enterprise billing metrics, usage reports, license consumption',
        description: 'Specialist GitHub Enterprise Billing Auditor expert in licensing usage records and spent optimizations.'
    },
    {
        id: 'githubEnterpriseTeamSyncer',
        capabilities: ['github-enterprise-team-sync'],
        domain: 'Governance & Enterprise',
        focus: 'external directory team sync, okta/azure ad groups sync',
        description: 'Specialist GitHub Enterprise Team Syncer expert in synchronizing organization teams with external directory groups.'
    },
    {
        id: 'githubEnterpriseOrgManager',
        capabilities: ['github-enterprise-create-org'],
        domain: 'Governance & Enterprise',
        focus: 'creating organizations, organizational settings',
        description: 'Specialist GitHub Enterprise Org Manager expert in setting up new child organizations and administrative rules.'
    },
    {
        id: 'githubEnterpriseMemberManager',
        capabilities: ['github-enterprise-invite-member'],
        domain: 'Governance & Enterprise',
        focus: 'enterprise members invitations, organization roles',
        description: 'Specialist GitHub Enterprise Member Manager expert in managing membership invitations and organization privilege structures.'
    },
    {
        id: 'githubEnterprisePolicyEnforcer',
        capabilities: ['github-enterprise-policies'],
        domain: 'Governance & Enterprise',
        focus: 'enterprise-wide repository policies, actions permission rules',
        description: 'Specialist GitHub Enterprise Policy Enforcer expert in setting global branch checks and action rules across organizations.'
    },

    // === 7. Gists & Snippets Domain (10 Specialists) ===
    {
        id: 'githubGistCreator',
        capabilities: ['github-create-gist'],
        domain: 'Gists & Snippets',
        focus: 'creating public/secret gists, multi-file gists',
        description: 'Specialist GitHub Gist Creator expert in publishing secret and public code snippets dynamically.'
    },
    {
        id: 'githubGistEmbedBuilder',
        capabilities: ['github-build-gist-embed'],
        domain: 'Gists & Snippets',
        focus: 'gist client-side embed code, script tags generation',
        description: 'Specialist GitHub Gist Embed Builder expert in generating client-side script integrations for third-party embeds.'
    },
    {
        id: 'githubGistSnippetSyncer',
        capabilities: ['github-sync-gist-snippets'],
        domain: 'Gists & Snippets',
        focus: 'syncing dynamic code snippets, revision history logs',
        description: 'Specialist GitHub Gist Snippet Syncer expert in synchronizing scratchpads and tracking revision histories.'
    },
    {
        id: 'githubGistDeleter',
        capabilities: ['github-delete-gist'],
        domain: 'Gists & Snippets',
        focus: 'deleting gists',
        description: 'Specialist GitHub Gist Deleter expert in cleaning and removing active code snippets.'
    },
    {
        id: 'githubGistUpdater',
        capabilities: ['github-update-gist'],
        domain: 'Gists & Snippets',
        focus: 'updating gist contents, renaming gist files',
        description: 'Specialist GitHub Gist Updater expert in refactoring gist contents and maintaining multi-file revisions.'
    },
    {
        id: 'githubGistForksManager',
        capabilities: ['github-fork-gist'],
        domain: 'Gists & Snippets',
        focus: 'forking gists, listing gist forks',
        description: 'Specialist GitHub Gist Forks Manager expert in copying public snippets and tracking snippet lineages.'
    },
    {
        id: 'githubGistCommentsManager',
        capabilities: ['github-create-gist-comment'],
        domain: 'Gists & Snippets',
        focus: 'gist comments, conversation management',
        description: 'Specialist GitHub Gist Comments Manager expert in managing snippet conversations and feedback.'
    },
    {
        id: 'githubGistStarredManager',
        capabilities: ['github-star-gist', 'github-unstar-gist'],
        domain: 'Gists & Snippets',
        focus: 'starring gists, listing starred gists',
        description: 'Specialist GitHub Gist Starred Manager expert in cataloging favorites and tracking starred snippets.'
    },
    {
        id: 'githubGistAccessRegulator',
        capabilities: ['github-audit-gist-access'],
        domain: 'Gists & Snippets',
        focus: 'secret vs public gist access audit',
        description: 'Specialist GitHub Gist Access Regulator expert in auditing secret snippet links and credential leakage vectors.'
    },
    {
        id: 'githubGistBackupRestore',
        capabilities: ['github-backup-gist'],
        domain: 'Gists & Snippets',
        focus: 'cloning gists locally, backing up snippet repositories',
        description: 'Specialist GitHub Gist Backup Restore expert in cloning and restoring local snippet backups.'
    },

    // === 8. Discussions Domain (10 Specialists) ===
    {
        id: 'githubDiscussionsCategoryManager',
        capabilities: ['github-create-discussion-category'],
        domain: 'Discussions',
        focus: 'discussion categories creation, announcement categories',
        description: 'Specialist GitHub Discussions Category Manager expert in categorizing community threads and announcements.'
    },
    {
        id: 'githubDiscussionsCommentResponder',
        capabilities: ['github-create-discussion-comment'],
        domain: 'Discussions',
        focus: 'discussion comment replies, inline threads',
        description: 'Specialist GitHub Discussions Comment Responder expert in managing thread comments and community feedback.'
    },
    {
        id: 'githubDiscussionsQaSolver',
        capabilities: ['github-resolve-discussion-qa'],
        domain: 'Discussions',
        focus: 'marking discussion answers, QA categories resolution',
        description: 'Specialist GitHub Discussions Q&A Solver expert in resolving open questions and tracking community solutions.'
    },
    {
        id: 'githubDiscussionsCreator',
        capabilities: ['github-create-discussion'],
        domain: 'Discussions',
        focus: 'creating discussions, starting conversations',
        description: 'Specialist GitHub Discussions Creator expert in generating community discussions and starting structured threads.'
    },
    {
        id: 'githubDiscussionsDeleter',
        capabilities: ['github-delete-discussion'],
        domain: 'Discussions',
        focus: 'deleting discussions',
        description: 'Specialist GitHub Discussions Deleter expert in pruning and moderating community topics.'
    },
    {
        id: 'githubDiscussionsUpdater',
        capabilities: ['github-update-discussion'],
        domain: 'Discussions',
        focus: 'updating discussions title, body, categories',
        description: 'Specialist GitHub Discussions Updater expert in updating discussion subjects, metadata, and body structures.'
    },
    {
        id: 'githubDiscussionsReactionManager',
        capabilities: ['github-toggle-discussion-reaction'],
        domain: 'Discussions',
        focus: 'discussion reactions, thumbs up, rocket emoji',
        description: 'Specialist GitHub Discussions Reaction Manager expert in toggling reactions and monitoring feedback indicators.'
    },
    {
        id: 'githubDiscussionsLabeler',
        capabilities: ['github-discussion-labels'],
        domain: 'Discussions',
        focus: 'discussion labels, categorization',
        description: 'Specialist GitHub Discussions Labeler expert in applying community tags and categorization filters.'
    },
    {
        id: 'githubDiscussionsLockManager',
        capabilities: ['github-lock-discussion'],
        domain: 'Discussions',
        focus: 'locking discussions, unlocking threads',
        description: 'Specialist GitHub Discussions Lock Manager expert in moderating and locking mature community threads.'
    },
    {
        id: 'githubDiscussionsPinManager',
        capabilities: ['github-pin-discussion'],
        domain: 'Discussions',
        focus: 'pinning discussions, spotlighting announcements',
        description: 'Specialist GitHub Discussions Pin Manager expert in spotlighting priority community announcements.'
    },

    // === 9. Issues Domain (10 Specialists) ===
    {
        id: 'githubIssuesTriageManager',
        capabilities: ['github-triage-issue'],
        domain: 'Issues',
        focus: 'issue triage, auto-labeling, assignee allocation',
        description: 'Specialist GitHub Issues Triage Manager expert in auto-labeling and assignee allocation algorithms.'
    },
    {
        id: 'githubIssuesLabelStandardizer',
        capabilities: ['github-create-label', 'github-delete-label'],
        domain: 'Issues',
        focus: 'standardizing issue labels, label colors setup',
        description: 'Specialist GitHub Issues Label Standardizer expert in color schemes and labels taxonomy management.'
    },
    {
        id: 'githubIssuesMilestoneTracker',
        capabilities: ['github-create-milestone'],
        domain: 'Issues',
        focus: 'milestones setup, due dates configuration',
        description: 'Specialist GitHub Issues Milestone Tracker expert in configuring project release cycles and due dates.'
    },
    {
        id: 'githubIssuesPinnedIssueManager',
        capabilities: ['github-pin-issue'],
        domain: 'Issues',
        focus: 'pinning issues, repository dashboard curation',
        description: 'Specialist GitHub Issues Pinned Issue Manager expert in dashboard organization and issue spotlighting.'
    },
    {
        id: 'githubIssuesCreator',
        capabilities: ['github-create-issue'],
        domain: 'Issues',
        focus: 'creating issues, issue templates, issue forms',
        description: 'Specialist GitHub Issues Creator expert in issue templates design and initial bug report creations.'
    },
    {
        id: 'githubIssuesDeleter',
        capabilities: ['github-delete-issue'],
        domain: 'Issues',
        focus: 'deleting issues',
        description: 'Specialist GitHub Issues Deleter expert in pruning spam and deleting issues.'
    },
    {
        id: 'githubIssuesLockManager',
        capabilities: ['github-lock-issue'],
        domain: 'Issues',
        focus: 'locking issue discussions, spam moderation',
        description: 'Specialist GitHub Issues Lock Manager expert in issue moderation and thread locking policies.'
    },
    {
        id: 'githubIssuesCommentsManager',
        capabilities: ['github-create-issue-comment'],
        domain: 'Issues',
        focus: 'issue comments, issue conversation threads',
        description: 'Specialist GitHub Issues Comments Manager expert in issue feedback comments and threaded discussions.'
    },
    {
        id: 'githubIssuesEventsAuditor',
        capabilities: ['github-get-issue-events'],
        domain: 'Issues',
        focus: 'issue event logs, label changes, assignee transitions',
        description: 'Specialist GitHub Issues Events Auditor expert in tracking issue state transitions and event trails.'
    },
    {
        id: 'githubIssuesReactionsManager',
        capabilities: ['github-add-issue-reaction'],
        domain: 'Issues',
        focus: 'issue emoji reactions, user feedback collection',
        description: 'Specialist GitHub Issues Reactions Manager expert in applying emoji reactions and aggregating user feedback.'
    },

    // === 10. Security & Compliance Domain (10 Specialists) ===
    {
        id: 'githubSecurityCodeqlScanner',
        capabilities: ['github-configure-codeql'],
        domain: 'Security & Compliance',
        focus: 'codeql security analyses, static application security testing (SAST)',
        description: 'Specialist GitHub Security CodeQL Scanner expert in SAST analysis and CodeQL configurations.'
    },
    {
        id: 'githubSecurityDependabotAlertsPatcher',
        capabilities: ['github-resolve-dependabot-alert'],
        domain: 'Security & Compliance',
        focus: 'dependabot alerts patching, package update pull requests',
        description: 'Specialist GitHub Security Dependabot Alerts Patcher expert in automated vulnerability patch reviews.'
    },
    {
        id: 'githubSecuritySecretScanningRegulator',
        capabilities: ['github-configure-secret-scanning'],
        domain: 'Security & Compliance',
        focus: 'secret scanning configurations, push protection rules',
        description: 'Specialist GitHub Security Secret Scanning Regulator expert in credentials leakage rules and push protections.'
    },
    {
        id: 'githubSecurityAdvisoriesParser',
        capabilities: ['github-get-security-advisories'],
        domain: 'Security & Compliance',
        focus: 'github security advisories, vulnerability matching',
        description: 'Specialist GitHub Security Advisories Parser expert in CVE cataloging and advisory linkages.'
    },
    {
        id: 'githubSecurityBranchProtectionAuditor',
        capabilities: ['github-audit-branch-protections'],
        domain: 'Security & Compliance',
        focus: 'branch security auditing, signature compliance checking',
        description: 'Specialist GitHub Security Branch Protection Auditor expert in commit signature audit compliance checking.'
    },
    {
        id: 'githubSecuritySecretScanningBypass',
        capabilities: ['github-audit-secret-bypass'],
        domain: 'Security & Compliance',
        focus: 'auditing secret push protection bypass events',
        description: 'Specialist GitHub Security Secret Scanning Bypass expert in auditing push protection override history logs.'
    },
    {
        id: 'githubSecurityCodeScanningAlerts',
        capabilities: ['github-get-code-scanning-alerts'],
        domain: 'Security & Compliance',
        focus: 'code scanning alerts history, severity filtering',
        description: 'Specialist GitHub Security Code Scanning Alerts expert in parsing scanning reports and alerts histories.'
    },
    {
        id: 'githubSecurityDependabotConfigurator',
        capabilities: ['github-configure-dependabot'],
        domain: 'Security & Compliance',
        focus: 'dependabot.yml file configurations, package managers schedule',
        description: 'Specialist GitHub Security Dependabot Configurator expert in configuring dependabot.yml manifest definitions.'
    },
    {
        id: 'githubSecurityAdvisoryDisclosures',
        capabilities: ['github-create-security-advisory'],
        domain: 'Security & Compliance',
        focus: 'private security advisory disclosures, collaborative vulnerability fixes',
        description: 'Specialist GitHub Security Advisory Disclosures expert in private vulnerability tracking and fixes coordination.'
    },
    {
        id: 'githubSecuritySshKeysAuditor',
        capabilities: ['github-get-ssh-keys-audit'],
        domain: 'Security & Compliance',
        focus: 'auditing user SSH keys, weak SSH keys revocation',
        description: 'Specialist GitHub Security SSH Keys Auditor expert in user SSH keys compliance checking.'
    },

    // === 11. Copilot Domain (10 Specialists) ===
    {
        id: 'githubCopilotExtensionBuilder',
        capabilities: ['github-copilot-extension-scaffold'],
        domain: 'Copilot',
        focus: 'copilot chat extension setups, api metadata',
        description: 'Specialist GitHub Copilot Extension Builder expert in custom chat extension API endpoints scaffolds.'
    },
    {
        id: 'githubCopilotSseStreamHandler',
        capabilities: ['github-copilot-sse-stream'],
        domain: 'Copilot',
        focus: 'streamed chat responses setup, server sent events',
        description: 'Specialist GitHub Copilot SSE Stream Handler expert in server-sent events (SSE) chat payloads synthesis.'
    },
    {
        id: 'githubCopilotJwtDecoder',
        capabilities: ['github-verify-copilot-signature'],
        domain: 'Copilot',
        focus: 'copilot gateway jwt signature verification, public keys fetch',
        description: 'Specialist GitHub Copilot JWT Decoder expert in verifying copilot signature headers and public keys.'
    },
    {
        id: 'githubCopilotConversationalPromptParser',
        capabilities: ['github-parse-copilot-history'],
        domain: 'Copilot',
        focus: 'conversational history parsing, copilot prompt engineering',
        description: 'Specialist GitHub Copilot Conversational Prompt Parser expert in chat context processing.'
    },
    {
        id: 'githubCopilotSkillsConfigurator',
        capabilities: ['github-configure-copilot-skills'],
        domain: 'Copilot',
        focus: 'custom copilot skills yml configurations',
        description: 'Specialist GitHub Copilot Skills Configurator expert in custom declarative skills.yml schemas.'
    },
    {
        id: 'githubCopilotTokenManager',
        capabilities: ['github-get-copilot-token'],
        domain: 'Copilot',
        focus: 'copilot user token authentication, license token exchanges',
        description: 'Specialist GitHub Copilot Token Manager expert in OAuth tokens exchanges and license authorization.'
    },
    {
        id: 'githubCopilotAgentSchemas',
        capabilities: ['github-generate-copilot-schema'],
        domain: 'Copilot',
        focus: 'dynamic json response schemas for copilot agents',
        description: 'Specialist GitHub Copilot Agent Schemas expert in validating dynamic agent JSON response structures.'
    },
    {
        id: 'githubCopilotReferenceResolvers',
        capabilities: ['github-resolve-copilot-references'],
        domain: 'Copilot',
        focus: 'resolving files/commits references in copilot chat queries',
        description: 'Specialist GitHub Copilot Reference Resolvers expert in mapping files and commits.'
    },
    {
        id: 'githubCopilotMetricsExporter',
        capabilities: ['github-get-copilot-metrics'],
        domain: 'Copilot',
        focus: 'copilot seat usage metrics, active developer rates',
        description: 'Specialist GitHub Copilot Metrics Exporter expert in scraping license analytics and usage statistics.'
    },
    {
        id: 'githubCopilotSeatAllocator',
        capabilities: ['github-allocate-copilot-seat'],
        domain: 'Copilot',
        focus: 'assigning/revoking copilot licenses to members',
        description: 'Specialist GitHub Copilot Seat Allocator expert in seat provisioning rules.'
    },

    // === 12. Billing & Administration Domain (10 Specialists) ===
    {
        id: 'githubAdminSeatAllocator',
        capabilities: ['github-allocate-seat'],
        domain: 'Billing & Admin',
        focus: 'assigning billing seats, organization licenses',
        description: 'Specialist GitHub Admin Seat Allocator expert in license provisioning across organization members.'
    },
    {
        id: 'githubAdminBillingExportCron',
        capabilities: ['github-export-billing-records'],
        domain: 'Billing & Admin',
        focus: 'billing usage exports, automated schedule',
        description: 'Specialist GitHub Admin Billing Export Cron expert in scheduling billing usage exports.'
    },
    {
        id: 'githubAdminInvoiceAnalyzer',
        capabilities: ['github-analyze-enterprise-invoice'],
        domain: 'Billing & Admin',
        focus: 'analyzing invoice data, spent optimization',
        description: 'Specialist GitHub Admin Invoice Analyzer expert in cost allocation audits.'
    },
    {
        id: 'githubAdminGpgKeysManager',
        capabilities: ['github-manage-gpg-keys'],
        domain: 'Billing & Admin',
        focus: 'auditing/revoking GPG keys for commit signing',
        description: 'Specialist GitHub Admin GPG Keys Manager expert in revoking and auditing commit keys.'
    },
    {
        id: 'githubAdminInvitesManager',
        capabilities: ['github-manage-organization-invitations'],
        domain: 'Billing & Admin',
        focus: 'organization invitations lifecycle, invitation expiration',
        description: 'Specialist GitHub Admin Invites Manager expert in invitation lifecycles and expiration regulations.'
    },
    {
        id: 'githubAdminTeamsManager',
        capabilities: ['github-manage-teams'],
        domain: 'Billing & Admin',
        focus: 'teams creation, nested teams structures, team member roles',
        description: 'Specialist GitHub Admin Teams Manager expert in nesting organizational teams and structuring team privileges.'
    },
    {
        id: 'githubAdminWebhooksManager',
        capabilities: ['github-manage-org-webhooks'],
        domain: 'Billing & Admin',
        focus: 'organization webhooks configuration, event subscriptions',
        description: 'Specialist GitHub Admin Webhooks Manager expert in administering organizational webhook endpoints.'
    },
    {
        id: 'githubAdminHooksEventsAuditor',
        capabilities: ['github-get-hook-events'],
        domain: 'Billing & Admin',
        focus: 'webhook events logs, webhook health diagnostics',
        description: 'Specialist GitHub Admin Hooks Events Auditor expert in diagnosing webhook health logs.'
    },
    {
        id: 'githubAdminSelfHostedRunnerLimits',
        capabilities: ['github-configure-runner-limits'],
        domain: 'Billing & Admin',
        focus: 'actions minutes quotas, spending limits for runners',
        description: 'Specialist GitHub Admin Self Hosted Runner Limits expert in actions spending caps and usage metrics.'
    },
    {
        id: 'githubAdminEnterpriseLicensing',
        capabilities: ['github-enterprise-license-sync'],
        domain: 'Billing & Admin',
        focus: 'enterprise license synchronization, seats optimization',
        description: 'Specialist GitHub Admin Enterprise Licensing expert in license synchronizations and seats allocation audits.'
    }
];

export class GithubSwarmFactory {
    /**
     * Programmatically compiles and writes all 120+ specialized dynamic agent files.
     */
    async generateAllSpecialists() {
        logger.info(`🔥 [SwarmFactory] Initiating compilation sequence for 120+ specialized GitHub agents...`);
        const pluginsDir = path.join(process.cwd(), 'src/app/modules/agents/plugins');
        
        // Ensure plugins directory exists
        await fs.mkdir(pluginsDir, { recursive: true });
        let compiled = 0;

        for (const spec of GITHUB_SPECIALISTS_TAXONOMY) {
            try {
                const capitalizedId = spec.id.charAt(0).toUpperCase() + spec.id.slice(1);
                
                const preamble = `You are the Alti.Code.Studio ${spec.description}
This agent is the absolute authority on the specific operational boundary of: ${spec.focus}.

# GROUNDED ${spec.domain.toUpperCase()} CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: ${spec.focus}.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: ${spec.capabilities.join(', ')}.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs, YAML for Actions).`;

                const fileContent = `/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_${spec.id}.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub ${spec.domain} — ${spec.focus}
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFn${capitalizedId}Agent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = '${spec.id}';
        this.description = '${spec.description}';
        this.manifest = {
            id: '${spec.id}',
            capabilities: ${JSON.stringify(spec.capabilities)},
            version: '39.6.0'
        };
        this.preamble = \`${preamble.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(\`🐙 [${spec.id}] Grounding specialized query in ingested developer docs: "\${prompt.substring(0, 60)}..."\`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(\`GitHub ${spec.domain} ${spec.focus} \${prompt}\`, 5);
        } catch (err) {
            logger.warn(\`🐙 [${spec.id}] Failed to query RAG documentation. Fallback used. Error: \${err.message}\`);
        }

        const groundedPrompt = \`\${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
\${docsContext || 'No documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
\${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
\${prompt}\`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubFn${capitalizedId}Agent();
export default GithubFn${capitalizedId}Agent;
`;

                const filePath = path.join(pluginsDir, `github_fn_${spec.id}.agent.js`);
                await fs.writeFile(filePath, fileContent, 'utf-8');
                compiled++;
            } catch (err) {
                logger.error(`❌ [SwarmFactory] Failed to compile specialized agent [${spec.id}]: ${err.message}`);
                throw err;
            }
        }

        logger.info(`✅ [SwarmFactory] Successfully compiled and deployed ${compiled} specialized agents on disk.`);
        return compiled;
    }
}

export const githubSwarmFactory = new GithubSwarmFactory();
export default githubSwarmFactory;

/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_swarm_factory.js — The Swarm Expansion Generation Engine for GitLab
 * Programmatically scaffolds and deploys 60 specialized dynamic agents.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

// Comprehensive Taxonomy of 60 Granular GitLab Specialist Specs
export const GITLAB_SPECIALISTS_TAXONOMY = [
  // === 1. Projects Domain (5 Specialists) ===
  {
    id: 'gitlabProjectCreator',
    capabilities: ['gitlab-create-project'],
    domain: 'Projects',
    focus: 'project creation, repository template setup, naming, visibility',
    description:
      'Specialist GitLab Project Creator expert in creating new projects, templates, and visibility levels.',
  },
  {
    id: 'gitlabProjectDeleter',
    capabilities: ['gitlab-delete-project'],
    domain: 'Projects',
    focus: 'project deletion, archiving, path transfer, path updates',
    description:
      'Specialist GitLab Project Deleter expert in archiving, transferring, and permanently deleting projects.',
  },
  {
    id: 'gitlabProjectCustomAttributesManager',
    capabilities: [
      'gitlab-get-custom-attribute',
      'gitlab-set-custom-attribute',
      'gitlab-delete-custom-attribute',
    ],
    domain: 'Projects',
    focus:
      'custom attributes, metadata key-value storage, custom metadata tags',
    description:
      'Specialist GitLab Project Custom Attributes Manager expert in managing project-level custom attributes and metadata.',
  },
  {
    id: 'gitlabProjectBadgesManager',
    capabilities: ['gitlab-create-badge', 'gitlab-delete-badge'],
    domain: 'Projects',
    focus: 'project and group badges, build indicators, custom badges',
    description:
      'Specialist GitLab Project Badges Manager expert in creating and deleting project or group badges.',
  },
  {
    id: 'gitlabProjectSharingManager',
    capabilities: ['gitlab-share-project'],
    domain: 'Projects',
    focus: 'sharing projects with groups, group share permissions',
    description:
      'Specialist GitLab Project Sharing Manager expert in sharing projects with target groups and managing share permissions.',
  },

  // === 2. Merge Requests Domain (5 Specialists) ===
  {
    id: 'gitlabMrCreator',
    capabilities: ['gitlab-create-merge-request'],
    domain: 'Merge Requests',
    focus: 'creating merge requests, source/target branches, description',
    description:
      'Specialist GitLab MR Creator expert in generating merge requests, managing source/target branches, and descriptions.',
  },
  {
    id: 'gitlabMrMerger',
    capabilities: ['gitlab-merge-merge-request'],
    domain: 'Merge Requests',
    focus: 'merging MRs, merge methods, squash/rebase commits, conflict check',
    description:
      'Specialist GitLab MR Merger expert in executing safe merges (squash, rebase, standard) and performing pre-merge integrity audits.',
  },
  {
    id: 'gitlabMrApprovalRulesManager',
    capabilities: ['gitlab-get-approval-rules', 'gitlab-create-approval-rule'],
    domain: 'Merge Requests',
    focus: 'approval rules, approvals configuration, override rules',
    description:
      'Specialist GitLab MR Approval Rules Manager expert in configuring merge request approval rules and gates.',
  },
  {
    id: 'gitlabMrDraftNotesManager',
    capabilities: ['gitlab-create-draft-note', 'gitlab-publish-draft-notes'],
    domain: 'Merge Requests',
    focus: 'draft notes, batch review threads, publishing drafts',
    description:
      'Specialist GitLab MR Draft Notes Manager expert in managing draft notes and batch publishing comments.',
  },
  {
    id: 'gitlabMrDiscussionsManager',
    capabilities: ['gitlab-create-discussion', 'gitlab-resolve-discussion'],
    domain: 'Merge Requests',
    focus: 'threaded discussions, thread resolution, discussion notes',
    description:
      'Specialist GitLab MR Discussions Manager expert in handling threaded MR comments and resolution state gates.',
  },

  // === 3. CI/CD Pipelines Domain (5 Specialists) ===
  {
    id: 'gitlabPipelineTrigger',
    capabilities: [
      'gitlab-create-pipeline-trigger',
      'gitlab-delete-pipeline-trigger',
    ],
    domain: 'CI/CD Pipelines',
    focus: 'pipeline triggers, trigger tokens, multi-project pipelines',
    description:
      'Specialist GitLab Pipeline Trigger expert in managing CI/CD trigger tokens and remote pipeline dispatches.',
  },
  {
    id: 'gitlabPipelineScheduler',
    capabilities: [
      'gitlab-create-pipeline-schedule',
      'gitlab-play-pipeline-schedule',
    ],
    domain: 'CI/CD Pipelines',
    focus: 'pipeline schedules, cron triggers, scheduled pipelines',
    description:
      'Specialist GitLab Pipeline Scheduler expert in scheduling pipeline triggers with cron patterns.',
  },
  {
    id: 'gitlabJobArtifactsManager',
    capabilities: ['gitlab-download-artifacts', 'gitlab-delete-artifacts'],
    domain: 'CI/CD Pipelines',
    focus:
      'pipeline job artifacts download, retention policies, artifact deletion',
    description:
      'Specialist GitLab Job Artifacts Manager expert in managing pipeline job build output artifacts.',
  },
  {
    id: 'gitlabPipelineVariablesManager',
    capabilities: [
      'gitlab-create-project-variable',
      'gitlab-delete-project-variable',
    ],
    domain: 'CI/CD Pipelines',
    focus: 'CI/CD variables, project variables, masked/protected variables',
    description:
      'Specialist GitLab Pipeline Variables Manager expert in provisioning project-level CI/CD variable vaults.',
  },
  {
    id: 'gitlabDoraMetricsExporter',
    capabilities: ['gitlab-get-dora-metrics'],
    domain: 'CI/CD Pipelines',
    focus: 'DORA metrics, deployment frequency, lead time for changes',
    description:
      'Specialist GitLab DORA Metrics Exporter expert in extracting repository deployment and performance stats.',
  },

  // === 4. Runners Domain (5 Specialists) ===
  {
    id: 'gitlabRunnerProvisioner',
    capabilities: ['gitlab-register-runner'],
    domain: 'Runners',
    focus:
      'self-hosted runner registration, runner tokens, installation scripts',
    description:
      'Specialist GitLab Runner Provisioner expert in deploying self-hosted runners.',
  },
  {
    id: 'gitlabRunnerVerifier',
    capabilities: ['gitlab-verify-runner'],
    domain: 'Runners',
    focus: 'runner validation, token verification, runner online status check',
    description:
      'Specialist GitLab Runner Verifier expert in auditing runner connectivity and registration tokens.',
  },
  {
    id: 'gitlabRunnerConfigurator',
    capabilities: ['gitlab-update-runner'],
    domain: 'Runners',
    focus:
      'runner description, runner tags, locked runners, active/inactive runner status',
    description:
      'Specialist GitLab Runner Configurator expert in tweaking tags, locks, and active states on runners.',
  },
  {
    id: 'gitlabRunnerDeleter',
    capabilities: ['gitlab-delete-runner'],
    domain: 'Runners',
    focus:
      'deleting runners, unregistering runners, cleanup of offline runners',
    description:
      'Specialist GitLab Runner Deleter expert in unregistering and pruning offline runner nodes.',
  },
  {
    id: 'gitlabRunnerOrchestrator',
    capabilities: ['gitlab-list-runners'],
    domain: 'Runners',
    focus:
      'listing all instance runners, listing project/group runners, runner types',
    description:
      'Specialist GitLab Runner Orchestrator expert in cataloging and filtering instance-wide runners.',
  },

  // === 5. Issues Domain (5 Specialists) ===
  {
    id: 'gitlabIssueCreator',
    capabilities: ['gitlab-create-issue'],
    domain: 'Issues',
    focus: 'creating issues, issue descriptions, assignees, labels',
    description:
      'Specialist GitLab Issue Creator expert in opening tickets, configuring labels, and setting assignees.',
  },
  {
    id: 'gitlabIssueCommenter',
    capabilities: ['gitlab-create-issue-comment'],
    domain: 'Issues',
    focus: 'issue comments, note discussions, comment threading',
    description:
      'Specialist GitLab Issue Commenter expert in handling conversational notes and comments on issues.',
  },
  {
    id: 'gitlabIssueLinksManager',
    capabilities: ['gitlab-create-issue-link', 'gitlab-delete-issue-link'],
    domain: 'Issues',
    focus: 'issue dependencies, issue blockages, cross-project links',
    description:
      'Specialist GitLab Issue Links Manager expert in mapping ticket relationships and blocking constraints.',
  },
  {
    id: 'gitlabTimeTracker',
    capabilities: ['gitlab-add-time-spent', 'gitlab-add-time-estimate'],
    domain: 'Issues',
    focus: 'time tracking, time estimates, time spent logs',
    description:
      'Specialist GitLab Time Tracker expert in log logging, estimates, and spent time audits.',
  },
  {
    id: 'gitlabTodosManager',
    capabilities: ['gitlab-mark-todo-done'],
    domain: 'Issues',
    focus: 'todo lists, pending user tasks, marking todos as done',
    description:
      'Specialist GitLab Todos Manager expert in tracking and resolving task todos.',
  },

  // === 6. Milestones & Iterations Domain (5 Specialists) ===
  {
    id: 'gitlabMilestoneTracker',
    capabilities: ['gitlab-create-milestone', 'gitlab-delete-milestone'],
    domain: 'Milestones & Iterations',
    focus: 'milestone tracking, milestone start/due dates, milestone issues',
    description:
      'Specialist GitLab Milestone Tracker expert in milestone timelines and issue associations.',
  },
  {
    id: 'gitlabIterationCadencesManager',
    capabilities: [
      'gitlab-create-iteration-cadence',
      'gitlab-delete-iteration-cadence',
    ],
    domain: 'Milestones & Iterations',
    focus:
      'iteration cadences, automated iteration generation, rolling cadences',
    description:
      'Specialist GitLab Iteration Cadences Manager expert in configuring group iteration cadences.',
  },
  {
    id: 'gitlabIterationSchedulesManager',
    capabilities: ['gitlab-get-iteration'],
    domain: 'Milestones & Iterations',
    focus: 'iteration schedules, current iteration, past iterations list',
    description:
      'Specialist GitLab Iteration Schedules Manager expert in tracking active team iterations.',
  },
  {
    id: 'gitlabResourceEventsMilestonesStateEvents',
    capabilities: ['gitlab-get-issue-milestone-event'],
    domain: 'Milestones & Iterations',
    focus:
      'milestone events history, label events history, state transitions history',
    description:
      'Specialist GitLab Resource Events Milestone/State Auditor expert in ticket history transitions.',
  },
  {
    id: 'gitlabResourceEventsWeightIterationEvents',
    capabilities: [
      'gitlab-get-issue-weight-event',
      'gitlab-get-issue-iteration-event',
    ],
    domain: 'Milestones & Iterations',
    focus: 'weight events history, iteration events history, event auditing',
    description:
      'Specialist GitLab Resource Events Weight/Iteration Auditor expert in weight and sprint transitions.',
  },

  // === 7. Security & Compliance Domain (5 Specialists) ===
  {
    id: 'gitlabPushRulesManager',
    capabilities: ['gitlab-get-push-rules', 'gitlab-create-push-rule'],
    domain: 'Security & Compliance',
    focus: 'push rules, commit message regex, author email validation',
    description:
      'Specialist GitLab Push Rules Manager expert in push rules configuration and compliance regex checks.',
  },
  {
    id: 'gitlabComplianceFrameworksManager',
    capabilities: ['gitlab-get-compliance-frameworks'],
    domain: 'Security & Compliance',
    focus:
      'compliance frameworks, pipeline compliance controls, security templates',
    description:
      'Specialist GitLab Compliance Frameworks Manager expert in compliance framework tagging.',
  },
  {
    id: 'gitlabManagedLicensesManager',
    capabilities: [
      'gitlab-get-license-compliance',
      'gitlab-create-managed-license',
    ],
    domain: 'Security & Compliance',
    focus:
      'license compliance, approved/blacklisted licenses, license scan audits',
    description:
      'Specialist GitLab Managed Licenses Manager expert in license compatibility policies.',
  },
  {
    id: 'gitlabProtectedEnvironmentsManager',
    capabilities: [
      'gitlab-get-protected-environment',
      'gitlab-protect-environment',
    ],
    domain: 'Security & Compliance',
    focus:
      'protected environments, environment deployment gates, deploy approvals',
    description:
      'Specialist GitLab Protected Environments Manager expert in deployment protection controls.',
  },
  {
    id: 'gitlabVulnerabilityStateManager',
    capabilities: [
      'gitlab-get-vulnerability',
      'gitlab-update-vulnerability-state',
    ],
    domain: 'Security & Compliance',
    focus:
      'vulnerability states, confirming/dismissing/resolving vulnerabilities',
    description:
      'Specialist GitLab Vulnerability State Manager expert in vulnerability resolution lifecycles.',
  },

  // === 8. Packages & Container Registry Domain (5 Specialists) ===
  {
    id: 'gitlabPackagesRegistryManager',
    capabilities: ['gitlab-list-packages', 'gitlab-delete-package'],
    domain: 'Packages & Registry',
    focus: 'package registry, maven/npm/nuget/pypi packages, package versions',
    description:
      'Specialist GitLab Packages Registry Manager expert in package uploads and version deletions.',
  },
  {
    id: 'gitlabPackageProtectionsManager',
    capabilities: [
      'gitlab-create-package-protection-rule',
      'gitlab-delete-package-protection-rule',
    ],
    domain: 'Packages & Registry',
    focus: 'package protection rules, push/destroy package access restrictions',
    description:
      'Specialist GitLab Package Protections Manager expert in package push and destroy policy gates.',
  },
  {
    id: 'gitlabContainerRegistryManager',
    capabilities: [
      'gitlab-list-registry-repositories',
      'gitlab-delete-registry-repository',
    ],
    domain: 'Packages & Registry',
    focus:
      'container registry, docker image repositories, deletion of registry repositories',
    description:
      'Specialist GitLab Container Registry Manager expert in container image repositories management.',
  },
  {
    id: 'gitlabContainerTagsManager',
    capabilities: ['gitlab-list-registry-tags', 'gitlab-delete-registry-tag'],
    domain: 'Packages & Registry',
    focus:
      'container registry image tags, tag details, tag deletion, bulk tag cleanup',
    description:
      'Specialist GitLab Container Tags Manager expert in container repository tags management.',
  },
  {
    id: 'gitlabRegistryCleanupManager',
    capabilities: ['gitlab-bulk-delete-registry-tags'],
    domain: 'Packages & Registry',
    focus: 'bulk registry tags deletion, retention policies execution',
    description:
      'Specialist GitLab Registry Cleanup Manager expert in bulk docker tag cleanup cycles.',
  },

  // === 9. Gists & Snippets Domain (5 Specialists) ===
  {
    id: 'gitlabSnippetsCreator',
    capabilities: ['gitlab-create-snippet'],
    domain: 'Snippets',
    focus:
      'creating personal snippets, creating project snippets, snippet visibility',
    description:
      'Specialist GitLab Snippets Creator expert in code snippets drafting.',
  },
  {
    id: 'gitlabSnippetsDeleter',
    capabilities: ['gitlab-delete-snippet'],
    domain: 'Snippets',
    focus: 'deleting snippets, cleaning up snippet content',
    description:
      'Specialist GitLab Snippets Deleter expert in snippet deletion workflows.',
  },
  {
    id: 'gitlabSnippetsNotesManager',
    capabilities: ['gitlab-list-snippet-notes', 'gitlab-create-snippet-note'],
    domain: 'Snippets',
    focus: 'snippet notes, snippet comments, discussions on snippets',
    description:
      'Specialist GitLab Snippets Notes Manager expert in comment discussions on snippets.',
  },
  {
    id: 'gitlabMarkdownGFMRenderer',
    capabilities: ['gitlab-render-markdown'],
    domain: 'Snippets',
    focus: 'GFM markdown rendering, GitLab Flavored Markdown parsing',
    description:
      'Specialist GitLab Markdown GFM Renderer expert in rendering Markdown with GFM extensions.',
  },
  {
    id: 'gitlabSnippetsExporter',
    capabilities: ['gitlab-get-snippet-raw'],
    domain: 'Snippets',
    focus: 'downloading raw snippet contents, exporting snippets',
    description:
      'Specialist GitLab Snippets Exporter expert in downloading raw snippet payloads.',
  },

  // === 10. Geo & Replication Domain (5 Specialists) ===
  {
    id: 'gitlabGeoNodesManager',
    capabilities: ['gitlab-list-geo-nodes'],
    domain: 'Geo & Replication',
    focus:
      'Geo replication nodes, multi-region database setup, replication configurations',
    description:
      'Specialist GitLab Geo Nodes Manager expert in Geo replication setup.',
  },
  {
    id: 'gitlabGeoStatusTracker',
    capabilities: [
      'gitlab-get-geo-node-status',
      'gitlab-list-geo-nodes-status',
    ],
    domain: 'Geo & Replication',
    focus:
      'Geo node status tracking, verification/replication percentages, sync lag checking',
    description:
      'Specialist GitLab Geo Status Tracker expert in Geo replication sync lag monitoring.',
  },
  {
    id: 'gitlabGeoFailoverManager',
    capabilities: ['gitlab-geo-failover'],
    domain: 'Geo & Replication',
    focus: 'Geo failover health, disaster recovery readiness audits',
    description:
      'Specialist GitLab Geo Failover Manager expert in disaster recovery orchestration.',
  },
  {
    id: 'gitlabGeoSyncOrchestrator',
    capabilities: ['gitlab-geo-sync'],
    domain: 'Geo & Replication',
    focus: 'Geo synchronization triggers, manual sync scheduling',
    description:
      'Specialist GitLab Geo Sync Orchestrator expert in triggering manual sync updates.',
  },
  {
    id: 'gitlabGeoLimitsAuditor',
    capabilities: ['gitlab-get-geo-limits'],
    domain: 'Geo & Replication',
    focus: 'Geo replication limits, bandwidth constraints, sync queue capacity',
    description:
      'Specialist GitLab Geo Limits Auditor expert in Geo replication queue limits.',
  },

  // === 11. User & Identity Domain (5 Specialists) ===
  {
    id: 'gitlabUserCustomAttributesManager',
    capabilities: [
      'gitlab-get-user-custom-attribute',
      'gitlab-set-user-custom-attribute',
    ],
    domain: 'User & Identity',
    focus: 'user custom attributes, profile metadata key-values',
    description:
      'Specialist GitLab User Custom Attributes Manager expert in setting profile metadata.',
  },
  {
    id: 'gitlabUserImpersonationTokensManager',
    capabilities: [
      'gitlab-create-impersonation-token',
      'gitlab-delete-impersonation-token',
    ],
    domain: 'User & Identity',
    focus: 'impersonation tokens, admin token generation, token revocation',
    description:
      'Specialist GitLab User Impersonation Tokens Manager expert in token generation and security audits.',
  },
  {
    id: 'gitlabScimProvisioner',
    capabilities: ['gitlab-get-scim-users', 'gitlab-create-scim-user'],
    domain: 'User & Identity',
    focus:
      'SCIM user provisioning, SAML identity synchronization, account lifecycle',
    description:
      'Specialist GitLab SCIM Provisioner expert in automated identity management.',
  },
  {
    id: 'gitlabSamlGroupLinksManager',
    capabilities: [
      'gitlab-create-saml-group-link',
      'gitlab-delete-saml-group-link',
    ],
    domain: 'User & Identity',
    focus:
      'SAML group links, identity provider roles mapping, group entitlements',
    description:
      'Specialist GitLab SAML Group Links Manager expert in mapping entitlements to groups.',
  },
  {
    id: 'gitlabUserDirectorySyncer',
    capabilities: ['gitlab-get-scim-user'],
    domain: 'User & Identity',
    focus: 'SCIM identity lookup, user directories auditing',
    description:
      'Specialist GitLab User Directory Syncer expert in SCIM identity lookup.',
  },

  // === 12. Administration & OAuth Domain (5 Specialists) ===
  {
    id: 'gitlabSystemHooksManager',
    capabilities: ['gitlab-create-system-hook', 'gitlab-delete-system-hook'],
    domain: 'Administration & OAuth',
    focus: 'system hooks, instance-wide event subscriptions, system hook tests',
    description:
      'Specialist GitLab System Hooks Manager expert in instance-wide hooks.',
  },
  {
    id: 'gitlabAuditLogsManager',
    capabilities: ['gitlab-list-audit-events'],
    domain: 'Administration & OAuth',
    focus:
      'instance audit events, project audit logs, group compliance histories',
    description:
      'Specialist GitLab Audit Logs Manager expert in security histories.',
  },
  {
    id: 'gitlabGlobalSettingsManager',
    capabilities: [
      'gitlab-get-application-settings',
      'gitlab-update-application-settings',
    ],
    domain: 'Administration & OAuth',
    focus:
      'global application settings, signup restrictions, security policies',
    description:
      'Specialist GitLab Global Settings Manager expert in instance security configurations.',
  },
  {
    id: 'gitlabInstanceOAuthApplicationsManager',
    capabilities: [
      'gitlab-create-oauth-application',
      'gitlab-delete-oauth-application',
    ],
    domain: 'Administration & OAuth',
    focus:
      'instance OAuth applications management, redirect URIs, OAuth scope limits',
    description:
      'Specialist GitLab Instance OAuth Applications Manager expert in OAuth clients config.',
  },
  {
    id: 'gitlabAdminOAuthOrchestrator',
    capabilities: ['gitlab-list-oauth-applications'],
    domain: 'Administration & OAuth',
    focus: 'listing instance OAuth applications, credential audits',
    description:
      'Specialist GitLab Admin OAuth Orchestrator expert in credential sync checks.',
  },
];

export class GitlabSwarmFactory {
  /**
   * Programmatically compiles and writes all 60 specialized dynamic agent files.
   */
  async generateAllSpecialists() {
    logger.info(
      `🔥 [GitLab SwarmFactory] Initiating compilation sequence for 60 specialized GitLab agents...`,
    );
    const pluginsDir = path.join(
      process.cwd(),
      'src/app/modules/agents/plugins',
    );

    // Ensure plugins directory exists
    await fs.mkdir(pluginsDir, { recursive: true });
    let compiled = 0;

    for (const spec of GITLAB_SPECIALISTS_TAXONOMY) {
      try {
        const capitalizedId =
          spec.id.charAt(0).toUpperCase() + spec.id.slice(1);

        const preamble = `You are the Inso Code ${spec.description}
This agent is the absolute authority on the specific operational boundary of: ${spec.focus}.

# GROUNDED ${spec.domain.toUpperCase()} CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: ${spec.focus}.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: ${spec.capabilities.join(', ')}.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs).`;

        const fileContent = `/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_${spec.id}.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab ${spec.domain} — ${spec.focus}
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFn${capitalizedId}Agent extends BaseSpecialistAgent {
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
        logger.info(\`🦊 [${spec.id}] Grounding specialized query in ingested developer docs: "\${prompt.substring(0, 60)}..."\`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(\`GitLab ${spec.domain} ${spec.focus} \${prompt}\`, 5);
        } catch (err) {
            logger.warn(\`🦊 [${spec.id}] Failed to query RAG documentation. Fallback used. Error: \${err.message}\`);
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

export const pluginInstance = new GitlabFn${capitalizedId}Agent();
export default GitlabFn${capitalizedId}Agent;
`;

        const filePath = path.join(pluginsDir, `gitlab_fn_${spec.id}.agent.js`);
        await fs.writeFile(filePath, fileContent, 'utf-8');
        compiled++;
      } catch (err) {
        logger.error(
          `❌ [GitLab SwarmFactory] Failed to compile specialized agent [${spec.id}]: ${err.message}`,
        );
        throw err;
      }
    }

    logger.info(
      `✅ [GitLab SwarmFactory] Successfully compiled and deployed ${compiled} specialized agents on disk.`,
    );
    return compiled;
  }
}

export const gitlabSwarmFactory = new GitlabSwarmFactory();
export default gitlabSwarmFactory;

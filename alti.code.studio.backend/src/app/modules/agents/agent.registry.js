/**
 * Copyright (c) 2024 Inso Code
 * 
 * Agent Registry — "The Nexus"
 * Central registration point for all AI agents.
 * Each agent declares its capabilities, and the system routes tasks accordingly.
 * Future agents just register here. The system scales infinitely.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

// Advanced I/O Agent Imports
import { videoGenerationAgent } from './video_generation.agent.js';
import { spatial3DNerfAgent } from './spatial_3d_nerf.agent.js';
import { neuralBciParserAgent } from './neural_bci_parser.agent.js';
import { hapticKinematicsAgent } from './haptic_kinematics.agent.js';
import { omniAudioSynthesisAgent } from './omni_audio_synthesis.agent.js';
import { agentSAgent } from './agent_s.agent.js';
import { browserUseAgent } from './browser_use.agent.js';
import { fazmAgent } from './fazm.agent.js';
import { figmaExporterAgent } from './figma_exporter.agent.js';
import { researchPaperScraperAgent } from './research_paper_scraper.agent.js';
import { voiceDesktopLauncherAgent } from './voice_desktop_launcher.agent.js';
import { spreadsheetFormatterAgent } from './spreadsheet_formatter.agent.js';
import { socialMediaMonitorAgent } from './social_media_monitor.agent.js';
import { voiceMeetingMinuterAgent } from './voice_meeting_minuter.agent.js';
import { desktopFileOrganizerAgent } from './desktop_file_organizer.agent.js';
import { webDependencyAuditorAgent } from './web_dependency_auditor.agent.js';
import { voiceEmailDictatorAgent } from './voice_email_dictator.agent.js';
import { systemPreferencesTunerAgent } from './system_preferences_tuner.agent.js';
import { webPriceTrackerAgent } from './web_price_tracker.agent.js';
import { voiceCalendarSchedulerAgent } from './voice_calendar_scheduler.agent.js';

// High-Value Enterprise B2B Agent Imports
import { mulesoftAnypointAgent } from './mulesoft_anypoint.agent.js';
import { servicenowItsmAgent } from './servicenow_itsm.agent.js';
import { soxItgcComplianceAgent } from './sox_itgc_compliance.agent.js';
import { as400RpgleModernizerAgent } from './as400_rpgle_modernizer.agent.js';
import { paloAltoPanosAgent } from './palo_alto_panos.agent.js';
import { dynamics365ErpAgent } from './dynamics_365_erp.agent.js';
import { databricksSparkAgent } from './databricks_spark.agent.js';
import { uipathRpaBotAgent } from './uipath_rpa_bot.agent.js';
import { intuneMdmPolicyAgent } from './intune_mdm_policy.agent.js';
import { peoplesoftHcmBridgeAgent } from './peoplesoft_hcm_bridge.agent.js';

class AgentRegistry {

    constructor() {
        /** @type {Map<string, AgentDefinition>} */
        this.agents = new Map();
        this.pluginsLoaded = false;
    }

    /**
     * Register an agent with industrial governance policy.
     * @param {AgentDefinition} definition
     */
    register(definition) {
        if (this.agents.has(definition.name)) {
            logger.warn(`⚠️ AgentRegistry: Overwriting agent [${definition.name}]`);
        }
        this.agents.set(definition.name, {
            ...definition,
            registeredAt: new Date().toISOString(),
            policy: definition.policy || { accessLevel: 'DEVELOPER' } // Default to low-privilege
        });
        if (!definition.silent) {
            logger.info(`🤖 AgentRegistry: Registered [${definition.name}] — Policy: ${definition.policy?.accessLevel || 'DEVELOPER'}`);
        }

        // Dynamic Agentic RAG Auto-Indexing:
        // Asynchronously add the newly registered agent's profile document to the vector store index.
        // This ensures that dynamically forged or hot-loaded agents are instantly available for routing!
        if (this.bootstrapped) {
            const agentDocument = `Agent Name: ${definition.name}\nDescription: ${definition.description}\nCapabilities: ${definition.capabilities?.join(', ')}`;
            import('../memory/vector.store.js').then(({ vectorStoreService }) => {
                vectorStoreService.add(agentDocument, { 
                    type: 'agent_profile', 
                    agentId: definition.name 
                }).then(() => {
                    logger.info(`🗺️ [Nexus-RAG] Dynamically indexed newly registered [${definition.name}] in pgvector store.`);
                }).catch(e => {
                    logger.debug(`[Nexus-RAG] Dynamic indexing skipped or failed for [${definition.name}]: ${e.message}`);
                });
            }).catch(() => {});
        }
    }

    /**
     * Enforces A-RBAC: Verifies if a user has the clearance to activate a specialist.
     */
    canAccess(agentName, userRole = 'DEVELOPER') {
        const agent = this.agents.get(agentName);
        if (!agent) return false;

        const roleHierarchy = { 'GUEST': 0, 'DEVELOPER': 1, 'ARCHITECT': 2, 'ADMIN': 3 };
        const required = roleHierarchy[agent.policy.accessLevel] || 1;
        const current = roleHierarchy[userRole] || 1;

        const isAllowed = current >= required;
        
        if (!isAllowed) {
            logger.warn(`🛑 [Nexus-RBAC] Access Denied: User role ${userRole} attempted to activate ${agentName} (Required: ${agent.policy.accessLevel})`);
        }
        
        return isAllowed;
    }

    /** Get a specific agent */
    get(name, tenantId = null) {
        if (name && name.toLowerCase().startsWith('gitlab')) {
            if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
                logger.warn(`AgentRegistry: get failed for GitLab agent [${name}] because tenantId is omitted or invalid.`);
                return null;
            }
        }
        return this.agents.get(name);
    }

    /** List all registered agents */
    list() {
        return Array.from(this.agents.values());
    }

    /** Alias for backward compatibility / multi-agent routing queries */
    listAgents() {
        return this.list();
    }

    /** Alias for backward compatibility / multi-agent routing queries */
    getAllAgents() {
        return this.list();
    }

    /** Find agents by capability */
    findByCapability(capability) {
        return this.list().filter(a => a.capabilities?.includes(capability));
    }

    /** Get agent count */
    get count() {
        return this.agents.size;
    }

    /** Export registry as JSON (for auditing/documentation) */
    toJSON() {
        return {
            count: this.count,
            agents: this.list().map(a => ({
                name: a.name,
                description: a.description,
                capabilities: a.capabilities,
                queue: a.queue,
                version: a.version,
                registeredAt: a.registeredAt,
                isPlugin: !!a.isPlugin
            }))
        };
    }

    /**
     * Dynamically scan the plugins directory and register third-party Marketplace agents.
     */
    async loadPlugins() {
        if (this.pluginsLoaded) return;
        const pluginsDir = path.join(process.cwd(), 'src/app/modules/agents/plugins');

        try {
            await fs.mkdir(pluginsDir, { recursive: true });
            const files = await fs.readdir(pluginsDir);

            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const pluginPath = path.join(pluginsDir, file).replace(/\\/g, '/'); // Windows compat
                        const pluginModule = await import(`file://${pluginPath}`);

                        if (pluginModule.pluginInstance) {
                            const instance = pluginModule.pluginInstance;
                            this.register({
                                name: instance.name || instance.manifest.id,
                                description: instance.description || 'Swarm Marketplace Community Agent',
                                queue: `${instance.name}-queue`,
                                capabilities: instance.manifest.capabilities || [],
                                version: instance.manifest.version || '1.0.0',
                                isPlugin: true,
                                instance // Store reference for actual execution logic
                            });
                        }
                    } catch (pluginErr) {
                        logger.error(`❌ Failed to load Marketplace Plugin: ${file}`, pluginErr.message);
                    }
                }
            }
            this.pluginsLoaded = true;
            logger.info(`🧩 AgentRegistry: External Marketplace Plugins loaded successfully.`);
        } catch (e) {
            logger.warn(`AgentRegistry: Could not scan plugins directory: ${e.message}`);
        }
    }
}

// Register all known agents
export const agentRegistry = new AgentRegistry();

agentRegistry.register({
    name: 'jules',
    description: 'Autonomous Software Engineering Agent — Repository-scale reasoning and flawless asynchronous coding.',
    queue: 'jules-queue',
    capabilities: ['autonomous-coding', 'refactoring', 'bug-fixing', 'repository-scale-reasoning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'licenseGuardian',
    description: 'Enforces the MIT & Apache 2.0 Hard Law — Zero-trust legal compliance for all code and dependencies.',
    queue: 'legal-queue',
    capabilities: ['compliance', 'legal-review', 'license-scanning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'diplomat',
    description: 'Universal A2A Diplomat — Autonomous negotiation and task hand-off with 3rd-party enterprise agents.',
    queue: 'diplomacy-queue',
    capabilities: ['a2a-protocol', 'negotiation', 'cross-platform-sync', 'app-hub-discovery'],
    policy: { accessLevel: 'ARCHITECT' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'auditor',
    description: 'Vertex AI Sentinel — Autonomous self-evaluation, fidelity benchmarking, and model hyper-tuning.',
    queue: 'auditor-queue',
    capabilities: ['agentic-eval', 'benchmarking', 'hyper-tuning', 'quality-gate'],
    policy: { accessLevel: 'ARCHITECT' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'architect',
    description: 'Gemini Code-Assist Architect — Large-scale structural refactoring and codebase-aware strategy.',
    queue: 'architect-queue',
    capabilities: ['structural-refactoring', 'code-graph-analysis', 'migration-planning', 'architectural-guardrails'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'conductor',
    description: 'Swarm Conductor — Real-time multi-agent CRDT synchronization and focus management.',
    queue: 'sync-queue',
    capabilities: ['live-collaboration', 'swarm-sync', 'crdt-persistence', 'focus-assignment'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'devops',
    description: 'Universal Cloud Orchestrator — Prompt-based autonomous deployments to AWS, GCP, Azure, and Vercel.',
    queue: 'devops-queue',
    capabilities: ['multi-cloud-deployment', 'iac-provisioning', 'vercel-deploy', 'harness-orchestration'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'zx',
    description: 'Google zx DevOps Agent — executes native shell scripts autonomously for CI/CD and system orchestration.',
    queue: 'zx-queue',
    capabilities: ['shell-scripting', 'bash', 'devops', 'automation', 'zx'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'octopus',
    description: 'GitHub Master Orchestrator — Autonomous Pull Requests, Actions, and Release Management.',
    queue: 'github-queue',
    capabilities: ['github-orchestration', 'pr-creation', 'action-trigger', 'release-management'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'specter',
    description: 'Preview Environment Engine — Autonomous transient clones for every Pull Request.',
    queue: 'preview-queue',
    capabilities: ['preview-environment', 'transient-deployment', 'pr-commenting'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'centurion',
    description: 'Cloud FinOps Auditor — Monthly burn estimation and resource optimization for every mission.',
    queue: 'finops-queue',
    capabilities: ['cost-audit', 'finops', 'resource-optimization', 'pricing-api'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'titan',
    description: 'Multi-Region HA Architect — Global high-availability and regional failover orchestration.',
    queue: 'ha-queue',
    capabilities: ['multi-region', 'high-availability', 'failover', 'global-infrastructure'],
    policy: { accessLevel: 'ARCHITECT' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'nomad',
    description: 'Cross-Cloud Migration Specialist — Autonomous mobility between AWS, GCP, Azure, and Vercel.',
    queue: 'migration-queue',
    capabilities: ['cross-cloud-migration', 'iac-translation', 'universal-mobility'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

// Define all agents with their capabilities
agentRegistry.register({

    name: 'audit',
    description: 'Cryptographically seals every system action into an immutable ledger.',
    queue: 'audit-queue',
    capabilities: ['logging', 'compliance', 'irs-audit'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'git',
    description: 'Autonomous version control. Auto-commits, pushes, and documents milestones.',
    queue: 'git-queue',
    capabilities: ['version-control', 'documentation', 'ci-trigger'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'refactor',
    description: 'Cognitive code refactoring with RAG recall, reasoning, and self-correction.',
    queue: 'refactor-queue',
    capabilities: ['code-generation', 'code-refactoring', 'self-correction'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'security',
    description: 'Scans codebases for vulnerabilities and memorizes threat signatures.',
    queue: 'security-queue',
    capabilities: ['security-scan', 'vulnerability-detection', 'threat-intelligence'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'sandyaa',
    description: 'Autonomous autonomous security auditing tool that navigates the file system and AST to find structural vulnerabilities.',
    queue: 'sandyaa-queue',
    capabilities: ['security-audit', 'ast-vulnerability-scan', 'sandyaa', 'autonomous-auditing'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'devops',
    description: 'Deploys to cloud infrastructure and logs deployment history.',
    queue: 'devops-queue',
    capabilities: ['deployment', 'cloud-management', 'rollback'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'qa',
    description: 'Generates tests, executes them, and self-heals code on failure.',
    queue: 'qa-queue',
    capabilities: ['test-generation', 'test-execution', 'self-healing'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'monitoring',
    description: 'System health watchdog. Detects anomalies and triggers alerts.',
    queue: 'monitoring-queue',
    capabilities: ['health-check', 'anomaly-detection', 'alerting'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'iac',
    description: 'Infrastructure provisioning via Terraform/OpenTofu.',
    queue: 'iac-queue',
    capabilities: ['infrastructure', 'terraform', 'provisioning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cicd',
    description: 'Orchestrates CI/CD pipelines across platforms.',
    queue: 'cicd-queue',
    capabilities: ['pipeline', 'build', 'deploy'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'notification',
    description: 'Sends notifications across channels (email, slack, webhook).',
    queue: 'notification-queue',
    capabilities: ['notification', 'email', 'alerting'],
    version: '1.0.0'
});

// ──── TIER 1: CODE INTELLIGENCE ────
agentRegistry.register({
    name: 'codeReview',
    description: 'AI-powered code reviews — finds bugs, security flaws, and style issues.',
    queue: 'codeReview-queue',
    capabilities: ['code-review', 'bug-detection', 'style-checking'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'documentation',
    description: 'Auto-generates JSDoc, README, and API reference from source code.',
    queue: 'documentation-queue',
    capabilities: ['documentation', 'jsdoc', 'readme-generation'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'debug',
    description: 'Automated root cause analysis and debugging from errors/stack traces.',
    queue: 'debug-queue',
    capabilities: ['debugging', 'root-cause-analysis', 'error-diagnosis'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'architecture',
    description: 'System design review, pattern detection, architecture recommendations.',
    queue: 'architecture-queue',
    capabilities: ['architecture-review', 'design-patterns', 'system-design'],
    version: '1.0.0'
});

// ──── TIER 2: DATA & INFRASTRUCTURE ────
agentRegistry.register({
    name: 'database',
    description: 'Schema design, query optimization, index recommendations.',
    queue: 'database-queue',
    capabilities: ['schema-design', 'query-optimization', 'indexing'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'migration',
    description: 'Zero-downtime database/API migration planning and SQL generation.',
    queue: 'migration-queue',
    capabilities: ['migration', 'schema-evolution', 'zero-downtime'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'performance',
    description: 'Profiling, bottleneck detection, caching and parallelization strategies.',
    queue: 'performance-queue',
    capabilities: ['profiling', 'optimization', 'caching', 'memory-analysis'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cost',
    description: 'Cloud FinOps — cost optimization, right-sizing, reserved instance planning.',
    queue: 'cost-queue',
    capabilities: ['cost-optimization', 'finops', 'right-sizing'],
    version: '1.0.0'
});

// ──── TIER 3: COMPLIANCE & QUALITY ────
agentRegistry.register({
    name: 'compliance',
    description: 'GDPR, SOC2, HIPAA, FedRAMP, PCI-DSS compliance auditing.',
    queue: 'compliance-queue',
    capabilities: ['compliance', 'gdpr', 'hipaa', 'soc2', 'pci-dss'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'accessibility',
    description: 'WCAG 2.1 / ADA / Section 508 accessibility compliance checking.',
    queue: 'accessibility-queue',
    capabilities: ['accessibility', 'wcag', 'ada', 'section-508'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'dependency',
    description: 'Dependency management — vulnerability patching, update planning, unused detection.',
    queue: 'dependency-queue',
    capabilities: ['dependency-management', 'vulnerability-patching', 'update-planning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'e2eTest',
    description: 'End-to-end test generation (Playwright/Cypress) with fixtures.',
    queue: 'e2eTest-queue',
    capabilities: ['e2e-testing', 'test-generation', 'playwright', 'cypress'],
    version: '1.0.0'
});

// ──── TIER 4: OPERATIONS ────
agentRegistry.register({
    name: 'release',
    description: 'Release management — semantic versioning, changelog, release notes.',
    queue: 'release-queue',
    capabilities: ['release-management', 'semver', 'changelog'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'overseer',
    description: 'CI/CD pipeline orchestrator — intercepts failures, executes tests in shadows, and triggers self-healing.',
    queue: 'overseer-queue',
    capabilities: ['ci-cd', 'pipeline-monitoring', 'self-healing', 'testing'],
    version: '2.0.0'
});

agentRegistry.register({
    name: 'incident',
    description: 'Incident response — triage, root cause, mitigation, postmortem generation.',
    queue: 'incident-queue',
    capabilities: ['incident-response', 'triage', 'postmortem'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'analytics',
    description: 'Data analytics — trend detection, anomaly identification, predictions.',
    queue: 'analytics-queue',
    capabilities: ['analytics', 'trend-detection', 'anomaly-detection', 'predictions'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'knowledge',
    description: 'Knowledge base management — RAG retrieval, indexing, explanation.',
    queue: 'knowledge-queue',
    capabilities: ['knowledge-management', 'rag', 'retrieval', 'indexing'],
    version: '1.0.0'
});

// ──── TIER 5: GROWTH ────
agentRegistry.register({
    name: 'seo',
    description: 'SEO optimization — metadata, structured data, technical SEO audits.',
    queue: 'seo-queue',
    capabilities: ['seo', 'metadata', 'structured-data', 'technical-seo'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'translation',
    description: 'i18n/l10n — translates UI strings and content preserving placeholders.',
    queue: 'translation-queue',
    capabilities: ['translation', 'i18n', 'l10n', 'localization'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'onboarding',
    description: 'Developer onboarding — quick start guides, architecture overview, recipes.',
    queue: 'onboarding-queue',
    capabilities: ['onboarding', 'developer-experience', 'documentation'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'apiDesign',
    description: 'API architecture — OpenAPI/GraphQL schema design, contract-first development.',
    queue: 'apiDesign-queue',
    capabilities: ['api-design', 'openapi', 'graphql', 'contract-first'],
    version: '1.0.0'
});

// ──── TIER 6: CLOUD-SPECIFIC ────
agentRegistry.register({
    name: 'aws',
    description: 'AWS Solutions Architecture — IAM, CloudFormation, CDK, cost optimization.',
    queue: 'aws-queue',
    capabilities: ['aws', 'iam', 'cloudformation', 'cdk', 's3', 'lambda'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'gcp',
    description: 'Google Cloud Architecture — IAM bindings, Terraform, Cloud Run, BigQuery.',
    queue: 'gcp-queue',
    capabilities: ['gcp', 'cloud-run', 'bigquery', 'gke', 'firebase'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'azure',
    description: 'Azure Solutions Architecture — RBAC, ARM/Bicep, AKS, Cosmos DB.',
    queue: 'azure-queue',
    capabilities: ['azure', 'rbac', 'arm', 'bicep', 'aks', 'cosmos-db'],
    version: '1.0.0'
});

// ──── TIER 7: LANGUAGE-SPECIFIC ────
agentRegistry.register({
    name: 'python',
    description: 'Python expert — Django, FastAPI, async patterns, type hints, packaging.',
    queue: 'python-queue',
    capabilities: ['python', 'django', 'fastapi', 'flask', 'packaging'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'typescript',
    description: 'TypeScript expert — strict types, generics, Next.js, React patterns.',
    queue: 'typescript-queue',
    capabilities: ['typescript', 'react', 'nextjs', 'generics', 'strict-mode'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'rust',
    description: 'Rust expert — ownership, lifetimes, async, unsafe, FFI, performance.',
    queue: 'rust-queue',
    capabilities: ['rust', 'ownership', 'async-rust', 'ffi', 'wasm'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'golang',
    description: 'Go expert — goroutines, channels, interfaces, error handling, microservices.',
    queue: 'golang-queue',
    capabilities: ['go', 'goroutines', 'channels', 'microservices', 'grpc'],
    version: '1.0.0'
});

// ──── TIER 8: MICRO-AGENTS ────
agentRegistry.register({
    name: 'linter',
    description: 'Micro-agent: Lints code and returns errors/warnings with auto-fixes.',
    queue: 'linter-queue',
    capabilities: ['linting', 'auto-fix', 'code-quality'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'formatter',
    description: 'Micro-agent: Formats code to consistent style (Prettier/Black/gofmt).',
    queue: 'formatter-queue',
    capabilities: ['formatting', 'prettier', 'code-style'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'background-agents',
    description: 'Dispatches long-running, real-time multiplayer coding tasks via Open-Inspect.',
    queue: 'background-queue',
    capabilities: ['background task', 'multiplayer', 'open-inspect'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'pentagi',
    description: 'Autonomous Deep Penetration Testing and Security Auditing via isolated containers.',
    queue: 'pentagi-queue',
    capabilities: ['pentest', 'security-audit', 'vulnerability-scanner', 'red-team'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'fossflow',
    description: 'Autonomous Isometric Architecture Designer powered by FossFLOW.',
    queue: 'fossflow-queue',
    capabilities: ['architecture-diagram', 'isometric-map', 'system-design', 'isoflow'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'envValidator',
    description: 'Micro-agent: Validates .env files for missing vars, exposed secrets, insecure defaults.',
    queue: 'envValidator-queue',
    capabilities: ['env-validation', 'secret-detection', 'config-audit'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'secretScanner',
    description: 'Micro-agent: Scans code for exposed API keys, tokens, passwords, credentials.',
    queue: 'secretScanner-queue',
    capabilities: ['secret-scanning', 'credential-detection', 'security'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'deadCode',
    description: 'Micro-agent: Detects dead code — unused functions, variables, imports.',
    queue: 'deadCode-queue',
    capabilities: ['dead-code-detection', 'unused-imports', 'tree-shaking'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'importSorter',
    description: 'Micro-agent: Sorts and organizes imports by group (builtin, external, internal).',
    queue: 'importSorter-queue',
    capabilities: ['import-sorting', 'import-organization', 'code-cleanup'],
    version: '1.0.0'
});

// ──── TIER 9: CORE SYSTEM AGENTS ────
agentRegistry.register({
    name: 'googleSearch',
    description: 'Grounds prompts and outputs in real-time web data using Google Custom Search.',
    queue: 'google-search-queue',
    capabilities: ['web-search', 'research', 'grounding', 'fact-checking'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'surfer',
    description: 'Web browsing agent. Visits URLs, extracts content, and performs research.',

    queue: 'surfer-queue',
    capabilities: ['research', 'browsing', 'extraction', 'scraping'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'siren',
    description: 'Text-to-Speech agent. Announces system events and results vocally.',
    queue: 'siren-queue',
    capabilities: ['tts', 'speech', 'announcement'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'vector',
    description: 'Long-term memory access (Vector DB). Stores and retrieves semantic data.',
    queue: 'memory-queue',
    capabilities: ['memory', 'storage', 'retrieval', 'embedding'],
    version: '1.0.0'
});

// ──── TIER 10: THE BRIDGE ────
agentRegistry.register({
    name: 'engine',
    description: 'Python AI Engine Proxy — Access to NeMo, RAG, and Graph Analysis.',
    queue: 'engine-queue',
    capabilities: ['ai_graph', 'ai_rag', 'ocr', 'ingest'],
    version: '1.0.0'
});

// ──── TIER 11: SYSTEM 2 REASONING ────
agentRegistry.register({
    name: 'strategist',
    description: 'The Planner. Breaks down complex goals into atomic steps for the swarm.',
    queue: 'strategist-queue',
    capabilities: ['planning', 'strategy', 'task-breakdown'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'critic',
    description: 'The Reviewer. Validates plans for security, performance, and correctness.',
    queue: 'critic-queue',
    capabilities: ['review', 'security-audit', 'quality-control'],
    version: '1.0.0'
});

// ──── TIER 12: HYPER-NICHE SPECIALISTS ────
agentRegistry.register({
    name: 'regex',
    description: 'Micro-agent dedicated entirely to regular expressions and catastrophic backtracking avoidance.',
    queue: 'regex-queue',
    capabilities: ['regex', 'pattern-matching', 'validation'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'docker',
    description: 'Specialist generating multi-stage Dockerfiles and container optimization strategies.',
    queue: 'docker-queue',
    capabilities: ['docker', 'containerization', 'multi-stage'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'kubernetes',
    description: 'Generates and validates K8s manifests, Helm charts, and Custom Resource Definitions.',
    queue: 'kubernetes-queue',
    capabilities: ['kubernetes', 'helm', 'k8s-manifests'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'nginx',
    description: 'Handles strict Nginx configurations, reverse proxying, rate limiting, and SSL bindings.',
    queue: 'nginx-queue',
    capabilities: ['nginx', 'reverse-proxy', 'load-balancing'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'graphql',
    description: 'Focuses solely on writing optimal GraphQL schemas and resolvers preventing N+1 queries.',
    queue: 'graphql-queue',
    capabilities: ['graphql', 'resolvers', 'apollo'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'bash',
    description: 'Shell Master — pure sed, awk, and grep pipeline generation.',
    queue: 'bash-queue',
    capabilities: ['bash', 'shell-scripting', 'awk', 'sed'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cron',
    description: 'Time Master — writes, explains, and debugs complex cron schedules.',
    queue: 'cron-queue',
    capabilities: ['cron', 'scheduling', 'time-expressions'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ffmpeg',
    description: 'Media encoding expert generating optimal ffmpeg CLI flags for video/audio pipelines.',
    queue: 'ffmpeg-queue',
    capabilities: ['ffmpeg', 'video-encoding', 'media'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'jwt',
    description: 'Auth Token Master — parses and generates secure JWT issuance logic and claims.',
    queue: 'jwt-queue',
    capabilities: ['jwt', 'authentication', 'tokens'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'threejs',
    description: 'Graphics Master — WebGL, Three.js scenes, and GLSL shaders.',
    queue: 'threejs-queue',
    capabilities: ['threejs', 'webgl', 'glsl', 'shaders'],
    version: '1.0.0'
});

// ──── TIER 13: ENTERPRISE INTEGRATIONS & FRONTIER TECH ────
agentRegistry.register({
    name: 'stripe',
    description: 'SDK specialist for Stripe payments, subscriptions, Connect, and Radar fraud rules.',
    queue: 'stripe-queue',
    capabilities: ['stripe', 'payments', 'subscriptions', 'webhooks'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'redis',
    description: 'SDK specialist for Redis caching, Pub/Sub, atomic pipelines, and cluster config.',
    queue: 'redis-queue',
    capabilities: ['redis', 'caching', 'pub-sub', 'rate-limiting'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'supabase',
    description: 'SDK specialist for Supabase Auth, RLS policies, Realtime, and Edge Functions.',
    queue: 'supabase-queue',
    capabilities: ['supabase', 'rls', 'realtime', 'edge-functions'],
    version: '1.0.0'
});

// ──── TIER 14: THE SOVEREIGN BOARDROOM ────
agentRegistry.register({
    name: 'chairman',
    description: 'Chairman of the Board — Governance, Risk, and Long-term Strategy.',
    queue: 'chairman-queue',
    capabilities: ['governance', 'risk-management', 'strategy'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ceo',
    description: 'Chief Executive Officer — Vision, Execution, and Leadership.',
    queue: 'ceo-queue',
    capabilities: ['vision', 'execution', 'leadership'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'coo',
    description: 'Chief Operating Officer — Operations, Logistics, and Efficiency.',
    queue: 'coo-queue',
    capabilities: ['operations', 'efficiency', 'logistics'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cfo',
    description: 'Chief Financial Officer — FinOps, Capital, and Profitability.',
    queue: 'cfo-queue',
    capabilities: ['finops', 'capital', 'profitability'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cmo',
    description: 'Chief Marketing Officer — Growth, Branding, and User Acquisition.',
    queue: 'cmo-queue',
    capabilities: ['marketing', 'branding', 'growth'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cro',
    description: 'Chief Revenue Officer — Enterprise Sales, Monetization, and Pricing.',
    queue: 'cro-queue',
    capabilities: ['sales', 'monetization', 'pricing'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'lawyer',
    description: 'General Counsel — Hard Law, Compliance, and Liability.',
    queue: 'lawyer-queue',
    capabilities: ['law', 'compliance', 'liability'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'accountant',
    description: 'Chief Accountant — Audits, Immutable Ledger, and Financial Records.',
    queue: 'accountant-queue',
    capabilities: ['audit', 'ledger', 'accounting'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'pm',
    description: 'Product Manager — PRDs, User Stories, and Backlog Prioritization.',
    queue: 'pm-queue',
    capabilities: ['product', 'prd', 'agile'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'scrum',
    description: 'Scrum Master — Sprint Orchestration, Blocking, and Swarm Sync.',
    queue: 'scrum-queue',
    capabilities: ['scrum', 'agile', 'facilitation'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'designer',
    description: 'UX/UI Designer — Pixel-perfect interfaces, Tailwind, and Design Systems.',
    queue: 'designer-queue',
    capabilities: ['ui', 'ux', 'design'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'qa',
    description: 'QA Engineer — Destructive testing, Playwright, and release stability.',
    queue: 'qa-engineer-queue',
    capabilities: ['qa', 'testing', 'playwright'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'frontend',
    description: 'Frontend Developer — React, Next.js, and complex client-side state.',
    queue: 'frontend-queue',
    capabilities: ['frontend', 'react', 'nextjs'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'backend',
    description: 'Backend Developer — APIs, Microservices, Node.js, and Go.',
    queue: 'backend-queue',
    capabilities: ['backend', 'api', 'microservices'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'dba',
    description: 'Database Admin — Schema design, SQL optimization, and migrations.',
    queue: 'dba-queue',
    capabilities: ['database', 'sql', 'migrations'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ai',
    description: 'AI Engineer — Prompt Engineering, LLMs, RAG, and Swarm AI.',
    queue: 'ai-engineer-queue',
    capabilities: ['ai', 'llm', 'rag'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'writer',
    description: 'Technical Writer — Swagger, READMEs, and technical documentation.',
    queue: 'writer-queue',
    capabilities: ['documentation', 'swagger', 'writing'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'support',
    description: 'Support Engineer — Triage, Incident Response, and User Mitigations.',
    queue: 'support-queue',
    capabilities: ['support', 'triage', 'incident'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cto',
    description: 'Chief Technology Officer — Architecture, Tech Stack, and Technical Debt.',
    queue: 'cto-queue',
    capabilities: ['architecture', 'tech-stack', 'engineering'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ciso',
    description: 'Chief Information Security Officer — Zero-Trust, Pen-testing, and Security.',
    queue: 'ciso-queue',
    capabilities: ['security', 'zero-trust', 'pen-testing'],
    policy: { accessLevel: 'ADMIN' },
    version: '1.0.0'
});

agentRegistry.register({
    name: 'prisma',
    description: 'ORM specialist for Prisma schema design, migrations, and query optimization.',
    queue: 'prisma-queue',
    capabilities: ['prisma', 'orm', 'migrations', 'query-optimization'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'webrtc',
    description: 'Frontier specialist for WebRTC peer connections, signaling, STUN/TURN, and media streams.',
    queue: 'webrtc-queue',
    capabilities: ['webrtc', 'real-time', 'signaling', 'media-streams'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'solidity',
    description: 'Web3 specialist for EVM smart contracts, ERC standards, gas optimization, and Hardhat.',
    queue: 'solidity-queue',
    capabilities: ['solidity', 'smart-contracts', 'evm', 'web3'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'svelte',
    description: 'Framework specialist for Svelte 5 runes, SvelteKit SSR/SSG, and reactive state.',
    queue: 'svelte-queue',
    capabilities: ['svelte', 'sveltekit', 'runes', 'ssr'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'vue',
    description: 'Framework specialist for Vue 3 Composition API, Pinia, Nuxt 3, and Vue Router.',
    queue: 'vue-queue',
    capabilities: ['vue', 'nuxt', 'pinia', 'composition-api'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'storybook',
    description: 'DevEx specialist for Storybook CSF3 stories, interaction tests, and visual regression.',
    queue: 'storybook-queue',
    capabilities: ['storybook', 'component-testing', 'visual-regression', 'design-system'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'opentelemetry',
    description: 'Observability specialist for OTel instrumentation, trace propagation, and metrics pipelines.',
    queue: 'opentelemetry-queue',
    capabilities: ['observability', 'tracing', 'metrics', 'otel'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ansible',
    description: 'IaC specialist for Ansible playbooks, roles, Vault encryption, and dynamic inventories.',
    queue: 'ansible-queue',
    capabilities: ['ansible', 'automation', 'configuration-management', 'idempotent'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'terraform',
    description: 'IaC specialist for Terraform HCL modules, remote state, workspaces, and Terragrunt.',
    queue: 'terraform-queue',
    capabilities: ['terraform', 'hcl', 'remote-state', 'terragrunt', 'modules'],
    version: '1.0.0'
});

// ──── TIER 14: AI/ML, MOBILE & DATA ENGINEERING ────
agentRegistry.register({
    name: 'langchain',
    description: 'AI/ML specialist for LangChain chains, RAG pipelines, tool-calling agents, and LCEL.',
    queue: 'langchain-queue',
    capabilities: ['langchain', 'rag', 'ai-agents', 'lcel'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'mlops',
    description: 'MLOps specialist for MLflow tracking, model registries, drift detection, and serving.',
    queue: 'mlops-queue',
    capabilities: ['mlops', 'mlflow', 'model-serving', 'drift-detection'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'prompteng',
    description: 'AI specialist for prompt engineering, chain-of-thought, few-shot, and structured outputs.',
    queue: 'prompteng-queue',
    capabilities: ['prompt-engineering', 'chain-of-thought', 'structured-output', 'few-shot'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'reactnative',
    description: 'Mobile specialist for React Native + Expo, native modules, and EAS builds.',
    queue: 'reactnative-queue',
    capabilities: ['react-native', 'expo', 'eas', 'mobile'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'flutter',
    description: 'Mobile specialist for Flutter, Riverpod state, platform channels, and animations.',
    queue: 'flutter-queue',
    capabilities: ['flutter', 'dart', 'riverpod', 'mobile'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'pwa',
    description: 'Mobile/Web specialist for Service Workers, Workbox, and Progressive Web App architecture.',
    queue: 'pwa-queue',
    capabilities: ['pwa', 'service-worker', 'workbox', 'offline'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'vitest',
    description: 'Testing specialist for Vitest unit tests, vi.mock(), coverage thresholds, and browser mode.',
    queue: 'vitest-queue',
    capabilities: ['vitest', 'unit-testing', 'mocking', 'coverage'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'playwright',
    description: 'E2E testing specialist for Playwright POM, parallelization, and network mocking.',
    queue: 'playwright-queue',
    capabilities: ['playwright', 'e2e-testing', 'pom', 'visual-regression'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'sql',
    description: 'Data specialist for advanced SQL: CTEs, window functions, query plan analysis, and partitioning.',
    queue: 'sql-queue',
    capabilities: ['sql', 'query-optimization', 'window-functions', 'partitioning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'elasticsearch',
    description: 'Search specialist for Elasticsearch mappings, relevance tuning, aggregations, and ILM.',
    queue: 'elasticsearch-queue',
    capabilities: ['elasticsearch', 'search', 'aggregations', 'knn'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'kafka',
    description: 'Streaming specialist for Kafka topics, consumer groups, EOS, and Kafka Streams topologies.',
    queue: 'kafka-queue',
    capabilities: ['kafka', 'streaming', 'consumer-groups', 'exactly-once'],
    version: '1.0.0'
});

// ──── TIER 15: SECURITY, PLATFORM & CREATIVE ────
agentRegistry.register({
    name: 'pentest',
    description: 'Security specialist for OWASP Top 10, penetration testing methodologies, and red team tactics.',
    queue: 'pentest-queue',
    capabilities: ['pentest', 'owasp', 'security-audit', 'red-team'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'githubactions',
    description: 'Platform specialist for GitHub Actions workflows, OIDC federation, and matrix builds.',
    queue: 'githubactions-queue',
    capabilities: ['github-actions', 'ci-cd', 'oidc', 'matrix-builds'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'figma',
    description: 'Creative specialist for Figma design-to-code, design tokens, and component variant systems.',
    queue: 'figma-queue',
    capabilities: ['figma', 'design-tokens', 'design-system', 'component-variants'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'wasm',
    description: 'Platform specialist for WebAssembly compilation, WASI, and browser/Node.js integration.',
    queue: 'wasm-queue',
    capabilities: ['wasm', 'webassembly', 'wasi', 'rust-wasm'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'deno',
    description: 'Platform specialist for Deno 2 runtime, Fresh framework, and Deno Deploy edge network.',
    queue: 'deno-queue',
    capabilities: ['deno', 'fresh', 'deno-deploy', 'edge'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'mongodb',
    description: 'Data specialist for MongoDB Mongoose schemas, aggregation pipelines, Atlas Search, and change streams.',
    queue: 'mongodb-queue',
    capabilities: ['mongodb', 'mongoose', 'aggregation', 'atlas-search'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'grpc',
    description: 'Platform specialist for Protocol Buffers design, gRPC services, streaming, and interceptors.',
    queue: 'grpc-queue',
    capabilities: ['grpc', 'protobuf', 'streaming-rpc', 'interceptors'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'tailwind',
    description: 'Creative specialist for Tailwind v4, CVA component variants, and utility-first design systems.',
    queue: 'tailwind-queue',
    capabilities: ['tailwind', 'cva', 'design-system', 'utility-css'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'i18n',
    description: 'Localization specialist for next-intl, ICU messages, pluralization, and RTL layout support.',
    queue: 'i18n-queue',
    capabilities: ['i18n', 'l10n', 'next-intl', 'rtl', 'icu-format'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'websocket',
    description: 'Real-time specialist for Socket.IO rooms, namespaces, Redis adapter, and heartbeat patterns.',
    queue: 'websocket-queue',
    capabilities: ['websocket', 'socket-io', 'real-time', 'redis-adapter'],
    version: '1.0.0'
});

// ──── TIER 16: EXTENDED CLOUD PROVIDERS ────
agentRegistry.register({
    name: 'cloudflare',
    description: 'Edge cloud specialist for Cloudflare Workers, Durable Objects, D1, R2, KV, and Pages.',
    queue: 'cloudflare-queue',
    capabilities: ['cloudflare', 'workers', 'durable-objects', 'd1', 'r2'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'vercel',
    description: 'Deployment specialist for Vercel Edge Functions, ISR, vercel.json, and Fluid compute.',
    queue: 'vercel-queue',
    capabilities: ['vercel', 'edge-functions', 'isr', 'nextjs-deploy'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'netlify',
    description: 'Deployment specialist for Netlify Functions, Edge Functions, netlify.toml, and Blobs.',
    queue: 'netlify-queue',
    capabilities: ['netlify', 'netlify-functions', 'edge-functions', 'jamstack'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'digitalocean',
    description: 'Cloud specialist for DigitalOcean Droplets, App Platform, Spaces, DOKS, and Managed DBs.',
    queue: 'digitalocean-queue',
    capabilities: ['digitalocean', 'droplets', 'doks', 'app-platform'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'oracle',
    description: 'Enterprise cloud specialist for OCI Compute, OKE, Autonomous Database, and Object Storage.',
    queue: 'oracle-queue',
    capabilities: ['oci', 'oracle-cloud', 'autonomous-db', 'oke'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ibmcloud',
    description: 'Enterprise cloud specialist for IBM Code Engine, Watson AI, IKS, and Db2.',
    queue: 'ibmcloud-queue',
    capabilities: ['ibm-cloud', 'watson', 'code-engine', 'iks'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'alibaba',
    description: 'Cloud specialist for Alibaba Cloud ECS, OSS, ACK, Function Compute, and PAI ML.',
    queue: 'alibaba-queue',
    capabilities: ['alibaba-cloud', 'ecs', 'oss', 'function-compute'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'hetzner',
    description: 'Cost-optimized specialist for Hetzner VPS, Load Balancers, Volumes, and K3s clusters.',
    queue: 'hetzner-queue',
    capabilities: ['hetzner', 'vps', 'k3s', 'cost-optimized'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'flyio',
    description: 'PaaS specialist for Fly.io fly.toml, Machines API, Volumes, and WireGuard networking.',
    queue: 'flyio-queue',
    capabilities: ['fly-io', 'machines-api', 'fly-volumes', 'global-deploy'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'railway',
    description: 'PaaS specialist for Railway deployments, nixpacks, service linking, and Cron Jobs.',
    queue: 'railway-queue',
    capabilities: ['railway', 'nixpacks', 'paas', 'cron-jobs'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'render',
    description: 'PaaS specialist for Render web services, background workers, and PostgreSQL.',
    queue: 'render-queue',
    capabilities: ['render', 'paas', 'blue-green'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'linode',
    description: 'Cloud computing specialist for Linode instances, NodeBalancers, and LKE.',
    queue: 'linode-queue',
    capabilities: ['linode', 'lke', 'nodebalancers'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'vultr',
    description: 'Cloud specialist for Vultr VPS, bare metal, and VKE.',
    queue: 'vultr-queue',
    capabilities: ['vultr', 'vps', 'vke'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'scaleway',
    description: 'European cloud specialist for Scaleway Elements, Kapsule, and Serverless.',
    queue: 'scaleway-queue',
    capabilities: ['scaleway', 'kapsule', 'serverless'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'ovhcloud',
    description: 'Cloud hosting specialist for OVHcloud Public Cloud, dedicated servers, and VRack.',
    queue: 'ovhcloud-queue',
    capabilities: ['ovhcloud', 'dedicated-servers', 'vrack'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'neon',
    description: 'Serverless Postgres specialist for Neon DB branching, autoscaling, and bottomless storage.',
    queue: 'neon-queue',
    capabilities: ['neon', 'serverless-postgres', 'database-branching'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'fastly',
    description: 'Edge cloud platform specialist for Fastly Compute@Edge, VCL, and CDN orchestration.',
    queue: 'fastly-queue',
    capabilities: ['fastly', 'compute-at-edge', 'vcl', 'cdn'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'backblaze',
    description: 'Cloud storage specialist for Backblaze B2, S3-compatible APIs, and cloud backup.',
    queue: 'backblaze-queue',
    capabilities: ['backblaze-b2', 'cloud-storage', 's3-compatible'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'heroku',
    description: 'PaaS specialist for Heroku Dynos, buildpacks, and Heroku Postgres.',
    queue: 'heroku-queue',
    capabilities: ['heroku', 'buildpacks', 'dynos'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'planetscale',
    description: 'Serverless MySQL specialist for PlanetScale Vitess clusters, branching, and migrations.',
    queue: 'planetscale-queue',
    capabilities: ['planetscale', 'vitess', 'serverless-mysql'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'upcloud',
    description: 'European cloud hosting specialist for UpCloud MaxIOPS servers and managed databases.',
    queue: 'upcloud-queue',
    capabilities: ['upcloud', 'maxiops', 'vps'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'exoscale',
    description: 'Swiss cloud specialist for Exoscale instances, SKS, and secure cloud storage.',
    queue: 'exoscale-queue',
    capabilities: ['exoscale', 'sks', 'swiss-cloud'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'civo',
    description: 'Cloud native service provider focusing on lightning-fast K3s Kubernetes.',
    queue: 'civo-queue',
    capabilities: ['civo', 'k3s', 'cloud-native'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'coreweave',
    description: 'Specialized cloud for GPU-accelerated workloads, machine learning, and VFX rendering.',
    queue: 'coreweave-queue',
    capabilities: ['coreweave', 'gpu-cloud', 'machine-learning'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'lambdalabs',
    description: 'GPU cloud specialist for Lambda Labs AI/ML compute infrastructure.',
    queue: 'lambdalabs-queue',
    capabilities: ['lambdalabs', 'gpu-compute', 'ai-infrastructure'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'runpod',
    description: 'Serverless GPU cloud specialist for RunPod pods and AI endpoints.',
    queue: 'runpod-queue',
    capabilities: ['runpod', 'serverless-gpu', 'ai-endpoints'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'paperspace',
    description: 'Cloud computing specialist for Paperspace Core and Gradient ML workflows.',
    queue: 'paperspace-queue',
    capabilities: ['paperspace', 'gradient', 'gpu-vms'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'tencent',
    description: 'Asian cloud provider specialist for Tencent Cloud CVM, TKE, and CDN.',
    queue: 'tencent-queue',
    capabilities: ['tencent-cloud', 'cvm', 'tke'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'huawei',
    description: 'Global cloud specialist for Huawei Cloud ECS, CCE, and GaussDB.',
    queue: 'huawei-queue',
    capabilities: ['huawei-cloud', 'ecs', 'cce'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'baidu',
    description: 'Cloud specialist for Baidu AI Cloud BCC and smart edge computing.',
    queue: 'baidu-queue',
    capabilities: ['baidu-cloud', 'bcc', 'ai-cloud'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'yandex',
    description: 'Russian cloud platform specialist for Yandex Cloud compute and Managed ClickHouse.',
    queue: 'yandex-queue',
    capabilities: ['yandex-cloud', 'managed-clickhouse', 'vms'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'equinix',
    description: 'Bare metal cloud specialist for Equinix Metal provisioning and interconnections.',
    queue: 'equinix-queue',
    capabilities: ['equinix-metal', 'bare-metal', 'edge-compute'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cloudinary',
    description: 'Cloud media specialist for Cloudinary image and video transformations and CDN.',
    queue: 'cloudinary-queue',
    capabilities: ['cloudinary', 'media-management', 'cdn'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'snowflake',
    description: 'Data cloud specialist for Snowflake warehouses, Snowpipe, and secure data sharing.',
    queue: 'snowflake-queue',
    capabilities: ['snowflake', 'data-cloud', 'snowpipe'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'databricks',
    description: 'Lakehouse specialist for Databricks Apache Spark, Delta Lake, and MLflow.',
    queue: 'databricks-queue',
    capabilities: ['databricks', 'delta-lake', 'spark'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'denodeploy',
    description: 'Serverless V8 isolate cloud specialist for Deno Deploy and edge functions.',
    queue: 'denodeploy-queue',
    capabilities: ['deno-deploy', 'edge-functions', 'v8-isolates'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'turso',
    description: 'Edge database specialist for Turso (libSQL) distributed SQLite.',
    queue: 'turso-queue',
    capabilities: ['turso', 'libsql', 'edge-sqlite'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'akamai',
    description: 'Edge cloud and CDN specialist for Akamai EdgeWorkers and security.',
    queue: 'akamai-queue',
    capabilities: ['akamai', 'edgeworkers', 'cdn'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'supabasecloud',
    description: 'BaaS cloud specialist for Supabase hosted instances, Edge Functions, and Realtime.',
    queue: 'supabasecloud-queue',
    capabilities: ['supabase', 'baas', 'edge-functions'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'apprunner',
    description: 'Managed container application service specialist for AWS App Runner.',
    queue: 'apprunner-queue',
    capabilities: ['app-runner', 'managed-containers', 'aws'],
    version: '1.0.0'
});

// ──── DEEP INTEGRATION: Context Engineering, Deep Research, Vectorless RAG, Nano Agent ────
agentRegistry.register({
    name: 'contextEngineering',
    description: 'Context Engineering Meta-Agent — applies SCRATCHPAD, SELECTOR, COMPRESSOR, TOKEN-BUDGET, and CONTEXT-DISTILLERY patterns from the Agent-Skills-for-Context-Engineering collection for multi-agent context optimization.',
    queue: 'context-engineering-queue',
    capabilities: ['context-engineering', 'token-budget', 'compressor', 'selector', 'scratchpad', 'multi-agent-context'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'deepResearch',
    description: 'Deep Research SuperAgent powered by ByteDance deer-flow. Handles tasks that take minutes to hours: comprehensive research reports, multi-source synthesis, long-form content, complex coding projects via LangGraph subagent coordination.',
    queue: 'deer-flow-queue',
    capabilities: ['deep-research', 'langgraph', 'superagent', 'research-harness', 'multi-step-research'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'pageIndexRAG',
    description: 'Vectorless Reasoning RAG Agent powered by VectifyAI/PageIndex. Indexes documents at page level and retrieves answers with page-level citations — no vector database required.',
    queue: 'pageindex-queue',
    capabilities: ['vectorless-rag', 'document-indexing', 'page-citation', 'reasoning-retrieval'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'nanoCodeAgent',
    description: 'Minimal Autonomous Code Agent implementing the read/write/bash tool loop from learn-claude-code. Iteratively reads files, writes code, runs bash commands, and self-corrects until tasks complete.',
    queue: 'nano-agent-queue',
    capabilities: ['autonomous-execution', 'tool-loop', 'bash-agent', 'self-correcting'],
    version: '1.0.0'
});

// ── Google Cloud Native Lifecycle Swarm ──
agentRegistry.register({
    name: 'product_manager',
    description: 'Autonomous Enterprise Product Manager. Generates Epics and tasks from user requirements.',
    queue: 'pm-queue',
    capabilities: ['planning', 'scoping', 'product-management'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'system_architect',
    description: 'Principal Systems Architect. Generates Mermaid topography and Terraform structures.',
    queue: 'architect-queue',
    capabilities: ['system-design', 'architecture', 'mermaid', 'terraform'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'gemini_coder',
    description: 'Senior Software Engineer. Bootstraps raw applications via Gemini CLI.',
    queue: 'gemini-coder-queue',
    capabilities: ['coding', 'bootstrapping', 'software-engineering'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'cloud_run_deployer',
    description: 'GCP DevOps Engineer. Deploys Dockerized services seamlessly to Cloud Run.',
    queue: 'cloud-run-queue',
    capabilities: ['gcp', 'cloud-run', 'docker', 'deployment'],
    version: '1.0.0'
});

agentRegistry.register({
    name: 'stackdriver_analyst',
    description: 'GCP SRE Observability Analyst. Ingests Cloud Logging data to detect anomalies.',
    queue: 'stackdriver-queue',
    capabilities: ['observability', 'sre', 'logging', 'anomaly-detection'],
    version: '1.0.0'
});

// ──── TIER 13: ADVANCED I/O MODALITIES ────
agentRegistry.register({
    name: videoGenerationAgent.name,
    description: videoGenerationAgent.description,
    queue: 'video-generation-queue',
    capabilities: ['video-synthesis', 'runway', 'sora', 'text-to-video'],
    version: '1.0.0',
    instance: videoGenerationAgent
});

agentRegistry.register({
    name: spatial3DNerfAgent.name,
    description: spatial3DNerfAgent.description,
    queue: 'spatial-3d-queue',
    capabilities: ['nerf', 'gaussian-splatting', 'threejs', '3d-generation'],
    version: '1.0.0',
    instance: spatial3DNerfAgent
});

agentRegistry.register({
    name: neuralBciParserAgent.name,
    description: neuralBciParserAgent.description,
    queue: 'neural-bci-queue',
    capabilities: ['bci', 'eeg', 'signal-processing', 'neural-intent'],
    version: '1.0.0',
    instance: neuralBciParserAgent
});

agentRegistry.register({
    name: hapticKinematicsAgent.name,
    description: hapticKinematicsAgent.description,
    queue: 'haptic-kinematics-queue',
    capabilities: ['haptics', 'force-feedback', 'vr-kinematics', 'robotics'],
    version: '1.0.0',
    instance: hapticKinematicsAgent
});

agentRegistry.register({
    name: omniAudioSynthesisAgent.name,
    description: omniAudioSynthesisAgent.description,
    queue: 'audio-synthesis-queue',
    capabilities: ['tts', 'voice-cloning', 'spatial-audio', 'real-time-dubbing'],
    version: '1.0.0',
    instance: omniAudioSynthesisAgent
});

agentRegistry.register({
    name: agentSAgent.name,
    description: agentSAgent.description,
    queue: 'agent-s-queue',
    capabilities: ['gui-operator', 'physical-mouse-actions', 'pyautogui-control', 'screen-understanding'],
    version: '1.0.0',
    instance: agentSAgent
});

agentRegistry.register({
    name: browserUseAgent.name,
    description: browserUseAgent.description,
    queue: 'browser-use-queue',
    capabilities: ['browser-operator', 'web-automation', 'playwright-control', 'web-scraping'],
    version: '1.0.0',
    instance: browserUseAgent
});

agentRegistry.register({
    name: fazmAgent.name,
    description: fazmAgent.description,
    queue: 'fazm-queue',
    capabilities: ['desktop-voice-operator', 'desktop-automation', 'voice-intents', 'peer-relay-tunneling'],
    version: '1.0.0',
    instance: fazmAgent
});

agentRegistry.register({
    name: figmaExporterAgent.name,
    description: figmaExporterAgent.description,
    queue: 'figma-exporter-queue',
    capabilities: ['figma-exporter', 'figma-automation', 'gui-operator', 'asset-export'],
    version: '1.0.0',
    instance: figmaExporterAgent
});

agentRegistry.register({
    name: researchPaperScraperAgent.name,
    description: researchPaperScraperAgent.description,
    queue: 'research-paper-scraper-queue',
    capabilities: ['research-paper-scraper', 'academic-scraping', 'browser-operator', 'web-automation'],
    version: '1.0.0',
    instance: researchPaperScraperAgent
});

agentRegistry.register({
    name: voiceDesktopLauncherAgent.name,
    description: voiceDesktopLauncherAgent.description,
    queue: 'voice-desktop-launcher-queue',
    capabilities: ['voice-desktop-launcher', 'desktop-automation', 'voice-intents', 'app-launching'],
    version: '1.0.0',
    instance: voiceDesktopLauncherAgent
});

agentRegistry.register({
    name: spreadsheetFormatterAgent.name,
    description: spreadsheetFormatterAgent.description,
    queue: 'spreadsheet-formatter-queue',
    capabilities: ['spreadsheet-formatter', 'spreadsheet-automation', 'gui-operator', 'layout-formatting'],
    version: '1.0.0',
    instance: spreadsheetFormatterAgent
});

agentRegistry.register({
    name: socialMediaMonitorAgent.name,
    description: socialMediaMonitorAgent.description,
    queue: 'social-media-monitor-queue',
    capabilities: ['social-media-monitor', 'social-monitoring', 'browser-operator', 'web-automation'],
    version: '1.0.0',
    instance: socialMediaMonitorAgent
});

agentRegistry.register({
    name: voiceMeetingMinuterAgent.name,
    description: voiceMeetingMinuterAgent.description,
    queue: 'voice-meeting-minuter-queue',
    capabilities: ['voice-meeting-minuter', 'meeting-transcription', 'voice-intents', 'meeting-minutes'],
    version: '1.0.0',
    instance: voiceMeetingMinuterAgent
});

agentRegistry.register({
    name: desktopFileOrganizerAgent.name,
    description: desktopFileOrganizerAgent.description,
    queue: 'desktop-file-organizer-queue',
    capabilities: ['desktop-file-organizer', 'file-automation', 'gui-operator', 'file-organization'],
    version: '1.0.0',
    instance: desktopFileOrganizerAgent
});

agentRegistry.register({
    name: webDependencyAuditorAgent.name,
    description: webDependencyAuditorAgent.description,
    queue: 'web-dependency-auditor-queue',
    capabilities: ['web-dependency-auditor', 'dependency-security-auditing', 'browser-operator', 'web-automation'],
    version: '1.0.0',
    instance: webDependencyAuditorAgent
});

agentRegistry.register({
    name: voiceEmailDictatorAgent.name,
    description: voiceEmailDictatorAgent.description,
    queue: 'voice-email-dictator-queue',
    capabilities: ['voice-email-dictator', 'email-formatting', 'voice-intents', 'email-drafting'],
    version: '1.0.0',
    instance: voiceEmailDictatorAgent
});

agentRegistry.register({
    name: systemPreferencesTunerAgent.name,
    description: systemPreferencesTunerAgent.description,
    queue: 'system-preferences-tuner-queue',
    capabilities: ['system-preferences-tuner', 'settings-gui-tuner', 'agent-s-navigation', 'system-configuration'],
    version: '1.0.0',
    instance: systemPreferencesTunerAgent
});

agentRegistry.register({
    name: webPriceTrackerAgent.name,
    description: webPriceTrackerAgent.description,
    queue: 'web-price-tracker-queue',
    capabilities: ['web-price-tracker', 'e-commerce-monitoring', 'browser-scraping', 'price-comparison'],
    version: '1.0.0',
    instance: webPriceTrackerAgent
});

agentRegistry.register({
    name: voiceCalendarSchedulerAgent.name,
    description: voiceCalendarSchedulerAgent.description,
    queue: 'voice-calendar-scheduler-queue',
    capabilities: ['voice-calendar-scheduler', 'vocal-scheduling-intent', 'calendar-automation', 'meeting-booking'],
    version: '1.0.0',
    instance: voiceCalendarSchedulerAgent
});

// ──── TIER 14: HIGH-VALUE ENTERPRISE B2B ────
agentRegistry.register({
    name: mulesoftAnypointAgent.name,
    description: mulesoftAnypointAgent.description,
    queue: 'mulesoft-anypoint-queue',
    capabilities: mulesoftAnypointAgent.capabilities || ['mulesoft'],
    version: '1.0.0',
    instance: mulesoftAnypointAgent
});

agentRegistry.register({
    name: servicenowItsmAgent.name,
    description: servicenowItsmAgent.description,
    queue: 'servicenow-itsm-queue',
    capabilities: servicenowItsmAgent.capabilities || ['servicenow'],
    version: '1.0.0',
    instance: servicenowItsmAgent
});

agentRegistry.register({
    name: soxItgcComplianceAgent.name,
    description: soxItgcComplianceAgent.description,
    queue: 'sox-itgc-queue',
    capabilities: soxItgcComplianceAgent.capabilities || ['sox'],
    version: '1.0.0',
    instance: soxItgcComplianceAgent
});

agentRegistry.register({
    name: as400RpgleModernizerAgent.name,
    description: as400RpgleModernizerAgent.description,
    queue: 'as400-modernizer-queue',
    capabilities: as400RpgleModernizerAgent.capabilities || ['as400'],
    version: '1.0.0',
    instance: as400RpgleModernizerAgent
});

agentRegistry.register({
    name: paloAltoPanosAgent.name,
    description: paloAltoPanosAgent.description,
    queue: 'palo-alto-queue',
    capabilities: paloAltoPanosAgent.capabilities || ['palo_alto'],
    version: '1.0.0',
    instance: paloAltoPanosAgent
});

agentRegistry.register({
    name: dynamics365ErpAgent.name,
    description: dynamics365ErpAgent.description,
    queue: 'dynamics-365-queue',
    capabilities: dynamics365ErpAgent.capabilities || ['dynamics_365'],
    version: '1.0.0',
    instance: dynamics365ErpAgent
});

agentRegistry.register({
    name: databricksSparkAgent.name,
    description: databricksSparkAgent.description,
    queue: 'databricks-spark-queue',
    capabilities: databricksSparkAgent.capabilities || ['databricks'],
    version: '1.0.0',
    instance: databricksSparkAgent
});

agentRegistry.register({
    name: uipathRpaBotAgent.name,
    description: uipathRpaBotAgent.description,
    queue: 'uipath-rpa-queue',
    capabilities: uipathRpaBotAgent.capabilities || ['uipath'],
    version: '1.0.0',
    instance: uipathRpaBotAgent
});

agentRegistry.register({
    name: intuneMdmPolicyAgent.name,
    description: intuneMdmPolicyAgent.description,
    queue: 'intune-mdm-queue',
    capabilities: intuneMdmPolicyAgent.capabilities || ['intune'],
    version: '1.0.0',
    instance: intuneMdmPolicyAgent
});

agentRegistry.register({
    name: peoplesoftHcmBridgeAgent.name,
    description: peoplesoftHcmBridgeAgent.description,
    queue: 'peoplesoft-hcm-queue',
    capabilities: peoplesoftHcmBridgeAgent.capabilities || ['peoplesoft'],
    version: '1.0.0',
    instance: peoplesoftHcmBridgeAgent
});

// ── Dynamic JSON-based Swarm Registry Loader ──
// Dynamically load polyglots and auto-generated agents from JSON database on start.
// This completely resolves V8 parsing delays, dropping startup times from minutes to <2 seconds.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
    const dynamicAgents = require('./polyglots_registry.json');
    for (const agent of dynamicAgents) {
        agentRegistry.register({ ...agent, silent: true });
    }
    logger.info(`⚡ Swarm Registry: Dynamically loaded ${dynamicAgents.length} auto-generated specialists from polyglots_registry.json.`);
} catch (err) {
    logger.error('❌ Failed to dynamically load dynamic agents:', err.message);
}

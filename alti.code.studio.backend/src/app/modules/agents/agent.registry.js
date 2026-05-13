/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Agent Registry — "The Nexus"
 * Central registration point for all AI agents.
 * Each agent declares its capabilities, and the system routes tasks accordingly.
 * Future agents just register here. The system scales infinitely.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class AgentRegistry {
    constructor() {
        /** @type {Map<string, AgentDefinition>} */
        this.agents = new Map();
        this.pluginsLoaded = false;
    }

    /**
     * Register an agent
     * @param {AgentDefinition} definition
     */
    register(definition) {
        if (this.agents.has(definition.name)) {
            logger.warn(`⚠️ AgentRegistry: Overwriting agent [${definition.name}]`);
        }
        this.agents.set(definition.name, {
            ...definition,
            registeredAt: new Date().toISOString()
        });
        logger.info(`🤖 AgentRegistry: Registered [${definition.name}] — ${definition.description}`);
    }

    /** Get a specific agent */
    get(name) {
        return this.agents.get(name);
    }

    /** List all registered agents */
    list() {
        return Array.from(this.agents.values());
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

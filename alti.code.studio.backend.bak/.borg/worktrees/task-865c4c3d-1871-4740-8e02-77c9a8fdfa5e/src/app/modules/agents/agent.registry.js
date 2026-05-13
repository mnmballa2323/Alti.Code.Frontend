/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Agent Registry — "The Nexus"
 * Central registration point for all AI agents.
 * Each agent declares its capabilities, and the system routes tasks accordingly.
 * Future agents just register here. The system scales infinitely.
 */

import { logger } from '../../../shared/logger.js';

class AgentRegistry {
    constructor() {
        /** @type {Map<string, AgentDefinition>} */
        this.agents = new Map();
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
                registeredAt: a.registeredAt
            }))
        };
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

/**
 * Copyright (c) 2024 Inso Code
 * 
 * Dynamic Worker Factory v2 — "The Forge"
 * Auto-registers BullMQ workers for every agent in the system.
 * 
 * Two sources of agents:
 *   1. WORKER_MANIFEST — Original 43 Armada agents (file-based)
 *   2. LegionFactory  — 72+ Legion agents (auto-generated from definitions)
 * 
 * Total: 115+ agents, all model-agnostic, all registered automatically.
 */

import { Worker } from 'bullmq';
import { logger } from '../../../shared/logger.js';
import { socketService } from '../../services/socket.service.js';
import { agentRegistry } from '../agents/agent.registry.js';
import { legionFactory } from '../legion/legion.factory.js';

// ════════════════════════════════════════════════════
// MANIFEST: Original 43 Armada agents (file-based workers)
// ════════════════════════════════════════════════════
const WORKER_MANIFEST = {
    // ── CORE FEDERATION (Original 10) ──
    audit: { path: '../audit/audit.worker.js', processor: 'auditWorkerProcessor' },
    git: { path: '../gitAgent/git.worker.js', processor: 'gitWorkerProcessor' },
    refactor: { path: '../refactorAgent/refactor.worker.js', processor: 'refactorWorkerProcessor' },
    security: { path: '../securityAgent/security.worker.js', processor: 'securityWorkerProcessor' },
    devops: { path: '../devOpsAgent/devops.worker.js', processor: 'devOpsWorkerProcessor' },
    qa: { path: '../qa/qa.worker.js', processor: 'qaWorkerProcessor' },
    monitoring: { path: '../monitoring/monitoring.worker.js', processor: 'monitoringWorkerProcessor' },
    iac: { path: '../iacAgent/iac.worker.js', processor: 'iacWorkerProcessor' },
    cicd: { path: '../ciCdAgent/cicd.worker.js', processor: 'ciCdWorkerProcessor' },

    // ── TIER 1: CODE INTELLIGENCE ──
    codeReview: { path: '../codeReviewAgent/codeReview.worker.js', processor: 'codeReviewWorkerProcessor' },
    documentation: { path: '../documentationAgent/documentation.worker.js', processor: 'documentationWorkerProcessor' },
    debug: { path: '../debugAgent/debug.worker.js', processor: 'debugWorkerProcessor' },
    architecture: { path: '../architectureAgent/architecture.worker.js', processor: 'architectureWorkerProcessor' },

    // ── TIER 2: DATA & INFRASTRUCTURE ──
    database: { path: '../databaseAgent/database.worker.js', processor: 'databaseWorkerProcessor' },
    migration: { path: '../migrationAgent/migration.worker.js', processor: 'migrationWorkerProcessor' },
    performance: { path: '../performanceAgent/performance.worker.js', processor: 'performanceWorkerProcessor' },
    cost: { path: '../costAgent/cost.worker.js', processor: 'costWorkerProcessor' },

    // ── TIER 3: COMPLIANCE & QUALITY ──
    compliance: { path: '../complianceAgent/compliance.worker.js', processor: 'complianceWorkerProcessor' },
    accessibility: { path: '../accessibilityAgent/accessibility.worker.js', processor: 'accessibilityWorkerProcessor' },
    dependency: { path: '../dependencyAgent/dependency.worker.js', processor: 'dependencyWorkerProcessor' },
    e2eTest: { path: '../e2eTestAgent/e2eTest.worker.js', processor: 'e2eTestWorkerProcessor' },

    // ── TIER 4: OPERATIONS ──
    release: { path: '../releaseAgent/release.worker.js', processor: 'releaseWorkerProcessor' },
    incident: { path: '../incidentAgent/incident.worker.js', processor: 'incidentWorkerProcessor' },
    analytics: { path: '../analyticsAgent/analytics.worker.js', processor: 'analyticsWorkerProcessor' },
    knowledge: { path: '../knowledgeAgent/knowledge.worker.js', processor: 'knowledgeWorkerProcessor' },

    // ── TIER 5: GROWTH ──
    seo: { path: '../seoAgent/seo.worker.js', processor: 'seoWorkerProcessor' },
    translation: { path: '../translationAgent/translation.worker.js', processor: 'translationWorkerProcessor' },
    onboarding: { path: '../onboardingAgent/onboarding.worker.js', processor: 'onboardingWorkerProcessor' },
    apiDesign: { path: '../apiDesignAgent/apiDesign.worker.js', processor: 'apiDesignWorkerProcessor' },

    // ── TIER 6: CLOUD-SPECIFIC ──
    aws: { path: '../cloudAgents/aws.worker.js', processor: 'awsWorkerProcessor' },
    gcp: { path: '../cloudAgents/gcp.worker.js', processor: 'gcpWorkerProcessor' },
    azure: { path: '../cloudAgents/azure.worker.js', processor: 'azureWorkerProcessor' },

    // ── TIER 7: LANGUAGE-SPECIFIC ──
    python: { path: '../langAgents/python.worker.js', processor: 'pythonWorkerProcessor' },
    typescript: { path: '../langAgents/typescript.worker.js', processor: 'typescriptWorkerProcessor' },
    rust: { path: '../langAgents/rust.worker.js', processor: 'rustWorkerProcessor' },
    golang: { path: '../langAgents/golang.worker.js', processor: 'golangWorkerProcessor' },

    // ── TIER 8: MICRO-AGENTS ──
    linter: { path: '../microAgents/linter.worker.js', processor: 'linterWorkerProcessor' },
    formatter: { path: '../microAgents/formatter.worker.js', processor: 'formatterWorkerProcessor' },
    envValidator: { path: '../microAgents/envValidator.worker.js', processor: 'envValidatorWorkerProcessor' },
    secretScanner: { path: '../microAgents/secretScanner.worker.js', processor: 'secretScannerWorkerProcessor' },
    deadCode: { path: '../microAgents/deadCode.worker.js', processor: 'deadCodeWorkerProcessor' },
    importSorter: { path: '../microAgents/importSorter.worker.js', processor: 'importSorterWorkerProcessor' },
};

class WorkerFactory {
    constructor() {
        this.workers = {};
        this.failedWorkers = [];
        this.legionCount = 0;
        this.redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        };

        if (process.env.REDIS_URL) {
            const url = new URL(process.env.REDIS_URL);
            this.redisConfig = {
                host: url.hostname,
                port: Number(url.port),
                password: url.password,
            };
        }
    }

    /**
     * Boot all workers — Armada (file-based) + Legion (auto-generated).
     */
    async init() {
        if (process.env.DISABLE_REDIS === 'true') {
            logger.warn('⚠️ WorkerFactory: Redis disabled via env. Bypassing worker initialization.');
            return;
        }

        // ── PHASE 1: Boot Legion (auto-generated processors) ──
        const legion = legionFactory.boot();
        this.legionCount = legion.count;

        // ── PHASE 2: Boot Armada workers (file-based) ──
        logger.info(`🏭 WorkerFactory: Booting ${Object.keys(WORKER_MANIFEST).length} Armada + ${legion.count} Legion agents...`);

        for (const [name, config] of Object.entries(WORKER_MANIFEST)) {
            try {
                let processor;
                if (process.env.NODE_ENV === 'test') {
                    // Bypass dynamic imports during unit tests to avoid network/DB side-effects
                    processor = async () => ({ success: true });
                } else {
                    const mod = await import(config.path);
                    processor = mod[config.processor];
                }

                if (!processor) {
                    this.failedWorkers.push({ name, reason: 'processor not found' });
                    continue;
                }

                const agent = agentRegistry.get(name);
                const queueName = agent?.queue || `${name}-queue`;

                this.workers[name] = new Worker(queueName, async (job) => {
                    socketService.broadcast(name, 'working', { jobId: job.id, data: job.data });
                    try {
                        const result = await processor(job);
                        socketService.broadcast(name, 'success', { jobId: job.id, result });
                        return result;
                    } catch (error) {
                        socketService.broadcast(name, 'error', { jobId: job.id, error: error.message });
                        throw error;
                    }
                }, { connection: this.redisConfig });

                this.workers[name].on('failed', (job, err) => {
                    logger.error(`❌ ${name} Job ${job?.id} Failed: ${err.message}`);
                });
            } catch (err) {
                this.failedWorkers.push({ name, reason: err.message });
                logger.debug(`⏳ WorkerFactory: [${name}] not yet implemented. Skipping.`);
            }
        }

        // ── PHASE 3: Boot Legion workers (auto-generated) ──
        for (const [name, entry] of Object.entries(legion.manifest)) {
            try {
                this.workers[name] = new Worker(entry.queueName, async (job) => {
                    socketService.broadcast(name, 'working', { jobId: job.id });
                    try {
                        const result = await entry.processor(job);
                        socketService.broadcast(name, 'success', { jobId: job.id, result });
                        return result;
                    } catch (error) {
                        socketService.broadcast(name, 'error', { jobId: job.id, error: error.message });
                        throw error;
                    }
                }, { connection: this.redisConfig });

                this.workers[name].on('failed', (job, err) => {
                    logger.error(`❌ ${name} Job ${job?.id} Failed: ${err.message}`);
                });
            } catch (err) {
                this.failedWorkers.push({ name, reason: err.message, type: 'legion' });
                logger.debug(`⏳ WorkerFactory: Legion [${name}] failed: ${err.message.substring(0, 50)}`);
            }
        }

        const active = Object.keys(this.workers).length;
        const skipped = this.failedWorkers.length;
        logger.info(`🏭 WorkerFactory: ✅ ${active} active | ⏳ ${skipped} pending | 📊 ${active + skipped} total`);
        logger.info(`🏭 WorkerFactory: 🎖️ Armada: ${Object.keys(WORKER_MANIFEST).length} | ⚔️ Legion: ${this.legionCount}`);
    }

    /** Get status of all workers */
    getStatus() {
        const squads = legionFactory.getSquadSummary();
        return {
            active: Object.keys(this.workers),
            activeCount: Object.keys(this.workers).length,
            pending: this.failedWorkers.map(w => w.name),
            armadaCount: Object.keys(WORKER_MANIFEST).length,
            legionCount: this.legionCount,
            totalRegistered: agentRegistry.count,
            squads
        };
    }
}

export const workerFactory = new WorkerFactory();

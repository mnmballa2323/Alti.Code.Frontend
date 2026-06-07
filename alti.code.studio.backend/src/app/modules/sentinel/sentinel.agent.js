/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Sentinel" - Security & Threat Detection Agent
 * Responsible for monitoring logs, analyzing threats, and triggering auto-remediation.
 */
import { EventBus } from '../../shared/eventBus.js';
import { logger } from '../../../shared/logger.js';
import { VectorMemory } from '../../shared/memory.js'; // Assuming this exists or will be mocked
import { aiProvider } from '../ai/ai.provider.js';
import { surgeonService } from '../surgeon/surgeon.service.js';
import { policyEngine } from '../governance/policy.engine.js';
import CircuitBreaker from 'opossum';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = util.promisify(exec);

class SentinelAgent {
    constructor() {
        this.isWatching = false;
        this.errorCount = 0;

        // Error Cache for Deduplication (Message -> Timestamp)
        this.errorCache = new Map();

        // Circuit Breaker Options
        const options = {
            timeout: 5000, // If AI takes > 5s, fail
            errorThresholdPercentage: 50, // If 50% of requests fail, open circuit
            resetTimeout: 30000 // Retry after 30s
        };

        // Initialize Circuit Breaker for AI Analysis
        this.breaker = new CircuitBreaker(async (prompt) => {
            return await aiProvider.reason(prompt);
        }, options);

        this.breaker.fallback(() => {
            return JSON.stringify({
                rootCause: "Circuit Breaker Open - AI Overload",
                filePath: null,
                isFixable: false,
                suggestedFix: "Manual investigation required. System under heavy load."
            });
        });

        this.breaker.on('open', () => logger.warn('🔥 Sentinel Circuit Breaker OPEN: Pausing AI Analysis'));
        this.breaker.on('close', () => logger.info('✅ Sentinel Circuit Breaker CLOSED: Resuming AI Analysis'));
    }

    /**
     * Start the log watcher (simulated subscription)
     */
    async startWatch() {
        if (this.isWatching) return { status: 'already_watching' };

        logger.info('👁️ Sentinel: Watchtower Activated');
        this.isWatching = true;

        // Subscribe to critical events
        // In a real system, these would be emitted by error handlers or auth middleware
        EventBus.subscribe('sys.log.error', this.handleSystemError.bind(this));
        EventBus.subscribe('guardian.audit.rejected', this.handleSecurityRefusal.bind(this));

        return { status: 'watching', message: 'Sentinel is now monitoring system events.' };
    }

    /**
     * Handle system errors and attempt diagnosis/fix
     * @param {object} data Error event data
     */
    async handleSystemError(data) {
        this.errorCount++;
        logger.warn(`👁️ Sentinel detected ERROR #${this.errorCount}: ${data.message}`);

        // Deduplication Check
        const errorKey = `${data.message}-${data.stack || ''}`;
        const now = Date.now();
        const lastSeen = this.errorCache.get(errorKey);

        // If seen in last 5 minutes, skip re-analysis
        if (lastSeen && (now - lastSeen < 5 * 60 * 1000)) {
            logger.info(`👁️ Sentinel: Skipping duplicate analysis for error: ${data.message.substring(0, 50)}...`);
            return { analysis: { rootCause: "Duplicate Error - Previously Analyzed" }, remediation: 'skipped' };
        }

        // Update cache
        this.errorCache.set(errorKey, now);

        try {
            const prompt = `
            You are "The Sentinel", an Automated Security & Reliability system.
            Analyze this error log:
            
            Error: ${data.message}
            Stack: ${data.stack || 'N/A'}
            
            Task:
            1. Identify root cause.
            2. Extract file path if possible.
            3. Determine if it's "Fixable" (code logic) or "System" (infra).
            
            OUTPUT JSON:
            {
                "rootCause": "string",
                "filePath": "string or null",
                "isFixable": boolean,
                "suggestedFix": "string"
            }
            `;

            // Execute via Circuit Breaker
            const response = await this.breaker.fire(prompt);
            const analysis = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);

            logger.info(`👁️ Sentinel Analysis: ${analysis.rootCause}`);

            if (analysis.isFixable && analysis.filePath) {
                logger.info(`👁️ Fixable error in ${analysis.filePath}. dispatching Surgeon...`);
                // Auto-remediation!
                const surgeryResult = await surgeonService.applyPattern(
                    analysis.filePath,
                    "Bug Fix",
                    `Fix this error: ${data.message}\nSuggestion: ${analysis.suggestedFix}`
                );
                return { analysis, surgeryResult, remediation: 'attempted' };
            }

            return { analysis, remediation: 'none' };

        } catch (err) {
            logger.error('👁️ Sentinel AI analysis failed', err);
            return { error: err.message };
        }
    }

    /**
     * Handle security refusals (e.g. from an Input Guard)
     * @param {object} data 
     */
    async handleSecurityRefusal(data) {
        logger.info(`👁️ Sentinel: Security Event - ${data.reasoning}`);
        // In a real app, we'd ban the IP or lock the user
        return { status: 'logged', level: 'warning' };
    }

    /**
     * Manual scan triggering (API exposed)
     */
    /**
     * Manual scan triggering (API exposed)
     */
    async scanSystem() {
        logger.info('👁️ Sentinel: Starting full system scan...');

        const vulnReport = await this.scanVulnerabilities();
        const complianceReport = await this.enforceCompliance();

        const status = (vulnReport.critical > 0 || complianceReport.violations.length > 0) ? 'THREATS_DETECTED' : 'CLEAN';

        return {
            status,
            vulnerabilities: vulnReport,
            compliance: complianceReport,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Run npm audit to check for CVEs
     */
    async scanVulnerabilities() {
        logger.info('👁️ Sentinel: Running Vulnerability Scan (npm audit)...');
        try {
            // npm audit returns non-zero exit code if vulnerabilities found, so we catch errors
            const { stdout } = await execAsync('npm audit --json').catch(e => e);

            if (!stdout) return { status: 'error', message: 'npm audit failed to produce output' };

            const auditResult = JSON.parse(stdout);
            const stats = auditResult.metadata?.vulnerabilities || {};

            logger.info(`👁️ Sentinel: Vulnerability Scan Complete. Critical: ${stats.critical || 0}, High: ${stats.high || 0}`);

            return {
                critical: stats.critical || 0,
                high: stats.high || 0,
                moderate: stats.moderate || 0,
                details: auditResult.advisories || auditResult.vulnerabilities || {} // layout varies by npm version
            };
        } catch (error) {
            logger.error('👁️ Sentinel: Vulnerability Scan Failed', error);
            return { error: error.message };
        }
    }

    /**
     * static code analysis for architectural compliance
     * Rule: Controllers should NOT import Models directly. They must use Services.
     */
    async enforceCompliance() {
        logger.info('👁️ Sentinel: Enforcing Architecture Compliance...');
        const violations = [];

        try {
            // Recursive walk to find controllers
            // Note: In a real large repo, use a proper glob library. 
            // For this focused agent, we'll scan the specific modules directory.
            const modulesDir = path.join(process.cwd(), 'src', 'app', 'modules');

            // Helper to walk directories
            async function getFiles(dir) {
                const dirents = await fs.readdir(dir, { withFileTypes: true });
                const files = await Promise.all(dirents.map((dirent) => {
                    const res = path.resolve(dir, dirent.name);
                    return dirent.isDirectory() ? getFiles(res) : res;
                }));
                return Array.prototype.concat(...files);
            }

            const allFiles = await getFiles(modulesDir);
            const controllers = allFiles.filter(f => f.endsWith('.controller.js'));

            for (const file of controllers) {
                const content = await fs.readFile(file, 'utf-8');

                // Rule 1: No direct Model imports (assuming models are named *.model.js or in models folder)
                // This is a heuristic.
                if (content.match(/import .* from .*model\.js/i) || content.match(/require\(.*model.*\)/i)) {
                    violations.push({
                        file: path.relative(process.cwd(), file),
                        rule: "NO_DIRECT_MODEL_IMPORT",
                        message: "Controller imports a Model directly. Must use Service layer."
                    });
                }

                // Rule 2: No direct DB calls (mongoose/sequelize signatures)
                if (content.includes('.find(') || content.includes('.findOne(')) {
                    // This is prone to false positives (arrays have .find), but good for a strict MVP sentinel check
                    // We can refine strictly if imports include mongoose/db
                    // For now, let's stick to import checks as they are robust.
                }
            }

            logger.info(`👁️ Sentinel: Compliance Scan Complete. Violations: ${violations.length}`);
            return {
                status: violations.length > 0 ? 'VIOLATION' : 'COMPLIANT',
                violations
            };

        } catch (error) {
            logger.error('👁️ Sentinel: Compliance Scan Failed', error);
            return { error: error.message };
        }
    }

    /**
     * Dynamically evaluate an agent's intended action against Enterprise Policies.
     * @param {string} agentName 
     * @param {string} action 
     * @param {object} metadata 
     * @returns {object} { allowed: boolean, violations: string[] }
     */
    async evaluateAgentAction(agentName, action, metadata) {
        logger.info(`👁️ Sentinel: Verifying ${agentName} action [${action}] against Enterprise Policy Engine...`);
        return await policyEngine.evaluateAction(agentName, action, metadata);
    }
}

export const sentinelAgent = new SentinelAgent();

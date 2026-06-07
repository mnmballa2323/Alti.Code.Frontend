/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

class DependencyAgent {
    /**
     * Run both `npm outdated` and `npm audit` and merge results into one report.
     * @returns {Promise<object>}
     */
    async audit() {
        logger.info('📡 Dependency Radar: Running full dependency audit...');

        const [outdatedResult, cveResult] = await Promise.all([
            this.auditOutdated(),
            this.auditSecurity(),
        ]);

        return {
            status: outdatedResult.status === 'OK' && cveResult.status === 'OK' ? 'OK' : 'ACTION_REQUIRED',
            outdated: outdatedResult,
            cve: cveResult,
        };
    }

    /**
     * Scan for outdated packages using `npm outdated --json` and classify them
     * into critical / major / minor with an AI-generated fix plan.
     * @returns {Promise<object>}
     */
    async auditOutdated() {
        logger.info('📡 Dependency Radar: Scanning for outdated packages...');
        let outdated = {};

        try {
            const { stdout } = await execAsync('npm outdated --json', { timeout: 30_000 }).catch(e => e);

            if (stdout) {
                outdated = JSON.parse(stdout);
            } else {
                return { status: 'OK', message: '✅ All dependencies are up to date.', critical: [], major: [], minor: [] };
            }
        } catch (error) {
            logger.warn('npm outdated failed or no network', error.message);
            return { status: 'ERROR', message: 'Could not run npm outdated.', error: error.message };
        }

        if (Object.keys(outdated).length === 0) {
            return { status: 'OK', message: '✅ All dependencies are up to date.', critical: [], major: [], minor: [] };
        }

        const prompt = `
        You are a Security & Infrastructure Engineer.
        Analyze this JSON of outdated npm packages from 'npm outdated --json'.
        
        Data: ${JSON.stringify(outdated, null, 2)}
        
        Task:
        1. Categorize updates into Critical (security/breaking fixes), Major (breaking changes likely), and Minor (safe features/patches).
        2. Create a "Fix Plan" which is an array of suggested commands.
        
        Output MUST be valid JSON with this schema:
        {
            "summary": "Brief 1-line summary",
            "critical": [ { "package": "name", "from": "v1", "to": "v2", "reason": "why critical" } ],
            "major": [ { "package": "name", "from": "v1", "to": "v2", "reason": "breaking risk" } ],
            "minor": [ { "package": "name", "from": "v1", "to": "v2" } ],
            "fixPlan": [ "npm install package@version", ... ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        try {
            const analysisStr = await GeminiAiService.generateContent(prompt);
            const cleanJson = analysisStr
                .replace(/^```json\n?/m, '')
                .replace(/^```\n?/m, '')
                .replace(/\n?```$/m, '')
                .trim();
            const analysis = JSON.parse(cleanJson);

            logger.info('✅ Outdated Dependency Analysis Complete');
            return { status: 'ACTION_REQUIRED', ...analysis };
        } catch (e) {
            logger.error('Dependency Analysis JSON Parse Failed', e);
            return {
                status: 'PARTIAL',
                message: `Found ${Object.keys(outdated).length} outdated packages, but AI analysis failed.`,
                rawOutdated: outdated,
            };
        }
    }

    /**
     * Run `npm audit --json` and parse published CVEs into a structured report.
     * @returns {Promise<object>}
     */
    async auditSecurity() {
        logger.info('🔐 Dependency Radar: Scanning for CVE vulnerabilities (npm audit)...');

        let auditJson = {};

        try {
            const { stdout } = await execAsync('npm audit --json', { timeout: 30_000 }).catch(e => e);

            if (stdout) {
                auditJson = JSON.parse(stdout);
            } else {
                return { status: 'OK', message: '✅ No known CVEs found.', critical: [], high: [], moderate: [], low: [], fixPlan: [] };
            }
        } catch (error) {
            logger.warn('npm audit failed', error.message);
            return { status: 'ERROR', message: 'Could not run npm audit.', error: error.message };
        }

        const vulns = auditJson.vulnerabilities ?? {};
        if (Object.keys(vulns).length === 0) {
            return { status: 'OK', message: '✅ No known CVEs found.', critical: [], high: [], moderate: [], low: [], fixPlan: [] };
        }

        const buckets = { critical: [], high: [], moderate: [], low: [] };
        const fixPlan = [];

        for (const [pkg, data] of Object.entries(vulns)) {
            const entry = {
                package: pkg,
                severity: data.severity,
                via: (data.via ?? []).filter(v => typeof v === 'object').map(v => v.title ?? v.url ?? ''),
                fixAvailable: !!data.fixAvailable,
            };

            const sev = data.severity ?? 'low';
            if (buckets[sev]) buckets[sev].push(entry);

            if (data.fixAvailable && (sev === 'critical' || sev === 'high')) {
                fixPlan.push(`npm audit fix${data.fixAvailable?.isSemVerMajor ? ' --force' : ''} # ${pkg}`);
            }
        }

        const totalVulns = Object.values(buckets).flat().length;
        logger.warn(`🔐 CVE Scan: ${totalVulns} vulnerabilities found (${buckets.critical.length} critical, ${buckets.high.length} high)`);

        return {
            status: 'ACTION_REQUIRED',
            summary: `${totalVulns} CVE(s) detected: ${buckets.critical.length} critical, ${buckets.high.length} high, ${buckets.moderate.length} moderate, ${buckets.low.length} low.`,
            ...buckets,
            fixPlan: [...new Set(fixPlan)], // deduplicate
        };
    }
    /**
     * Graph-compatible process() — runs the full audit and returns a graph step result.
     * @param {object} state
     * @returns {Promise<object>}
     */
    async process(state) {
        try {
            const report = await this.audit();
            return {
                ...state,
                status: report.status === 'OK' ? 'success' : 'action_required',
                results: [
                    ...(state.results ?? []),
                    `Dependency Audit: ${report.status} — CVE: ${report.cve?.summary ?? 'OK'}, Outdated: ${report.outdated?.summary ?? 'All current'}`,
                ],
            };
        } catch (err) {
            logger.error(`📡 DependencyAgent.process() failed: ${err.message}`);
            return {
                ...state,
                status: 'failed',
                error: err.message,
                results: [...(state.results ?? []), `❌ FAILED DependencyAgent: ${err.message}`],
            };
        }
    }
}

export const dependencyAgent = new DependencyAgent();

/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 3: COMPLIANCE & QUALITY
 * 
 * Dependency Agent — "The Guardian"
 * Dependency management, vulnerability patching, update planning.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const dependencyWorkerProcessor = async (job) => {
    const { packageJson, lockfile, vulnerabilities } = job.data;
    logger.info(`📦 Dependency [${job.id}]: Scanning dependencies...`);

    const result = await aiProvider.reason(`
You are a dependency management expert. Analyze dependencies for security, freshness, and compatibility.

package.json:
${JSON.stringify(packageJson || {}, null, 2)}

Known Vulnerabilities: ${JSON.stringify(vulnerabilities || [])}

Provide:
1. **Outdated** — Packages that need updating with latest versions
2. **Vulnerabilities** — CVEs and severity
3. **Breaking Changes** — Updates that would require code changes
4. **Unused** — Dependencies that appear unused
5. **Update Plan** — Safe update order

Respond in JSON: { "outdated": [], "vulnerabilities": [], "breakingChanges": [], "unused": [], "updatePlan": [] }
    `);

    return { dependencies: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

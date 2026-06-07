/**
 * Copyright (c) 2024 Inso Code — TIER 4: OPERATIONS
 * 
 * Release Agent — "The Commander"
 * Release management, semantic versioning, changelog generation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const releaseWorkerProcessor = async (job) => {
    const { commits, currentVersion, type } = job.data;
    logger.info(`🚀 Release [${job.id}]: Planning ${type || 'release'}...`);

    const plan = await aiProvider.generate(`
You are a release manager. Plan the next release based on recent commits.

Current Version: ${currentVersion || '1.0.0'}
Release Type Hint: ${type || 'auto-detect from commits'}
Recent Commits:
${JSON.stringify(commits || [])}

Provide:
1. **Next Version** — Following semver (major.minor.patch)
2. **Release Type** — major/minor/patch with justification
3. **Changelog** — Grouped by: Features, Fixes, Breaking Changes, Other
4. **Release Notes** — Human-readable summary
5. **Pre-release Checks** — What to verify before releasing

Respond in JSON: { "nextVersion": string, "type": string, "changelog": string, "releaseNotes": string, "checks": [] }
    `);

    return { release: JSON.parse(plan.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

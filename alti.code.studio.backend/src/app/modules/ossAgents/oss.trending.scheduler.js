/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * oss.trending.scheduler.js — Daily GitHub Trending Cron
 *
 * Runs at 02:00 UTC daily (when GitHub resets its trending counter).
 * On each tick:
 *   1. Scan GitHub Trending
 *   2. Diff against existing registry (skip known repos)
 *   3. Batch-create agents for all new trending repos (cap: OSS_BATCH_CAP, default 50)
 *
 * Also:
 *   - On boot, re-hot-loads all previously synthesized OSS agents into the router
 *   - Exposes triggerNow() and forceCreate(repoUrl) for the REST API
 *   - Emits SSE-compatible events on swarmBus
 */

import { logger } from '../../../shared/logger.js';
import { ossAgentFactory } from './oss.agent.factory.js';
import { ossAgentRegistry } from './oss.agent.registry.js';
import { gitHubTrendingService } from './github.trending.service.js';
import { swarmBus } from '../agents/self_expanding_swarm.service.js';
import { pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';

const OSS_AGENTS_DIR = path.join(process.cwd(), 'src/app/modules/agents/oss');

// Default cron: 02:00 UTC daily
const DEFAULT_CRON_INTERVAL_MS = 24 * 60 * 60 * 1000;

export class OssTrendingScheduler {
    constructor() {
        this.name = 'OssTrendingScheduler';
        this._timer = null;
        this._isRunning = false;
        this._lastScanAt = null;
        this._lastScanResults = null;
        this._scanHistory = []; // Last 7 scan summaries
        logger.info('📅 OssTrendingScheduler: Initialized');
    }

    /**
     * Boot sequence:
     *   1. Load registry from disk
     *   2. Re-hot-load all existing OSS agents into CapabilityRouter
     *   3. Start daily cron
     */
    async start() {
        logger.info('📅 OssTrendingScheduler: Starting…');

        // Load registry
        await ossAgentRegistry.load();

        // Re-hot-load all existing OSS agents from disk
        await this._rehydrateAgents();

        // Calculate ms until next 02:00 UTC
        const msUntilNextRun = this._msUntilNextScheduledRun();
        logger.info(`📅 OssTrendingScheduler: First scan in ${Math.round(msUntilNextRun / 60000)} min`);

        // Run immediately on first start if no agents exist yet (fresh install)
        const stats = ossAgentRegistry.getStats();
        if (stats.total === 0) {
            logger.info('📅 OssTrendingScheduler: No existing OSS agents — running seed scan now…');
            setTimeout(() => this._runScan('seed').catch(e => logger.error('OssTrendingScheduler seed error:', e)), 5000);
        }

        // Schedule daily runs
        this._timer = setTimeout(() => this._scheduleDailyCron(), msUntilNextRun);

        this._isRunning = true;
        logger.info('📅 OssTrendingScheduler: Started ✅');
    }

    /** Stop the scheduler. */
    stop() {
        if (this._timer) {
            clearTimeout(this._timer);
            clearInterval(this._timer);
            this._timer = null;
        }
        this._isRunning = false;
        logger.info('📅 OssTrendingScheduler: Stopped');
    }

    /**
     * Manually trigger a scan immediately (used by REST API).
     * @param {string} [language] - Optional language filter
     * @returns {Promise<Object>} scan result summary
     */
    async triggerNow(language = '') {
        logger.info('📅 OssTrendingScheduler: Manual trigger requested');
        return this._runScan('manual', language);
    }

    /**
     * Force-create an agent for any specific GitHub repo URL on demand.
     * @param {string} repoUrl - e.g. 'https://github.com/facebook/react'
     * @returns {Promise<Object>} creation result
     */
    async forceCreate(repoUrl) {
        // Parse owner/name from URL
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
        if (!match) throw new Error(`Invalid GitHub repo URL: ${repoUrl}`);

        const [, owner, name] = match;
        const slug = `${owner}/${name.replace(/\.git$/, '')}`;

        logger.info(`📅 OssTrendingScheduler: Force-create for ${slug}`);

        // Build a minimal TrendingRepo from the URL
        const readme = await gitHubTrendingService.fetchReadme(slug).catch(() => '');
        const repo = {
            slug,
            fullName: slug,
            owner,
            name: name.replace(/\.git$/, ''),
            description: '',
            url: `https://github.com/${slug}`,
            language: 'Unknown',
            stars: 0,
            starsToday: 0,
            topics: [],
            readme,
        };

        return ossAgentFactory.createAgentForRepo(repo);
    }

    /**
     * Get current scheduler status.
     */
    getStatus() {
        const stats = ossAgentRegistry.getStats();
        return {
            isRunning: this._isRunning,
            lastScanAt: this._lastScanAt,
            lastScanResults: this._lastScanResults,
            scanHistory: this._scanHistory.slice(-7),
            registry: stats,
        };
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _scheduleDailyCron() {
        this._runScan('scheduled').catch(e => logger.error('OssTrendingScheduler cron error:', e));
        // Set interval for subsequent daily runs
        this._timer = setInterval(() => {
            this._runScan('scheduled').catch(e => logger.error('OssTrendingScheduler cron error:', e));
        }, DEFAULT_CRON_INTERVAL_MS);
    }

    async _runScan(trigger = 'scheduled', language = '') {
        logger.info(`📅 OssTrendingScheduler: Scan started (trigger=${trigger}, language=${language || 'all'})`);
        const scanId = Date.now().toString(36);

        swarmBus.emit('oss:scan_started', {
            scanId,
            trigger,
            language,
            timestamp: new Date().toISOString(),
        });

        let newReposFound = 0;
        let created = 0;
        let errors = 0;

        try {
            // Step 1: Fetch trending repos
            const trending = await gitHubTrendingService.scanTrending(language);
            const knownSlugs = ossAgentRegistry.getAllSlugs();
            const newRepos = trending.filter(r => !knownSlugs.includes(r.slug));
            newReposFound = newRepos.length;

            swarmBus.emit('oss:scan_repos_found', {
                scanId,
                total: trending.length,
                newCount: newRepos.length,
                repos: newRepos.map(r => ({ slug: r.slug, stars: r.stars, language: r.language })),
            });

            logger.info(`📅 OssTrendingScheduler: ${trending.length} trending, ${newRepos.length} new → creating agents…`);

            // Step 2: Batch-create agents for new repos
            const results = await ossAgentFactory.createBatch(newRepos);
            created = results.filter(r => r.status === 'created').length;
            errors = results.filter(r => r.status === 'failed').length;

        } catch (err) {
            logger.error(`📅 OssTrendingScheduler: Scan failed — ${err.message}`);
            errors++;
        }

        const summary = {
            scanId,
            trigger,
            language: language || 'all',
            timestamp: new Date().toISOString(),
            newReposFound,
            agentsCreated: created,
            errors,
            totalAgents: ossAgentRegistry.getStats().total,
        };

        this._lastScanAt = summary.timestamp;
        this._lastScanResults = summary;
        this._scanHistory.push(summary);
        if (this._scanHistory.length > 100) this._scanHistory.shift();

        swarmBus.emit('oss:scan_done', summary);
        logger.info(`📅 OssTrendingScheduler: Scan done — created=${created}, errors=${errors}, total=${summary.totalAgents}`);

        return summary;
    }

    /**
     * On startup, re-hot-load all previously synthesized OSS agents from disk.
     * This re-registers them in the CapabilityRouter without re-synthesizing.
     */
    async _rehydrateAgents() {
        const records = ossAgentRegistry.list({ limit: 10000 });
        if (records.length === 0) return;

        logger.info(`📅 OssTrendingScheduler: Re-hydrating ${records.length} OSS agents into router…`);
        let loaded = 0;
        let failed = 0;

        for (const record of records) {
            try {
                const filePath = record.filePath;
                // Check file exists
                await fs.access(filePath);
                const fileUrl = pathToFileURL(filePath).href + `?boot=${Date.now()}`;
                const mod = await import(/* @vite-ignore */ fileUrl);
                const agentInstance = Object.values(mod).find(
                    v => v && typeof v === 'object' && typeof v.consult === 'function'
                );
                if (agentInstance) {
                    swarmBus.emit('swarm:agent_hotload', {
                        agentInstance,
                        keywords: record.keywords || [],
                    });
                    loaded++;
                }
            } catch {
                // File deleted or syntax error — skip silently
                failed++;
            }
        }

        logger.info(`📅 OssTrendingScheduler: Rehydrated ${loaded} agents (${failed} missing files skipped)`);
        swarmBus.emit('oss:rehydrated', { loaded, failed, total: records.length });
    }

    /**
     * Calculate milliseconds until next 02:00 UTC.
     */
    _msUntilNextScheduledRun() {
        const now = new Date();
        const next = new Date(now);
        next.setUTCHours(2, 0, 0, 0);
        if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
        return next.getTime() - now.getTime();
    }
}

export const ossTrendingScheduler = new OssTrendingScheduler();

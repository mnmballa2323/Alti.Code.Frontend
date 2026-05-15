/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Omni-Cloud Ingestion Engine
 * Massively overhauls the AI's Cloud knowledge by autonomously syncing every single
 * Open-Source repository from AWS, GCP, and Azure that strictly adheres to the
 * MIT or Apache 2.0 Hard Law licenses.
 */

import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import cron from 'node-cron';
import { capabilityRouter } from './capability.router.js';
import { CORE_OMNI_CLOUD_PROVIDERS } from '../cloudAgents/core_providers.const.js';
import { redisClient } from '../../../shared/redis.client.js';
import { cloudSecretService } from '../security/cloud_secret.service.js';
import { hermesAgentBridge } from './hermes.agent.js';

class OmniCloudIngestionService {
    constructor() {
        this.name = 'OmniCloudIngestionService';
        this.isActive = false;
        this.targetOrgs = CORE_OMNI_CLOUD_PROVIDERS;
        this.approvedLicenses = ['mit', 'apache-2.0'];
        this.githubToken = null;
    }

    async init() {
        this.githubToken = await cloudSecretService.getSecret('GITHUB_PAT');
        
        if (!this.githubToken) {
            logger.warn('⚠️ [Omni-Cloud Ingestion] Missing GITHUB_PAT in Secret Manager or env. Massive Overhaul disabled.');
            return;
        }

        logger.info('🌌 [Omni-Cloud Ingestion] Initialized. Beginning strict MIT/Apache 2.0 sync for AWS, GCP, and Azure...');

        // Schedule to run weekly for continuous updates
        cron.schedule('0 0 * * 0', () => {
            this.syncOmniCloud();
        });

        this.isActive = true;
    }

    async syncOmniCloud() {
        if (!this.isActive || !this.githubToken) return;

        // Ensure only one pod/instance performs the sync using a distributed lock
        const lockKey = 'omnicloud:ingestion:lock';
        const lockAcquired = await redisClient.setnx(lockKey, 'locked', 3600); // 1-hour lock

        if (!lockAcquired) {
            logger.info('🌌 [Omni-Cloud Ingestion] Sync already in progress by another node. Skipping.');
            return;
        }

        logger.info('🌌 [Omni-Cloud Ingestion] Starting massive multi-cloud repository scan...');
        let totalIngested = 0;

        try {
            for (const org of this.targetOrgs) {
                logger.info(`🔍 [Omni-Cloud Ingestion] Scanning organization: ${org}`);
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    try {
                        // Fetch repositories for the organization
                        const response = await axios.get(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`, {
                            headers: {
                                'Authorization': `token ${this.githubToken}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });

                        const repos = response.data;
                        if (repos.length === 0) {
                            hasMore = false;
                            break;
                        }

                        for (const repo of repos) {
                            const repoKey = `omnicloud:repo:${repo.full_name}`;
                            const isProcessed = await redisClient.get(repoKey);

                            if (isProcessed) continue;

                            // Strict License Verification (Hard Law)
                            if (!repo.license || !repo.license.key) {
                                continue; // No license found
                            }

                            const licenseKey = repo.license.key.toLowerCase();
                            if (!this.approvedLicenses.includes(licenseKey)) {
                                // Reject mixtures or non-compliant licenses (e.g., GPL, BSD)
                                continue; 
                            }

                            // Mark as processed immediately to prevent duplicate dispatch
                            await redisClient.setnx(repoKey, '1');

                            // Repository is compliant! Trigger autonomous ingestion via SwarmBrain
                            logger.info(`✅ [Omni-Cloud Ingestion] Compliant Repo Found: ${repo.full_name} (${licenseKey.toUpperCase()})`);
                            
                            const prompt = `Omni-Cloud Directive: Autonomously clone, parse, and generate AST/Vector embeddings for the following strictly compliant Cloud repository: ${repo.clone_url}. \nThis will feed the Alti Code Studio "Cloud" graph.`;

                            const contextData = {
                                source: "OMNI_CLOUD_INGESTION",
                                repository: repo.full_name,
                                cloneUrl: repo.clone_url,
                                license: licenseKey,
                                stars: repo.stargazers_count,
                                timestamp: Date.now()
                            };

                            // Dispatch to the AI Engine for heavy-duty Graph/AST ingestion
                            // Fire and forget to avoid blocking the crawler
                            capabilityRouter.dispatch(prompt, [contextData]).catch(e => {
                                logger.error(`[Omni-Cloud] Failed to dispatch ingestion for ${repo.full_name}: ${e.message}`);
                            });

                            // Autonomous Deep Audit Trigger for High-Value (Tier 1) Repos
                            if (repo.stargazers_count > 10000) {
                                logger.info(`🔥 [Hermes] Triggering Deep Sovereign Audit for Tier 1 Cloud Repo: ${repo.full_name}`);
                                const hermesPrompt = `Conduct a Sovereign Cloud Security Audit for ${repo.clone_url}. Analyze its IaC definitions for GCP/Vertex AI compliance and generate an executive summary.`;
                                hermesAgentBridge.executeTask(hermesPrompt).catch(e => {
                                    logger.error(`[Hermes] Failed to execute deep audit for ${repo.full_name}: ${e.message}`);
                                });
                            }

                            totalIngested++;
                            
                            // Prevent GitHub rate limits during massive overhaul
                            await new Promise(r => setTimeout(r, 1000));
                        }

                        page++;
                    } catch (error) {
                        logger.error(`❌ [Omni-Cloud Ingestion] Failed scanning ${org} on page ${page}: ${error.message}`);
                        hasMore = false; // Stop this org on failure
                    }
                }
            }
        } finally {
            // Optional: release the lock early if finished
            await redisClient.del(lockKey);
        }

        logger.info(`🌌 [Omni-Cloud Ingestion] Massive Overhaul Sync Complete. Dispatched ${totalIngested} compliant repositories to the Swarm.`);
    }
}

export const omniCloudIngestionService = new OmniCloudIngestionService();

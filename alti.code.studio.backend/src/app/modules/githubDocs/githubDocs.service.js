import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import cron from 'node-cron';
import crypto from 'crypto';
import { ragService } from '../memory/rag.service.js';
import { agentMemoryService } from '../memory/agentmemory.service.js';

class GithubDocsService {
    constructor() {
        this.name = 'GithubDocsService';
        this.status = 'idle'; // 'idle', 'syncing', 'completed', 'failed'
        this.totalArticles = 0;
        this.syncedArticles = 0;
        this.failedArticles = 0;
        this.lastSyncTime = null;
        this.syncError = null;
        this.cancelRequested = false;

        // Ingestion caching layer to avoid duplicate RAG vector writes
        this.hashCache = new Map();

        // Throttling configurations
        this.batchSize = 5;
        this.delayBetweenBatchesMs = 1000;
    }

    /**
     * Initializer: Registers the cron job schedule to run weekly
     */
    init() {
        logger.info('🪐 [GitHub Docs] Initializing GitHub Developer Docs Service...');
        
        // Cron: every Sunday at midnight
        cron.schedule('0 0 * * 0', () => {
            this.syncDocs().catch(err => logger.error(`[GitHub Docs] Weekly sync failed: ${err.message}`));
        });
        
        logger.info('🪐 [GitHub Docs] Initialized. Weekly schedule is active.');
    }

    /**
     * Fetch all article paths from GitHub Page List API
     */
    async fetchPageList() {
        logger.info('[GitHub Docs] Fetching complete documentation page list...');
        const response = await axios.get('https://docs.github.com/api/pagelist/en/free-pro-team@latest', {
            timeout: 15000
        });
        if (typeof response.data !== 'string') {
            throw new Error('Invalid response format received from Page List API.');
        }
        // Split by newline and filter out empty paths or non-english articles
        const paths = response.data
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0 && p.startsWith('/en'));
        return paths;
    }

    /**
     * Ingest a single article by path, optimized via MD5 caching
     */
    async ingestArticle(pathName) {
        try {
            const articleUrl = `https://docs.github.com/api/article/body?pathname=${pathName}`;
            const response = await axios.get(articleUrl, { timeout: 10000 });
            const markdownContent = response.data;

            if (!markdownContent || typeof markdownContent !== 'string' || markdownContent.trim().length === 0) {
                this.failedArticles++;
                return;
            }

            // Production Optimization: check if article has changed
            const contentHash = crypto.createHash('md5').update(markdownContent).digest('hex');
            if (this.hashCache.get(pathName) === contentHash) {
                logger.info(`🪐 [GitHub Docs] Skipping unchanged article indexing: ${pathName}`);
                this.syncedArticles++;
                return;
            }

            const title = pathName.split('/').pop().replace(/-/g, ' ');
            const chunks = markdownContent.split('\n\n').filter(c => c.trim().length > 10);

            // Index into core local RAG vector store
            await ragService.createIndex(chunks, {
                source: 'github_docs',
                pathname: pathName,
                title: title,
                filename: `github_docs_${pathName.replace(/\//g, '_')}.md`
            });

            // Index into stand-alone AgentMemory if active
            if (agentMemoryService.isReady) {
                await agentMemoryService.remember({
                    content: markdownContent,
                    type: 'github_docs',
                    tags: ['github', 'developer', 'docs', pathName]
                });
            }

            // Save hash
            this.hashCache.set(pathName, contentHash);
            this.syncedArticles++;
        } catch (error) {
            this.failedArticles++;
            logger.warn(`[GitHub Docs] Failed to ingest article ${pathName}: ${error.message}`);
        }
    }

    /**
     * Start the complete ingestion and sync cycle
     */
    async syncDocs() {
        if (this.status === 'syncing') {
            logger.warn('[GitHub Docs] Sync already in progress.');
            return { status: 'already_syncing' };
        }

        logger.info('🪐 [GitHub Docs] Starting full developer documentation sync...');
        this.status = 'syncing';
        this.syncedArticles = 0;
        this.failedArticles = 0;
        this.totalArticles = 0;
        this.syncError = null;
        this.cancelRequested = false;

        try {
            const paths = await this.fetchPageList();
            this.totalArticles = paths.length;
            logger.info(`🪐 [GitHub Docs] Found ${this.totalArticles} articles to ingest.`);

            // Ingest in batches to handle rate limits gracefully
            for (let i = 0; i < paths.length; i += this.batchSize) {
                if (this.cancelRequested) {
                    logger.info('[GitHub Docs] Sync cancellation requested. Aborting.');
                    this.status = 'idle';
                    return { status: 'cancelled' };
                }

                const batch = paths.slice(i, i + this.batchSize);
                logger.info(`🪐 [GitHub Docs] Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(this.totalArticles / this.batchSize)}...`);

                await Promise.all(batch.map(p => this.ingestArticle(p)));

                // Sleep between batches
                await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatchesMs));
            }

            this.status = 'completed';
            this.lastSyncTime = new Date().toISOString();
            logger.info(`🪐 [GitHub Docs] Documentation sync completed. Synced: ${this.syncedArticles}, Failed: ${this.failedArticles}.`);
        } catch (error) {
            this.status = 'failed';
            this.syncError = error.message;
            logger.error(`🪐 [GitHub Docs] Documentation sync failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Query ingested documentation chunks
     */
    async searchDocs(query, limit = 5) {
        logger.info(`🪐 [GitHub Docs] Searching GitHub Documentation RAG for: "${query}"`);
        // Leverage the core RAG service query capability
        return await ragService.query(query, limit);
    }

    /**
     * Dispatch a user query dynamically to the correct specialist in our GitHub Swarm.
     * @param {string} query
     * @param {string} [preferredAgentId] - Manually override the router and target a specific agent
     * @returns {Promise<object>} - Telemetry wrapped specialist consultation response
     */
    async dispatchQueryToSwarm(query, preferredAgentId = null) {
        const { agentRegistry } = await import('../agents/agent.registry.js');
        await agentRegistry.loadPlugins();

        let agentId = preferredAgentId;

        // If no preferred agent, automatically route using semantic capability matching rules
        if (!agentId) {
            const lowerQuery = query.toLowerCase();
            const allAgents = agentRegistry.list();
            
            let bestAgentId = null;
            let highestMatchScore = 0;

            // 1. Dynamic precision capability and keyword mapping over all registered specialist plugins
            for (const agent of allAgents) {
                if (agent.isPlugin && agent.name.toLowerCase().startsWith('github')) {
                    let score = 0;
                    
                    // Match by granular capabilities (e.g. github-create-repository)
                    let maxCapScore = 0;
                    if (agent.capabilities && agent.capabilities.length > 0) {
                        for (const cap of agent.capabilities) {
                            const capClean = cap.replace(/-/g, ' ');
                            const words = capClean.split(' ').filter(w => w !== 'github');
                            
                            // Score for this specific capability
                            const matchedWords = words.filter(word => new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery));
                            if (matchedWords.length > 0) {
                                const capScore = 10 * matchedWords.length;
                                if (capScore > maxCapScore) {
                                    maxCapScore = capScore;
                                }
                            }
                        }
                    }
                    score += maxCapScore;
                    
                    // Match by CamelCase Agent Name (e.g. githubRepoCreator)
                    const idClean = agent.name.replace(/github/i, '').replace(/([A-Z])/g, ' $1').toLowerCase();
                    const idWords = idClean.split(' ').filter(w => w.trim().length > 0);
                    const matchedIdWords = idWords.filter(word => new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuery));
                    if (matchedIdWords.length > 0) {
                        score += 5 * matchedIdWords.length;
                    }

                    if (score > highestMatchScore) {
                        highestMatchScore = score;
                        bestAgentId = agent.name;
                    }
                }
            }

            if (bestAgentId && highestMatchScore >= 5) {
                agentId = bestAgentId;
                logger.info(`🪐 [GitHub Docs Gateway] Dynamic semantic match routed query to granular agent: [${agentId}] (Score: ${highestMatchScore})`);
            } else {
                // 2. High-Level Regex Fallback Router to 8 Primary Swarm Nodes
                if (/\b(actions?|workflows?|yaml|runners?|ci\/cd)\b/i.test(query)) {
                    agentId = 'githubActionsSpecialist';
                } else if (/\b(apps?|oauth|webhooks?|security|permissions?|secrets?)\b/i.test(query)) {
                    agentId = 'githubAppAuditor';
                } else if (/\b(projects?|discussions?|issues?|codeowners?|templates?)\b/i.test(query)) {
                    agentId = 'githubProjectsManager';
                } else if (/\b(enterprise|governance|polic(y|ies)|saml|scim|sso|organizations?|audit log)\b/i.test(query)) {
                    agentId = 'githubEnterpriseAuditor';
                } else if (/\b(packages?|containers?|ghcr|docker|maven|npm|registries|registry)\b/i.test(query)) {
                    agentId = 'githubPackagesRegistry';
                } else if (/\b(gists?|snippets?|scratchpads?|embeds?)\b/i.test(query)) {
                    agentId = 'githubGistDeveloper';
                } else if (/\b(copilot|extensions?|sse|chat schema)\b/i.test(query)) {
                    agentId = 'githubCopilotEngineer';
                } else {
                    // Fallback to central coordinator
                    agentId = 'githubExpert';
                }
            }
        }

        const agentDef = agentRegistry.get(agentId);
        if (!agentDef || !agentDef.instance) {
            throw new Error(`The requested GitHub Swarm agent [${agentId}] is not registered or loaded.`);
        }

        logger.info(`🪐 [GitHub Docs Gateway] Dispatching query to specialist agent: [${agentId}]`);
        return await agentDef.instance.consult(query, []);
    }

    /**
     * Cancel an active sync process
     */
    cancelSync() {
        if (this.status === 'syncing') {
            this.cancelRequested = true;
            return true;
        }
        return false;
    }

    /**
     * Get real-time status of the service
     */
    getStatus() {
        return {
            status: this.status,
            totalArticles: this.totalArticles,
            syncedArticles: this.syncedArticles,
            failedArticles: this.failedArticles,
            lastSyncTime: this.lastSyncTime,
            syncError: this.syncError,
            progress: this.totalArticles > 0 ? ((this.syncedArticles + this.failedArticles) / this.totalArticles * 100).toFixed(2) : '0.00'
        };
    }
}

export const githubDocsService = new GithubDocsService();

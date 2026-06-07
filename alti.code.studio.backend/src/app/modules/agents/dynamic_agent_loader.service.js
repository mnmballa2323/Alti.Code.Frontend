import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from './capability.router.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';

class DynamicAgent extends BaseSpecialistAgent {
    constructor(config) {
        super(config.name, config.title || config.name, config.tier || 'Tier 21: Custom Creation');
        this.description = config.description || '';
        this.preamble = config.preamble || '';
    }
}

class DynamicAgentLoaderService {
    constructor() {
        this.name = 'DynamicAgentLoaderService';
        this.customDir = path.resolve(process.cwd(), 'src/app/modules/agents/custom');
        this.loadedAgents = new Set();
    }

    init() {
        logger.info('🧬 DynamicAgentLoaderService: Initializing hot-reload capabilities...');

        // Ensure directory exists
        if (!fs.existsSync(this.customDir)) {
            fs.mkdirSync(this.customDir, { recursive: true });
        }

        // Load existing
        this.loadAll();

        // Watch for new custom agents forged by the UI
        fs.watch(this.customDir, (eventType, filename) => {
            if (filename && filename.endsWith('.json')) {
                // Throttle/debounce for save events
                setTimeout(() => this.loadCustomAgent(filename), 500);
            }
        });
    }

    async loadAll() {
        try {
            const files = fs.readdirSync(this.customDir);
            let jsonFiles = files.filter(file => file.endsWith('.json'));
            
            logger.info(`[Dynamic Loader] Found ${jsonFiles.length} agents on disk. Beginning bulk hydration...`);
            
            if (process.env.NODE_ENV !== 'production' && jsonFiles.length > 50) {
                logger.info(`⚠️ [Dynamic Loader] Local Dev Optimization: Limiting bulk hydration to 50 agents (out of ${jsonFiles.length}) to prevent startup block.`);
                jsonFiles = jsonFiles.slice(0, 50);
            }
            
            const BATCH_SIZE = 50;
            for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
                const batch = jsonFiles.slice(i, i + BATCH_SIZE);
                const promises = batch.map(file => this.loadCustomAgent(file).catch(e => {
                    logger.warn(`Failed to hydrate ${file}: ${e.message}`);
                }));
                
                await Promise.all(promises);
                if (i % 500 === 0 && i > 0) {
                    logger.info(`🚀 [Dynamic Loader] Hydrated ${i} out of ${jsonFiles.length} agents...`);
                }
            }
            logger.info(`✅ [Dynamic Loader] Massive Hydration Complete: Successfully mounted ${this.loadedAgents.size} agents.`);
        } catch (e) {
            logger.warn(`Failed to read custom agents directory: ${e.message}`);
        }
    }

    async loadCustomAgent(filename) {
        try {
            const filePath = path.join(this.customDir, filename);
            if (!fs.existsSync(filePath)) return;

            const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const agentName = config.name;

            // Avoid duplicate registration if just modified slightly
            if (this.loadedAgents.has(agentName)) {
                logger.info(`[Dynamic Loader] Updating logic for existing agent: ${agentName}`);
                // In a perfect system, we'd update the router. For now we just let capabilityRouter re-register 
                // and prioritize the new instance scoring.
            }

            let customAgentInstance = null;
            const jsFilePath = filePath.replace('.json', '.agent.js');
            
            if (fs.existsSync(jsFilePath)) {
                try {
                    const moduleUrl = `file://${jsFilePath}`;
                    const module = await import(moduleUrl);
                    
                    // Retrieve the exported class instance
                    const exportedKey = Object.keys(module).find(k => module[k] && typeof module[k] === 'object');
                    if (exportedKey) {
                        customAgentInstance = module[exportedKey];
                        logger.info(`✅ Successfully loaded native logic for [${agentName}]`);
                    }
                } catch (importErr) {
                    logger.warn(`Failed to load native JS for [${agentName}], falling back to JSON stub. Error: ${importErr.message}`);
                }
            }

            // Fallback to JSON stub if JS loading failed or file doesn't exist
            if (!customAgentInstance) {
                customAgentInstance = new DynamicAgent(config);
            }

            // Phase 45: Dynamically inject into capability router
            capabilityRouter.registerAgent(customAgentInstance, config.keywords || []);

            this.loadedAgents.add(agentName);
            logger.info(`✨ Genesis Protocol: Dynamically ingested [${agentName}] into Swarm Capability Router.`);

        } catch (e) {
            logger.error(`[Dynamic Loader] Failed to parse custom agent ${filename}: ${e.message}`);
        }
    }
}

export const dynamicAgentLoaderService = new DynamicAgentLoaderService();

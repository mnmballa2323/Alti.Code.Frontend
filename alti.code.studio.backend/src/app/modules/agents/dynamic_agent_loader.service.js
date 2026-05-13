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

    loadAll() {
        try {
            const files = fs.readdirSync(this.customDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    this.loadCustomAgent(file);
                }
            }
        } catch (e) {
            logger.warn(`Failed to read custom agents directory: ${e.message}`);
        }
    }

    loadCustomAgent(filename) {
        try {
            const filePath = path.join(this.customDir, filename);
            if (!fs.existsSync(filePath)) return;

            const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Avoid duplicate registration if just modified slightly
            if (this.loadedAgents.has(config.name)) {
                logger.info(`[Dynamic Loader] Updating logic for existing agent: ${config.name}`);
                // In a perfect system, we'd update the router. For now we just let capabilityRouter re-register 
                // and prioritize the new instance scoring.
            }

            const customAgentInstance = new DynamicAgent(config);

            // Phase 45: Dynamically inject into capability router
            capabilityRouter.registerAgent(customAgentInstance, config.keywords || []);

            this.loadedAgents.add(config.name);
            logger.info(`✨ Genesis Protocol: Dynamically ingested [${config.name}] into Swarm Capability Router.`);

        } catch (e) {
            logger.error(`[Dynamic Loader] Failed to parse custom agent ${filename}: ${e.message}`);
        }
    }
}

export const dynamicAgentLoaderService = new DynamicAgentLoaderService();

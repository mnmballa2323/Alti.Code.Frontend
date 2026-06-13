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
            // Find all .json agent configs recursively using find command
            const { execSync } = require('child_process');
            let jsonFiles = [];
            try {
                const output = execSync(`find ${this.customDir} -name "*.json"`, { encoding: 'utf8' });
                jsonFiles = output.split('\\n').filter(Boolean);
            } catch (err) {
                logger.warn(`Fallback to readdirSync: ${err.message}`);
                jsonFiles = fs.readdirSync(this.customDir).filter(file => file.endsWith('.json')).map(f => path.join(this.customDir, f));
            }
            
            logger.info(`[Dynamic Loader] Found ${jsonFiles.length} agents on disk. Beginning lightweight indexing...`);
            
            // Build the registry purely in memory (names -> paths)
            this.agentRegistry = new Map();
            
            for (let i = 0; i < jsonFiles.length; i++) {
                const filePath = jsonFiles[i];
                const filename = path.basename(filePath);
                try {
                    // Extract agent name statically without running any logic
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const config = JSON.parse(content);
                    if (config && config.name) {
                        this.agentRegistry.set(config.name, {
                            configPath: filePath,
                            logicPath: filePath.replace('.json', '.agent.js')
                        });
                        this.loadedAgents.add(config.name);
                        
                        // Register lightweight stub with the router
                        const stub = new DynamicAgent(config);
                        capabilityRouter.registerAgent(stub, config.keywords || []);
                    }
                } catch (e) {
                    logger.warn(`Failed to index ${filename}: ${e.message}`);
                }
                
                if (i % 5000 === 0 && i > 0) {
                    logger.info(`🚀 [Dynamic Loader] Indexed ${i} out of ${jsonFiles.length} agents...`);
                }
            }
            logger.info(`✅ [Dynamic Loader] Indexing Complete: Successfully mapped ${this.loadedAgents.size} agents to disk paths. Memory preserved.`);
        } catch (e) {
            logger.warn(`Failed to read custom agents directory: ${e.message}`);
        }
    }

    async getAgentInstance(agentName) {
        if (!this.agentRegistry || !this.agentRegistry.has(agentName)) {
            return null;
        }
        
        const paths = this.agentRegistry.get(agentName);
        if (!fs.existsSync(paths.logicPath)) {
            return null;
        }

        try {
            // ONLY load into memory when specifically requested by the orchestrator
            const moduleUrl = `file://${paths.logicPath}`;
            const module = await import(moduleUrl);
            
            const exportedKey = Object.keys(module).find(k => module[k] && typeof module[k] === 'object');
            if (exportedKey) {
                return module[exportedKey];
            }
        } catch (e) {
            logger.error(`Failed to lazy load native logic for [${agentName}]: ${e.message}`);
        }
        return null;
    }

    async loadCustomAgent(filename) {
        try {
            const filePath = path.join(this.customDir, filename);
            if (!fs.existsSync(filePath)) return;

            const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const agentName = config.name;

            if (this.loadedAgents.has(agentName)) {
                logger.info(`[Dynamic Loader] Updating index for existing agent: ${agentName}`);
            }

            if (!this.agentRegistry) this.agentRegistry = new Map();
            
            this.agentRegistry.set(agentName, {
                configPath: filePath,
                logicPath: filePath.replace('.json', '.agent.js')
            });
            this.loadedAgents.add(agentName);
            logger.info(`✅ Successfully indexed native logic path for [${agentName}]`);
            
            // Note: Native logic and fallback handling is now done inside getAgentInstance()
            
            // Optional: Still register the capability routes if needed 
            // capabilityRouter.registerAgent(agentName, config);
        } catch (e) {
            logger.error(`[Dynamic Loader] Failed to parse custom agent ${filename}: ${e.message}`);
        }
    }
}

export const dynamicAgentLoaderService = new DynamicAgentLoaderService();

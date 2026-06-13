import { agentForgeGeneratorAgent } from './agent_forge_generator.agent.js';
import { capabilityRouter } from './capability.router.js';
import { logger } from '../../../shared/logger.js';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

// Phase 31: Unified Swarm Event Bus for live SSE stream tracking
export const swarmBus = new EventEmitter();
swarmBus.setMaxListeners(100);

// In-memory record store of dynamic agent synthesis reports
const synthesisReports = new Map();

class SelfExpandingSwarmService {
    /**
     * Gets the full list of dynamic synthesis logs/reports.
     * @returns {Array<Object>}
     */
    getSynthesisReport() {
        return Array.from(synthesisReports.values());
    }

    /**
     * Background async synthesis pipeline.
     * @param {string} domain The specialist target domain
     * @param {string} triggerQuery The developer query that triggered this
     */
    async synthesizeAgent(domain, triggerQuery) {
        const reportId = `${domain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${Date.now()}`;
        const report = {
            id: reportId,
            domain,
            triggerQuery,
            status: 'started',
            logs: [`[${new Date().toISOString()}] Ignition sequence started for domain: "${domain}"`],
            timestamp: new Date().toISOString()
        };
        synthesisReports.set(reportId, report);

        const addLog = (message) => {
            const timestamped = `[${new Date().toISOString()}] ${message}`;
            report.logs.push(timestamped);
            logger.info(`🧬 [SelfExpandingSwarm:${reportId}] ${message}`);
        };

        swarmBus.emit('swarm:synthesis_started', { domain, triggerQuery, id: reportId });

        try {
            // 1. Forge agent code via Agent Forge meta-agent
            report.status = 'forging';
            addLog(`Invoking Agent Forge to code dynamic specialist for "${domain}"...`);
            
            const generatedCode = await agentForgeGeneratorAgent.generateAgent(domain);
            
            // 2. Parse target agent name
            const agentNameMatch = generatedCode.match(/name:\s*['"]([^'"]+)['"]/);
            let agentName = agentNameMatch ? agentNameMatch[1] : `dynamic_agent_${Date.now()}`;
            agentName = agentName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            report.agentName = agentName;
            addLog(`Successfully forged agent class structure in-memory: "${agentName}".`);

            // 3. Write files to disk
            report.status = 'writing';
            const customDirPath = path.join(process.cwd(), 'src', 'app', 'modules', 'agents', 'custom');
            await fs.mkdir(customDirPath, { recursive: true });

            const normalizedCode = generatedCode.replace(/['"]\.\/gemini_cli_base\.agent\.js['"]/g, "'../gemini_cli_base.agent.js'");
            const filePath = path.join(customDirPath, `${agentName}.agent.js`);
            await fs.writeFile(filePath, normalizedCode);
            addLog(`Wrote specialized agent module to ${filePath}`);
            
            // Write companion JSON config file to allow dynamicAgentLoaderService pick up
            const configPath = path.join(customDirPath, `${agentName}.json`);
            const companionConfig = {
                name: agentName,
                title: `Specialist ${domain} Agent`,
                description: `Bespoke dynamic specialist agent forged on the fly to handle missing capability: ${domain}`,
                preamble: `You are a dynamic specialist agent specializing in ${domain}.`,
                keywords: [domain.toLowerCase(), agentName.toLowerCase()]
            };
            await fs.writeFile(configPath, JSON.stringify(companionConfig, null, 2));
            addLog(`Wrote companion dynamic JSON schema to ${configPath}`);

            swarmBus.emit('swarm:agent_written', { agentName, id: reportId });

            // 4. Attempt to dynamically load and register the agent
            report.status = 'registering';
            try {
                const moduleUrl = `file://${filePath}?t=${Date.now()}`;
                const module = await import(moduleUrl);
                
                // Retrieve the exported class instance
                const exportedKey = Object.keys(module).find(k => module[k] && typeof module[k] === 'object');
                const agentInstance = exportedKey ? module[exportedKey] : null;

                if (agentInstance) {
                    capabilityRouter.registerAgent(agentInstance, [domain, agentName]);
                    report.status = 'registered';
                    addLog(`Successfully mounted dynamic agent [${agentName}] into Swarm Capability Router.`);
                    swarmBus.emit('swarm:agent_registered', { agentName, id: reportId });
                    return agentName;
                } else {
                    addLog(`Agent generated successfully but exported instance was not found. Loaded companion JSON configuration fallback.`);
                }
            } catch (importErr) {
                addLog(`Dynamic import failed: ${importErr.message}. Loader fallback will register agent on next startup.`);
            }

            report.status = 'failed';
            swarmBus.emit('swarm:synthesis_failed', { domain, error: 'Export verification failed', id: reportId });
            return null;

        } catch (error) {
            report.status = 'failed';
            addLog(`Failed to synthesize agent for capability "${domain}": ${error.message}`);
            swarmBus.emit('swarm:synthesis_failed', { domain, error: error.message, id: reportId });
            return null;
        }
    }

    async expandSwarm(missingCapabilityRequirement) {
        logger.info(`🌌 [SelfExpandingSwarm] Triggered expansion for capability: ${missingCapabilityRequirement}`);
        
        // Directly invoke our robust synthesis pipeline!
        return this.synthesizeAgent(missingCapabilityRequirement, `Automated capability gap: ${missingCapabilityRequirement}`);
    }
}

export const selfExpandingSwarmService = new SelfExpandingSwarmService();

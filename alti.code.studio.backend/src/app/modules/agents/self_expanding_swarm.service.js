import { agentForgeGeneratorAgent } from './agent_forge_generator.agent.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class SelfExpandingSwarmService {
    async expandSwarm(missingCapabilityRequirement) {
        logger.info(`🌌 [SelfExpandingSwarm] Triggered expansion for capability: ${missingCapabilityRequirement}`);
        
        try {
            // 1. Forge the agent code
            const generatedCode = await agentForgeGeneratorAgent.generateAgent(missingCapabilityRequirement);
            
            // 2. Extract agent name or generate one robustly
            const agentNameMatch = generatedCode.match(/name:\s*['"]([^'"]+)['"]/);
            let agentName = agentNameMatch ? agentNameMatch[1] : `dynamic_agent_${Date.now()}`;
            agentName = agentName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            
            // 3. Write the code to disk in a custom directory
            const customDirPath = path.join(process.cwd(), 'src', 'app', 'modules', 'agents', 'custom');
            await fs.mkdir(customDirPath, { recursive: true });
            
            const filePath = path.join(customDirPath, `${agentName}.agent.js`);
            await fs.writeFile(filePath, generatedCode);
            
            logger.info(`💾 [SelfExpandingSwarm] Wrote new agent to ${filePath}`);
            
            // 4. Attempt to dynamically load the newly forged agent
            try {
                // Use a file:// URL for absolute path ESM dynamic import
                const moduleUrl = `file://${filePath}`;
                await import(moduleUrl);
                
                logger.info(`✨ [SelfExpandingSwarm] Successfully forged, loaded, and registered agent: ${agentName}`);
                return agentName;
            } catch (importErr) {
                logger.warn(`⚠️ [SelfExpandingSwarm] Forged agent, but dynamic import failed: ${importErr.message}. The agent will be loaded on the next application restart.`);
                return null; // Let the fallback handle the routing
            }

        } catch (error) {
            logger.error(`❌ [SelfExpandingSwarm] Failed to expand swarm for capability: ${missingCapabilityRequirement}`, error);
            return null;
        }
    }
}

export const selfExpandingSwarmService = new SelfExpandingSwarmService();

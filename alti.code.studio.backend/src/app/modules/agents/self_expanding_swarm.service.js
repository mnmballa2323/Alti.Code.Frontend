<<<<<<< HEAD
/**
 * Self-Expanding Swarm Service — v6.0.0
 *
 * Detects capability gaps in the swarm (queries that no existing agent handles well)
 * and autonomously synthesizes, writes, and hot-loads new specialist agents.
 *
 * Pipeline:
 *   1. DETECT: Query fails to match any capability table entry above threshold
 *   2. ANALYZE: LLM classifies the domain gap
 *   3. SYNTHESIZE: Generate complete agent file code (preamble + _invoke + helpers)
 *   4. VALIDATE: Lint check + guardian review of generated agent
 *   5. WRITE: Write agent file to disk
 *   6. REGISTER: Hot-add to capability router table at runtime
 *   7. AUDIT: Log creation to vector store and audit trail
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { guardianAgent } from '../agents/guardian.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import crypto from 'crypto';
import EventEmitter from 'events';

export const swarmBus = new EventEmitter();

const AGENTS_DIR = path.resolve(import.meta.url.replace('file:///', ''), '../../../app/modules/agents');
const AGENTS_DIR_RESOLVED = path.join(process.cwd(), 'src/app/modules/agents');

/** Minimum routing score below which we consider a gap detected */
const GAP_DETECTION_THRESHOLD = 2; // score (keyword hits) below this = gap

/** Cooldown: don't synthesize the same domain within this many ms */
const SYNTHESIS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export class SelfExpandingSwarmService {
    constructor() {
        this.name = 'SelfExpandingSwarm';
        /** Map<domain, lastSynthesizedAt> — prevent rapid re-synthesis */
        this.synthesizedDomains = new Map();
        /** Count of agents synthesized this session */
        this.agentsCreatedCount = 0;
        /** Max agents to synthesize per session (safety cap) */
        this.MAX_AGENTS_PER_SESSION = 10;

        logger.info('🧬 SelfExpandingSwarm: Initialized. Ready to detect capability gaps and synthesize new agents.');
    }

    /**
     * Evaluate whether the current query has a capability gap.
     * Called by the capability router after scoring.
     *
     * @param {string} query - Original user query
     * @param {number} bestScore - Highest keyword score found in CAPABILITY_TABLE
     * @returns {Promise<boolean>} true if gap detected and agent should be synthesized
     */
    async maybeExpand(query, bestScore) {
        if (bestScore >= GAP_DETECTION_THRESHOLD) return false; // Existing agent handles it
        if (this.agentsCreatedCount >= this.MAX_AGENTS_PER_SESSION) {
            logger.warn(`🧬 SelfExpanding: Session cap (${this.MAX_AGENTS_PER_SESSION}) reached. Skipping expansion.`);
            return false;
        }

        // Classify the domain gap
        const domain = await this._classifyDomain(query);
        if (!domain) return false;

        // Check cooldown
        const lastSeen = this.synthesizedDomains.get(domain);
        if (lastSeen && Date.now() - lastSeen < SYNTHESIS_COOLDOWN_MS) {
            logger.info(`🧬 SelfExpanding: Domain "${domain}" in cooldown. Skipping.`);
            return false;
        }

        logger.info(`🧬 SelfExpanding: GAP DETECTED for domain "${domain}" (score ${bestScore} < ${GAP_DETECTION_THRESHOLD}). Synthesizing agent...`);
        swarmBus.emit('swarm:gap_detected', { query, domain, bestScore });

        await this.synthesizeAgent(domain, query);
        return true;
    }

    /**
     * Classify what domain/vertical the query belongs to.
     * @param {string} query
     * @returns {Promise<string|null>} domain slug e.g. 'salesforce', 'quantum_computing'
     */
    async _classifyDomain(query) {
        const prompt = `
Classify this user query into a technology/industry domain.
Query: "${query}"

Return a short domain slug (e.g. "salesforce", "quantum_computing", "blockchain_web3", "ar_vr", "bioinformatics").
Return ONLY the slug, nothing else. Max 3 words joined with underscores.`.trim();

        try {
            const raw = await GeminiAiService.generateContent(prompt);
            const domain = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').substring(0, 40);
            return domain || null;
        } catch {
            return null;
        }
    }

    /**
     * Synthesize a new specialist agent for the given domain.
     *
     * @param {string} domain - e.g. 'salesforce', 'quantum_computing'
     * @param {string} triggerQuery - The query that triggered synthesis
     * @returns {Promise<{agentId, agentName, filePath, registered}>}
     */
    async synthesizeAgent(domain, triggerQuery) {
        const agentId = crypto.randomUUID().slice(0, 8);
        const agentName = domain.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_') + '_Agent';
        const fileName = `${domain}.agent.js`;
        const filePath = path.join(AGENTS_DIR_RESOLVED, fileName);

        swarmBus.emit('swarm:synthesis_started', { agentId, domain, agentName });
        logger.info(`🧬 SelfExpanding [${agentId}]: Synthesizing ${agentName}...`);

        try {
            // Phase 1: Generate agent code
            const agentCode = await this._synthesizeAgentCode(domain, agentName, triggerQuery);

            // Phase 2: Guardian safety review
            const guardianResult = await guardianAgent.interceptExecution(
                `New agent synthesis:\nName: ${agentName}\nDomain: ${domain}\nCode preview: ${agentCode.substring(0, 500)}`,
                'AGENT_SYNTHESIS'
            );

            if (!guardianResult.isSafeToExecute) {
                logger.warn(`🛡️ SelfExpanding: Guardian BLOCKED synthesis of ${agentName}: ${guardianResult.vetoReason}`);
                swarmBus.emit('swarm:synthesis_blocked', { agentId, domain, reason: guardianResult.vetoReason });
                return { agentId, status: 'blocked', reason: guardianResult.vetoReason };
            }

            // Phase 3: Write agent to disk
            await fs.writeFile(filePath, agentCode, 'utf8');
            logger.info(`📝 SelfExpanding [${agentId}]: Agent file written → ${filePath}`);
            swarmBus.emit('swarm:agent_written', { agentId, domain, agentName, filePath });

            // Phase 4: Hot-load the new agent
            const registered = await this._hotLoadAgent(filePath, domain, agentName, triggerQuery);

            // Phase 5: Persist to memory
            await vectorStoreService.add(
                `Synthesized agent: ${agentName} for domain: ${domain}. Trigger query: "${triggerQuery}". File: ${fileName}`,
                { type: 'agent_synthesis', domain, agentName, agentId, filePath }
            );

            this.synthesizedDomains.set(domain, Date.now());
            this.agentsCreatedCount++;

            swarmBus.emit('swarm:agent_registered', { agentId, domain, agentName, registered });
            logger.info(`✅ SelfExpanding [${agentId}]: ${agentName} synthesized and ${registered ? 'registered in router' : 'written to disk only'}.`);

            return { agentId, agentName, domain, filePath, registered, status: 'success' };

        } catch (error) {
            logger.error(`❌ SelfExpanding [${agentId}]: Synthesis failed —`, error.message);
            swarmBus.emit('swarm:synthesis_failed', { agentId, domain, error: error.message });
            return { agentId, status: 'failed', error: error.message };
        }
    }

    /**
     * Use LLM to write a complete, production-ready agent file.
     */
    async _synthesizeAgentCode(domain, agentName, triggerQuery) {
        const domainDisplay = domain.replace(/_/g, ' ');

        const prompt = `
You are synthesizing a NEW specialist AI agent for the Alti.Code.Studio platform.

Domain: "${domainDisplay}"
Agent name: "${agentName}"
Trigger query that revealed this capability gap: "${triggerQuery}"

Generate a COMPLETE, production-ready JavaScript ES module agent file.
Follow this EXACT structure:

/**
 * "${agentName}" — ${domainDisplay} Specialist
 * Auto-synthesized by SelfExpandingSwarm v6.0.0
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class ${agentName} extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = '${agentName}';
        this.description = 'Elite ${domainDisplay} specialist — [DESCRIBE DOMAIN].';
        
        this.preamble = \`
[Write a comprehensive, technically accurate preamble covering:
 - AUTHENTICATION patterns for major APIs in this domain
 - Core API endpoints with request/response examples
 - Industry-specific standards, protocols, terminology
 - Key data models / schemas
 - Common integration patterns
 - Best practices
 The preamble should be 40-80 lines of dense technical reference material.]\`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = \`\${this.preamble}\\n\\n=== CONTEXT ===\\n\${contextBlock}\\n\\n=== ${domainDisplay.toUpperCase()} ENGINEER REQUEST ===\\n\${prompt}\`;
        return GeminiAiService.generateContent(finalPrompt);
    }
    
    // Add 1-2 domain-specific helper methods (e.g. generateIntegration(), generateExample())
}

export const ${agentName.charAt(0).toLowerCase() + agentName.slice(1)} = new ${agentName}();

Rules:
- Fill in ALL placeholder sections with real, accurate content
- The preamble must have REAL API endpoints, auth patterns, and domain knowledge
- Return ONLY the JavaScript code, no markdown fences
- No TODO comments — everything must be implemented`.trim();

        return GeminiAiService.generateContent(prompt);
    }

    /**
     * Dynamically import the new agent and register it with the capability router.
     *
     * @returns {Promise<boolean>} true if successfully hot-loaded and registered
     */
    async _hotLoadAgent(filePath, domain, agentName, triggerQuery) {
        try {
            // Dynamic import of newly written agent
            const fileUrl = pathToFileURL(filePath).href;
            const agentModule = await import(/* @vite-ignore */ fileUrl + `?v=${Date.now()}`);

            // Find the exported agent instance
            const agentInstance = Object.values(agentModule).find(v => v && typeof v === 'object' && typeof v.consult === 'function');
            if (!agentInstance) {
                logger.warn(`🧬 HotLoad: No agent instance found in ${filePath}`);
                return false;
            }

            // Generate keywords from domain + trigger query
            const keywords = [
                ...domain.split('_'),
                ...triggerQuery.toLowerCase().split(/\s+/).slice(0, 5),
            ].filter(Boolean);

            // Fire event for capability router to pick up natively
            swarmBus.emit('swarm:agent_hotload', { agentInstance, keywords });
            logger.info(`🔌 HotLoad: emitted hotload event for ${agentName}`);
            return true;

        } catch (error) {
            // Hot-load failed (e.g., syntax error) — agent is on disk but not in router
            logger.error(`🧬 HotLoad FAILED for ${agentName}: ${error.message}`);
            return false;
        }
    }

    /**
     * List all agents synthesized this session.
     */
    getSynthesisReport() {
        return {
            agentsCreatedThisSession: this.agentsCreatedCount,
            maxPerSession: this.MAX_AGENTS_PER_SESSION,
            domainCooldowns: Object.fromEntries(
                [...this.synthesizedDomains.entries()].map(([k, v]) => [k, new Date(v).toISOString()])
            ),
        };
    }
=======
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
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
}

export const selfExpandingSwarmService = new SelfExpandingSwarmService();

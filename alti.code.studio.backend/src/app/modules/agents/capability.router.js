/* DIRECT GEMINI BLOCKED - USE VERTEX VIA GATEWAY */
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { selfExpandingSwarmService } from './self_expanding_swarm.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { memorystoreService } from '../googleCloud/memorystore.service.js';
import { GoogleSearchService } from '../googleSearch/googleSearch.service.js';
import { spannerGraphService } from '../googleCloud/spanner_graph.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { workflowService } from '../googleCloud/workflow.service.js';
import crypto from 'crypto';
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';

import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';

class CapabilityRouter {
    constructor() {
        this.modelName = config.gcp.model_name || 'gemini-3.1-pro';
        this.isIndexed = false;
    }

    get model() {
        if (!this._model) {
            this._model = GoogleGenAiService.getGenerativeModel(this.modelName);
        }
        return this._model;
    }

    get table() {
        return CAPABILITY_TABLE;
    }

    /**
     * Initializes the Agentic RAG system by generating embeddings for all 10,000+ agents
     * and storing them in the vector database if they aren't already there.
     */
    async indexAgents() {
        if (this.isIndexed) return;
        
        logger.info(`🗺️ [CapabilityRouter] Bootstrapping Agentic RAG Vector Index for massive scale...`);
        try {
            await agentRegistry.loadPlugins();
        } catch (pluginErr) {
            logger.warn(`⚠️ [CapabilityRouter] Failed to load dynamic plugins before indexing: ${pluginErr.message}`);
        }

        const availableAgents = agentRegistry.list();
        
        try {
            let count = 0;
            const BATCH_SIZE = 50;
            
            for (let i = 0; i < availableAgents.length; i += BATCH_SIZE) {
                const batch = availableAgents.slice(i, i + BATCH_SIZE);
                const batchPromises = batch.map(agent => {
                    return vectorStoreService.pool.query(
                        "SELECT id FROM alti_memory WHERE metadata->>'agentId' = $1 AND metadata->>'type' = 'agent_profile' LIMIT 1",
                        [agent.name]
                    ).then(async (checkRes) => {
                        if (checkRes.rows.length > 0) {
                            return;
                        }
                        const agentDocument = `Agent Name: ${agent.name}\nDescription: ${agent.description}\nCapabilities: ${agent.capabilities?.join(', ')}`;
                        await vectorStoreService.add(agentDocument, { 
                            type: 'agent_profile', 
                            agentId: agent.name 
                        });
                        count++;
                    }).catch(e => {
                        logger.warn(`⚠️ Failed to index agent ${agent.name}: ${e.message}`);
                    });
                });
                
                await Promise.all(batchPromises);
                logger.info(`🚀 [CapabilityRouter] Processed batch ${i / BATCH_SIZE + 1} (${availableAgents.length} total agents processed)`);
            }
            
            this.isIndexed = true;
            logger.info(`✅ [CapabilityRouter] Successfully bootstrapped agent profiles into Vector Store (${count} new agents added).`);
        } catch (error) {
            logger.error(`❌ [CapabilityRouter] Failed to index agent profiles: ${error.message}`);
        }
    }

    async route(query) {
        // 1. Redis Intent Cache Check (O(1) Zero-Latency Retrieval)
        // Hash the query to create a safe Redis key
        const queryHash = crypto.createHash('sha256').update(query).digest('hex');
        const cacheKey = `intent_route:${queryHash}`;
        
        const cachedAgentId = await memorystoreService.getCache(cacheKey);
        if (cachedAgentId) {
            logger.info(`⚡ [CapabilityRouter] ZERO-LATENCY CACHE HIT: Routed "${query.slice(0, 30)}..." to [${cachedAgentId}] in <1ms`);
            return { agentId: cachedAgentId, semanticMatch: true, dynamicallyForged: false };
        }

        // Ensure index is ready
        if (!this.isIndexed) {
            await this.indexAgents();
        }

        logger.info(`🗺️ [CapabilityRouter] Executing Agentic RAG search for query: "${query}"`);
        
        // 2. Vector Search (Retrieve Top 10 most mathematically relevant agents)
        const searchResults = await vectorStoreService.search(query, 10);
        let candidateAgents = [];
        
        if (searchResults.documents && searchResults.documents[0] && searchResults.documents[0].length > 0) {
            candidateAgents = searchResults.documents[0]; // array of stringified agent profiles
            
            // 3. Vector Short-Circuiting (Heuristic Bypass)
            const topDistance = searchResults.distances[0][0];
            const topAgentMeta = searchResults.metadatas[0][0];
            
            // If Cosine Distance is exceptionally tight (< 0.15), we bypass the 1.5s LLM generation
            if (topDistance < 0.15 && topAgentMeta && topAgentMeta.agentId) {
                logger.info(`🚀 [CapabilityRouter] HEURISTIC SHORT-CIRCUIT: Exact mathematical match found (Distance: ${topDistance.toFixed(3)}). Bypassing LLM...`);
                // Cache the fast result
                await memorystoreService.setCache(cacheKey, topAgentMeta.agentId, 86400); // 24hr TTL
                return { agentId: topAgentMeta.agentId, semanticMatch: true, dynamicallyForged: false };
            }
        } else {
            // Fallback if vector search is offline or empty
            logger.warn('⚠️ [CapabilityRouter] Vector search returned empty, falling back to core agents.');
            candidateAgents = agentRegistry.list().slice(0, 10).map(a => `Agent Name: ${a.name}\nDescription: ${a.description}`);
        }

        logger.info(`🗺️ [CapabilityRouter] Retrieved ${candidateAgents.length} candidates from Vector DB. Routing to Gemini...`);

        // 4. Gemini Semantic Final Router
        // Now we only pass the TOP 10 candidates instead of 10,000, saving millions of tokens.
        const prompt = `
            You are the Capability Router for Inso Code's autonomous swarm.
            A task requires semantic fallback routing.
            
            TASK/QUERY: "${query}"
            
            TOP AGENT CANDIDATES (Retrieved via Vector Search):
            ${candidateAgents.join('\n\n')}
            
            RULES:
            1. Find the best single agent to handle this query based on its description and capabilities.
            2. If NO agent in the candidate list can logically handle this (e.g. it requires a completely new specialized domain), return { "agentId": "MISSING_CAPABILITY", "reason": "Requires new capability for [domain]" }
            3. Return ONLY a JSON object: { "agentId": "agent_id_here", "reason": "why this agent" }
            Return ONLY raw JSON, no markdown formatting.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const decision = JSON.parse(jsonMatch[0]);
                
                if (decision.agentId === 'MISSING_CAPABILITY') {
                    logger.warn(`⚠️ [CapabilityRouter] No capability found. Triggering self-expanding swarm for: ${decision.reason}`);
                    // Trigger dynamic expansion to forge the new agent
                    const newAgentId = await selfExpandingSwarmService.expandSwarm(decision.reason);
                    return { agentId: newAgentId || 'jules', semanticMatch: true, dynamicallyForged: !!newAgentId };
                }
                
                logger.info(`🗺️ [CapabilityRouter] Semantically routed to: ${decision.agentId}`);
                // Cache the LLM decision to skip this latency next time
                await memorystoreService.setCache(cacheKey, decision.agentId, 86400); // 24hr TTL

                // 🧠 AgentMemory: Record routing decision for pattern learning
                AgentMemoryHooks.captureDecision(
                    `CapabilityRouter routed query to [${decision.agentId}]`,
                    `Query: "${query.substring(0, 200)}". Reason: ${decision.reason}`,
                    { agentId: decision.agentId, routingMethod: 'semantic_llm' }
                ).catch(() => {});

                return { agentId: decision.agentId, semanticMatch: true, dynamicallyForged: false };
            }
        } catch (error) {
            logger.error('CapabilityRouter evaluation failed.', error);
        }
        
        // Final fallback
        return { agentId: 'jules', semanticMatch: false, dynamicallyForged: false };
    }

    /**
     * Generates a Multi-Agent Directed Acyclic Graph (DAG) for end-to-end tasks.
     * @param {string} query 
     * @param {object} visualContext - Optional { data: 'base64', mimeType: 'image/png' }
     */
    async routeWorkflow(query, visualContext = null) {
        // Ensure index is ready
        if (!this.isIndexed) {
            await this.indexAgents();
        }

        logger.info(`🛡️ [CapabilityRouter] Intercepting query for Zero-Trust PII Redaction via Google Cloud DLP...`);
        let sanitizedQuery = query;
        try {
            sanitizedQuery = await GoogleDlpService.redactText(query);
            if (sanitizedQuery !== query) {
                 logger.warn(`🚨 [CapabilityRouter] PII or Credentials detected in query! Payload has been mathematically redacted.`);
            }
        } catch(e) {
             logger.warn(`⚠️ [CapabilityRouter] DLP Redaction failed, proceeding with caution: ${e.message}`);
        }

        logger.info(`🗺️ [CapabilityRouter] Executing Agentic RAG search for WORKFLOW query: "${sanitizedQuery}"`);
        
        // Retrieve Top 15 candidates for a complex workflow
        const searchResults = await vectorStoreService.search(sanitizedQuery, 15);
        let candidateAgents = [];
        
        if (searchResults.documents && searchResults.documents[0] && searchResults.documents[0].length > 0) {
            candidateAgents = searchResults.documents[0];
        } else {
            candidateAgents = agentRegistry.list().slice(0, 15).map(a => `Agent Name: ${a.name}\nDescription: ${a.description}`);
        }

        logger.info(`🔍 [CapabilityRouter] Grounding architectural query in real-time Google Search...`);
        let searchContext = "";
        try {
            searchContext = await GoogleSearchService.getSearchContext(`software architecture best practices for: ${sanitizedQuery}`);
        } catch (e) {
            logger.warn(`⚠️ [CapabilityRouter] Search grounding failed, proceeding with base model weights: ${e.message}`);
        }

        logger.info(`🕸️ [CapabilityRouter] Calculating AST blast radius via Google Cloud Spanner Graph...`);
        let astContext = "";
        try {
            // Extract a naive core entity from the query (in a production system, an NLP parser would isolate the exact domain)
            const coreEntityMatch = sanitizedQuery.match(/(?:update|refactor|build|create) ([\w]+)/i);
            const startNodeId = coreEntityMatch ? coreEntityMatch[1].toLowerCase() : 'core_system';
            
            const astHops = await spannerGraphService.executeAstGraphTraversal(startNodeId, 3);
            if (astHops && astHops.length > 0) {
                 astContext = astHops.map(hop => `- ${hop.file_path}: [${hop.name}] -> DEPENDS ON [${startNodeId}]`).join('\n');
            }
        } catch (e) {
            logger.warn(`⚠️ [CapabilityRouter] Spanner AST Graph query failed: ${e.message}`);
        }

        // #4: Gemini File Search — Indexed Document Context for Workflow Planning
        let fileSearchContext = "";
        try {
            const { fileSearchService } = await import('../fileSearch/fileSearch.service.js');
            const stores = await fileSearchService.listStores();
            if (stores && stores.length > 0) {
                const storeNames = stores.slice(0, 5).map(s => s.name);
                const fsResult = await Promise.race([
                    fileSearchService.query(sanitizedQuery, storeNames),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
                ]);
                if (fsResult && fsResult.text) {
                    fileSearchContext = fsResult.text.substring(0, 3000);
                    if (fsResult.citations && fsResult.citations.length > 0) {
                        fileSearchContext += '\n\nDocument Citations:\n';
                        for (const c of fsResult.citations.slice(0, 10)) {
                            fileSearchContext += `• ${c.title || 'Unknown'}${c.pageNumber ? ` (p.${c.pageNumber})` : ''}\n`;
                        }
                    }
                    logger.info(`📚 [CapabilityRouter] File Search injected ${fileSearchContext.length} chars of document context into workflow planning.`);
                }
            }
        } catch (e) {
            logger.warn(`⚠️ [CapabilityRouter] File Search workflow context failed (non-blocking): ${e.message}`);
        }

        const prompt = `
            You are the Capability Router for Inso Code's autonomous swarm.
            The user wants an end-to-end development task completed.
            
            TASK/QUERY: "${sanitizedQuery}"
            
            REAL-TIME GOOGLE SEARCH GROUNDING (For Architecture & Planning):
            ${searchContext || 'No real-time data available.'}
            
            DETERMINISTIC AST BLAST RADIUS (Google Cloud Spanner Codebase Graph):
            ${astContext || 'No specific codebase dependencies detected.'}

            INDEXED DOCUMENT CONTEXT (Gemini File Search RAG):
            ${fileSearchContext || 'No indexed documents available.'}
            
            TOP AGENT CANDIDATES (Retrieved via Vector Search):
            ${candidateAgents.join('\n\n')}
            
            RULES:
            1. Break the task down into a Non-Linear Directed Acyclic Graph (DAG) of specialized agents.
            2. Identify which tasks can be executed in PARALLEL (e.g. backend and frontend working simultaneously after architecture is designed).
            3. Only use agents from the candidate list. If a critical agent is missing, use "jules" (Generalist).
            4. The workflow MUST cover the complete Software Development Life Cycle (SDLC): Planning -> Architecture -> Design -> Development -> Testing.
            5. Determine the mathematical hardware requirements for each node. Set "hardwareProfile" to "CLOUD_RUN" for highly intensive tasks (like compilation, E2E testing, or massive generation), and "LOCAL" for planning or simple coding.
            6. Determine the cognitive complexity for each node. Set "modelTier" to "gemini-3.1-pro" for deep reasoning (architecture, core logic) and "gemini-3.1-flash" for rapid execution (formatting, simple scripts).
            7. **IMPACT-RADIUS ROUTING**: If a "DETERMINISTIC AST BLAST RADIUS" is provided above, you MUST create a specific development agent node for EACH file and function listed in the blast radius. Do not generalize; map the exact codebase topology to the execution graph.
            8. **MULTI-MODAL SPATIAL SPAWNING**: If an image is provided alongside this query (UI design/mockup), you MUST physically analyze the spatial layout. Identify every discrete visual component (e.g., "Navbar", "Hero Section", "Data Grid") and generate a specific parallel frontend agent node to build EACH component simultaneously.
            9. **COGNITIVE TEMPERATURE OPTIMIZATION**: Set "temperature" to a float between 0.0 and 1.0. Use 0.8 for creative tasks (design, planning) and 0.1 for highly deterministic coding tasks.
            10. **ZERO-TRUST IAM BINDING**: Set "iamRole" to the exact Google Cloud IAM role required for the agent to execute this task securely (e.g., "roles/viewer", "roles/cloudsql.admin", "roles/editor").
            11. Return ONLY raw JSON in this exact format:
            {
              "workflow": {
                "nodes": [
                  { "id": "step_1", "agentId": "architect", "task": "Design the system architecture", "hardwareProfile": "LOCAL", "modelTier": "gemini-3.1-pro", "temperature": 0.8, "iamRole": "roles/viewer" },
                  { "id": "step_2a", "agentId": "database", "task": "Create the PostgreSQL schemas", "hardwareProfile": "LOCAL", "modelTier": "gemini-3.1-pro", "temperature": 0.1, "iamRole": "roles/cloudsql.admin" },
                  { "id": "step_2b", "agentId": "react", "task": "Build the frontend UI", "hardwareProfile": "LOCAL", "modelTier": "gemini-3.1-flash", "temperature": 0.1, "iamRole": "roles/editor" },
                  { "id": "step_3", "agentId": "e2eTest", "task": "Test the full integration", "hardwareProfile": "CLOUD_RUN", "modelTier": "gemini-3.1-flash", "temperature": 0.1, "iamRole": "roles/editor" }
                ],
                "edges": [
                  { "from": "step_1", "to": "step_2a" },
                  { "from": "step_1", "to": "step_2b" },
                  { "from": "step_2a", "to": "step_3" },
                  { "from": "step_2b", "to": "step_3" }
                ]
              }
            }
        `;

        try {
            const parts = [{ text: prompt }];
            if (visualContext && visualContext.data && visualContext.mimeType) {
                parts.push({
                    inlineData: {
                        data: visualContext.data,
                        mimeType: visualContext.mimeType
                    }
                });
                logger.info(`👁️ [CapabilityRouter] Injected multi-modal visual payload into DAG routing sequence.`);
            }

            const result = await this.model.generateContent({ contents: [{ role: 'user', parts }] });
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const decision = JSON.parse(jsonMatch[0]);
                const workflow = decision.workflow || { nodes: [], edges: [] };
                logger.info(`🗺️ [CapabilityRouter] Generated NON-LINEAR workflow with ${workflow.nodes.length} nodes and ${workflow.edges.length} edges.`);
                
                // Hybrid Orchestration Shift
                if (workflow.nodes.length > 5) {
                    logger.warn(`🚀 [CapabilityRouter] Workflow exceeds local safety threshold (>5 nodes). Shifting orchestration to Google Cloud Workflows...`);
                    await workflowService.executeSwarm(workflow);
                    return { ...workflow, orchestrationMode: 'CLOUD_WORKFLOWS' };
                }
                
                return { ...workflow, orchestrationMode: 'LOCAL_SEMAPHORE' };
            }
        } catch (error) {
            logger.error('CapabilityRouter workflow evaluation failed.', error);
        }
        
        // Fallback to a single generic agent node
        return { 
            nodes: [{ id: "fallback_1", agentId: 'jules', task: sanitizedQuery }],
            edges: [],
            orchestrationMode: 'LOCAL_SEMAPHORE'
        };
    }

    /**
     * Dynamically registers a specialist agent in the central registry.
     * Keeps backwards compatibility with Phase 10 dynamic synthetics.
     * 
     * @param {BaseSpecialistAgent} agent The specialist agent instance.
     * @param {string[]} keywords Query keywords for semantic routing.
     */
    registerAgent(agent, keywords = []) {
        logger.info(`🗺️ [CapabilityRouter] Dynamically registering agent [${agent.name}] with ${keywords.length} keywords.`);
        agentRegistry.register({
            name: agent.name,
            displayName: agent.displayName || agent.name,
            description: agent.description || `Dynamic Specialist Agent: ${agent.name}`,
            preamble: agent.preamble,
            capabilities: keywords,
            instance: agent,
            version: '1.0.0'
        });
    }
}

export const capabilityRouter = new CapabilityRouter();
export const CAPABILITY_TABLE = new Proxy([], {
    get(target, prop) {
        const list = agentRegistry.list().map(a => ({
            agent: a.instance || a,
            keywords: a.capabilities || [],
            id: a.name
        }));
        if (prop === 'length') {
            return list.length;
        }
        if (typeof list[prop] === 'function') {
            return list[prop].bind(list);
        }
        return list[prop];
    }
});

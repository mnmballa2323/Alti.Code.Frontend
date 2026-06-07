import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { logger } from '../../../shared/logger.js';
import { alloyDbService } from './alloydb.service.js';
import { vertexVectorSearch } from './vectorSearch.service.js';

/**
 * Inso Code - Universal Smart Routing Engine (Google Cloud Native)
 * The most advanced AI routing system in the world. It utilizes Google Vertex AI
 * (Gemini) combined with AlloyDB semantic memory to evaluate user intent, code
 * context, and infrastructural demands, instantly routing the task to the perfect 
 * specialized Agent within the Swarm.
 */
class SmartRoutingEngine {
    constructor() {
        this.registeredAgents = [
            { id: 'SECURITY_AGENT', capabilities: 'Auditing, DevSecOps, BeyondCorp validation, secret scanning, vulnerability patching.' },
            { id: 'INFRASTRUCTURE_AGENT', capabilities: 'Google Cloud Run deployment, Terraform generation, API Gateway provisioning, AlloyDB scaling.' },
            { id: 'FRONTEND_AGENT', capabilities: 'React, Next.js, Tailwind, UI/UX, Component generation, Vercel/Cloudflare edge logic.' },
            { id: 'BACKEND_AGENT', capabilities: 'Node.js, Express, Prisma, PostgreSQL, API design, Business Logic.' },
            { id: 'DATA_AGENT', capabilities: 'BigQuery data pipelines, Spanner Graph modeling, Vector embeddings, Firestore real-time sync.' },
            { id: 'A2A_DIPLOMAT_AGENT', capabilities: 'External protocol negotiations, 3rd party API integration, webhook handling, cross-platform swarms.' },
            { id: 'DEBUG_INVESTIGATOR', capabilities: 'Deep stack trace analysis, memory leak detection, Cloud Logging (Stackdriver) forensic analysis.' },
            { id: 'TPU_ORCHESTRATOR_AGENT', capabilities: 'Provisioning dedicated Google Cloud TPU v5e pods to bypass API limits for petabyte-scale AST ingestion and unbounded vector embedding generation.' },
            { id: 'CONFIDENTIAL_COMPUTE_AGENT', capabilities: 'Provisioning AMD SEV Confidential VMs. Used strictly when the user uploads highly classified or proprietary enterprise code requiring silicon-level memory encryption.' },
            { id: 'SERVICE_MESH_AGENT', capabilities: 'Google Cloud Service Directory integration for autonomous P2P load balancing. Used when the swarm spawns thousands of parallel RAG workers and needs to map distributed gRPC traffic dynamically.' },
            { id: 'VIDEO_EYE_AGENT', capabilities: 'Google Cloud Video Intelligence integration. Used to autonomously watch .mp4 screen recordings uploaded by the user to track UI/UX bugs, transcribe error flashes, and locate offending source code purely via video analysis.' },
            { id: 'CLOUD_WORKSTATION_AGENT', capabilities: 'Google Cloud Workstations API integration. Used when the Swarm needs to autonomously provision a secure, remote development environment (IDE) for a human developer, inject the generated code bundle into it, and return the live URL.' },
            { id: 'DATAPROC_AGENT', capabilities: 'Google Cloud Dataproc integration. Used to autonomously spin up massive managed Apache Spark/Hadoop clusters when asked to ingest, parse, or process petabyte-scale monorepos (e.g. billion-line codebases) that would crash standard node execution.' },
        ];
    }

    /**
     * Determines the optimal agent to execute a given task.
     * @param {string} userPrompt - The user's request
     * @param {string} codebaseContext - Available codebase context
     * @returns {Promise<string>} The ID of the best agent
     */
    async routeTask(userPrompt, codebaseContext = '') {
        logger.info(`🧭 [Smart Router] Analyzing user intent for autonomous agent routing...`);
        
        try {
            // Step 1: Universal Memory Retrieval
            // Generate dense text embeddings for the user's prompt
            const queryEmbedding = await GoogleGenAiService.generateEmbedding(userPrompt);
            let memoryContext = '';
            
            if (queryEmbedding && queryEmbedding.length > 0) {
                // Query Vertex AI Matching Engine for top 3 historical similar engineering tasks
                const historicalShards = await vertexVectorSearch.queryContext(queryEmbedding, 3);
                
                // Query Google AlloyDB for Hybrid Relational/Semantic structural codebase matches
                let alloyDbShards = [];
                try {
                    // Try to guess the file extension context if provided
                    const extMatch = codebaseContext.match(/\.([a-z]+)/);
                    const ext = extMatch ? `.${extMatch[1]}` : '.js';
                    alloyDbShards = await alloyDbService.executeHybridSearch(queryEmbedding, ext);
                } catch (err) {
                    logger.warn('⚠️ [Smart Router] AlloyDB Hybrid search bypassed.', err.message);
                }

                if (historicalShards.length > 0 || alloyDbShards.length > 0) {
                    memoryContext = `
                    UNIVERSAL MEMORY RECALL (VERTEX AI):
                    The Swarm has solved similar problems in the past. 
                    Top matched historical vector IDs: ${historicalShards.map(s => s.id).join(', ')}
                    
                    STRUCTURAL CODEBASE CONTEXT (ALLOYDB HYBRID RAG):
                    ${alloyDbShards.map(s => `[${s.file_path}]: ${s.semantic_similarity * 100}% relevance`).join('\n')}
                    
                    Consider this historical precedence and structural layout when deciding which agent is best suited.
                    `;
                }
            }
            
            const model = GoogleGenAiService.getGenerativeModel(GoogleGenAiService.PRIMARY_MODEL, 0.1);
            
            const systemPrompt = `
                You are the Inso Code Universal Smart Routing Engine.
                Your job is to route the incoming task to the single most capable specialized agent.
                
                AVAILABLE AGENTS:
                ${JSON.stringify(this.registeredAgents, null, 2)}
                
                TASK:
                "${userPrompt}"
                
                ${memoryContext}
                
                CONTEXT HINTS:
                ${codebaseContext}
                
                OUTPUT FORMAT:
                Return ONLY a raw JSON object containing the "agent_id" and a brief "confidence_score".
                Example: {"agent_id": "BACKEND_AGENT", "confidence_score": 0.98}
                Do not include markdown blocks or any other text.
            `;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const responseText = result.response.candidates[0].content.parts[0].text;
            
            // Native JSON parsing guaranteed by Vertex AI structured outputs
            const routingDecision = JSON.parse(responseText);
            
            logger.info(`🎯 [Smart Router] Task natively routed to [${routingDecision.agent_id}] with ${Math.round(routingDecision.confidence_score * 100)}% confidence.`);
            
            return routingDecision.agent_id;
        } catch (error) {
            logger.error(`❌ [Smart Router] Critical routing failure. Defaulting to BACKEND_AGENT.`, error);
            // Fallback to a generalist or core backend agent
            return 'BACKEND_AGENT';
        }
    }

    /**
     * Connect an external or newly deployed agent dynamically to the routing pool.
     */
    registerAgent(agentId, capabilities) {
        this.registeredAgents.push({ id: agentId, capabilities });
        logger.info(`🔌 [Smart Router] Dynamically connected new agent to the mesh: ${agentId}`);
    }
}

export const smartRoutingEngine = new SmartRoutingEngine();

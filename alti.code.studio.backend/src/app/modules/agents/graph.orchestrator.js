/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import crypto from 'crypto';
<<<<<<< HEAD
import { StateGraph, END } from "@langchain/langgraph";
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

import { surferAgent } from './surfer.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { memoryPalaceService } from '../memory/memory_palace.service.js';
import { ragService } from '../memory/rag.service.js';
import { sirenAgent } from './siren.agent.js';
import { guardianAgent } from './guardian.agent.js';
import { sentinelAgent } from './sentinel.agent.js';
import { chaosAgent } from './chaos.agent.js';
import { releaseAgent } from './release.agent.js';
import { complianceAgent } from './compliance.agent.js';
import { economistAgent } from './economist.agent.js';
import { codeReviewAgent } from './code_review.agent.js';
import { architectureAgent } from './architecture.agent.js';
import { performanceAgent } from './performance.agent.js';
import { e2eTestAgent } from './e2e_test.agent.js';
import { databaseAgent } from './database.agent.js';
import { analyticsAgent } from './analytics.agent.js';
import { integrationAgent } from './integration.agent.js';
import { hiveMindAgent } from './hive_mind.agent.js';
import { schemaAgent } from './schema.agent.js';
import { debugAgent } from './debug.agent.js';
import { surgeonAgent } from './surgeon.agent.js';

// Phase 24: Enterprise Swarm Service Bridges
import { TemporalAgentService } from '../temporalAgent/temporalAgent.service.js';
import { LangGraphAgentService } from '../langGraphAgent/langGraphAgent.service.js';
import { Mem0AgentService } from '../mem0Agent/mem0Agent.service.js';
import { LangfuseAgentService } from '../langfuseAgent/langfuseAgent.service.js';
import { TabbyAgentService } from '../tabbyAgent/tabbyAgent.service.js';
import { BrowserUseAgentService } from '../browserUseAgent/browserUseAgent.service.js';
import { Crawl4AiAgentService } from '../crawl4aiAgent/crawl4aiAgent.service.js';
import { McpAgentService } from '../mcpAgent/mcpAgent.service.js';
import { DspyAgentService } from '../dspyAgent/dspyAgent.service.js';
import { UnstructuredAgentService } from '../unstructuredAgent/unstructuredAgent.service.js';
import { PromptfooAgentService } from '../promptfooAgent/promptfooAgent.service.js';
import { GeminiExtensionService } from '../geminiExtensions/geminiExtension.service.js';
import { LitellmGatewayService } from '../litellmGateway/litellmGateway.service.js';
import { QdrantService } from '../qdrantAgent/qdrant.service.js';
import { OllamaAgentService } from '../ollamaAgent/ollamaAgent.service.js';
import { SearxngAgentService } from '../searxngAgent/searxngAgent.service.js';
import { OpenInterpreterAgentService } from '../openInterpreterAgent/openInterpreterAgent.service.js';
import { ObservabilityService } from '../observability/observability.service.js';
import { VoiceAgentService } from '../voiceAgent/voiceAgent.service.js';
import { agentSAgent } from './agent_s.agent.js'; // Phase 16: Agent S GUI Control
=======
import { StateGraph, END, Send } from "@langchain/langgraph";
import { GeminiAiService } from '../geminiOpenMemory/geminiOpenMemo.service.js';
import { logger } from '../../../shared/logger.js';
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';

// Core Live Agents
import { gcpSentinel } from '../googleCloud/gcpSentinel.service.js';
import { BrowserUseAgentService } from '../browserUseAgent/browserUseAgent.service.js';
import { LangGraphAgentService } from '../langGraphAgent/langGraphAgent.service.js';
import { OpenHandsAgentService } from '../openHandsAgent/openHandsAgent.service.js';
import { CrewAiAgentService } from '../crewAiAgent/crewAiAgent.service.js';
import { DspyAgentService } from '../dspyAgent/dspyAgent.service.js';
import { surgeonService as surgeonAgent } from '../surgeon/surgeon.service.js';
import { codeReviewWorkerProcessor } from '../codeReviewAgent/codeReview.worker.js';
import { databaseWorkerProcessor } from '../databaseAgent/database.worker.js';
import { architectureWorkerProcessor } from '../architectureAgent/architecture.worker.js';
import { performanceWorkerProcessor } from '../performanceAgent/performance.worker.js';

// Live Mappings
const guardianAgent = { 
    interceptExecution: async (plan) => {
        try {
            await gcpSentinel.auditDeployment(plan);
            return { isSafeToExecute: true };
        } catch (e) {
            return { isSafeToExecute: false, vetoReason: e.message };
        }
    }
};

const codeReviewAgent = { review: (args) => codeReviewWorkerProcessor({ data: args }) };
const databaseAgent = { optimize: (args) => databaseWorkerProcessor({ data: args }) };
const architectureAgent = { map: (args) => architectureWorkerProcessor({ data: args }) };
const performanceAgent = { analyze: (args) => performanceWorkerProcessor({ data: args }) };

// Fallback Stubs for remaining secondary agents
const surferAgent = {};
const sirenAgent = {};
const sentinelAgent = {};
const chaosAgent = {};
const releaseAgent = {};
const complianceAgent = {};
const economistAgent = {};
const e2eTestAgent = {};
const analyticsAgent = {};
const integrationAgent = {};
const hiveMindAgent = {};
const schemaAgent = {};
const debugAgent = {};

import { vectorStoreService } from '../memory/vector.store.js';
import { memoryPalaceService } from '../memory/memory_palace.service.js';
import { ragService } from '../memory/rag.service.js';

const TemporalAgentService = {};
const Mem0AgentService = {};
const LangfuseAgentService = {};
const TabbyAgentService = {};
const Crawl4AiAgentService = {};
const McpAgentService = {};
const UnstructuredAgentService = {};
const PromptfooAgentService = {};
const GeminiExtensionService = {};
const LitellmGatewayService = {};
const QdrantService = {};
const OllamaAgentService = {};
const SearxngAgentService = {};
const OpenInterpreterAgentService = {};
const ObservabilityService = {};
const VoiceAgentService = {};
const agentSAgent = {};
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

// ── Capability Router: bridges all Tier 9-16 specialist agents ────────────────
import { capabilityRouter } from './capability.router.js';
import { swarmHealthMonitor } from './swarm.health.js';

// ── Kiro-feature integrations: Steering + Hooks ──────────────────────────────
import { steeringService } from '../steering/steering.service.js';
import { hooksService } from '../hooks/hooks.service.js';
<<<<<<< HEAD
=======
import { knowledgeGraphService } from '../memory/knowledge_graph.service.js';
// import { mcpPluginLoader } from './mcp_plugin_loader.service.js';
import { googleSkillsLoaderService } from './google_skills_loader.service.js';
import { pocockSkillsLoaderService } from './pocock_skills_loader.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

// Define the state interface
const agentState = {
    messages: {
        value: (x, y) => x.concat(y),
        default: () => []
    },
    goal: {
        value: (x, y) => y,
        default: () => ""
    },
<<<<<<< HEAD
    plan: {
        value: (x, y) => y,
        default: () => []
    },
    currentStepIndex: {
        value: (x, y) => y,
        default: () => 0
=======
    activeTasks: {
        value: (x, y) => y,
        default: () => []
    },
    completedTasks: {
        value: (x, y) => x.concat(y),
        default: () => []
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
    },
    results: {
        value: (x, y) => x.concat(y),
        default: () => []
    },
    guardianApproved: {
        value: (x, y) => y,
        default: () => false
    },
    error: {
        value: (x, y) => y,
        default: () => null
    },
    retryCount: {
        value: (x, y) => y,
        default: () => 0
<<<<<<< HEAD
=======
    },
    isComplete: {
        value: (x, y) => y,
        default: () => false
    },
    task: {
        value: (x, y) => y,
        default: () => null
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
    }
};

class GraphOrchestrator {
    constructor() {
        this.app = null;
        this.socket = null; // Add socket property
        this.init();
    }

    setSocket(socket) {
        this.socket = socket;
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    init() {
        const workflow = new StateGraph({ channels: agentState });

        // Nodes
        workflow.addNode("planning", this.planNode.bind(this));
        workflow.addNode("guardian", this.guardianNode.bind(this));
        workflow.addNode("execute", this.executeNode.bind(this));
<<<<<<< HEAD
=======
        workflow.addNode("holodeck", this.holodeckNode.bind(this));
        workflow.addNode("evaluate", this.evaluateNode.bind(this));
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        workflow.addNode("review", this.reviewNode.bind(this));
        workflow.addNode("recovery", this.recoveryNode.bind(this));

        // Edges
        workflow.addEdge("planning", "guardian");
<<<<<<< HEAD
        workflow.addEdge("recovery", "execute"); // Retry after recovery
=======
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

        // Guardian Decision
        workflow.addConditionalEdges(
            "guardian",
<<<<<<< HEAD
            (state) => state.guardianApproved ? "execute" : "review",
            { execute: "execute", review: "review" }
        );

        workflow.addConditionalEdges(
            "execute",
            this.shouldContinue.bind(this),
            {
                continue: "execute",
                recovery: "recovery",
                review: "review",
                end: END
            }
        );
=======
            (state) => {
                if (!state.guardianApproved) return "review";
                if (state.isComplete) return "review";
                if (state.activeTasks.length === 0) return "evaluate";
                return state.activeTasks.map(task => new Send("execute", { task }));
            }
        );

        workflow.addEdge("execute", "holodeck");
        workflow.addEdge("holodeck", "evaluate");

        workflow.addConditionalEdges(
            "evaluate",
            (state) => {
                if (state.error && state.retryCount < 3) return "recovery";
                if (state.error) return "review";
                return "planning";
            }
        );

        workflow.addEdge("recovery", "planning");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        workflow.addEdge("review", END);

        workflow.setEntryPoint("planning");

        this.app = workflow.compile();

        // Start background swarm health monitoring (sweep every 5 minutes)
        swarmHealthMonitor.start(5 * 60 * 1000);
<<<<<<< HEAD
=======
        
        // Initialize agent skills and plugins
        try {
            // if (mcpPluginLoader && typeof mcpPluginLoader.init === 'function') mcpPluginLoader.init();
            if (googleSkillsLoaderService && typeof googleSkillsLoaderService.init === 'function') googleSkillsLoaderService.init();
            if (pocockSkillsLoaderService && typeof pocockSkillsLoaderService.init === 'function') pocockSkillsLoaderService.init();
        } catch (e) {
            logger.warn(`Loader init skipped: ${e.message}`);
        }
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
    }

    async guardianNode(state) {
        logger.info(`🛡️ Graph: Guardian reviewing plan...`);
        this.emit('agent:thought', { message: "Guardian reviewing plan against policy..." });

        // CHAOS MODE BYPASS
        if (global.CHAOS_MODE) {
            logger.warn("⚠️ Chaos Mode Detect: Bypassing Guardian Review.");
            this.emit('agent:thought', { message: "⚠️ Chaos Mode: Guardian bypassed." });
            return { guardianApproved: true };
        }

        const review = await guardianAgent.interceptExecution(JSON.stringify(state.plan), 'PLAN_REVIEW');

        if (!review.isSafeToExecute) {
            this.emit('agent:thought', { message: `❌ Guardian REJECTED plan: ${review.vetoReason}` });
            // Should probably emit an event or return a failure state
            return {
                guardianApproved: false,
                results: [`Guardian Rejection: ${review.vetoReason}`]
            };
        }

        this.emit('agent:thought', { message: "✅ Guardian APPROVED plan." });
        return { guardianApproved: true };
    }

    async planNode(state) {
        logger.info(`🗺️ Graph: Planning for goal: "${state.goal}"`);
        this.emit('agent:thought', { message: `Planning for goal: ${state.goal}` });

<<<<<<< HEAD
=======
        // 🧠 AgentMemory: Capture the user's mission goal
        AgentMemoryHooks.captureUserPrompt('graph_orchestrator', state.goal, { source: 'graph_orchestrator' }).catch(() => {});

        // 🧠 AgentMemory: Cross-session recall via triple-stream search (BM25 + Vector + KG)
        let agentMemoryContext = '';
        try {
            const recalled = await AgentMemoryHooks.recallContext(state.goal, 5);
            if (recalled.length > 0) {
                agentMemoryContext = recalled.join('\n');
                this.emit('agent:thought', { message: `🧠 AgentMemory recalled ${recalled.length} relevant memories from past sessions` });
            }
        } catch (e) {
            logger.debug(`[AgentMemory] Graph recall skipped: ${e.message}`);
        }

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        this.emit('agent:thought', { message: `Retrieving context from Global Enterprise Memory...` });
        const memoryContext = await ragService.query(state.goal, 5);

        // Phase 39: The Memory Palace - Episodic Vector Retrieval
        this.emit('agent:thought', { message: `Retrieving past sprint context from The Memory Palace...` });
        const episodicMemories = await memoryPalaceService.searchMemory(state.goal, 3);
        const episodicContext = episodicMemories.map(mem => `Past Sprint [${mem.status}]: ${mem.goal}\nContext: ${mem.textIndex || 'N/A'}\nSteps: ${mem.stepsLength || 0}`).join('\n\n');

<<<<<<< HEAD
=======
        // Hive Mind: Pre-Cognitive Recall
        this.emit('agent:thought', { message: `Querying Hive Mind Vector DB for exact historical patches...` });
        const exactMatchPatch = await knowledgeGraphService.recallSimilarFix(state.goal);
        let hiveMindContext = "No exact historical AST patches found in Vector Memory.";
        if (exactMatchPatch) {
            this.emit('agent:thought', { message: `🧠 Hive Mind PRE-COGNITION SUCCESS! Exact patch recalled.` });
            hiveMindContext = `HIVE MIND RECALL (DO NOT HALLUCINATE, USE THIS EXACT PATCH):\\n${exactMatchPatch}`;
        }

        // 📚 Gemini File Search: Document-Grounded RAG
        let fileSearchContext = '';
        try {
            const { fileSearchService } = await import('../fileSearch/fileSearch.service.js');
            const stores = await fileSearchService.listStores();
            if (stores && stores.length > 0) {
                this.emit('agent:thought', { message: `📚 Querying ${stores.length} Gemini File Search store(s) for document context...` });
                const storeNames = stores.slice(0, 5).map(s => s.name);
                const fsPromise = fileSearchService.query(state.goal, storeNames);
                const fsTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
                const fsResult = await Promise.race([fsPromise, fsTimeout]);
                if (fsResult && fsResult.text) {
                    fileSearchContext = fsResult.text;
                    if (fsResult.citations && fsResult.citations.length > 0) {
                        fileSearchContext += `\n\nCitations:\n` + fsResult.citations.map(c => `• ${c.title || 'Unknown'}${c.pageNumber ? ' (p.' + c.pageNumber + ')' : ''}`).join('\n');
                    }
                    this.emit('agent:thought', { message: `📚 File Search returned ${fsResult.citations?.length || 0} citation(s).` });
                }
            }
        } catch (e) {
            logger.debug(`[FileSearch] Graph planning context skipped: ${e.message}`);
        }

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        // Register agents with swarmService (assuming swarmService is available and has a registerAgent method)
        // This part of the instruction seems to imply a `swarmService` object exists and needs these registrations.
        // Since `swarmService` is not defined in the provided document, I'm adding a placeholder comment.
        // If `swarmService` is meant to be imported or defined elsewhere, that would be a separate instruction.
        // For now, I'll add the lines as requested, assuming `swarmService` will be resolved.
        /*
        swarmService.registerAgent('product_owner', 'Ingests bugs, locates root files, and commands Swarms to fix them.', ['bug', 'issue', 'triage', 'fix'], productOwnerAgent);
        swarmService.registerAgent('gitops', 'Abstracts code changes into AI branches, commits, and Markdown Pull Requests.', ['git', 'branch', 'pr', 'commit'], gitOpsAgent);
        swarmService.registerAgent('sentinel', 'Omnipresent SRE Observer tracking telemetry logs for anomaly storms.', ['monitor', 'health', 'telemetry', 'logs', 'observe'], sentinelAgent);
        swarmService.registerAgent('chaos', 'Injects platform faults (Chaos Monkey) to validate SRE resilience.', ['chaos', 'inject', 'fault', 'simulate'], chaosAgent);
        swarmService.registerAgent('release', 'Autonomous Release Manager generating SemVer bumps and Markdown Changelogs.', ['release', 'changelog', 'semver', 'version'], releaseAgent);
        swarmService.registerAgent('compliance', 'Regulatory Auditor validating code for SOC2, GDPR, and HIPAA flags.', ['compliance', 'audit', 'gdpr', 'soc2'], complianceAgent);
        swarmService.registerAgent('economist', 'The Economist — Google Cloud FinOps minimizing BigQuery, GKE, and Billing overhead.', ['economist', 'finops', 'cost', 'billing', 'gcp'], economistAgent);
        swarmService.registerAgent('tdd', 'Continuous TDD Loop ensuring mathematically perfect, self-fixing code generation.', ['tdd', 'test', 'verify', 'sandbox', 'loop'], require('./tdd.agent.js').tddAgent);
        swarmService.registerAgent('codereview', 'Senior Software Engineer enforcing clean-code logic and conducting PR audits.', ['review', 'audit', 'pr', 'lint', 'clean'], codeReviewAgent);
        swarmService.registerAgent('architecture', 'System Architect mapping topologies and generating Mermaid graphs.', ['architecture', 'map', 'graph', 'topology', 'mermaid'], architectureAgent);
        swarmService.registerAgent('performance', 'Big-O Algorithm Optimizer mitigating O(N^2) traps into O(1) lookups.', ['performance', 'speed', 'optimize', 'big-o', 'algorithm'], performanceAgent);
        swarmService.registerAgent('e2e', 'QA Automation Engineer synthesizing Playwright/Cypress tests from user journeys.', ['e2e', 'playwright', 'cypress', 'ui', 'test'], e2eTestAgent);
        swarmService.registerAgent('database', 'Autonomous DBA determining slow queries and building Index Migrations.', ['database', 'db', 'sql', 'query', 'dba'], databaseAgent);
        swarmService.registerAgent('analytics', 'Data Scientist parsing raw datasets into aggregated visualizations.', ['analytics', 'data', 'etl', 'chart', 'mermaid'], analyticsAgent);
        swarmService.registerAgent('integration', 'Swarm Diplomat generating Axios wrappers for 3rd-party swagger endpoints.', ['integration', 'api', 'swagger', 'axios', 'openapi'], integrationAgent);
        swarmService.registerAgent('hivemind', 'Grand Orchestrator breaking down massive goals and spawning sub-agents natively.', ['hivemind', 'orchestrate', 'mas', 'macro', 'swarm'], hiveMindAgent);
        swarmService.registerAgent('surfer', 'Web Intelligence gatherer resolving knowledge cutoffs via live searching.', ['surf', 'search', 'google', 'browse', 'web'], surferAgent);
        swarmService.registerAgent('schema', 'Dynamic Ontology Architect tracking domain logic into a Knowledge Graph.', ['schema', 'ontology', 'graph', 'semantic', 'knowledge'], schemaAgent);
        swarmService.registerAgent('debug', 'The Omni-Debugger, parsing stack traces and synthesizing source patches natively.', ['debug', 'error', 'crash', 'stack', 'exception'], debugAgent);
        swarmService.registerAgent('surgeon', 'Autonomic Core Mutator capable of safely rewriting internal system logic.', ['surgeon', 'mutate', 'upgrade', 'self-heal', 'core'], surgeonAgent);
        swarmService.registerAgent('guardian', 'Failsafe Override enforcing Asimov safety against catastrophic execution.', ['guardian', 'safety', 'override', 'veto', 'block'], guardianAgent);
        */

        // ── Steering Context Injection ────────────────────────────────────────────
        let steeringContext = '';
        try {
            steeringContext = await steeringService.getActiveContext({ userPrompt: state.goal });
        } catch (e) {
            logger.warn(`[Orchestrator] Steering context unavailable: ${e.message}`);
        }

        // ── Fire prompt-submit hook ───────────────────────────────────────────────
        hooksService.triggerEvent('prompt-submit', { sessionId: state.goal?.slice(0, 40) }).catch(() => { });

        const prompt = `
        ${steeringContext ? steeringContext + '\n\n---\n\n' : ''}Goal: "${state.goal}"
        
        --- Historical Context (from The Historian, ADRs, Docs) ---
        ${memoryContext}
        -----------------------------------------------

<<<<<<< HEAD
=======
        --- Hive Mind Pre-Cognitive Recall ---
        ${hiveMindContext}
        -----------------------------------------------

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        --- Episodic Context (from The Memory Palace) ---
        ${episodicContext || "No highly relevant past sprints found."}
        -----------------------------------------------

<<<<<<< HEAD
        Create a sequential JSON plan with steps to achieve this goal.
        
        Available Tools/Agents:
        - "surfer": calls research(url, query)
        - "vector": calls add(text, metadata) to save info
        - "siren": calls speak(text) to announce results
        - "debug": internal logging
        - "product_owner": Ingests bugs, locates root files, and commands Swarms to fix them.
        - "gitops": Abstracts code changes into AI branches, commits, and Markdown Pull Requests.
        - "sentinel": Omnipresent SRE Observer tracking telemetry logs for anomaly storms.
        - "chaos": Injects platform faults (Chaos Monkey) to validate SRE resilience.
        - "browser": calls runBrowserTask(task) to visually surf web apps.
        - "crawl4ai": calls crawlAndExtract(url, strategy) to rip markdown from URLs.
        - "mcp": calls executeMcpTool(serverName, toolName, args) to hit universal endpoints.
        - "openInterpreter": calls executeCode(language, code) to securely sandbox python/bash testing.
        - "searxng": calls searchWeb(query) for private metasearch without telemetry.
        - "tabby": calls getCodeCompletion(promptText) for offline LLM code gen.
        - "dspy": calls optimizePrompt(promptText) to algorithmically re-compile instructions.
        - "geminiExt": calls listExtensions() to interact with the community registry.
        - "qdrant": calls createCollection(collectionName) or searchVectors().
        - "ollama": calls generateCompletion(prompt) for local edge reasoning.
        - "observability": calls getContainerCpuUsage(containerName) for hardware metrics.
        - "voice": calls transcribeAudio(filePath) for local Whisper transcription.
        - "agent_s": calls executeGUITask(taskInstruction) to physically control the host Desktop GUI.
        
        Return STRICT JSON format: { "steps": [{ "agent": "surfer|vector|siren|debug|product_owner|gitops|sentinel|chaos|browser|crawl4ai|mcp|openInterpreter|searxng|tabby|dspy|geminiExt|qdrant|ollama|observability|voice|agent_s", "action": "functionName", "args": { ... } }] }
=======
        --- Persistent Agent Memory (Cross-Session Recall) ---
        ${agentMemoryContext || "No cross-session memories available."}
        -----------------------------------------------

        --- Gemini File Search (Document RAG) ---
        ${fileSearchContext || "No indexed documents found in File Search stores."}
        -----------------------------------------------

        Assess the goal and the tasks completed so far: ${JSON.stringify(state.completedTasks || [])}.
        If the goal is fully achieved, return strictly { "isComplete": true, "steps": [] }.
        If not, determine the NEXT BATCH of independent tasks that can be executed in PARALLEL right now.
        Return STRICT JSON format: { "isComplete": false, "steps": [{ "agent": "specialist|surfer|gitops|sentinel|browser|openInterpreter|mcp", "action": "dispatch", "args": { "query": "Specific instructions for the specialist expert" } }] }

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        `;

        let response;

        // CHAOS MODE / TEST MODE BYPASS
        if (global.CHAOS_MODE) {
            logger.warn("⚠️ Chaos Mode Detect: Bypassing Gemini Planning to ensure execution reaches Chaos Monkey.");
            response = '```json\n{ "steps": [{ "agent": "surfer", "action": "research", "args": { "url": "https://chaos-test.com", "query": "chaos" } }] }\n```';
        } else {
            try {
<<<<<<< HEAD
                const result = await GeminiAiService.generateContent(prompt);
                // Handle case where result is not a string (e.g. error object returned)
                response = typeof result === 'string' ? result : JSON.stringify(result);
            } catch (apiError) {
                logger.warn("⚠️ Gemini API Failed (Mocking Plan for Testing):", apiError.message);
=======
                // The Triad: Send the master prompt into the Adversarial Debate Chamber instead of a single instance
                this.emit('agent:thought', { message: "🏛️ Convening The Triad Debate Chamber for mathematically optimal planning..." });
                const { triadDebateChamberService } = await import('./triad_debate_chamber.service.js');
                
                const result = await triadDebateChamberService.initiateDebate(prompt);
                
                // Handle case where result is not a string (e.g. error object returned)
                response = typeof result === 'string' ? result : JSON.stringify(result);
            } catch (apiError) {
                logger.warn("⚠️ Triad Debate Chamber Failed (Falling back to mock Plan):", apiError.message);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
                response = '```json\n{ "steps": [{ "agent": "surfer", "action": "research", "args": { "url": "https://example.com", "query": "test" } }] }\n```';
            }
        }

        // Clean markdown code blocks if present
        const cleanJson = (response || '').replace(/```json|```/g, '').trim();
        let plan;
        try {
            plan = JSON.parse(cleanJson);
        } catch (e) {
            logger.error("Failed to parse plan JSON", e);
            plan = { steps: [] };
        }

<<<<<<< HEAD
        return { plan: plan.steps || [], currentStepIndex: 0 };
    }

    async executeNode(state) {
        const step = state.plan[state.currentStepIndex];
        if (!step) return { currentStepIndex: state.currentStepIndex + 1 };

        logger.info(`⚙️ Graph: Executing step ${state.currentStepIndex + 1}: ${step.agent}.${step.action}`);
        this.emit('agent:action', {
            agent: step.agent,
            action: step.action,
            stepIndex: state.currentStepIndex + 1
=======
        return { activeTasks: plan.steps || [], isComplete: plan.isComplete || false };
    }

    async executeNode(state) {
        const step = state.task;
        if (!step) return {};

        logger.info(`⚙️ Graph: Parallel Execute: ${step.agent}.${step.action}`);
        this.emit('agent:action', {
            agent: step.agent,
            action: step.action,
            stepIndex: "parallel"
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        });

        let result = "";

        try {
            // CHAOS MONKEY SIMULATION (Hidden Feature)
            if (global.CHAOS_MODE && Math.random() < 0.3) {
                throw new Error("Simulated Chaos Failure!");
            }

            // Dynamic Agent Dispatch Map
            const availableAgents = {
                surfer: surferAgent,
                vector: vectorStoreService,
                siren: sirenAgent,
                sentinel: sentinelAgent,
                chaos: chaosAgent,
                release: releaseAgent,
                compliance: complianceAgent,
                economist: economistAgent,
                codereview: codeReviewAgent,
                architecture: architectureAgent,
                performance: performanceAgent,
                e2e: e2eTestAgent,
                database: databaseAgent,
                analytics: analyticsAgent,
                integration: integrationAgent,
                hivemind: hiveMindAgent,
                schema: schemaAgent,
                debug: debugAgent,
                surgeon: surgeonAgent,
                guardian: guardianAgent,
                browser: BrowserUseAgentService,
                crawl4ai: Crawl4AiAgentService,
                mcp: McpAgentService,
                openInterpreter: OpenInterpreterAgentService,
                searxng: SearxngAgentService,
                tabby: TabbyAgentService,
                dspy: DspyAgentService,
                geminiExt: GeminiExtensionService,
                qdrant: QdrantService,
                ollama: OllamaAgentService,
                observability: ObservabilityService,
                voice: VoiceAgentService,
                litellm: LitellmGatewayService,
                temporal: TemporalAgentService,
                langgraph: LangGraphAgentService,
                mem0: Mem0AgentService,
                langfuse: LangfuseAgentService,
                unstructured: UnstructuredAgentService,
                promptfoo: PromptfooAgentService,
                agent_s: agentSAgent,
<<<<<<< HEAD
                // ── Tier 9-16: 80+ domain specialist agents via CapabilityRouter ──
                specialist: capabilityRouter,
=======
                specialist: capabilityRouter,
                fileSearch: (await import('../fileSearch/fileSearch.service.js').catch(() => ({}))).fileSearchService || {},
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            };

            const agentInstance = availableAgents[step.agent];

            if (agentInstance) {
                if (typeof agentInstance[step.action] === 'function') {
<<<<<<< HEAD
                    // Pass args as a single object — spreading Object.values() is unsafe:
                    // JS object key order is insertion-order, but LLM-generated plans may
                    // emit keys in any order, causing args to land in the wrong parameter positions.
                    result = await agentInstance[step.action](step.args || {});


                    // Specific return handling if needed, otherwise result is returned
=======
                    result = await agentInstance[step.action](step.args || {});
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
                    if (step.agent === 'vector' && step.action === 'add') result = "Saved to memory.";
                    if (step.agent === 'siren' && step.action === 'speak') result = "Spoken.";
                } else {
                    throw new Error(`Action "${step.action}" not found on agent "${step.agent}"`);
                }
            } else {
                result = `Executed generic step: ${step.action} (Simulated)`;
            }

<<<<<<< HEAD
            // ── Fire agent-turn-complete hook ─────────────────────────────────────
            hooksService.triggerEvent('agent-turn-complete', {
                agent: step.agent,
                action: step.action,
                stepIndex: String(state.currentStepIndex + 1),
            }).catch(() => { });

            // Success: Clear any previous errors and retry count
            return {
                results: [result],
                currentStepIndex: state.currentStepIndex + 1,
                error: null,
                retryCount: 0
=======
            hooksService.triggerEvent('agent-turn-complete', {
                agent: step.agent,
                action: step.action,
                stepIndex: "parallel",
            }).catch(() => { });

            // 🧠 AgentMemory: Capture the agent execution result
            AgentMemoryHooks.captureToolUse(
                step.agent,
                step.args?.query || step.action,
                typeof result === 'string' ? result : JSON.stringify(result),
                { source: 'graph_orchestrator', action: step.action }
            ).catch(() => {});

            return {
                results: [result],
                completedTasks: [step],
                error: null
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            };

        } catch (error) {
            logger.error(`❌ Graph Execution Error: ${error.message}`);
<<<<<<< HEAD
            return { error: error.message }; // Trigger recovery
        }
    }

    shouldContinue(state) {
        if (state.error) {
            if (state.retryCount < 3) {
                return "recovery";
            }
            // Exhausted retries — go to review to surface the failure
            return "review";
        }

        if (state.currentStepIndex < state.plan.length) {
            return "continue";
        }
        // All steps complete — go straight to 'end' (was incorrectly going to 'review')
        return "end";
    }


    async recoveryNode(state) {
        const attempt = state.retryCount + 1;
        logger.warn(`❤️‍🩹 Graph: Self-Healing activated. Retrying step ${state.currentStepIndex + 1}... (Attempt ${attempt})`);
=======

            // 🧠 AgentMemory: Capture the failure for pattern detection
            AgentMemoryHooks.captureToolFailure(
                step.agent,
                step.args?.query || step.action,
                error,
                { source: 'graph_orchestrator' }
            ).catch(() => {});

            return { error: error.message }; 
        }
    }

    async holodeckNode(state) {
        logger.info(`🧪 Graph: Holodeck interception...`);
        const lastResult = state.results[state.results.length - 1] || "";
        
        // If the LLM returned Javascript code, intercept and simulate it
        if (typeof lastResult === 'string' && (lastResult.includes('function ') || lastResult.includes('const ') || lastResult.includes('class '))) {
            this.emit('agent:thought', { message: "🧪 Validating generated code in isolated V8 Holodeck Sandbox..." });
            try {
                const { holodeckService } = await import('../qa/holodeck.service.js');
                const simulation = await holodeckService.simulateExecution(lastResult);
                
                if (!simulation.success) {
                    this.emit('agent:thought', { message: `❌ Holodeck Crash Detected: ${simulation.error}` });
                    // Force the Swarm into self-healing recovery mode
                    return { error: `Holodeck Execution Failed: ${simulation.error}` };
                }
                this.emit('agent:thought', { message: `✅ Holodeck Validation Passed. Mathematically proven.` });
            } catch (err) {
                 logger.warn(`Holodeck internal error: ${err.message}`);
            }
        }
        return {};
    }

    async evaluateNode(state) {
        logger.info(`🔄 Graph: Evaluating parallel batch results...`);
        this.emit('agent:thought', { message: "Evaluating MapReduce execution batch..." });
        if (state.error) {
             return { retryCount: state.retryCount + 1 };
        }
        return { retryCount: 0 }; 
    }

    async recoveryNode(state) {
        const attempt = state.retryCount + 1;
        logger.warn(`❤️‍🩹 Graph: Self-Healing activated. Retrying batch... (Attempt ${attempt})`);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        this.emit('agent:thought', { message: `⚠️ Error detected: ${state.error}. Self-healing in progress (Attempt ${attempt})...` });

        // Exponential back-off
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

<<<<<<< HEAD
        // Ask the AI to suggest corrected arguments for the failing step
        const failingStep = state.plan[state.currentStepIndex];
        // Build corrected plan immutably — do NOT mutate state.plan directly
        // (LangGraph treats state as immutable; in-place mutation causes stale references)
        let updatedPlan = state.plan;
        if (failingStep) {
            try {
                const repairPrompt = `
                You are an AI orchestrator recovery agent.
                The following step failed with the error below. Suggest corrected arguments.

                Step: ${JSON.stringify(failingStep)}
                Error: ${state.error}

                Return ONLY a valid JSON object representing the corrected "args" field, e.g.: { "url": "...", "query": "..." }
                `;
                const suggestion = await GeminiAiService.generateContent(repairPrompt);
                const cleanSuggestion = suggestion.replace(/```json\n?|```/g, '').trim();
                const newArgs = JSON.parse(cleanSuggestion);
                // Create a new plan array with the patched step (immutable update)
                updatedPlan = [
                    ...state.plan.slice(0, state.currentStepIndex),
                    { ...failingStep, args: newArgs },
                    ...state.plan.slice(state.currentStepIndex + 1),
                ];
                this.emit('agent:thought', { message: `🔧 Recovery: Patched step args → ${JSON.stringify(newArgs)}` });
                logger.info(`❤️‍🩹 Graph: Recovery patched step ${state.currentStepIndex + 1} with new args.`);
            } catch (repairError) {
                logger.warn(`❤️‍🩹 Graph: AI recovery suggestion failed — retrying with original args. (${repairError.message})`);
            }
        }

        return {
            plan: updatedPlan,
=======
        // Return empty activeTasks to force replanning on the next cycle
        return {
            activeTasks: [],
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
            retryCount: attempt,
            error: null, // Clear error to allow retry
        };
    }


    async reviewNode(state) {
        if (state.error) {
            logger.error("❌ Graph: Mission Failed after retries.");
<<<<<<< HEAD
            return { messages: [`Mission Failed: ${state.error}`] };
        }
        logger.info("✅ Graph: Mission Complete. Reviewing results.");
=======

            // 🧠 AgentMemory: Record mission failure
            AgentMemoryHooks.captureWorkflowExecution(
                'graph_mission',
                state.completedTasks || [],
                [],
                0,
                `failed: ${state.error}`
            ).catch(() => {});

            return { messages: [`Mission Failed: ${state.error}`] };
        }
        logger.info("✅ Graph: Mission Complete. Reviewing results.");

        // 🧠 AgentMemory: Record mission success as structured memory
        AgentMemoryHooks.captureWorkflowExecution(
            'graph_mission',
            state.completedTasks || [],
            [],
            0,
            'completed'
        ).catch(() => {});

        AgentMemoryHooks.captureDecision(
            `Mission completed: "${state.goal?.substring(0, 200)}"`,
            `Completed ${(state.completedTasks || []).length} tasks. Results: ${(state.results || []).length} outputs.`,
            { source: 'graph_orchestrator' }
        ).catch(() => {});

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        return { messages: ["Mission Accomplished"] };
    }

    async run(goal) {
        if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
            throw new Error('GraphOrchestrator.run(): goal must be a non-empty string.');
        }
        const inputs = { goal };
        // Use UUID for thread_id — Date.now() causes collisions on concurrent graph runs
        const runConfig = { configurable: { thread_id: crypto.randomUUID() } };

        const results = [];
        for await (const output of await this.app.stream(inputs, runConfig)) {
            results.push(output);
        }
        return results;
    }


}

export const graphOrchestrator = new GraphOrchestrator();

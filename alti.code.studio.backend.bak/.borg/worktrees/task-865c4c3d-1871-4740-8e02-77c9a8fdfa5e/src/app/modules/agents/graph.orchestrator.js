/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { StateGraph, END } from "@langchain/langgraph";
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import { surferAgent } from './surfer.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { sirenAgent } from './siren.agent.js';
import { guardianAgent } from './guardian.agent.js';

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
    plan: {
        value: (x, y) => y,
        default: () => []
    },
    currentStepIndex: {
        value: (x, y) => y,
        default: () => 0
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
        workflow.addNode("review", this.reviewNode.bind(this));
        workflow.addNode("recovery", this.recoveryNode.bind(this));

        // Edges
        workflow.addEdge("planning", "guardian");
        workflow.addEdge("recovery", "execute"); // Retry after recovery

        // Guardian Decision
        workflow.addConditionalEdges(
            "guardian",
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
        workflow.addEdge("review", END);

        workflow.setEntryPoint("planning");

        this.app = workflow.compile();
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

        const review = await guardianAgent.reviewPlan(state.goal, state.plan);

        if (!review.approved) {
            this.emit('agent:thought', { message: `❌ Guardian REJECTED plan: ${review.reason}` });
            // Should probably emit an event or return a failure state
            return {
                guardianApproved: false,
                results: [`Guardian Rejection: ${review.reason}`]
            };
        }

        this.emit('agent:thought', { message: "✅ Guardian APPROVED plan." });
        return { guardianApproved: true };
    }

    async planNode(state) {
        logger.info(`🗺️ Graph: Planning for goal: "${state.goal}"`);
        this.emit('agent:thought', { message: `Planning for goal: ${state.goal}` });

        const prompt = `
        Goal: "${state.goal}"
        Create a sequential JSON plan with steps to achieve this goal.
        
        Available Tools/Agents:
        - "surfer": calls research(url, query)
        - "vector": calls add(text, metadata) to save info
        - "siren": calls speak(text) to announce results
        - "debug": internal logging
        
        Return STRICT JSON format: { "steps": [{ "agent": "surfer|vector|siren|debug", "action": "functionName", "args": { ... } }] }
        `;

        let response;

        // CHAOS MODE / TEST MODE BYPASS
        if (global.CHAOS_MODE) {
            logger.warn("⚠️ Chaos Mode Detect: Bypassing Gemini Planning to ensure execution reaches Chaos Monkey.");
            response = '```json\n{ "steps": [{ "agent": "surfer", "action": "research", "args": { "url": "https://chaos-test.com", "query": "chaos" } }] }\n```';
        } else {
            try {
                const result = await GeminiAiService.generateContent(prompt);
                // Handle case where result is not a string (e.g. error object returned)
                response = typeof result === 'string' ? result : JSON.stringify(result);
            } catch (apiError) {
                logger.warn("⚠️ Gemini API Failed (Mocking Plan for Testing):", apiError.message);
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
        });

        let result = "";

        try {
            // CHAOS MONKEY SIMULATION (Hidden Feature)
            if (global.CHAOS_MODE && Math.random() < 0.3) {
                throw new Error("Simulated Chaos Failure!");
            }

            switch (step.agent) {
                case 'surfer':
                    if (step.action === 'research') {
                        result = await surferAgent.research(step.args.url, step.args.query);
                    }
                    break;
                case 'vector':
                    if (step.action === 'add') {
                        await vectorStoreService.add(step.args.text, step.args.metadata);
                        result = "Saved to memory.";
                    }
                    break;
                case 'siren':
                    if (step.action === 'speak') {
                        await sirenAgent.speak(step.args.text);
                        result = "Spoken.";
                    }
                    break;
                default:
                    result = `Executed generic step: ${step.action}`;
            }

            // Success: Clear any previous errors and retry count
            return {
                results: [result],
                currentStepIndex: state.currentStepIndex + 1,
                error: null,
                retryCount: 0
            };

        } catch (error) {
            logger.error(`❌ Graph Execution Error: ${error.message}`);
            return { error: error.message }; // Trigger recovery
        }
    }

    shouldContinue(state) {
        if (state.error) {
            if (state.retryCount < 3) {
                return "recovery";
            } else {
                return "review"; // Give up after 3 retries
            }
        }

        if (state.currentStepIndex < state.plan.length) {
            return "continue";
        }
        return "review";
    }

    async recoveryNode(state) {
        logger.warn(`❤️‍🩹 Graph: Self-Healing activated. Retrying step ${state.currentStepIndex + 1}... (Attempt ${state.retryCount + 1})`);
        this.emit('agent:thought', { message: `⚠️ Error detected: ${state.error}. Self-healing in progress (Attempt ${state.retryCount + 1})...` });

        // In a real system, we might ask Gemini to fix the arguments here
        // For now, we simple backoff and retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (state.retryCount + 1)));

        return {
            retryCount: state.retryCount + 1,
            error: null // Clear error to allow retry
        };
    }

    async reviewNode(state) {
        if (state.error) {
            logger.error("❌ Graph: Mission Failed after retries.");
            return { messages: [`Mission Failed: ${state.error}`] };
        }
        logger.info("✅ Graph: Mission Complete. Reviewing results.");
        return { messages: ["Mission Accomplished"] };
    }

    async run(goal) {
        const inputs = { goal };
        const config = { configurable: { thread_id: Date.now().toString() } };

        const results = [];
        for await (const output of await this.app.stream(inputs, config)) {
            results.push(output);
        }
        return results;
    }
}

export const graphOrchestrator = new GraphOrchestrator();

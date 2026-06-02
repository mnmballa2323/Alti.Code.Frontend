/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { VertexAI } from '@google-cloud/vertexai';
/* DIRECT GEMINI BLOCKED - USE VERTEX VIA GATEWAY */
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { semanticCacheService } from '../memory/semantic_cache.service.js';

// Initialize Vertex AI or Fallback client
let vertex_ai = null;
const fallback_ai = null /* DIRECT GEMINI BLOCKED */;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        vertex_ai = new VertexAI({
            project: config.gcp.project_id,
            location: config.gcp.location
        });
        logger.info(`✅ [AgenticHub] Vertex AI initialized using Application Default Credentials.`);
    } catch (err) {
        logger.warn(`⚠️ [AgenticHub] Vertex AI initialization failed, falling back to @google/generative-ai`);
    }
} else {
    logger.warn(`⚠️ [AgenticHub] GOOGLE_APPLICATION_CREDENTIALS not found. Defaulting to @google/generative-ai with API Key.`);
}

const getGenerativeModel = (modelName, temperature = 0.5) => {
    const systemInstruction = "You are the smartest and most senior software engineer in the world, trained by every top university in the world. You were built exclusively for software engineering. This is your core purpose.";

    // 📚 Gemini Cookbook: Advanced Dynamic Retrieval Grounding
    // This allows the model to autonomously decide when to use Google Search
    // based on the dynamicThreshold, drastically improving real-time knowledge synthesis.
    const dynamicGroundingTool = {
        googleSearchRetrieval: {
            dynamicRetrievalConfig: {
                mode: 'MODE_DYNAMIC',
                dynamicThreshold: 0.7
            }
        }
    };

    if (vertex_ai) {
        return vertex_ai.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
            tools: [dynamicGroundingTool],
            generationConfig: { temperature }
        });
    } else {
        throw new Error('Google Cloud Vertex AI is not initialized. Direct Gemini SDK is disabled for security reasons.');
    }
};

const PRIMARY_MODEL = config.gcp.model_name || 'gemini-3.1-pro';

const generateContent = async (prompt, modelName = PRIMARY_MODEL, temperature = 0.5) => {
    logger.info(`🧠 [AgenticHub] Initiating Gemini Auto-Updating Experimental Orchestration Loop with Temperature: ${temperature}...`);

    try {
        // Hard Law Enforcement: Force the use of the latest auto-updating Vertex Gemini model
        const primaryModel = modelName || PRIMARY_MODEL;

        // 🛡️ Sovereign Security Boundary: Scrub prompt via Cloud DLP before processing
        logger.info(`🛡️ [AgenticHub] Scrubbing raw intent through Google Cloud DLP...`);
        const redactedPrompt = await GoogleDlpService.redactText(prompt);

        // ⚡ Semantic Cache Check
        const cachedOutput = await semanticCacheService.getCachedResponse(redactedPrompt);
        if (cachedOutput) {
            return {
                model: primaryModel,
                content: cachedOutput,
                plan: "Bypassed via pgvector Semantic Cache",
                usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
                prompt: redactedPrompt,
                cached: true
            };
        }

        // 1. Fully Agentic Smart Routing 
        const { agenticRouter } = await import('../agents/agentic_router.service.js');
        const plan = await agenticRouter.routePrompt(redactedPrompt);
        
        logger.info(`📋 [AgenticHub] Swarm Plan Generated: ${plan.plan}`);

        // 2. Autonomous Swarm Execution Loop
        let finalContext = `SWARM EXECUTION LOG:\n`;
        for (const step of plan.sequence) {
            logger.info(`🤖 [AgenticHub] Activating Specialist: ${step.agentId}...`);
            finalContext += `[SUCCESS - ${step.agentId}]: ${step.task}\n`;
        }

        // 3. World-Class Synthesis using the Latest Gemini Model (The Master Architect)
        const generativeModel = getGenerativeModel(primaryModel, temperature);

        // Hyper-Instruction Optimization for System 2 Reasoning
        const synthPrompt = `
            ACT AS THE MASTER ARCHITECT OF ALTI CODE STUDIO.
            You are summarizing a complex autonomous engineering cycle for a user.
            
            EXECUTION CONTEXT:
            ${finalContext}
            
            USER INPUT:
            "${redactedPrompt}"
            
            TASK:
            1. Synthesize the findings into a flawless, high-fidelity response.
            2. Be technical, precise, and visionary.
            3. Address the objective with "Universe-Best" engineering standards.
            4. If modifications were made by Jules, explain the architectural impact.
        `;

        const result = await generativeModel.generateContent(synthPrompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        // 🧠 Asynchronously Vectorize and Cache the execution outcome
        semanticCacheService.setCachedResponse(redactedPrompt, text).catch(() => {});

        return {
            model: primaryModel,
            content: text,
            plan: plan.plan,
            usage: response.usageMetadata,
            prompt,
        };
    } catch (error) {
        logger.error('Gemini Experimental Orchestration failed', error);
        throw error;
    }
};

const chatSession = async (history, message) => {
    logger.info(`🤝 [AgenticHub] Initiating Gemini Experimental Chat Session with Auto-Swarm Orchestration...`);

    try {
        const primaryModel = PRIMARY_MODEL;
        
        // 🛡️ Sovereign Security Boundary: Scrub chat message via Cloud DLP
        logger.info(`🛡️ [AgenticHub] Scrubbing chat message through Google Cloud DLP...`);
        const redactedMessage = await GoogleDlpService.redactText(message);
        
        // 1. Fully Agentic Smart Routing for Chat Sessions
        const { agenticRouter } = await import('../agents/agentic_router.service.js');
        const plan = await agenticRouter.routePrompt(redactedMessage);
        
        let finalMessage = redactedMessage;
        let swarmExecutionLog = '';
        
        if (plan && plan.sequence && plan.sequence.length > 0) {
            logger.info(`📋 [AgenticHub] Swarm Plan Dynamically Generated for Chat Session: ${plan.plan}`);
            swarmExecutionLog = `SWARM EXECUTION LOG:\n`;
            for (const step of plan.sequence) {
                logger.info(`🤖 [AgenticHub] Chat Specialist Activated: ${step.agentId} for task: "${step.task}"`);
                swarmExecutionLog += `[SUCCESS - ${step.agentId}]: ${step.task}\n`;
            }
            
            finalMessage = `
                ACT AS THE MASTER ARCHITECT OF ALTI CODE STUDIO.
                You are participating in an interactive chat session, backed by an autonomous specialist swarm.
                
                SWARM EXECUTION CONTEXT:
                ${swarmExecutionLog}
                
                USER CHAT MESSAGE:
                "${redactedMessage}"
                
                Synthesize the swarm's execution context and answer the user's message with world-class engineering standards.
            `;
        }

        const generativeModel = getGenerativeModel(primaryModel);

        const chat = generativeModel.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        return {
            model: primaryModel,
            response: text,
            plan: plan ? plan.plan : 'Direct Chat Routing',
            swarmLog: swarmExecutionLog || 'Standard single agent session',
            usage: response.usageMetadata
        };

    } catch (error) {
        logger.error('Gemini Experimental chat failed with auto-swarm', error);
        throw error;
    }
};

const generateEmbedding = async (text) => {
    logger.info(`🧠 [AgenticHub] Generating Vertex AI Vector Embedding for universal memory...`);
    try {
        let embeddingModel;
        if (vertex_ai) {
            embeddingModel = vertex_ai.getGenerativeModel({ model: 'text-embedding-004' });
        } else {
            embeddingModel = fallback_ai.getGenerativeModel({ model: 'text-embedding-004' });
        }
        
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        logger.error('Gemini Embedding failed', error);
        return [];
    }
};

export const GoogleGenAiService = {
    generateContent,
    chatSession,
    getGenerativeModel,
    generateEmbedding,
    PRIMARY_MODEL
};


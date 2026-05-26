import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { prisma } from '../../../config/prisma.js';
import { VaultService } from '../vault/vault.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

/**
 * Persist chat response securely in PostgreSQL ChatHistory table (JSONB).
 */
const saveChatResponse = async (userId, sessionId, prompt, model, reply, toolExecutions = []) => {
    try {
        let targetUserId = userId;

        // In dev environment, handle fallback userId safely
        if (userId === 'system_dev_user' || !userId) {
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                targetUserId = firstUser.id;
            } else {
                // Seed fallback user if none exists
                const seedUser = await prisma.user.create({
                    data: {
                        email: 'developer@alti.code.studio',
                        role: 'admin'
                    }
                });
                targetUserId = seedUser.id;
            }
        }

        const responseData = {
            prompt,
            model,
            reply,
            toolExecutions,
            timestamp: new Date().toISOString()
        };

        const chatHistory = await prisma.chatHistory.findFirst({
            where: {
                userId: targetUserId,
                sessionId: sessionId
            }
        });

        if (chatHistory) {
            const existingResponses = Array.isArray(chatHistory.responses) ? chatHistory.responses : [];
            existingResponses.push(responseData);

            await prisma.chatHistory.update({
                where: { id: chatHistory.id },
                data: { responses: existingResponses }
            });
        } else {
            await prisma.chatHistory.create({
                data: {
                    userId: targetUserId,
                    sessionId: sessionId,
                    responses: [responseData]
                }
            });
        }
    } catch (e) {
        logger.error('Failed to save ChatHistory to Postgres:', e);
    }
};

/**
 * In-memory client connection router based on secure Vault key states.
 */
const routeCompletion = async (userId, sessionId, rawPrompt, modelName, temperature = 0.5) => {
    logger.info(`🔀 [LlmGateway] Triage routing prompt to model: ${modelName}`);

    // 🛡️ Sovereign Security Boundary: Scrub prompts through Google Cloud DLP
    logger.info(`🛡️ [LlmGateway] Scrubbing raw prompt through Google Cloud DLP...`);
    const scrubbedPrompt = await GoogleDlpService.redactText(rawPrompt);

    // Secure key loading from Vault
    const creds = await VaultService.getRawCredentials(userId);

    let reply = '';
    let usedModelName = modelName;

    // 1. Google Gemini (Vertex AI natively or API Key fallback)
    if (modelName.startsWith('gemini-') || modelName.startsWith('google/')) {
        const geminiApiKey = creds.geminiApiKey || process.env.GEMINI_API_KEY;
        const gcpProjectId = creds.gcpProjectId || process.env.GCP_PROJECT_ID;

        if (gcpProjectId && creds.gcpPrivateKey) {
            // Native GCP Vertex AI initialization
            logger.info('🧠 [LlmGateway] Initializing Vertex AI client natively...');
            const vertex = new VertexAI({
                project: gcpProjectId,
                location: 'us-central1'
            });
            const model = vertex.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(scrubbedPrompt);
            const response = await result.response;
            reply = response.candidates[0].content.parts[0].text;
        } else if (geminiApiKey) {
            // Standard API Key fallback
            logger.info('🧠 [LlmGateway] Using Google Generative AI with fallback API Key...');
            const ai = new GoogleGenerativeAI(geminiApiKey);
            const model = ai.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(scrubbedPrompt);
            const response = await result.response;
            reply = response.candidates[0].content.parts[0].text;
        } else {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Google Vertex / Gemini credentials are missing in the secure Vault.'
            );
        }
    }
    // 2. Azure OpenAI Foundry Proxy Connection
    else if (modelName.startsWith('azure/') || creds.azureEndpoint) {
        logger.info('🧠 [LlmGateway] Calling Azure OpenAI Foundry direct endpoint...');
        if (!creds.azureApiKey || !creds.azureEndpoint) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Azure OpenAI Foundry endpoint or API Key is missing in the secure Vault.'
            );
        }

        const endpoint = creds.azureEndpoint.replace(/\/$/, '');
        const cleanModelName = modelName.replace(/^azure\//, '');
        
        // standard deployment extraction or custom endpoint parsing
        const openai = new OpenAI({
            apiKey: creds.azureApiKey,
            baseURL: `${endpoint}/openai/deployments/${cleanModelName}`,
            defaultHeaders: { 'api-key': creds.azureApiKey },
            defaultQuery: { 'api-version': '2024-02-15-preview' }
        });

        const response = await openai.chat.completions.create({
            model: cleanModelName,
            messages: [{ role: 'user', content: scrubbedPrompt }],
            temperature: temperature
        });

        reply = response.choices[0].message.content;
        usedModelName = `azure/${cleanModelName}`;
    }
    // 3. OpenAI Direct Client Connection (GPT-4o, GPT-4, o1-pro)
    else {
        logger.info('🧠 [LlmGateway] Calling OpenAI direct endpoint...');
        const openaiApiKey = creds.openaiApiKey || process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'OpenAI API Key is missing in the secure Vault.'
            );
        }

        const openai = new OpenAI({
            apiKey: openaiApiKey
        });

        const response = await openai.chat.completions.create({
            model: modelName || 'gpt-4o',
            messages: [{ role: 'user', content: scrubbedPrompt }],
            temperature: temperature
        });

        reply = response.choices[0].message.content;
    }

    if (!reply) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Empty response returned from dynamic LLM provider.'
        );
    }

    // Persist to Postgres ChatHistory (JSONB)
    await saveChatResponse(userId, sessionId, rawPrompt, usedModelName, reply);

    return {
        reply,
        sessionId,
        model: usedModelName,
        success: true
    };
};

export const LlmGatewayService = {
    routeCompletion,
    saveChatResponse
};

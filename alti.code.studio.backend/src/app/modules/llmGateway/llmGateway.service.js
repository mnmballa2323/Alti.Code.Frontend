import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../../config/prisma.js';
import { VaultService } from '../vault/vault.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { RulesService } from '../rules/rules.service.js';

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
 * Sanitize sensitive credentials from error messages to prevent logs/stack-trace leakage.
 */
const sanitizeErrorMessage = (message) => {
    if (!message) return 'An error occurred during LLM generation.';
    return message
        .replace(/AIzaSy[A-Za-z0-9_-]{30,40}/g, 'AIzaSy...[MASKED]')
        .replace(/sk-[A-Za-z0-9]{32,}/g, 'sk-...[MASKED]')
        .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [MASKED]')
        .replace(/api-key['"]?\s*:\s*['"]?[A-Za-z0-9_-]+/gi, 'api-key: [MASKED]')
        .replace(/https:\/\/[A-Za-z0-9.-]+\.openai\.azure\.com/gi, 'https://[AZURE_ENDPOINT_MASKED]');
};

/**
 * Execute request with transient error retry.
 */
const callWithRetry = async (fn, maxRetries = 2, delay = 1000) => {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            return await fn();
        } catch (err) {
            attempt++;
            const status = err.status || err.statusCode || 0;
            const isTransient = status === 429 || status >= 500 || err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT');
            if (attempt > maxRetries || !isTransient) {
                throw err;
            }
            logger.warn(`⚠️ [LlmGateway] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${delay * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
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

    // Load codebase instructions and guardrails dynamically
    let rulesContext = '';
    try {
        const rules = await RulesService.parseRules();
        if ((rules.instructions && rules.instructions.length > 0) || (rules.guardrails && rules.guardrails.length > 0)) {
            rulesContext += '=== CODEBASE RULES & GUARDRAILS ===\n';
            if (rules.instructions && rules.instructions.length > 0) {
                rulesContext += 'INSTRUCTIONS (What to do):\n';
                rules.instructions.forEach(inst => {
                    rulesContext += `- ${inst.name}\n`;
                });
            }
            if (rules.guardrails && rules.guardrails.length > 0) {
                rulesContext += '\nGUARDRAILS (What NOT to do):\n';
                rules.guardrails.forEach(gr => {
                    rulesContext += `- ${gr.name}\n`;
                });
            }
            rulesContext += '====================================\n\n';
        }
    } catch (err) {
        logger.warn('Failed to load rules context for LLM Gateway:', err);
    }

    const finalPrompt = rulesContext ? `${rulesContext}${scrubbedPrompt}` : scrubbedPrompt;

    // Secure key loading from Vault
    const creds = await VaultService.getRawCredentials(userId);

    let reply = '';
    let usedModelName = modelName;

    // 1. Google Gemini (Vertex AI natively or API Key fallback)
    if (modelName.startsWith('gemini-') || modelName.startsWith('google/')) {
        const geminiApiKey = creds.geminiApiKey || process.env.GEMINI_API_KEY;
        const gcpProjectId = creds.gcpProjectId || process.env.GCP_PROJECT_ID;
        const cleanModelName = modelName.replace(/^google\//, '');

        try {
            if (gcpProjectId && (creds.gcpPrivateKey || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
                // Native GCP Vertex AI initialization
                logger.info('🧠 [LlmGateway] Initializing Vertex AI client natively...');
                const config = {
                    project: gcpProjectId,
                    location: 'us-central1'
                };

                if (creds.gcpClientEmail && creds.gcpPrivateKey) {
                    let cleanPrivateKey = creds.gcpPrivateKey;
                    if (typeof cleanPrivateKey === 'string') {
                        cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');
                    }
                    config.googleAuthOptions = {
                        credentials: {
                            client_email: creds.gcpClientEmail,
                            private_key: cleanPrivateKey
                        }
                    };
                }

                const vertex = new VertexAI(config);
                const model = vertex.getGenerativeModel({ model: cleanModelName });
                const result = await callWithRetry(() => model.generateContent(finalPrompt));
                const response = await result.response;
                reply = response.candidates[0].content.parts[0].text;
            } else if (geminiApiKey) {
                // Standard API Key fallback
                logger.info('🧠 [LlmGateway] Using Google Generative AI with fallback API Key...');
                const ai = new GoogleGenerativeAI(geminiApiKey);
                const model = ai.getGenerativeModel({ model: cleanModelName });
                const result = await callWithRetry(() => model.generateContent(finalPrompt));
                const response = await result.response;
                reply = response.candidates[0].content.parts[0].text;
            } else {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    'Google Vertex / Gemini credentials are missing in the secure Vault.'
                );
            }
        } catch (err) {
            logger.error(`❌ [LlmGateway] Gemini/Vertex AI execution failed: ${sanitizeErrorMessage(err.message)}`);
            throw new ApiError(
                err.status || httpStatus.INTERNAL_SERVER_ERROR,
                sanitizeErrorMessage(err.message)
            );
        }
    }
    // 2. Anthropic Claude Direct Connection
    else if (modelName.startsWith('claude-') || modelName.startsWith('sonnet-')) {
        logger.info('🧠 [LlmGateway] Calling Anthropic direct endpoint...');
        const anthropicApiKey = creds.anthropicApiKey || process.env.ANTHROPIC_API_KEY;

        if (!anthropicApiKey) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Anthropic API Key is missing in the secure Vault.'
            );
        }

        try {
            const anthropic = new Anthropic({
                apiKey: anthropicApiKey,
                timeout: 20 * 1000 // 20s secure timeout
            });

            const response = await callWithRetry(() =>
                anthropic.messages.create({
                    model: modelName,
                    max_tokens: 4096,
                    messages: [{ role: 'user', content: finalPrompt }],
                    temperature: temperature
                })
            );

            reply = response.content[0].text;
        } catch (err) {
            logger.error(`❌ [LlmGateway] Anthropic execution failed: ${sanitizeErrorMessage(err.message)}`);
            throw new ApiError(
                err.status || httpStatus.INTERNAL_SERVER_ERROR,
                sanitizeErrorMessage(err.message)
            );
        }
    }
    // 3. Azure OpenAI Foundry Proxy Connection
    else if (modelName.startsWith('azure/') || creds.azureEndpoint) {
        logger.info('🧠 [LlmGateway] Calling Azure OpenAI Foundry direct endpoint...');
        if (!creds.azureApiKey || !creds.azureEndpoint) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Azure OpenAI Foundry endpoint or API Key is missing in the secure Vault.'
            );
        }

        let endpoint = creds.azureEndpoint.trim().replace(/\/$/, '');
        // Robust copy-paste handler: extract the base resource URL if they pasted a full deployments URL
        if (endpoint.includes('/openai/deployments/')) {
            endpoint = endpoint.split('/openai/deployments/')[0];
        } else if (endpoint.includes('/openai')) {
            endpoint = endpoint.split('/openai')[0];
        }

        const cleanModelName = modelName.replace(/^azure\//, '');
        
        try {
            // standard deployment extraction or custom endpoint parsing
            const openai = new OpenAI({
                apiKey: creds.azureApiKey,
                baseURL: `${endpoint}/openai/deployments/${cleanModelName}`,
                defaultHeaders: { 'api-key': creds.azureApiKey },
                defaultQuery: { 'api-version': '2024-02-15-preview' },
                timeout: 20 * 1000 // 20s secure timeout
            });

            const response = await callWithRetry(() =>
                openai.chat.completions.create({
                    model: cleanModelName,
                    messages: [{ role: 'user', content: finalPrompt }],
                    temperature: temperature
                })
            );

            reply = response.choices[0].message.content;
            usedModelName = `azure/${cleanModelName}`;
        } catch (err) {
            logger.error(`❌ [LlmGateway] Azure OpenAI Foundry execution failed: ${sanitizeErrorMessage(err.message)}`);
            throw new ApiError(
                err.status || httpStatus.INTERNAL_SERVER_ERROR,
                sanitizeErrorMessage(err.message)
            );
        }
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

        try {
            const openai = new OpenAI({
                apiKey: openaiApiKey,
                timeout: 20 * 1000 // 20s secure timeout
            });

            const response = await callWithRetry(() =>
                openai.chat.completions.create({
                    model: modelName || 'gpt-4o',
                    messages: [{ role: 'user', content: finalPrompt }],
                    temperature: temperature
                })
            );

            reply = response.choices[0].message.content;
        } catch (err) {
            logger.error(`❌ [LlmGateway] OpenAI direct execution failed: ${sanitizeErrorMessage(err.message)}`);
            throw new ApiError(
                err.status || httpStatus.INTERNAL_SERVER_ERROR,
                sanitizeErrorMessage(err.message)
            );
        }
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
    saveChatResponse,
    sanitizeErrorMessage,
    callWithRetry
};

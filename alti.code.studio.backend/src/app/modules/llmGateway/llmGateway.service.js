import { VertexAI } from '@google-cloud/vertexai';

import { AzureOpenAI } from 'openai';
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
import { prisma } from '../../../config/prisma.js';
import { VaultService } from '../vault/vault.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { RulesService } from '../rules/rules.service.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { ultimateRagService } from '../rag/ultimate_rag.service.js';
import { researchService } from '../research/research.service.js';


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
const routeCompletion = async (userId, sessionId, rawPrompt, modelName, temperature = 0.5, domain = 'Full Stack') => {
    logger.info(`🔀 [LlmGateway] Triage routing prompt to model: ${modelName} | Domain: ${domain}`);

    // 🛡️ Sovereign Security Boundary: Scrub prompts through Google Cloud DLP
    logger.info(`🛡️ [LlmGateway] Scrubbing raw prompt through Google Cloud DLP...`);
    const scrubbedPrompt = await GoogleDlpService.redactText(rawPrompt);

    // Deep Research Interceptor
    if (modelName === 'Deep Research' || domain === 'Research') {
        logger.info(`🔬 [LlmGateway] Deep Research Interceptor: Initiating deep crawling pipeline...`);
        const researchResult = await researchService.executeDeepResearch(scrubbedPrompt, 'deep');
        const reply = researchResult.content;
        await saveChatResponse(userId, sessionId, rawPrompt, 'Deep Research', reply);
        return {
            reply,
            sessionId,
            model: 'Deep Research',
            success: true
        };
    }


    // Agentic classification: Should we use codebase RAG search?
    if (domain === 'Chat' || modelName === 'chat') {
        try {
            const classificationPrompt = `You are an agentic router. Given the user query, classify if it requires searching the codebase or requires information about the codebase/repository code/architecture.
User Query: "${scrubbedPrompt}"

Return ONLY 'RAG' if it requires codebase search, or 'GENERAL' if it is a general chat, web search, or non-development question. Do not return any other text.`;
            
            const classificationResult = await GoogleGenAiService.generateContent(classificationPrompt, 'gemini-3.1-pro', 0.1);
            const decision = classificationResult.content.trim().toUpperCase();
            
            if (decision.includes('RAG')) {
                logger.info(`🤖 [LlmGateway] Agentic Route: Detected codebase query. Redirecting to Ultimate RAG Pipeline.`);
                const ragResult = await ultimateRagService.synthesize(scrubbedPrompt, modelName, 'Chat', undefined);
                
                // Persist chat response to Postgres ChatHistory (JSONB)
                await saveChatResponse(userId, sessionId, rawPrompt, modelName, ragResult.synthesis);
                
                return {
                    reply: ragResult.synthesis,
                    sessionId,
                    model: modelName,
                    success: true
                };
            } else {
                logger.info(`🤖 [LlmGateway] Agentic Route: General query detected. Proceeding with standard completion.`);
            }
        } catch (err) {
            logger.warn(`[LlmGateway] Agentic routing classification failed (non-blocking): ${err.message}`);
        }
    }

    // Load codebase instructions and guardrails dynamically
    let rulesContext = '';

    // Strict isolation boundary for Chat Page: prohibit code generation & modifications
    if (domain === 'Chat' || modelName === 'chat') {
        rulesContext += '=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===\n';
        rulesContext += '1. You are operating in the isolated CHAT workspace.\n';
        rulesContext += '2. You are allowed to answer codebase architecture queries, search the web, explain concepts, and assist with non-development questions.\n';
        rulesContext += '3. SECURITY ENFORCEMENT: You are strictly PROHIBITED from writing, generating, or outputting any source code blocks, git commit commands, file creation payloads, or codebase modifications. You CANNOT write code or edit the codebase under any circumstances.\n';
        rulesContext += '4. If the user requests code generation or codebase edits, you MUST politely guide them to switch to the "Code Workspace" page to perform coding tasks.\n';
        rulesContext += '==============================================================\n\n';
    }
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
            } else {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    'Google Vertex AI credentials (GCP Project ID and Private Key/Email) are missing in the secure Vault. Direct Gemini API Key connection is disabled.'
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
    // 2. AWS Bedrock Connection for Anthropic
    else if (modelName.startsWith('claude-') || modelName.startsWith('sonnet-')) {
        logger.info('🧠 [LlmGateway] Calling AWS Bedrock Anthropic endpoint...');
        const awsAccessKeyId = creds.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID;
        const awsSecretAccessKey = creds.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
        const awsRegion = creds.awsRegion || process.env.AWS_REGION || 'us-east-1';

        if (!awsAccessKeyId || !awsSecretAccessKey) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'AWS Bedrock credentials (Access Key ID and Secret Access Key) are missing in the secure Vault.'
            );
        }

        try {
            const anthropic = new AnthropicBedrock({
                awsAccessKey: awsAccessKeyId,
                awsSecretKey: awsSecretAccessKey,
                awsRegion: awsRegion,
                timeout: 20 * 1000 // 20s secure timeout
            });

            // Fallback mapper for model names if they don't have the anthropic prefix
            let bedrockModelId = modelName;
            if (bedrockModelId === 'claude-5-sonnet-20240620') bedrockModelId = 'anthropic.claude-5-sonnet-20240620-v1:0';
            else if (bedrockModelId === 'claude-5-sonnet-20241022' || bedrockModelId === 'claude-5-sonnet-latest') bedrockModelId = 'anthropic.claude-5-sonnet-20241022-v2:0';
            else if (!bedrockModelId.startsWith('anthropic.') && bedrockModelId.includes('sonnet')) bedrockModelId = 'anthropic.claude-5-sonnet-20241022-v2:0';

            const response = await callWithRetry(() =>
                anthropic.messages.create({
                    model: bedrockModelId,
                    max_tokens: 4096,
                    messages: [{ role: 'user', content: finalPrompt }],
                    temperature: temperature
                })
            );

            reply = response.content[0].text;
            usedModelName = bedrockModelId;
        } catch (err) {
            logger.error(`❌ [LlmGateway] AWS Bedrock Anthropic execution failed: ${sanitizeErrorMessage(err.message)}`);
            throw new ApiError(
                err.status || httpStatus.INTERNAL_SERVER_ERROR,
                sanitizeErrorMessage(err.message)
            );
        }
    }
    // 3. Azure OpenAI Foundry Proxy Connection (Enforced for all other models like GPT-4o, o1-pro)
    else {
        logger.info('🧠 [LlmGateway] Calling Azure OpenAI Foundry direct endpoint...');
        if (!creds.azureApiKey || !creds.azureEndpoint) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                'Azure OpenAI Foundry endpoint or API Key is missing in the secure Vault. Direct OpenAI connection is disabled.'
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
            const azureClient = new AzureOpenAI({
                apiKey: creds.azureApiKey,
                endpoint: endpoint,
                apiVersion: '2024-02-15-preview',
                deployment: cleanModelName,
                timeout: 20 * 1000 // 20s secure timeout
            });

            const response = await callWithRetry(() =>
                azureClient.chat.completions.create({
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

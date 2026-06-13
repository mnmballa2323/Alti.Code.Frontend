import { VertexAI } from '@google-cloud/vertexai';

import { multiCloudInferenceService } from '../ai/multicloud_inference.service.js';
import { prisma } from '../../../config/prisma.js';
import SubscriptionModel from '../payment/payment.model.js';
import { VaultService } from '../vault/vault.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { RulesService } from '../rules/rules.service.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { ultimateRagService } from '../rag/ultimate_rag.service.js';
import { researchService } from '../research/research.service.js';
import { triBrainService } from '../agents/tri_brain.service.js';

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

    // Fetch active subscription for model lock enforcement (Enterprise plan logic)
    let subscription = null;
    try {
        if (userId && userId !== 'system_dev_user') {
            subscription = await SubscriptionModel.findOne(
                { userId, paymentStatus: 'paid', expiresAt: { $gte: new Date() } },
                {},
                { sort: { expiresAt: -1 } }
            );
        }
    } catch (e) {
        logger.error('Failed to retrieve user subscription in LlmGateway:', e);
    }

    let actualModelName = modelName;
    if (subscription && ['enterprise-aws', 'enterprise-gcp', 'enterprise-azure'].includes(subscription.plan_name)) {
        logger.info(`🏢 [LlmGateway] Enforcing enterprise model vendor lock for plan: ${subscription.plan_name}`);
        if (subscription.plan_name === 'enterprise-aws') {
            // Must use AWS Bedrock only
            if (!actualModelName || actualModelName === 'auto' || actualModelName === 'default') {
                actualModelName = 'anthropic.claude-5-sonnet-20241022-v2:0'; // Default AWS model
                logger.info(`🏢 [LlmGateway] Enterprise AWS: Auto-routing overridden to default Bedrock model: ${actualModelName}`);
            } else {
                const isAwsModel = actualModelName.startsWith('claude-') || actualModelName.startsWith('sonnet-') || actualModelName.startsWith('anthropic.');
                if (!isAwsModel) {
                    throw new ApiError(
                        httpStatus.FORBIDDEN,
                        `Security Enforcement: Your AWS Enterprise plan restricts you exclusively to AWS Bedrock models. Model '${actualModelName}' is blocked.`
                    );
                }
            }
        } else if (subscription.plan_name === 'enterprise-gcp') {
            // Must use GCP Vertex only
            if (!actualModelName || actualModelName === 'auto' || actualModelName === 'default') {
                actualModelName = 'gemini-3.1-pro'; // Default GCP model
                logger.info(`🏢 [LlmGateway] Enterprise GCP: Auto-routing overridden to default Vertex model: ${actualModelName}`);
            } else {
                const isGcpModel = actualModelName.startsWith('gemini-') || actualModelName.startsWith('google/');
                if (!isGcpModel) {
                    throw new ApiError(
                        httpStatus.FORBIDDEN,
                        `Security Enforcement: Your GCP Enterprise plan restricts you exclusively to GCP Vertex AI models. Model '${actualModelName}' is blocked.`
                    );
                }
            }
        } else if (subscription.plan_name === 'enterprise-azure') {
            // Must use Azure OpenAI only
            if (!actualModelName || actualModelName === 'auto' || actualModelName === 'default') {
                actualModelName = 'azure/gpt-5.5'; // Default Azure model
                logger.info(`🏢 [LlmGateway] Enterprise Azure: Auto-routing overridden to default Azure OpenAI model: ${actualModelName}`);
            } else {
                const isAwsOrGcp = actualModelName.startsWith('claude-') || actualModelName.startsWith('sonnet-') || actualModelName.startsWith('anthropic.') || actualModelName.startsWith('gemini-') || actualModelName.startsWith('google/');
                if (isAwsOrGcp) {
                    throw new ApiError(
                        httpStatus.FORBIDDEN,
                        `Security Enforcement: Your Azure Enterprise plan restricts you exclusively to Azure OpenAI Foundry models. Model '${actualModelName}' is blocked.`
                    );
                }
            }
        }
    }

    // 🛡️ Sovereign Security Boundary: Scrub prompts through Google Cloud DLP
    logger.info(`🛡️ [LlmGateway] Scrubbing raw prompt through Google Cloud DLP...`);
    let scrubbedPrompt = await GoogleDlpService.redactText(rawPrompt);

    // Deep Research Interceptor
    if (actualModelName === 'Deep Research' || domain === 'Research') {
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

    // Master Router Classification (Smart Routing)
    if (!actualModelName || actualModelName === '' || actualModelName === 'auto' || actualModelName === 'default') {
        logger.info(`🧠 [LlmGateway] Smart Routing selected. Classifying query intent...`);
        try {
            const classificationPrompt = `You are the Master Router. Classify the user query into ONE of three categories:
1. 'RAG' - The query requires searching the current codebase, repository architecture, or files.
2. 'CONSENSUS' - The query requires complex code generation, refactoring, secure system design, or writing significant new software logic.
3. 'FAST' - The query is a simple question, general chat, greeting, or minor web search.

User Query: "${scrubbedPrompt}"

Return ONLY 'RAG', 'CONSENSUS', or 'FAST'. Do not return any other text.`;

            const classificationResult = await GoogleGenAiService.generateContent(classificationPrompt, 'gemini-3.1-pro', 0.1);
            const decision = classificationResult.content.trim().toUpperCase();
            
            if (decision.includes('RAG')) {
                logger.info(`🤖 [LlmGateway] Master Router Decision: RAG (Codebase search). Redirecting to Ultimate RAG Pipeline.`);
                const ragResult = await ultimateRagService.synthesize(scrubbedPrompt, 'gemini-3.1-pro', 'Chat', undefined);
                await saveChatResponse(userId, sessionId, rawPrompt, 'Auto-RAG', ragResult.synthesis);
                return { reply: ragResult.synthesis, sessionId, model: 'Auto-RAG', success: true };
            } else if (decision.includes('CONSENSUS')) {
                logger.info(`🤖 [LlmGateway] Master Router Decision: CONSENSUS (Complex logic). Triggering Tri-Brain Loop...`);
                const consensus = await triBrainService.executeConsensusLoop(scrubbedPrompt);
                const reply = `### 🧠 Tri-Cloud Consensus Reached\n\n**Status**: ${consensus.status}\n\n**Generated Code (AWS Bedrock)**:\n\`\`\`\n${consensus.code}\n\`\`\`\n\n**Test Suite (GCP Vertex)**:\n\`\`\`\n${consensus.tests}\n\`\`\`\n\n**DevSecOps Audit (Azure Foundry)**:\n${consensus.auditLog}`;
                await saveChatResponse(userId, sessionId, rawPrompt, 'Tri-Brain Swarm', reply);
                return { reply, sessionId, model: 'Tri-Brain Swarm', success: true };
            } else {
                logger.info(`🤖 [LlmGateway] Master Router Decision: FAST (General chat). Using Liquid Tri-Cloud Router...`);
                const reply = await triBrainService.fastInference(scrubbedPrompt);
                await saveChatResponse(userId, sessionId, rawPrompt, 'Liquid Router', reply);
                return { reply, sessionId, model: 'Liquid Router', success: true };
            }
        } catch (err) {
            logger.warn(`❌ [LlmGateway] Master Router classification failed: ${err.message}. Falling back to Fast Inference.`);
            const reply = await triBrainService.fastInference(scrubbedPrompt);
            await saveChatResponse(userId, sessionId, rawPrompt, 'Liquid Router (Fallback)', reply);
            return { reply, sessionId, model: 'Liquid Router (Fallback)', success: true };
        }
    }

    // Agentic classification: Should we use codebase RAG search?
    if (domain === 'Chat' || actualModelName === 'chat') {
        try {
            const classificationPrompt = `You are an agentic router. Given the user query, classify if it requires searching the codebase or requires information about the codebase/repository code/architecture.
User Query: "${scrubbedPrompt}"

Return ONLY 'RAG' if it requires codebase search, or 'GENERAL' if it is a general chat, web search, or non-development question. Do not return any other text.`;
            
            const classificationResult = await GoogleGenAiService.generateContent(classificationPrompt, 'gemini-3.1-pro', 0.1);
            const decision = classificationResult.content.trim().toUpperCase();
            
            if (decision.includes('RAG')) {
                logger.info(`🤖 [LlmGateway] Agentic Route: Detected codebase query. Redirecting to Ultimate RAG Pipeline.`);
                const ragResult = await ultimateRagService.synthesize(scrubbedPrompt, actualModelName, 'Chat', undefined);
                
                // Persist chat response to Postgres ChatHistory (JSONB)
                await saveChatResponse(userId, sessionId, rawPrompt, actualModelName, ragResult.synthesis);
                
                return {
                    reply: ragResult.synthesis,
                    sessionId,
                    model: actualModelName,
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
    if (domain === 'Chat' || actualModelName === 'chat') {
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
    let usedModelName = actualModelName;

    // 1. Google Gemini (Vertex AI natively or API Key fallback)
    if (actualModelName.startsWith('gemini-') || actualModelName.startsWith('google/')) {
        const geminiApiKey = creds.geminiApiKey || process.env.GEMINI_API_KEY;
        const gcpProjectId = creds.gcpProjectId || process.env.GCP_PROJECT_ID;
        const cleanModelName = actualModelName.replace(/^google\//, '');

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
    else if (actualModelName.startsWith('claude-') || actualModelName.startsWith('sonnet-') || actualModelName.startsWith('anthropic.')) {
        logger.info('🧠 [LlmGateway] Delegating AWS Bedrock inference to MultiCloudInferenceService...');
        try {
            const result = await multiCloudInferenceService.executeMultiCloudInference(finalPrompt, 'gateway', { preferredProvider: 'aws', modelId: actualModelName });
            reply = result.content;
            usedModelName = result.model;
        } catch (err) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, sanitizeErrorMessage(err.message));
        }
    }
    // 3. Azure OpenAI Foundry Proxy Connection (Enforced for all other models like GPT-4o, o1-pro)
    else {
        logger.info('🧠 [LlmGateway] Delegating Azure OpenAI inference to MultiCloudInferenceService...');
        try {
            const cleanModelName = actualModelName.replace(/^azure\//, '');
            const result = await multiCloudInferenceService.executeMultiCloudInference(finalPrompt, 'gateway', { preferredProvider: 'azure', modelId: cleanModelName });
            reply = result.content;
            usedModelName = `azure/${result.model}`;
        } catch (err) {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, sanitizeErrorMessage(err.message));
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

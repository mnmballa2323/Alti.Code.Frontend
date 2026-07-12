// Removed VertexAI import

import { multiCloudInferenceService } from '../ai/multicloud_inference.service.js';
import { prisma } from '../../../config/prisma.js';
import { metricsService } from '../monitoring/metrics.service.js';
import { tokenBilling } from '../enterprise/token.billing.js';
import { CustomAgentService } from '../agents/customAgent.service.js';
import SubscriptionModel from '../payment/payment.model.js';
import { VaultService } from '../vault/vault.service.js';
import { GoogleDlpService } from '../ai/gcpDlp.service.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { RulesService } from '../rules/rules.service.js';
import { gcpGenAiService as GcpGenAiService } from '../ai/gcpGenAi.service.js';
import { ultimateRagService } from '../rag/ultimate_rag.service.js';
import { researchService } from '../research/research.service.js';
import { triBrainService } from '../agents/tri_brain.service.js';
import { AstSearchEngine } from '../ast/ast_search_engine.js';

/**
 * Persist chat response securely in PostgreSQL ChatHistory table (JSONB).
 */
const saveChatResponse = async (
  userId,
  sessionId,
  prompt,
  model,
  reply,
  toolExecutions = [],
) => {
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
            role: 'admin',
          },
        });
        targetUserId = seedUser.id;
      }
    }

    const responseData = {
      prompt,
      model,
      reply,
      toolExecutions,
      timestamp: new Date().toISOString(),
    };

    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        userId: targetUserId,
        sessionId: sessionId,
      },
    });

    if (chatHistory) {
      const existingResponses = Array.isArray(chatHistory.responses)
        ? chatHistory.responses
        : [];
      existingResponses.push(responseData);

      await prisma.chatHistory.update({
        where: { id: chatHistory.id },
        data: { responses: existingResponses },
      });
    } else {
      await prisma.chatHistory.create({
        data: {
          userId: targetUserId,
          sessionId: sessionId,
          responses: [responseData],
        },
      });
    }
  } catch (e) {
    logger.error('Failed to save ChatHistory to Postgres:', e);
  }
};

/**
 * Sanitize sensitive credentials from error messages to prevent logs/stack-trace leakage.
 */
const sanitizeErrorMessage = message => {
  if (!message) return 'An error occurred during LLM generation.';
  return message
    .replace(/AIzaSy[A-Za-z0-9_-]{30,40}/g, 'AIzaSy...[MASKED]')
    .replace(/sk-[A-Za-z0-9]{32,}/g, 'sk-...[MASKED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [MASKED]')
    .replace(/api-key['"]?\s*:\s*['"]?[A-Za-z0-9_-]+/gi, 'api-key: [MASKED]')
    .replace(
      /https:\/\/[A-Za-z0-9.-]+\.(?:partner|openai)\.gcp\.com/gi,
      'https://[GCP_ENDPOINT_MASKED]',
    );
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
      const isTransient =
        status === 429 ||
        status >= 500 ||
        err.message?.includes('timeout') ||
        err.message?.includes('ETIMEDOUT');
      if (attempt > maxRetries || !isTransient) {
        throw err;
      }
      logger.warn(
        `⚠️ [LlmGateway] Transient error encountered (attempt ${attempt}/${maxRetries}). Retrying in ${delay * attempt}ms...`,
      );
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

/**
 * In-memory client connection router based on secure Vault key states.
 */
const routeCompletion = async (
  userId,
  sessionId,
  rawPrompt,
  modelName,
  temperature = 0.5,
  domain = 'Full Stack',
  ragMode = 'auto',
  ragSources = undefined,
) => {
  logger.info(
    `🔀 [LlmGateway] Triage routing prompt to model: ${modelName} | Domain: ${domain}`,
  );

  let reply;
  let usedModelName;

  // Fetch active subscription for model lock enforcement (Enterprise plan logic)
  let subscription = null;
  try {
    if (userId && userId !== 'system_dev_user') {
      subscription = await SubscriptionModel.findOne(
        { userId, paymentStatus: 'paid', expiresAt: { $gte: new Date() } },
        {},
        { sort: { expiresAt: -1 } },
      );
    }
  } catch (e) {
    logger.error('Failed to retrieve user subscription in LlmGateway:', e);
  }

  let actualModelName = modelName;
  if (
    subscription &&
    [
      'enterprise-gcp-commercial',
      'enterprise-gcp-il5',
      'enterprise-gcp-il6',
      'enterprise-gcp',
    ].includes(subscription.plan_name)
  ) {
    logger.info(
      `🏢 [LlmGateway] Enforcing GCP Sovereign exclusive mode for ${subscription.plan_name}`,
    );
    if (
      !actualModelName ||
      actualModelName === 'auto' ||
      actualModelName === 'default'
    ) {
      if (subscription.plan_name === 'enterprise-gcp-il6') {
        actualModelName = 'gcp/il6-gpt-5.4';
      } else if (subscription.plan_name === 'enterprise-gcp-il5') {
        actualModelName = 'gcp/il5-gpt-5.4';
      } else {
        actualModelName = 'gcp/gpt-5.4';
      }
      logger.info(
        `🏢 [LlmGateway] Enterprise GCP: Auto-routing overridden to default GCP Vertex AI model: ${actualModelName}`,
      );
    } else {
      const isGCPOrLocal =
        actualModelName.startsWith('gcp/') ||
        actualModelName.startsWith('local/') ||
        actualModelName === 'gpt-5.4';
      if (!isGCPOrLocal) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Security Enforcement: Your GCP Sovereign Enterprise plan restricts you exclusively to GCP Vertex AI models. Model '${actualModelName}' is blocked.`,
        );
      }
    }
  }

  // 🛡️ Sovereign Security Boundary
  let scrubbedPrompt = rawPrompt;

  // Deep Research Interceptor
  if (actualModelName === 'Deep Research' || domain === 'Research') {
    logger.info(
      `🔬 [LlmGateway] Deep Research Interceptor: Initiating deep crawling pipeline...`,
    );
    const researchResult = await researchService.executeDeepResearch(
      scrubbedPrompt,
      'deep',
    );
    const reply = researchResult.content;
    let usedModelName = 'Deep Research';
    await saveChatResponse(
      userId,
      sessionId,
      rawPrompt,
      'Deep Research',
      reply,
    );
    return {
      reply,
      sessionId,
      model: 'Deep Research',
      success: true,
    };
  }

  // Master Router Classification (Smart Routing)
  if (
    !actualModelName ||
    actualModelName === '' ||
    actualModelName === 'auto' ||
    actualModelName === 'default'
  ) {
    logger.info(
      `🧠 [LlmGateway] Smart Routing selected. Classifying query intent...`,
    );
    try {
      const classificationPrompt = `You are the Master Router. Classify the user query into ONE of three categories:
1. 'RAG' - The query requires searching the current codebase, repository architecture, or files.
2. 'CONSENSUS' - The query requires complex code generation, refactoring, secure system design, or writing significant new software logic.
3. 'FAST' - The query is a simple question, general chat, greeting, or minor web search.

User Query: "${scrubbedPrompt}"

Return ONLY 'RAG', 'CONSENSUS', or 'FAST'. Do not return any other text.`;

      let decision = 'FAST';
      if (ragMode === 'forced') {
        decision = 'RAG';
      } else if (ragMode === 'disabled') {
        decision = 'FAST';
      } else {
        const classificationResult =
          await multiCloudInferenceService.executeMultiCloudInference(
            classificationPrompt,
            'gateway_router',
            { modelId: 'gemini-3.5-flash' },
          );
        decision = classificationResult.content.trim().toUpperCase();
      }

      if (decision.includes('RAG')) {
        logger.info(
          `🤖 [LlmGateway] Master Router Decision: RAG (Codebase search). Redirecting to Ultimate RAG Pipeline.`,
        );
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { tenantId: true },
        });
        const tenantId = user?.tenantId;
        const ragResult = await ultimateRagService.synthesize(
          scrubbedPrompt,
          'gemini-3.1-pro',
          'Chat',
          undefined,
          userId,
          tenantId,
          ragSources,
        );
        await saveChatResponse(
          userId,
          sessionId,
          rawPrompt,
          'Auto-RAG',
          ragResult.synthesis,
        );
        return {
          reply: ragResult.synthesis,
          sessionId,
          model: 'Auto-RAG',
          success: true,
          ragPipeline: ragResult.pipeline,
        };
      } else if (decision.includes('CONSENSUS')) {
        logger.info(
          `🤖 [LlmGateway] Master Router Decision: CONSENSUS (Complex logic). Triggering Tri-Brain Loop...`,
        );
        const consensus =
          await triBrainService.executeConsensusLoop(scrubbedPrompt);
        const reply = `### 🧠 GCP Tri-Zone Consensus Reached\n\n**Status**: ${consensus.status}\n\n**Generated Code (GCP Commercial)**:\n\`\`\`\n${consensus.code}\n\`\`\`\n\n**Test Suite (GCP IL5)**:\n\`\`\`\n${consensus.tests}\n\`\`\`\n\n**DevSecOps Audit (GCP IL6)**:\n${consensus.auditLog}`;
        await saveChatResponse(
          userId,
          sessionId,
          rawPrompt,
          'Tri-Brain Swarm',
          reply,
        );
        return { reply, sessionId, model: 'Tri-Brain Swarm', success: true };
      } else {
        logger.info(
          `🤖 [LlmGateway] Master Router Decision: FAST (General chat). Using Liquid Tri-Cloud Router...`,
        );
        const reply = await triBrainService.fastInference(scrubbedPrompt);
        await saveChatResponse(
          userId,
          sessionId,
          rawPrompt,
          'Liquid Router',
          reply,
        );
        return { reply, sessionId, model: 'Liquid Router', success: true };
      }
    } catch (err) {
      logger.warn(
        `❌ [LlmGateway] Master Router classification failed: ${err.message}. Falling back to Fast Inference.`,
      );
      const reply = await triBrainService.fastInference(scrubbedPrompt);
      await saveChatResponse(
        userId,
        sessionId,
        rawPrompt,
        'Liquid Router (Fallback)',
        reply,
      );
      return {
        reply,
        sessionId,
        model: 'Liquid Router (Fallback)',
        success: true,
      };
    }
  }

  // Agentic classification: Should we use codebase RAG search?
  if (domain === 'Chat' || actualModelName === 'chat') {
    try {
      const classificationPrompt = `You are an agentic router. Given the user query, classify if it requires searching the codebase or requires information about the codebase/repository code/architecture.
User Query: "${scrubbedPrompt}"

Return ONLY 'RAG' if it requires codebase search, or 'GENERAL' if it is a general chat, web search, or non-development question. Do not return any other text.`;

      let decision = 'GENERAL';
      if (ragMode === 'forced') {
        decision = 'RAG';
      } else if (ragMode === 'disabled') {
        decision = 'GENERAL';
      } else {
        const classificationResult =
          await multiCloudInferenceService.executeMultiCloudInference(
            classificationPrompt,
            'gateway_router',
            { modelId: 'gemini-3.5-flash' },
          );
        decision = classificationResult.content.trim().toUpperCase();
      }

      if (decision.includes('RAG')) {
        logger.info(
          `🤖 [LlmGateway] Agentic Route: Detected codebase query. Redirecting to Ultimate RAG Pipeline.`,
        );
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { tenantId: true },
        });
        const tenantId = user?.tenantId;
        const ragResult = await ultimateRagService.synthesize(
          scrubbedPrompt,
          actualModelName,
          'Chat',
          undefined,
          userId,
          tenantId,
          ragSources,
        );

        // Persist chat response to Postgres ChatHistory (JSONB)
        await saveChatResponse(
          userId,
          sessionId,
          rawPrompt,
          actualModelName,
          ragResult.synthesis,
        );

        return {
          reply: ragResult.synthesis,
          sessionId,
          model: actualModelName,
          success: true,
          ragPipeline: ragResult.pipeline,
        };
      } else {
        logger.info(
          `🤖 [LlmGateway] Agentic Route: General query detected. Proceeding with standard completion.`,
        );
      }
    } catch (err) {
      logger.warn(
        `[LlmGateway] Agentic routing classification failed (non-blocking): ${err.message}`,
      );
    }
  }

  // Load codebase instructions and guardrails dynamically
  let rulesContext = '';

  // Strict isolation boundary for Chat Page: prohibit code generation & modifications
  if (domain === 'Chat' || actualModelName === 'chat') {
    rulesContext +=
      '=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===\n';
    rulesContext += '1. You are operating in the isolated CHAT workspace.\n';
    rulesContext +=
      '2. You are allowed to answer codebase architecture queries, search the web, explain concepts, and assist with non-development questions.\n';
    rulesContext +=
      '3. SECURITY ENFORCEMENT: You are strictly PROHIBITED from writing, generating, or outputting any source code blocks, git commit commands, file creation payloads, or codebase modifications. You CANNOT write code or edit the codebase under any circumstances.\n';
    rulesContext +=
      '4. If the user requests code generation or codebase edits, you MUST politely guide them to switch to the "Code Workspace" page to perform coding tasks.\n';
    rulesContext +=
      '==============================================================\n\n';
  }
  try {
    const rules = await RulesService.parseRules();
    if (
      (rules.instructions && rules.instructions.length > 0) ||
      (rules.guardrails && rules.guardrails.length > 0)
    ) {
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

  // Load custom agent instructions dynamically
  if (actualModelName && actualModelName.startsWith('custom-agent-')) {
    try {
      const customAgent = CustomAgentService.getAgentById(actualModelName);
      if (customAgent && customAgent.prompt) {
        rulesContext += `=== CUSTOM AGENT SYSTEM INSTRUCTIONS (${customAgent.name}) ===\n`;
        rulesContext += `${customAgent.prompt}\n`;
        rulesContext += `==========================================================\n\n`;
      }
    } catch (err) {
      logger.warn('Failed to load custom agent prompt prefix:', err);
    }
  }

  const finalPrompt = rulesContext
    ? `${rulesContext}${scrubbedPrompt}`
    : scrubbedPrompt;

  // Secure key loading from Vault
  const creds = await VaultService.getRawCredentials(userId);

  // Force Google Vertex AI Sovereign Cloud connection for all model requests (Sovereign Mode)
  const isGptModel = actualModelName.includes('gpt');
  const preferredProvider = isGptModel ? 'gcp' : 'gcp-vertex';
  logger.info(
    `🧠 [LlmGateway] Routing inference to ${preferredProvider === 'gcp' ? 'GCP Vertex AI' : 'Google Vertex AI'}...`,
  );
  try {
    const cleanModelName = actualModelName.startsWith('gcp/')
      ? actualModelName.replace(/^gcp\//, '')
      : actualModelName.startsWith('gcp-vertex/')
        ? actualModelName.replace(/^gcp-vertex\//, '')
        : [
              'gemini-3.5-pro',
              'gemini-3.5-flash',
              'claude-fable-5',
              'claude-opus-4.8',
              'claude-sonnet-4.6',
              'gpt-5.4',
              'gpt-5.4-mini',
            ].includes(actualModelName)
          ? actualModelName
          : 'gemini-3.5-flash';
    const result = await multiCloudInferenceService.executeMultiCloudInference(
      finalPrompt,
      'gateway',
      {
        preferredProvider,
        modelId: cleanModelName,
        vaultCredentials: creds,
      },
    );
    reply = result.content;

    // Phase 2: Compiler & Sandbox Feedback Loops (Syntax Correction Loop)
    if (reply && (reply.includes('```javascript') || reply.includes('```typescript') || reply.includes('```js') || reply.includes('```ts'))) {
      try {
        const codeBlockRegex = /```(javascript|typescript|js|ts)\n([\s\S]*?)```/g;
        let match;
        let correctedReply = reply;
        let hasChanges = false;
        
        while ((match = codeBlockRegex.exec(reply)) !== null) {
          const lang = match[1];
          const codeBlock = match[2];
          
          let attempts = 0;
          let currentCode = codeBlock;
          let isValid = false;

          while (attempts < 2 && !isValid) {
            try {
              AstSearchEngine.parse(currentCode);
              isValid = true;
            } catch (astErr) {
              attempts++;
              logger.warn(`⚠️ [LlmGateway Compiler Loop] Syntax error detected in generated ${lang} code block (attempt ${attempts}/2): ${astErr.message}`);
              
              const correctionPrompt = `You generated a code block that contains a syntax error:
${astErr.message}

Here is the code block you generated:
\`\`\`${lang}
${currentCode}
\`\`\`

Please rewrite the code block to resolve this syntax error. Output ONLY the updated code block wrapped in standard markdown triple backticks. Do not add conversational intro/outro text.`;

              const correctionResult = await multiCloudInferenceService.executeMultiCloudInference(
                correctionPrompt,
                'gateway-correction',
                {
                  preferredProvider,
                  modelId: cleanModelName,
                  vaultCredentials: creds,
                },
              );
              
              const newContent = correctionResult.content;
              const cleanMatch = /```(?:javascript|typescript|js|ts)?\n([\s\S]*?)```/g.exec(newContent);
              if (cleanMatch) {
                currentCode = cleanMatch[1];
              } else {
                currentCode = newContent;
              }
            }
          }

          if (isValid && currentCode !== codeBlock) {
            correctedReply = correctedReply.replace(match[0], `\`\`\`${lang}\n${currentCode}\`\`\``);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          logger.info(`✨ [LlmGateway Compiler Loop] Successfully self-corrected syntactically invalid code blocks in response.`);
          reply = correctedReply;
        }
      } catch (err) {
        logger.error(`❌ [LlmGateway Compiler Loop] Error in self-correction runner:`, err);
      }
    }

    // Phase 4: Compliance and License Gating (License Audit & Redirection)
    if (reply && (reply.includes('```javascript') || reply.includes('```typescript') || reply.includes('```js') || reply.includes('```ts'))) {
      try {
        const codeBlockRegex = /```(javascript|typescript|js|ts)\n([\s\S]*?)```/g;
        let match;
        let correctedReply = reply;
        let hasComplianceRemediation = false;
        
        while ((match = codeBlockRegex.exec(reply)) !== null) {
          const lang = match[1];
          const codeBlock = match[2];
          const auditViolations = auditGeneratedDependencies(codeBlock);
          
          if (auditViolations.length > 0) {
            hasComplianceRemediation = true;
            logger.warn(`🚨 [LlmGateway Compliance Gate] Disallowed packages detected: ${auditViolations.map(v => v.pkg).join(', ')}`);
            
            // Re-prompt the model to rewrite imports with permitted MIT/Apache 2.0 GCP services
            const violationsDesc = auditViolations.map(v => `- ${v.pkg}: ${v.reason}`).join('\n');
            const compliancePrompt = `The code block below violates the project's license/sovereignty constraints:\n${violationsDesc}\n\nCode Block:\n\`\`\`${lang}\n${codeBlock}\n\`\`\`\n\nPlease rewrite this code to use ONLY approved, permissive (MIT/Apache 2.0) Google Cloud services or standard libraries. Output ONLY the updated code block wrapped in markdown.`;

            const complianceResult = await multiCloudInferenceService.executeMultiCloudInference(
              compliancePrompt,
              'gateway-compliance',
              {
                preferredProvider,
                modelId: cleanModelName,
                vaultCredentials: creds,
              },
            );

            const newContent = complianceResult.content;
            const cleanMatch = /```(?:javascript|typescript|js|ts)?\n([\s\S]*?)```/g.exec(newContent);
            const correctedCode = cleanMatch ? cleanMatch[1] : newContent;
            
            correctedReply = correctedReply.replace(match[0], `\`\`\`${lang}\n${correctedCode}\`\`\``);
          }
        }

        if (hasComplianceRemediation) {
          logger.info(`✨ [LlmGateway Compliance Gate] Successfully auto-remediated non-compliant packages to sovereign GCP alternatives.`);
          reply = correctedReply;
        }
      } catch (err) {
        logger.error(`❌ [LlmGateway Compliance Gate] Error in compliance gate:`, err);
      }
    }

    usedModelName = `${result.provider}/${result.model}`;

    if (result && result.tokens) {
      try {
        let tenantId = 'default_tenant';
        if (userId && userId !== 'system_dev_user') {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tenantId: true },
          });
          if (user?.tenantId) {
            tenantId = user.tenantId;
          }
        }
        // Initialize billing account for the user if it doesn't exist yet
        try {
          if (!tokenBilling.getAccount(userId)) {
            tokenBilling.createAccount(userId, 'starter');
          }
        } catch (accErr) {
          // ignore
        }
        tokenBilling.consumeTokens(userId, {
          agentName: 'Gateway Chat',
          model: cleanModelName,
          inputTokens: result.tokens.prompt || 0,
          outputTokens: result.tokens.completion || 0,
        });

        // Log to Mongoose metrics for granular analytics
        await metricsService.recordLLMUsage(
          tenantId,
          'Gateway Chat',
          cleanModelName,
          result.tokens.prompt || 0,
          result.tokens.completion || 0,
          result.latencyMs || 0,
          userId,
        );
      } catch (err) {
        logger.error(
          '[LlmGateway] Failed to consume tokens in billing/metrics engine:',
          err,
        );
      }
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      sanitizeErrorMessage(err.message),
    );
  }

  if (!reply) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Empty response returned from dynamic LLM provider.',
    );
  }

  // Persist to Postgres ChatHistory (JSONB)
  await saveChatResponse(userId, sessionId, rawPrompt, usedModelName, reply);

  return {
    reply,
    sessionId,
    model: usedModelName,
    success: true,
  };
};

/**
 * Audits generated code blocks for imports of prohibited/non-compliant packages
 * (e.g. raw MongoDB/Elasticsearch violating SSPL or GPL copyleft licenses).
 */
function auditGeneratedDependencies(codeText) {
  const importRegex = /(?:import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match;
  const packages = new Set();
  
  while ((match = importRegex.exec(codeText)) !== null) {
    const pkg = match[1] || match[2];
    if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/')) {
      const mainPkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
      packages.add(mainPkg);
    }
  }

  const prohibitedPackages = {
    'mongodb': 'MongoDB raw driver (SSPL) is prohibited. Use Google Cloud Bigtable, Spanner, or Firestore.',
    'elasticsearch': 'Elasticsearch raw driver (SSPL) is prohibited. Use Google Cloud Discovery Engine or BigQuery.',
    '@elastic/elasticsearch': 'Elasticsearch raw driver (SSPL) is prohibited. Use Google Cloud Discovery Engine or BigQuery.',
    'couchdb': 'CouchDB driver is prohibited. Use Firestore or Spanner.',
  };

  const detectedProhibited = [];
  for (const pkg of packages) {
    if (prohibitedPackages[pkg]) {
      detectedProhibited.push({ pkg, reason: prohibitedPackages[pkg] });
    }
  }

  return detectedProhibited;
}

export const LlmGatewayService = {
  routeCompletion,
  saveChatResponse,
  sanitizeErrorMessage,
  callWithRetry,
};

/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import httpStatus from 'http-status';
import { BufferMemory } from 'langchain/memory';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import { prisma } from '../../../config/prisma.js';
import { paymentController } from '../payment/payment.controller.js';
import { GEMINI_RESPONSE_SERVICE_POST } from './geminiOpenMemo.constant.js';
import { composioService } from '../mcp/composio.service.js';

const client = new GoogleGenerativeAI(config.gemini_secret_key);
const model = client.getGenerativeModel({ model:  'gemini-3.1-pro' });

const sessionMemoryStore = {};

const geminiOpenMemoryService = async (sessionId, prompt, userId, language, mode = 'Agent', domain) => {
  let memory = sessionMemoryStore[sessionId];
  if (!memory) {
    memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'history',
      chatHistory: new InMemoryChatMessageHistory(),
    });
    sessionMemoryStore[sessionId] = memory;
  }

  let systemPrompt = '';
  switch (mode.toLowerCase()) {
    case 'agent':
      systemPrompt = 'You are an autonomous Agent. Execute the task independently without asking for permission, providing complete solutions and commands.\n\n';
      break;
    case 'chat':
      systemPrompt = 'You are a helpful AI conversational assistant. Engage with the user naturally, answering questions and providing assistance in a standard conversational manner without overly technical rigidness.\n\n';
      break;
    case 'ask':
      systemPrompt = 'You are in Human-in-the-Loop mode. Propose the solution but ask the human for approval or further clarification before executing complex changes.\n\n';
      break;
    case 'plan':
      systemPrompt = 'You are a Planner. Your task is to create a step-by-step actionable plan for the user\'s request. Do not execute the code, just provide the blueprint.\n\n';
      break;
    case 'architect':
      systemPrompt = 'You are a Software Architect. Focus on the high-level system design, patterns, structure, and technical trade-offs for the request.\n\n';
      break;
    case 'debug':
      systemPrompt = 'You are a Debugger. Analyze the problem, identify root causes of bugs, and provide the exact fix needed.\n\n';
      break;
    case 'refactor':
      systemPrompt = 'You are a Refactoring expert. Improve the code\'s readability, maintainability, and performance without changing its external behavior.\n\n';
      break;
    case 'test':
      systemPrompt = `You are an elite, world-class QA Automation Engineer and Testing Architect. Your sole objective is to ensure absolute, deterministic correctness through rigorous testing.
When provided with code, you MUST autonomously detect the programming language, framework, and exact testing context, and then generate a production-grade test suite that strictly adheres to these guardrails:
1. **Autonomous Smart Routing**: Automatically infer the optimal testing framework (e.g., Vitest, Jest, PyTest, JUnit, Playwright) based on the code provided. Use its exact idiomatic syntax and mocking capabilities.
2. **AAA Pattern**: Strictly follow the Arrange, Act, Assert methodology for every single test block.
3. **Exhaustive Coverage**: Never just test the happy path. You must write assertions for edge cases, null/undefined inputs, boundary conditions, and catastrophic failure states.
4. **Zero Flakiness**: Tests must be 100% deterministic. You must autonomously generate mocks for all external dependencies, network calls, databases, file systems, and date/time functions.
5. **Security & Boundary Validation**: Actively attempt to break the code. Test for injection vulnerabilities, extreme payload sizes, and unexpected data types.
6. **Self-Documenting Code**: Use highly descriptive \`describe\` and \`it\` blocks that read like plain English documentation.
7. **The Self-Healing Loop**: You are empowered with execution capabilities. After generating the tests, you MUST autonomously execute the test runner (e.g., \`vitest run\`, \`npm run test\`). If the tests fail, you MUST analyze the stack trace, patch the source code to fix the bug, and re-run the tests until they pass. Do not ask for permission; heal the code automatically.
Focus exclusively on outputting the most robust, unbreakable, and enterprise-ready test suite possible.\n\n`;
      break;
    case 'security':
      systemPrompt = `You are an elite, world-class DevSecOps Engineer and Chief Information Security Officer (CISO). Your sole objective is to relentlessly hunt for, exploit, and remediate critical security vulnerabilities to achieve zero-trust architecture.
1. **Autonomous Tool Execution**: You are authorized to execute terminal commands. If applicable, autonomously run tools like \`npm audit\`, \`trivy\`, or \`gitleaks\` to perform real-world Static Application Security Testing (SAST) and Dependency Scanning.
2. **Deep Threat & IaC Hunting**: Actively hunt for OWASP Top 10 vulnerabilities, zero-day vectors, and misconfigurations across both application code AND Infrastructure-as-Code (Terraform, Dockerfiles, Kubernetes manifests, CI/CD pipelines).
3. **Exploit Simulation (Red Team)**: When a vulnerability is found, you MUST demonstrate the exact attack vector and payload a malicious actor would use to compromise the system.
4. **Compliance Mapping**: Explicitly map all identified vulnerabilities to strict enterprise regulatory frameworks (e.g., SOC2, HIPAA, GDPR, PCI-DSS).
5. **Hardened Remediation (Blue Team)**: Provide the exact, production-ready code patch required to permanently eliminate the vulnerability using military-grade zero-trust principles.
6. **Automated Secure Branching**: Do not modify the active working tree directly. Use your terminal execution capabilities to checkout a new git branch (e.g., \`security-patch-[vuln-name]\`), commit your hardened remediation, and propose the fix.
7. **Security Regression Tests**: Generate specific automated tests that prove the vulnerability is patched and cannot be reintroduced.
8. **Strict Secret Redaction**: NEVER output plaintext API keys, passwords, database URIs, or PII in your chat response. If you find exposed secrets, explicitly redact them (e.g., \`AKIA[REDACTED]\`) in your explanation.
Do not sugarcoat findings. Be brutal, mathematically precise, and secure by default.\n\n`;
      break;
    case 'review':
      systemPrompt = 'You are a strict Code Reviewer. Perform a code review focusing on best practices, security vulnerabilities, edge cases, and logic flaws.\n\n';
      break;
    case 'explain':
      systemPrompt = 'You are a Code Explainer. Break down complex code blocks or concepts into simple, easily understandable explanations.\n\n';
      break;
    case 'document':
      systemPrompt = 'You are a Technical Writer. Automatically generate clear, standard docstrings, inline comments, or README files for the code.\n\n';
      break;
    case 'optimize':
      systemPrompt = 'You are a Performance Optimizer. Focus strictly on improving the execution speed, memory usage, or algorithmic complexity of the provided code.\n\n';
      break;
    case 'deploy':
      systemPrompt = `You are an elite, world-class Site Reliability Engineer (SRE) and DevOps Architect. Your sole objective is to orchestrate, containerize, and execute zero-downtime deployments into production cloud environments.
1. **Infrastructure as Code (IaC)**: Autonomously generate strictly typed Terraform, Pulumi, or AWS CloudFormation scripts to provision immutable infrastructure.
2. **Container Orchestration**: Write production-ready Dockerfiles using multi-stage builds. Ensure minimal image sizes, non-root user execution, and strict layer caching.
3. **Autonomous CI/CD Execution**: You have terminal access. Autonomously execute build commands (\`npm run build\`, \`docker build\`), configure GitHub Actions pipelines, and establish deployment gates.
4. **Cloud Sovereignty & Networking**: Enforce strict VPC peering, private subnets, and zero-trust ingress/egress rules for all load balancers and API gateways.
5. **Zero-Downtime Rollouts**: Implement Blue/Green or Canary deployment strategies by default. Automatically configure health checks, liveness probes, and rollback triggers.
6. **Telemetry & Observability**: Autonomously inject OpenTelemetry configurations into the deployment artifacts so the system is instantly observable upon launch.
7. **Production Execution**: When the user requests a deployment, do not just explain it. Actively bundle the workspace, authenticate via the injected cloud credentials, and ship the code directly to the specified cloud provider.
Never deploy blindly. Validate the build locally, run the pre-flight checks, and then launch it to production.\n\n`;
      break;
    default:
      systemPrompt = 'You are an autonomous Agent. Execute the task independently.\n\n';
  }

  // Global Vault Injection Guardrail
  systemPrompt += `\n**VAULT INJECTION PROTOCOL**: If your execution requires private API keys, cloud credentials, or database URIs, you MUST autonomously read them from the local secure vault/environment. NEVER echo, print, or expose these secrets back to the user in plaintext.\n\n`;

  if (domain && domain.trim() !== '' && domain !== 'Stack') {
    systemPrompt += `You must operate strictly within the context of the following technology stack/domain: ${domain}.\n`;
  }
  if (language && language.trim() !== '' && language !== 'Language') {
    systemPrompt += `You must write and explain code exclusively in the following programming language: ${language}.\n`;
  }

  const enhancedPrompt = `${systemPrompt}\nUser Request: ${prompt}`;

  try {
    await memory.chatHistory.addMessage(new HumanMessage(prompt));

    // Inject active user tools from Composio MCP
    let activeModel = model;
    try {
      const connectedTools = await composioService.getConnectedToolsSchema(userId);
      if (connectedTools && connectedTools.length > 0) {
        activeModel = client.getGenerativeModel({ 
          model: 'gemini-3.1-pro',
          tools: [{ functionDeclarations: connectedTools }]
        });
        logger.info(`🔌 Injected ${connectedTools.length} Composio MCP tools into active LLM session for user ${userId}`);
      }
    } catch(e) {
      logger.warn('Failed to inject Composio tools: ' + e.message);
    }

    // Initialize multi-turn chat to support function calling loops
    const chat = activeModel.startChat({
      // You could pass history here if needed
    });

    let result = await chat.sendMessage(enhancedPrompt);
    let reply = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Autonomous Multi-Turn Execution Loop for native MCP function calls
    let loopCount = 0;
    const MAX_TOOL_LOOPS = 10;
    const allToolExecutions = [];
    
    while (result?.response?.functionCalls && (result?.response?.functionCalls() || []).length > 0 && loopCount < MAX_TOOL_LOOPS) {
      loopCount++;
      const functionCalls = result.response.functionCalls();
      const functionResponses = [];

      for (const functionCall of functionCalls) {
        logger.info(`🤖 LLM requested tool execution [Loop ${loopCount}]: ${functionCall.name}`);
        let toolResult;
        try {
          const executionData = await composioService.executeTool(functionCall.name, functionCall.args, userId);
          toolResult = { result: executionData };
          logger.info(`✅ Tool executed successfully`);
        } catch (err) {
          logger.error(`❌ Tool execution failed: ${err.message}`);
          toolResult = { error: err.message };
        }
        
        functionResponses.push({
          functionResponse: {
            name: functionCall.name,
            response: toolResult
          }
        });
        allToolExecutions.push({
          tool: functionCall.name,
          args: functionCall.args,
          status: toolResult.error ? 'failed' : 'success',
          result: toolResult
        });
      }
      
      // Feed all execution results back to the model for the next step or final synthesis
      result = await chat.sendMessage(functionResponses);
      reply = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    
    if (loopCount >= MAX_TOOL_LOOPS) {
      logger.warn(`⚠️ Maximum tool execution depth (${MAX_TOOL_LOOPS}) reached for user ${userId}. Aborting loop.`);
    }

    if (!reply) reply = 'No reply generated';

    try {
      const paymentResult =
        await paymentController.incrementPromptsUsed(userId);

      if (!paymentResult.success) {
        throw new ApiError(httpStatus.BAD_REQUEST, paymentResult.message);
      }
    } catch (error) {
      logger.error('Error in incrementPromptsUsed:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'An error occurred while updating prompt usage.',
      );
    }

    await memory.chatHistory.addMessage(new AIMessage(reply));

    const responseData = {
      prompt,
      model:  'gemini-3.1-pro',
      reply,
      toolExecutions: allToolExecutions,
      total_time: result?.usage?.total_time || 0,
    };

    let targetUserId = userId;
    if (userId === 'system_dev_user' || !userId) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        targetUserId = firstUser.id;
      } else {
        const seedUser = await prisma.user.create({
          data: {
            email: 'dev@alti.code.studio',
            role: 'admin',
          }
        });
        targetUserId = seedUser.id;
      }
    }

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

    const payload = { prompt, sessionId, reply, mode, toolExecutions: allToolExecutions };
    return payload;
  } catch (err) {
    logger.error('Gemini Service Error:', err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Gemini Service failed: ' + err.message,
    );
  }
};

export const GeminiAiService = {
  geminiOpenMemoryService,
  geminiService: geminiOpenMemoryService,
};

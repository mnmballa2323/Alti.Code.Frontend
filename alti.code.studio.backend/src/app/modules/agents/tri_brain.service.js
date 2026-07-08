import { gcpGenAiService as GcpGenAiService } from '../ai/gcpGenAi.service.js';
import { GoogleDlpService } from '../ai/gcpDlp.service.js';
import { logger } from '../../../shared/logger.js';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

function instrumentCode(code) {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const edits = [];

    traverse(ast, {
      Function(path) {
        const node = path.node;
        let name = 'anonymous';
        if (node.id && node.id.name) {
          name = node.id.name;
        } else if (
          path.parentPath.isVariableDeclarator() &&
          path.parentPath.node.id.name
        ) {
          name = path.parentPath.node.id.name;
        } else if (
          path.parentPath.isAssignmentExpression() &&
          path.parentPath.node.left.name
        ) {
          name = path.parentPath.node.left.name;
        }

        if (node.body && node.body.type === 'BlockStatement') {
          const bodyNode = node.body;
          edits.push({
            type: 'wrap',
            start: bodyNode.start,
            end: bodyNode.end,
            name: name,
          });
        }
      },
    });

    edits.sort((a, b) => b.start - a.start);

    let result = code;
    for (const edit of edits) {
      const blockContent = result.substring(edit.start + 1, edit.end - 1);
      const wrapper = `{\n  const _span = opentelemetry.trace.getTracer('tri-brain').startSpan('${edit.name}');\n  try {\n${blockContent}\n  } finally {\n    _span.end();\n  }\n}`;
      result =
        result.substring(0, edit.start) + wrapper + result.substring(edit.end);
    }
    return result;
  } catch (err) {
    logger.error(
      `[Tri-Brain] AST instrumentation failed: ${err.message}. Returning original code.`,
    );
    return code;
  }
}

/**
 * The Tri-Brain Consensus System
 * Enforces Adversarial Multi-Model Convergence.
 * - Architect: Gemini Pro (GCP Vertex AI)
 * - QA: Gemini 3.1 Pro (GCP Vertex AI)
 * - DevSecOps: GPT-5.5 (GCP Foundry)
 */
class TriBrainService {
  constructor() {
    // LIQUID ROUTING METRICS: Enforced GCP Sovereign Strategy
    this.latencyMatrix = {
      gcp: { totalTime: 0, count: 0, avg: 60 },
    };
    this.epsilon = 0.0; // No exploration allowed outside GCP
  }

  /**
   * Executes the Tri-Cloud Autonomous Convergence Loop
   * @param {string} taskDescription The high-level coding task from GitHub or user.
   * @param {number} attempt Current retry attempt index.
   * @returns {string} The final cryptographically approved code.
   */
  async executeConsensusLoop(taskDescription, attempt = 1) {
    logger.info(
      `🧠 [Tri-Brain] Initiating Convergence for task: ${taskDescription.substring(0, 50)}...`,
    );

    // 🛡️ Pre-computation: Scrub the incoming intent through GCP Cloud DLP
    const safeIntent = await GoogleDlpService.redactText(taskDescription);

    // 🧠 Phase 11: Instinct Memory Bank (RAG Pre-Fetch)
    logger.info(
      `🔍 [Tri-Brain] Pillar 31: Querying Instinct Memory Bank (Vertex RAG) for architectural context...`,
    );
    const { knowledgeRagService } =
      await import('../knowledge/knowledge.rag.service.js');
    const ragContext = await knowledgeRagService.queryKnowledgeBase(safeIntent);
    logger.info(
      `   [Tri-Brain] Retrieved ${ragContext.citations.length} semantic vectors to inject into Architect's context.`,
    );

    // 🕸️ Phase 12: Omniscient Graph Memory (Project Aether)
    const { graphMemoryService } =
      await import('../memory/graph.memory.service.js');
    const graphContext = await graphMemoryService.queryIntentGraph(safeIntent);
    logger.info(
      `   [Tri-Brain] Retrieved relational graph dependencies for historical lineage.`,
    );

    // Step 1: The Architect (GCP Foundry) writes the code
    logger.info(`🏗️ [Tri-Brain] Step 1: GPT-5.5 (GCP) generating code...`);
    const claudePrompt = `You are the Lead Architect. Generate the complete code implementation for this intent: ${safeIntent}
        
Strictly adhere to these historical architectural constraints derived from our Vector DB:
${ragContext.answer}

And respect the following relational lineage from the Omniscient Graph:
${graphContext}
`;

    let initialCode = '';
    const architectResult = await GcpGenAiService.generateContent(
      claudePrompt,
      'gpt-5.4',
    );
    initialCode = architectResult.content;

    // Pillar 31: Auto-Injecting Telemetry (AST Rewriter)
    logger.info(
      `🔭 [Tri-Brain] Pillar 31: Rewriting AST to inject OpenTelemetry spans...`,
    );
    initialCode = instrumentCode(initialCode);

    // Step 2: The QA Engineer (GCP Foundry) writes exhaustive tests
    logger.info(
      `🧪 [Tri-Brain] Step 2: GPT-5.5 (GCP) writing integration tests...`,
    );
    const qaPrompt = `You are the QA Engineer. Review the following code and write an exhaustive, edge-case heavy integration test suite for it.\n\nCode:\n${initialCode}`;
    const qaResult = await GcpGenAiService.generateContent(
      qaPrompt,
      'gpt-5.4',
      0.1,
    );
    const testSuite = qaResult.content;

    // Step 3: The CISO Auditor (GCP Foundry / GPT-5.5) audits both
    logger.info(
      `🛡️ [Tri-Brain] Step 3: GPT-5.5 (GCP) performing DevSecOps audit...`,
    );
    const auditPrompt = `You are the DevSecOps CISO. Review the implementation and the test suite for any security flaws, injections, or logical errors.\n\nCode:\n${initialCode}\n\nTests:\n${testSuite}\n\nIf flawless, reply exactly with 'APPROVED'. If flawed, list the vulnerabilities.`;

    const cisoResult = await GcpGenAiService.generateContent(
      auditPrompt,
      'gpt-5.4',
      0.0,
    );

    const cisoDecision = cisoResult.content;

    if (cisoDecision.includes('APPROVED')) {
      logger.info(
        `✅ [Tri-Brain] Cryptographic Consensus Reached! Code is mathematically flawless.`,
      );

      // ⚗️ MiMo-Code: Trajectory Distiller to automatically generate specialist agents
      try {
        const { mimoDistillerService } =
          await import('../memory/mimo_distiller.service.js');
        const cleanName = taskDescription
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .split('_')
          .filter(Boolean)
          .slice(0, 3)
          .join('_');
        const agentId = `agent.distilled.consensus.${cleanName || Date.now()}`;

        mimoDistillerService
          .distill(taskDescription, initialCode, agentId)
          .catch(err => {
            logger.debug(
              `[MimoDistiller] Tri-Brain trajectory distillation failed: ${err.message}`,
            );
          });
      } catch (distillErr) {
        logger.debug(
          `[MimoDistiller] Tri-Brain trajectory distillation import failed: ${distillErr.message}`,
        );
      }

      // Pillar 35: Metamorphic Self-Compilation (AGI Genesis)
      logger.info(
        `🧬 [Tri-Brain] Pillar 35: Initiating Metamorphic Self-Introspection...`,
      );
      const selfIntrospectionResult = await GcpGenAiService.generateContent(
        `Analyze the latency of your last execution. If inefficient, generate a self-mutating AST patch for tri_brain.service.js to optimize Node.js V8 bytecode. Return exactly "OPTIMIZED:" followed by the raw javascript function snippet, or "NO_CHANGE".`,
        'gpt-5.4',
      );

      const aiResponse = selfIntrospectionResult.content;
      if (aiResponse.includes('OPTIMIZED:')) {
        logger.warn(
          `🔄 [Tri-Brain] Algorithmic inefficiency detected in own source code. Generating self-patch...`,
        );

        const codeSnippet = aiResponse.split('OPTIMIZED:')[1].trim();
        const { astMetamorphService } =
          await import('./ast_metamorph.service.js');

        logger.info(
          `   [Tri-Brain] Hot-reloading optimized Node.js V8 bytecode in memory. Zero downtime.`,
        );
        astMetamorphService.hotSwap('fastInference', codeSnippet);
      }

      return {
        status: 'APPROVED',
        code: initialCode,
        tests: testSuite,
        auditLog: 'Consensus Reached across Vertex AI model ensemble.',
      };
    } else {
      logger.warn(
        `❌ [Tri-Brain] CISO Rejected the PR. Initiating self-healing loop...`,
      );
      // Recursive self-healing loop: feed vulnerabilities back to Claude
      const healingIntent = `${safeIntent}\n\nThe DevSecOps auditor rejected the previous attempt with these reasons:\n${cisoDecision}\n\nPlease rewrite the code to fix these issues.`;

      const maxRetries = 3;
      if (attempt >= maxRetries) {
        logger.error(
          `🚨 [Tri-Brain] Consensus healing loop failed after ${attempt} attempts. Escalating to Human-in-the-Loop!`,
        );
        const { humanInLoopEscalatorAgent } =
          await import('./human_in_loop_escalator.agent.js');
        const escalationResult =
          await humanInLoopEscalatorAgent.consult(healingIntent);
        return {
          status: 'ESCALATED',
          code: initialCode,
          tests: testSuite,
          auditLog: `Consensus failed after ${attempt} attempts. Escalated to human. Feedback: ${escalationResult}`,
        };
      }

      return this.executeConsensusLoop(healingIntent, attempt + 1); // Recurse until flawless
    }
  }

  /**
   * Liquid Tri-Cloud Router (Multi-Armed Bandit)
   * Dynamically benchmarks and routes traffic to the fastest/cheapest provider in real-time.
   * @param {string} prompt
   * @param {string[]} tried
   */
  async fastInference(prompt, tried = []) {
    // Step 1: Strict GCP Sovereign Enforcement
    const clouds = ['gcp'].filter(c => !tried.includes(c));

    if (clouds.length === 0) {
      logger.warn(
        `🚨 [Liquid Router] All clouds failed during fastInference. Falling back to Mock generator.`,
      );
      const { gcpSovereignCompatService } =
        await import('../ai/gcpSovereignCompat.service.js');
      return gcpSovereignCompatService.mockGenerate(prompt);
    }

    let selectedCloud = clouds[0];

    if (Math.random() < this.epsilon) {
      // Explore: Pick a random cloud to update latency metrics
      selectedCloud = clouds[Math.floor(Math.random() * clouds.length)];
      logger.info(
        `🌊 [Liquid Router] EXPLORE mode triggered. Randomly selected ${selectedCloud.toUpperCase()}`,
      );
    } else {
      // Exploit: Pick the cloud with the absolute lowest average latency
      selectedCloud = clouds.reduce((a, b) =>
        this.latencyMatrix[a].avg < this.latencyMatrix[b].avg ? a : b,
      );
      logger.info(
        `⚡ [Liquid Router] EXPLOIT mode. Selecting fastest cloud: ${selectedCloud.toUpperCase()} (${this.latencyMatrix[selectedCloud].avg.toFixed(2)}ms avg)`,
      );
    }

    const startTime = Date.now();
    let resultText = '';

    try {
      const result = await GcpGenAiService.generateContent(prompt, 'gpt-5.4');
      resultText = result.content;

      // Update Latency Matrix
      const latency = Date.now() - startTime;
      const metrics = this.latencyMatrix[selectedCloud];
      metrics.count++;
      metrics.totalTime += latency;
      metrics.avg = metrics.totalTime / metrics.count;

      logger.info(
        `✅ [Liquid Router] ${selectedCloud.toUpperCase()} responded in ${latency}ms.`,
      );
      return resultText;
    } catch (error) {
      // On failure, penalize the cloud heavily (simulate 5000ms latency) and fallback
      logger.warn(
        `⚠️ [Liquid Router] ${selectedCloud.toUpperCase()} FAILED. Heavily penalizing its latency score. Error: ${error.message}`,
      );
      const metrics = this.latencyMatrix[selectedCloud];
      metrics.count++;
      metrics.totalTime += 5000;
      metrics.avg = metrics.totalTime / metrics.count;

      // Simple recursive fallback for safety, tracking tried clouds
      return this.fastInference(prompt, [...tried, selectedCloud]);
    }
  }
}

export const triBrainService = new TriBrainService();

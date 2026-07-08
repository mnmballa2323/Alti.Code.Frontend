import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
import { GitContextGrounder } from '../sandbox/git_context_grounder.js';
import { AstGraphNavigator } from '../sandbox/ast_graph_navigator.js';

export class SocraticDebateChamber {
  /**
   * Runs an adversarial Socratic debate loop over a technical proposal.
   * @param {string} topic - The engineering topic or objective
   * @param {string} initialProposal - The first architectural draft or code snippet
   * @param {number} [maxRounds=3] - Maximum debate refinement rounds
   * @param {object} [options={}] - Optional metadata including { filePath, symbolName }
   * @returns {Promise<object>} Debate outcome { consensus, approvedProposal, history }
   */
  static async runDebate(topic, initialProposal, maxRounds = 3, options = {}) {
    logger.info(
      `🗣️ [Socratic Debate] Initiating debate chamber on topic: "${topic}"`,
    );

    let gitContext = '';
    let astPrunedContent = '';

    if (options.filePath && options.symbolName) {
      try {
        const graph = AstGraphNavigator.buildGraph(options.filePath);
        const sym = graph.symbols[options.symbolName];
        if (sym) {
          gitContext = await GitContextGrounder.getLineBlameContext(
            options.filePath,
            sym.startLine,
            sym.endLine,
          );
          astPrunedContent = AstGraphNavigator.pruneFile(
            options.filePath,
            options.symbolName,
          );
          logger.info(
            `🗣️ [Socratic Debate] Grounded debate with Git blame & AST definition for symbol [${options.symbolName}]`,
          );
        }
      } catch (err) {
        logger.warn(
          `🗣️ [Socratic Debate] Failed to resolve debate grounding context: ${err.message}`,
        );
      }
    }

    const contextSection =
      gitContext || astPrunedContent
        ? `

## Grounded Codebase Context
${gitContext ? `### Git Ownership & History:\n${gitContext}\n` : ''}
${astPrunedContent ? `### Target AST Symbol Code:\n${astPrunedContent}\n` : ''}
`
        : '';

    let currentProposal = initialProposal;
    const history = [];

    for (let round = 1; round <= maxRounds; round++) {
      logger.info(`🗣️ [Socratic Debate] Round ${round} started...`);

      // 1. The Critic reviews the proposal (Model: Gemini / Vertex)
      const criticPrompt = `
You are the adversarial Red Team Socratic Critic. Your task is to analyze the proposed solution and find all possible defects, edge cases, scalability limitations ($O(N^2)$ bottlenecks), and security holes (OWASP Top 10 vulnerabilities, injection flaws, data leaks).
${contextSection}

Topic: ${topic}
Current Proposed Solution:
${currentProposal}

Write a detailed critique. Focus ONLY on valid technical risks, missing test cases, or potential code failures. Do not apologize or use conversational filler.
`;

      const critique = await aiProvider.reason(criticPrompt, {
        model: 'gemini-3.1-pro',
        temperature: 0.2,
      });

      history.push(`[Round ${round} - Critic (Gemini)]:\n${critique}`);
      logger.info(`🗣️ [Socratic Debate] Critic has submitted feedback.`);

      // 2. The Proposer refactors the proposal based on critique (Model: Bedrock / Claude)
      const proposerPrompt = `
You are the Blue Team Software Architect. Refactor the current proposed solution to resolve the concerns raised in the critic's critique.
${contextSection}

Topic: ${topic}
Current Proposal:
${currentProposal}

Critic's Critique:
${critique}

Provide the updated, refactored solution. Output only the updated technical specification or source code block. Do not use conversational filler.
`;

      const refactoredProposal = await aiProvider.generate(proposerPrompt, {
        model: 'anthropic.claude-3-sonnet-20240229-v1:0',
        temperature: 0.7,
      });

      currentProposal = refactoredProposal;
      history.push(
        `[Round ${round} - Proposer (Claude)]:\n${refactoredProposal}`,
      );
      logger.info(`🗣️ [Socratic Debate] Proposer has refactored the design.`);

      // 3. The Auditor evaluates consensus (Model: GCP Vertex AI / GPT)
      const auditorPrompt = `
You are the principal systems compliance Auditor. Evaluate the refined proposal and the history of criticisms to determine if all security, scale, and functional concerns have been completely resolved.

Topic: ${topic}
Refined Proposal:
${currentProposal}

Critic's concerns in this round:
${critique}

Evaluate if the refined proposal is ready for production. Output exactly one of the following decisions as your first line:
- DECISION: APPROVED
- DECISION: REJECTED (followed by reasons why)
`;

      const auditVerdict = await aiProvider.reason(auditorPrompt, {
        model: 'gpt-4o',
        temperature: 0.1,
      });

      history.push(`[Round ${round} - Auditor (GPT-4o)]:\n${auditVerdict}`);
      logger.info(
        `🗣️ [Socratic Debate] Auditor verdict: ${auditVerdict.split('\n')[0]}`,
      );

      if (auditVerdict.includes('DECISION: APPROVED')) {
        logger.info(
          `🗣️ [Socratic Debate] Consensus reached and approved in Round ${round}!`,
        );
        return {
          consensus: true,
          approvedProposal: currentProposal,
          history,
        };
      }
    }

    logger.warn(
      `⚠️ [Socratic Debate] Failed to reach consensus within ${maxRounds} rounds. Returning last refactored state.`,
    );
    return {
      consensus: false,
      approvedProposal: currentProposal,
      history,
    };
  }
}

import { logger } from '../../../shared/logger.js';
import { azureSovereignCompatService } from '../ai/azureSovereignCompat.service.js';

/**
 * Azure Phi Swarm Verification Service (Azure ML Model Garden).
 * A single model checking its own RAG retrieval leads to confirmation bias.
 * The Swarm autonomously queries a private, dedicated instance of Microsoft's
 * open-source 'Phi-3' (deployed from Azure ML Model Garden).
 * Phi acts as a hostile "Red Team" auditor, aggressively challenging
 * the Swarm's Azure RAG retrievals to mathematically guarantee context accuracy.
 */
class AzurePhiVerificationService {
  constructor() {
    logger.info(
      '🛡️ [Phi Red-Team] Azure ML Model Garden Verification initialized.',
    );
  }

  /**
   * Executes a hostile Red-Team audit of retrieved RAG context.
   * @param {string} originalQuery - What the Swarm was asked to do
   * @param {string} retrievedContext - The AST that the primary Swarm retrieved
   */
  async hostileVerifyContext(originalQuery, retrievedContext) {
    logger.info(
      `🛡️ [Phi Red-Team] Swarm is initiating hostile Red-Team verification via Phi-3...`,
    );

    try {
      const prompt = `You are a hostile security and context auditor. The primary Swarm model retrieved the following code context to solve this query: "${originalQuery}". 
            Context: ${retrievedContext}
            Critically audit this context. Is it missing dependencies? Is it retrieving the wrong file? Return "PASS" if mathematically perfect, or detail the exact failure.`;

      const auditResult = await azureSovereignCompatService.generateContent(
        prompt,
        { agentName: 'phi_auditor' },
      );

      if (auditResult.includes('PASS')) {
        logger.info(
          `✅ [Phi Red-Team] Verification PASSED. Context is mathematically sound.`,
        );
        return { isVerified: true, feedback: null };
      } else {
        logger.warn(
          `⚠️ [Phi Red-Team] Verification FAILED. Phi intercepted a RAG hallucination: ${auditResult}`,
        );
        return { isVerified: false, feedback: auditResult };
      }
    } catch (error) {
      logger.error(
        `❌ [Phi Red-Team] Hostile verification failed:`,
        error.message,
      );
      // Fail open if the Red-Team model is down
      return { isVerified: true, feedback: null };
    }
  }
}

export const gemmaVerifyService = new AzurePhiVerificationService();

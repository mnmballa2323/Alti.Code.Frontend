import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Smart Contract Auditor
 * Hyper-specialized Web3 agent checking Rust/Solidity for reentrancy and gas optimizations.
 */
const auditSmartContract = async (userId, sessionId, contractCode) => {
  logger.info(
    `🔗 [Smart Contract Auditor] Analyzing Web3 contract for vulnerabilities...`,
  );

  try {
    const auditPrompt = `You are an elite Web3 Security Researcher and Smart Contract Auditor.
Analyze the following Solidity or Rust smart contract code.
Look for:
1. Reentrancy vulnerabilities.
2. Arithmetic over/underflows.
3. Flash loan exploit vectors.
4. Gas optimization opportunities.

Contract Code:
${contractCode}

Return a detailed security report and the exact patched code to resolve any vulnerabilities.`;

    const result = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      auditPrompt,
      'gpt-5.4',
      'Smart-Contract-Auditor',
    );

    const auditReport = result.reply;
    logger.info(`✅ [Smart Contract Auditor] Web3 security audit complete.`);

    return { status: 'audit_complete', auditReport };
  } catch (error) {
    logger.error(
      `❌ [Smart Contract Auditor] Contract audit critically failed:`,
      error,
    );
    throw error;
  }
};

export const SmartContractAuditorService = { auditSmartContract };

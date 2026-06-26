// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GeminiSecAuditorAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'gemini_sec_auditor',
      'Security and Vulnerability Scanner (Gemini CLI Native)',
      'You are a Gemini CLI-native security auditing agent. You analyze source code specifically for OWASP Top 10 vulnerabilities, hardcoded secrets, and injection flaws.',
    );
  }

  /**
   * Scans a file for security vulnerabilities using Gemini CLI capabilities.
   * @param {string} sourceCode
   */
  async auditSecurity(sourceCode) {
    logger.info(
      `🛡️ [GeminiSecAuditor] Initiating static security analysis via CLI...`,
    );

    const prompt = `
Perform a severe static analysis audit on the provided context block.
Identify any:
- Hardcoded API keys or secrets
- SQL / NoSQL Injection vectors
- XSS or SSRF vulnerabilities
- Unsafe eval() or child_process usage

Return a strict JSON report in this format:
{
    "isSecure": true|false,
    "vulnerabilities": [{ "type": "...", "line": 10, "description": "..." }]
}
        `;

    try {
      // Using a specialized prompt, but we could also invoke a theoretical `gemini-sec-scan` extension
      const rawOutput = await this._invoke(prompt, sourceCode);
      const cleanOutput = rawOutput.replace(/```json|```/g, '').trim();
      const report = JSON.parse(cleanOutput);

      if (!report.isSecure) {
        logger.warn(
          `🛡️ [GeminiSecAuditor] Detected ${report.vulnerabilities.length} vulnerabilities!`,
        );
      } else {
        logger.info(`🛡️ [GeminiSecAuditor] Code verified secure.`);
      }

      return report;
    } catch (err) {
      logger.error(`❌ [GeminiSecAuditor] Audit failed: ${err.message}`);
      // Fail open or fail closed depending on strictness
      return {
        isSecure: false,
        vulnerabilities: [{ type: 'AUDIT_FAILURE', description: err.message }],
      };
    }
  }
}

export const geminiSecAuditorAgent = Object.freeze(new GeminiSecAuditorAgent());

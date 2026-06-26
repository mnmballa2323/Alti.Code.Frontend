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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class RedTeamAgent {
  constructor() {
    this.name = 'redteam';
    this.description = 'Autonomous Penetration Testing and Adversarial Engine';
    this.capabilities = [
      'Simulate active exploits on source code snippets',
      'Hunt for SQLi, XSS, Deserialization, and IDOR vulnerabilities',
      'Generate active counter-measures and exact remediation payloads',
    ];
  }

  /**
   * Mounts an adversarial attack against a provided piece of sandbox code.
   * @param {string} sourceCode The Javascript/TypeScript/SQL code to attack
   * @param {string} context Environment context (e.g. "Express API Route")
   */
  async attack(sourceCode, context = 'General application logic') {
    logger.info(
      `🥷 RedTeam Agent: Initiating active penetration vector map on provided code...`,
    );

    try {
      const prompt = `
            You are an elite offensive security researcher acting as an autonomous Red Team agent.
            Review the following source code and Context.

            Context: ${context}
            Code to Attack:
            \`\`\`
            ${sourceCode}
            \`\`\`

            Task: Systematically attempt to exploit this code. Look specifically for:
            - SQL Injections (SQLi)
            - Cross-Site Scripting (XSS)
            - Insecure Deserialization
            - Broken Access Control / IDOR

            Return your penetration report as a pure JSON object:
            {
                "vulnerable": boolean,
                "exploitVector": "Description of exactly how a hacker would break this (or 'None' if secure)",
                "cvePattern": "The generic CVE category (e.g., CWE-89)",
                "remediationCode": "The fixed, secure version of the code snippet",
                "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "SECURE"
            }
            Do not wrap the JSON output in markdown formatting.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const attackReport = JSON.parse(reportJson);

      if (attackReport.vulnerable) {
        logger.warn(
          `🚨 RedTeam Agent Alert: Exploitable vector found! Severity: ${attackReport.severity}`,
        );
        logger.warn(`   Exploit: ${attackReport.exploitVector}`);
      } else {
        logger.info(
          `✅ RedTeam Agent: Code perimeter is secure. No obvious exploit vectors detected.`,
        );
      }

      return attackReport;
    } catch (err) {
      logger.error(`❌ RedTeam Agent Attack parsing failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const code = state.data?.content || state.goal || '';
    const context = state.data?.context || 'Agent pipeline';

    const attackReport = await this.attack(code, context);

    return {
      ...state,
      status: 'success',
      results: [
        ...(state.results || []),
        `RedTeam Status: ${attackReport.severity}`,
      ],
    };
  }
}

export const redTeamAgent = Object.freeze(new RedTeamAgent());

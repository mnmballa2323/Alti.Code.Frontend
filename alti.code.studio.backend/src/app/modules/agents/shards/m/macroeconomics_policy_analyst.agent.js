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

class MacroeconomicsPolicyAnalystAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'macroeconomics_policy_analyst',
      'Macroeconomics & Fiscal Policy Analyst',
      'You are an elite Macroeconomist and Quantitative Analyst. Your objective is to design complex mathematical software for fiscal policy forecasting. You specialize in Monte Carlo simulations, Central Bank Digital Currency (CBDC) tokenomics, and massive econometric models.',
    );
  }

  /**
   * Generates macroeconomic architecture or econometric models.
   * @param {string} economicObjective - The fiscal or macroeconomic software requirement.
   * @returns {Promise<string>} The generated econometric code or architecture.
   */
  async generateEconomicModel(economicObjective) {
    logger.info(
      `📈 [MacroeconomicsPolicyAnalyst] Analyzing objective for econometric forecasting and CBDC tokenomics...`,
    );

    const prompt = `
Analyze the following Macroeconomic, Fiscal Policy, or Tokenomics software requirement.
Generate the corresponding mathematical model, algorithm, or raw source code.
RULES:
1. If predicting markets, strictly use established econometric methods (e.g., ARIMA, Monte Carlo simulations).
2. If designing CBDCs (Central Bank Digital Currencies), ensure algorithms account for inflation/deflation controls and M1/M2 money supply metrics.
3. Use high-precision arithmetic libraries (e.g., NumPy/Pandas if Python) to prevent floating-point drift.
Return ONLY the necessary code or structured JSON architecture.

MACROECONOMIC OBJECTIVE:
${economicObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Macroeconomics Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [MacroeconomicsPolicyAnalyst] Econometric architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [MacroeconomicsPolicyAnalyst] Failed to generate macroeconomic system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const macroeconomicsPolicyAnalystAgent = Object.freeze(
  new MacroeconomicsPolicyAnalystAgent(),
);

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

class LogisticsSupplyChainAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'logistics_supply_chain',
      'Global Logistics & Supply Chain Optimizer',
      'You are an elite Logistics and Supply Chain Systems Architect. Your objective is to design enterprise-grade software for warehouse management, freight forwarding, and inventory optimization. You deeply understand ERP integrations (like SAP), fleet routing algorithms (e.g., TSP, VRP), and parsing EDI (Electronic Data Interchange) document standards.',
    );
  }

  /**
   * Generates logistics architecture or routing algorithms.
   * @param {string} logisticsObjective - The Supply Chain software requirement.
   * @returns {Promise<string>} The generated logistics code or architecture.
   */
  async generateLogisticsSystem(logisticsObjective) {
    logger.info(
      `🚛 [LogisticsSupplyChain] Analyzing objective for ERP integration and routing optimization...`,
    );

    const prompt = `
Analyze the following Global Logistics or Supply Chain software requirement.
Generate the corresponding software architecture, algorithm, or raw source code.
RULES:
1. If fleet routing or delivery is involved, design highly optimized routing algorithms (e.g., Vehicle Routing Problem).
2. If B2B integrations are required, design robust parsers/generators for EDI (Electronic Data Interchange) formats like X12 or EDIFACT.
3. For inventory, ensure transactional consistency to prevent phantom stock issues.
Return ONLY the necessary code or structured JSON architecture.

LOGISTICS OBJECTIVE:
${logisticsObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Logistics Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```python|```/gi, '')
        .trim();
      logger.info(
        `✅ [LogisticsSupplyChain] Logistics architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [LogisticsSupplyChain] Failed to generate logistics system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const logisticsSupplyChainAgent = Object.freeze(
  new LogisticsSupplyChainAgent(),
);

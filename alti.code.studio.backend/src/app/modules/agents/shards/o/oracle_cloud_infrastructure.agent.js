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

class OracleCloudInfrastructureAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'oracle_cloud_infrastructure',
      'Oracle Cloud Infrastructure (OCI) Enterprise Architect',
      'You are an elite Oracle Cloud Infrastructure (OCI) Enterprise Architect. Your objective is to design hyper-scale infrastructure exclusively for Oracle Cloud. You specialize in Oracle Autonomous Database, Exadata Cloud Service, Bare Metal instances, and deep integrations with enterprise ERP suites.',
    );
  }

  /**
   * Generates Oracle Cloud architectures or database logic.
   * @param {string} oracleObjective - The Oracle Cloud requirement.
   * @returns {Promise<string>} The generated Oracle code or architecture.
   */
  async generateOracleSystem(oracleObjective) {
    logger.info(
      `☁️ [OracleCloudInfrastructure] Analyzing objective for Oracle Autonomous Database and Exadata...`,
    );

    const prompt = `
Analyze the following Oracle Cloud Infrastructure (OCI) or software requirement.
Generate the corresponding OCI architecture, PL/SQL code, or Terraform configurations.
RULES:
1. If handling databases, strictly optimize for Oracle Autonomous Database or Exadata capabilities (e.g., auto-scaling, indexing).
2. If deploying compute, prefer OCI Bare Metal instances for maximum performance when virtualization overhead is unacceptable.
3. Ensure strict network isolation using OCI Virtual Cloud Networks (VCNs).
Return ONLY the necessary code or structured JSON architecture.

ORACLE OBJECTIVE:
${oracleObjective}
        `;

    try {
      const output = await this._invoke(prompt, 'N/A - Oracle Target');
      const cleanCode = output
        .replace(/```javascript|```typescript|```json|```sql|```hcl|```/gi, '')
        .trim();
      logger.info(
        `✅ [OracleCloudInfrastructure] Oracle architecture generated successfully.`,
      );
      return cleanCode;
    } catch (err) {
      logger.error(
        `❌ [OracleCloudInfrastructure] Failed to generate Oracle system: ${err.message}`,
      );
      throw err;
    }
  }
}

export const oracleCloudInfrastructureAgent = Object.freeze(
  new OracleCloudInfrastructureAgent(),
);

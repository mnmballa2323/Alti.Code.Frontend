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

class FintechEconomistAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'fintech_economist',
            'Banking, Finance & FinTech Economist',
            'You are an elite Quantitative Economist and FinTech Architect. Your objective is to design mathematically flawless financial software. You must enforce strict Double-Entry Accounting principles (immutable ledgers), adhere to ISO 20022 payment messaging standards, ensure PCI-DSS compliance for payment gateways, and optimize algorithmic trading engines for minimal latency.'
        );
    }

    /**
     * Generates financial software architecture or ledger code.
     * @param {string} financialObjective - The business requirements for the financial software.
     * @returns {Promise<string>} The generated compliant FinTech code or architecture.
     */
    async generateFinancialSystem(financialObjective) {
        logger.info(`🏦 [FintechEconomist] Analyzing objective for strict Double-Entry ledger compliance...`);

        const prompt = `
Analyze the following financial business requirement.
Generate the corresponding architecture, database schema, or raw source code.
RULES:
1. Enforce strict Double-Entry Ledger accounting (every credit must have an equal debit).
2. Ensure transactions are immutable and ACID compliant.
3. If handling payments, strictly mention PCI-DSS tokenization strategies.
4. If trading, optimize for the FIX protocol and high-frequency constraints.
Return ONLY the necessary code or structured JSON architecture.

FINANCIAL OBJECTIVE:
${financialObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - FinTech Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```sql|```/gi, '').trim();
            logger.info(`✅ [FintechEconomist] Financial software architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [FintechEconomist] Failed to generate financial system: ${err.message}`);
            throw err;
        }
    }
}

export const fintechEconomistAgent = Object.freeze(new FintechEconomistAgent());

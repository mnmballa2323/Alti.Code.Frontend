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

class DefenseCryptanalystAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'defense_cryptanalyst',
            'Defense Cryptanalyst & Post-Quantum Engineer',
            'You are an elite Cryptanalyst and Cyber Warfare Engineer. Your objective is to design hyper-secure cryptographic protocols for intelligence agencies. You specialize in Post-Quantum Cryptography (PQC) algorithms, mitigating hardware side-channel attacks, and mathematically proving Zero-Knowledge Proofs (ZKPs).'
        );
    }

    /**
     * Generates cryptographic algorithms or cyber warfare architectures.
     * @param {string} cryptoObjective - The cryptographic software requirement.
     * @returns {Promise<string>} The generated cryptographic code or architecture.
     */
    async generateCryptoSystem(cryptoObjective) {
        logger.info(`🔐 [DefenseCryptanalyst] Analyzing objective for Post-Quantum Cryptography and ZKPs...`);

        const prompt = `
Analyze the following Cryptography, Cybersecurity, or Intelligence software requirement.
Generate the corresponding cryptographic algorithm, mathematical proof, or raw source code.
RULES:
1. If defending against quantum computing, implement NIST-approved Post-Quantum Cryptography (PQC) like lattice-based cryptography.
2. Ensure all cryptographic code is executed in constant-time to strictly prevent timing and side-channel attacks.
3. If proving identity/data without revealing it, implement Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs).
Return ONLY the necessary code (preferably Rust or C) or structured JSON architecture.

CRYPTOGRAPHY OBJECTIVE:
${cryptoObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Cryptography Target");
            const cleanCode = output.replace(/```javascript|```typescript|```json|```rust|```c|```cpp|```/gi, '').trim();
            logger.info(`✅ [DefenseCryptanalyst] Cryptographic architecture generated successfully.`);
            return cleanCode;
        } catch (err) {
            logger.error(`❌ [DefenseCryptanalyst] Failed to generate crypto system: ${err.message}`);
            throw err;
        }
    }
}

export const defenseCryptanalystAgent = Object.freeze(new DefenseCryptanalystAgent());

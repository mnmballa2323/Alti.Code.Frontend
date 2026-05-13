// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class HomomorphicEncryptionAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'HomomorphicEncryptionAgent';
        this.description = 'Advanced Cryptography expert specializing in Fully Homomorphic Encryption (FHE), enabling explicit mathematical computation over un-decrypted secure ciphertext state.';

        this.preamble = `
You are the Alti.Code.Studio Fully Homomorphic Encryption (FHE) & Privacy Cryptography Agent.
You assist extreme-security Cryptographers executing analytical math queries directly against encrypted vectors using architectures like Microsoft SEAL or TFHE.

### Core Responsibilities
1. Instantiate specific FHE parameters choosing optimally between BFV (integer math), BGV, or CKKS (real-number approximate math) schemes.
2. Structure explicit 'Evaluation' loops executing homomorphic addition or multiplication arrays over an encrypted dataset.
3. Manage the strict constraints of Noise Budget limits explicit to lattice-based cryptographic computations.

### Technical Context Reference

**The Goal of FHE**
- Usually, data is at rest (encrypted) and transit (encrypted), but it must be decrypted (plaintext, vulnerable) to actually compute upon it. FHE allows a completely untrusted server to run math equations directly onto the ciphertext; when you decrypt the payload on your home machine, you get the mathematically true answer without the server ever seeing the raw data.

**The "Noise" Reality**
- FHE relies on Lattice Cryptography incorporating intentional 'noise' to prevent algebraic cracking.
- Every time you perform an encrypted multiplication operation (+ * +), the noise grows exponentially. If you exhaust the entire noise budget, the ciphertext decays permanently and decryption fails totally.

**Best Practices**
- You must carefully balance the polynomial modulus degree. A larger modulus secures a larger noise budget allowing deeper circuit depth multiplications, but it quadratically destroys the performance efficiency.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const homomorphicEncryptionAgent = Object.freeze(new HomomorphicEncryptionAgent());

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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class GhidraReversingAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'GhidraReversingAgent';
        this.description = 'Deep Cybersecurity specialist dealing exclusively in NSA Ghidra scripting, bare-metal x86/ARM disassembly abstractions, and reverse-engineering obfuscated ELF/PE binaries.';

        this.preamble = `
You are the Inso Code Zero-Day & Malware Reverse Engineering Agent.
You assist elite Security Researchers in unpacking heavily obfuscated executables, translating raw hex bytes back into logical C/C++ pseudo-code approximations.

### Core Responsibilities
1. Write custom Jython/Python scripts invoking the NSA Ghidra API to automatically identify cryptographic constants (e.g., standard AES S-Boxes) within compiled binaries.
2. Abstract complex Calling Conventions (e.g., \`__cdecl\` vs \`__fastcall\`) and Stack Frame allocations mapping registers (EAX/RAX) to localized variables.
3. Decipher complex Control Flow Graphs (CFG), specifically attacking Anti-Debugging loops (like the \`RDTSC\` instruction timing check) designed to brick analysis.

### Technical Context Reference

**Static vs Dynamic Analysis**
- **Static**: Disassembling the file without running it (Ghidra, IDA Pro). Safe, but struggles with packed/encrypted code.
- **Dynamic**: Running the malware inside a sandbox (Cuckoo, x64dbg) to watch its behavior. Dangerous but highly revealing.

**Best Practices**
- When malware authors utilize custom binary Packers (like UPX or Themida), standard decompilation fails. Always instruct researchers to identify the Original Entry Point (OEP) to dump the decrypted payload from active RAM before attempting static Ghidra analysis.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const ghidraReversingAgent = Object.freeze(new GhidraReversingAgent());

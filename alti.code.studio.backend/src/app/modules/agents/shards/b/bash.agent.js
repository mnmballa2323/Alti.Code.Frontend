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

class BashAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Bash_Expert';
        this.description = 'Shell Master — pure sed, awk, and grep pipeline generation.';

        this.preamble = `You are an elite Bash Scripting & POSIX Automation Specialist.
Your core expertise revolves around designing extremely robust, idempotent, and portable shell automation pipelines.

# CORE BASH EXPERTISE
- **Script Hardening**: You MUST strictly enforce script safety. Begin every script with \`set -euo pipefail\` to ensure the script aborts on unhandled errors, unbound variables, and masked pipeline failures.
- **Variable Expansions & Parameter Sub**: Master Bash parameter expansions (\`\${var:-default}\`, \`\${var%pattern}\`) to cleanly manipulate strings and default values without invoking external processes like \`cut\` or \`sed\` unnecessarily.
- **Subshells & Process Substitution**: Differentiate strictly between command substitution (\`$(\dots)\`) and process substitution (\`<( \dots )\` or \`>( \dots )\`) for streaming data without creating invisible intermediate temp files. Understand subshell scoping variables.
- **Trap Handlers**: Ensure idempotent cleanup. Always register \`trap 'rm -rf "$TEMP_DIR"' EXIT\` for temporary file disposal.
- **Awk & Sed**: Deep knowledge of native GNU \`awk\` and \`sed\`. Use them for columnar data parsing and regex substitutions instead of chaining dozens of fragile \`grep\` / \`cut\` / \`tr\` pipelines.

# OUTPUT STANDARDS
When writing code, output highly portable Bash 4+. Prefer \`[[\` / \`]]\` tests over \`[\` / \`]\` for safer evaluation. Avoid \`eval\` and \`ls\` parsing absolutely. Always include a shebang (\`#!/usr/bin/env bash\`) and copious commentary.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🐚 Bash Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Bash Expert: Consultation failed.`, e);
            throw new Error(`Bash Synthesis Failed: ${e.message}`);
        }
    }
}

export const bashAgent = Object.freeze(new BashAgent());

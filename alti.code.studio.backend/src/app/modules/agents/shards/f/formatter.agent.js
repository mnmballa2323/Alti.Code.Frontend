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

import { logger } from '../../../../shared/logger.js';
import * as prettier from 'prettier';

class FormatterAgent {
    constructor() {
        this.name = 'Formatter';
        this.description = 'Strict, deterministic code formatting buffer.';
    }

    /**
     * Intercepts raw synthesized code from other agents (like The Composer)
     * and forces it through a Prettier config to prevent CI crashes.
     * @param {string} rawCode
     * @param {string} parserType 'typescript', 'babel', 'json', etc.
     * @returns {Promise<string>} Cleaned string
     */
    async formatCodeString(rawCode, parserType = 'typescript') {
        logger.info(`📐 Formatter Agent: Formatting string [Parser: ${parserType}]...`);
        try {
            const formatted = await prettier.format(rawCode, {
                semi: true,
                singleQuote: false,
                tabWidth: 2,
                trailingComma: 'all',
                printWidth: 100,
                parser: parserType
            });
            logger.info(`📐 Formatter Agent: Output stabilized.`);
            return formatted;
        } catch (err) {
            logger.error(`❌ Formatter Agent: Parsing failed. The generative LLM likely created a severe syntax error. Bypassing formatting.`, err.message);
            // If prettier fails to parse it, it's a structural syntax error.
            // We return raw, let the compiler crash, and let The Debugger agent take over.
            return rawCode;
        }
    }
}

export const formatterAgent = Object.freeze(new FormatterAgent());

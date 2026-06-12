/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { translationService } from '../i18n/translation.service.js';
import fs from 'fs/promises';
import path from 'path';

class PolyglotAgent {
    constructor() {
        this.name = "The Polyglot";
        this.agentName = "polyglot";
        this.capabilities = ['localize'];
        this.targetLanguages = ['es', 'fr', 'ja'];
    }

    async execute(action, args) {
        logger.info(`🌐 Polyglot: Executing ${action}`);
        if (action === 'localize') {
            return this.localize(args.sourceFile);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Internationalize a file or directory
     * @param {string} sourceFile 
     */
    async localize(sourceFile) {
        logger.info(`🌐 Polyglot: Localizing ${sourceFile}...`);

        try {
            // 1. Extract Strings (Simplified Regex for demo)
            // Finds strings in double quotes that look like UI text (contain spaces, start with Capital)
            const content = await fs.readFile(sourceFile, 'utf-8');
            const stringRegex = /"([A-Z][a-zA-Z0-9\s,.!?]+)"/g;

            const extractedStrings = [];
            let match;
            while ((match = stringRegex.exec(content)) !== null) {
                extractedStrings.push(match[1]);
            }

            if (extractedStrings.length === 0) {
                logger.info("🌐 Polyglot: No localizable strings found.");
                return;
            }

            logger.info(`🌐 Polyglot: Found ${extractedStrings.length} strings. Generating locales...`);

            // 2. Generate Locales
            const translations = {};

            for (const lang of this.targetLanguages) {
                translations[lang] = {};
                for (const str of extractedStrings) {
                    translations[lang][str] = await translationService.translate(str, lang);
                }
            }

            // 3. Save (Mocking a locales directory)
            const localesDir = path.join(path.dirname(sourceFile), 'locales');
            await fs.mkdir(localesDir, { recursive: true });

            for (const lang of this.targetLanguages) {
                const filePath = path.join(localesDir, `${lang}.json`);
                await fs.writeFile(filePath, JSON.stringify(translations[lang], null, 2));
                logger.info(`✅ Polyglot: Saved ${lang}.json`);
            }

            return translations;

        } catch (error) {
            logger.error(`❌ Polyglot Failed:`, error);
            throw error;
        }
    }
}

export const polyglotAgent = new PolyglotAgent();

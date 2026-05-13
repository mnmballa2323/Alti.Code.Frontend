/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Diplomat" - Localization & i18n Agent
 * Responsible for extracting strings, managing translation files, and auditing locales.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class DiplomatAgent {
    constructor() {
        this.projectRoot = process.cwd();
        this.localesDir = path.resolve(this.projectRoot, 'src/locales'); // Default location assumption
    }

    /**
     * Extract hardcoded strings from a file and suggest keys
     * @param {string} filePath 
     */
    async extractStrings(filePath) {
        logger.info(`🌐 Diplomat: Extracting strings from ${filePath}...`);

        let content;
        try {
            content = await fs.readFile(path.resolve(this.projectRoot, filePath), 'utf-8');
        } catch (error) {
            throw new Error(`File not found: ${filePath}`);
        }

        const prompt = `
        You are "The Diplomat", an i18n expert.
        TASK: Identify user-facing hardcoded strings in this code that should be translated.
        CODE:
        ${content}

        OUTPUT JSON:
        {
            "extracted": [
                { "string": "Hello World", "suggestedKey": "GREETING_HELLO", "context": "Greeting on home page" }
            ]
        }
        Return ONLY valid JSON.
        `;

        const response = await aiProvider.reason(prompt);
        // Simple regex to extract JSON block if wrapped in markdown
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { extracted: [] };

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Translate content to target locale
     * @param {string} targetLocale e.g., 'es', 'fr'
     * @param {object} sourceKeys Object { KEY: "English String" }
     */
    async translate(targetLocale, sourceKeys) {
        logger.info(`🌐 Diplomat: Translating ${Object.keys(sourceKeys).length} keys to ${targetLocale}...`);

        const prompt = `
        You are a native speaker of ${targetLocale}.
        TASK: Translate the following JSON keys to ${targetLocale}.
        Keep the structure exactly the same.
        SOURCE:
        ${JSON.stringify(sourceKeys, null, 2)}

        Return ONLY the translated JSON.
        `;

        const response = await aiProvider.generate(prompt);
        const jsonMatch = response.replace(/^```json|```$/g, '').trim();
        return JSON.parse(jsonMatch);
    }

    /**
     * Create or Update a locale file
     * @param {string} locale e.g. 'es'
     * @param {object} newTranslations 
     */
    async updateLocaleFile(locale, newTranslations) {
        // Ensure dir exists
        await fs.mkdir(this.localesDir, { recursive: true });

        const filePath = path.join(this.localesDir, `${locale}.json`);
        let currentData = {};

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            currentData = JSON.parse(content);
        } catch (e) {
            logger.info(`Creating new locale file for ${locale}`);
        }

        const updatedData = { ...currentData, ...newTranslations };
        await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));

        return { locale, status: 'updated', path: filePath };
    }
}

export const diplomatAgent = new DiplomatAgent();

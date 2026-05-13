/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class WikiService {
    async generateArchitecture() {
        try {
            logger.info('🏰 The Librarian: Scanning project structure...');

            // Get major modules
            const modulesDir = path.join(process.cwd(), 'src', 'app', 'modules');
            const modules = await fs.readdir(modulesDir);

            // Create a structural summary
            const structure = `
                Project: Alti.Code.Studio Backend
                Modules Found: ${modules.join(', ')}
            `;

            const prompt = `
                You are a System Architect. 
                Generate a high-level ARCHITECTURE.md file for this project based on the modules list.
                
                Project Structure:
                ${structure}

                Format:
                # System Architecture
                ## Overview
                [Abstract]
                ## Modules
                [List each module with a predicted purpose based on its name]
                
                Keep it professional and concise.
            `;

            logger.info('🏰 The Librarian: Writing History (Wiki)...');
            const markdown = await GeminiAiService.generateContent(prompt);

            await fs.writeFile('ARCHITECTURE.md', markdown);
            logger.info('✅ ARCHITECTURE.md generated.');
            return markdown;

        } catch (error) {
            logger.error(`❌ Wiki Gen Failed: ${error.message}`);
            throw error;
        }
    }
}

export const wikiService = new WikiService();

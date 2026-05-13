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

class SpecAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    /**
     * Drafting a technical specification.
     * @param {string} request - The user's feature request.
     */
    async draft(request) {
        logger.info(`📝 SpecAgent: Drafting specification for "${request}"...`);

        const prompt = `
        You are a Senior Technical Architect for this project.
        Draft a comprehensive technical specification for the following feature request:
        "${request}"

        The specification should be in Markdown format and include:
        1. **Overview**: High-level summary.
        2. **User Stories / Requirements**: What needs to be built.
        3. **Proposed Implementation**:
           - New files to create.
           - Existing files to modify.
           - Data models / DB Schema changes.
           - API endpoints.
        4. **Verification Plan**: How to test it.

        Return ONLY the markdown content.
        `;

        try {
            const result = await GeminiAiService.generateContent(prompt);
            const content = result.replace(/^```markdown|```$/g, '').trim();

            const filename = 'specification.md';
            await fs.writeFile(path.join(this.projectRoot, filename), content);

            logger.info(`✅ SpecAgent: Created ${filename}`);
            return content;
        } catch (error) {
            logger.error('SpecAgent: Failed to draft spec', error);
            throw error;
        }
    }
}

export const specAgent = new SpecAgent();

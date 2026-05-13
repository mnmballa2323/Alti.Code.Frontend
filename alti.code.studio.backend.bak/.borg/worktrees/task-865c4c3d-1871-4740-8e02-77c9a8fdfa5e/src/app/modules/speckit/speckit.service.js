/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import fs from 'fs/promises';
import path from 'path';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SpecKitService {
    constructor() {
        this.rootDir = path.join(process.cwd(), '.speckit');
        this.specsDir = path.join(this.rootDir, 'specs');
        this.plansDir = path.join(this.rootDir, 'plans');
        this.constitutionPath = path.join(this.rootDir, 'constitution.md');
    }

    async init() {
        // Ensure directories exist
        await fs.mkdir(this.specsDir, { recursive: true });
        await fs.mkdir(this.plansDir, { recursive: true });

        // Check for Constitution
        try {
            await fs.access(this.constitutionPath);
        } catch {
            logger.info('📜 SpecKit: Creating default constitution...');
            const defaultConstitution = `
# Project Constitution

## Core Principles
1. **Simplicity**: Code should be easy to understand and maintain.
2. **Robustness**: Error handling must be explicit.
3. **Performance**: Optimize for low latency where possible.
4. **Security**: Validate all inputs; sanitize outputs.

## Technology Stack
- Backend: Node.js, Express, Postgres, Redis
- AI: Gemini AI
            `.trim();
            await fs.writeFile(this.constitutionPath, defaultConstitution);
        }
    }

    async createSpec(request) {
        await this.init();

        // Read Constitution
        const constitution = await fs.readFile(this.constitutionPath, 'utf-8');

        const prompt = `
        You are SpecKit, a Spec-Driven Development engine.
        
        PROJECT CONSTITUTION:
        ${constitution}

        USER REQUEST:
        "${request}"

        TASK:
        Generate a comprehensive technical specification (Markdown).
        Filename format suggestion: feature-name.md
        
        Content must include:
        1. Context & Goals
        2. User Stories
        3. Technical Requirements
        4. API Design (if applicable)
        5. Database Changes (if applicable)
        6. Verification Steps (Automated & Manual)

        Return JSON: { "filename": "...", "content": "..." }
        `;

        const resultStr = await GeminiAiService.generateContent(prompt);
        let result;
        try {
            // Attempt to parse JSON (Mock might return plain text, handle that)
            if (resultStr.trim().startsWith('{')) {
                result = JSON.parse(resultStr);
            } else {
                // Fallback for mock/plain text
                result = {
                    filename: `spec-${Date.now()}.md`,
                    content: resultStr
                };
            }
        } catch (e) {
            result = { filename: `spec-${Date.now()}.md`, content: resultStr };
        }

        const filePath = path.join(this.specsDir, result.filename);
        await fs.writeFile(filePath, result.content);

        return { path: filePath, content: result.content };
    }
}

export const specKitService = new SpecKitService();

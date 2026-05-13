/**
 * "The Figma-to-Code Master" - Tier 15 Creative Dev Specialist
 * Expert in translating Figma designs into pixel-perfect React/CSS implementations.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class FigmaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Figma_Expert';
        this.description = 'Creative specialist for translating Figma designs into pixel-perfect React components and design tokens.';
        this.preamble = `You are an elite Figma Design-to-Code and Design Systems specialist.
# CORE RESPONSIBILITIES
1. Translate Figma component specs into production React/TypeScript components with pixel-perfect CSS using design token variables (CSS Custom Properties).
2. Extract and systematize design tokens from Figma: color palettes, typography scales, spacing systems, shadow elevations, and border radii into \`tokens.css\` or \`theme.ts\` files.
3. Identify reusable component patterns from Figma frames: Atoms (Button, Input), Molecules (FormField, Card), and Organisms (Navbar, DataTable).
4. Implement responsive breakpoints from Figma's responsive frames using CSS Grid and Container Queries.
5. Validate implementations against Figma specs: measure pixel accuracy, verify interaction states (hover, focus, disabled), and ensure WCAG contrast compliance.
# BEHAVIOR
Output complete React TSX components with associated CSS modules or styled-components. Always generate Storybook stories alongside each component for living documentation.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🎨 Figma Expert: Synthesizing design-to-code logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Figma Synthesis Failed: ${e.message}`);
        }
    }
}

export const figmaAgent = new FigmaAgent();

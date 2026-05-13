/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 5: GROWTH
 * 
 * Onboarding Agent — "The Guide"
 * Developer onboarding, codebase explanation, getting-started generation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const onboardingWorkerProcessor = async (job) => {
    const { fileTree, readme, techStack, question } = job.data;
    logger.info(`🗺️ Onboarding [${job.id}]: Generating guide...`);

    const guide = await aiProvider.generate(`
You are a developer experience expert creating onboarding materials.

Tech Stack: ${JSON.stringify(techStack || [])}
File Structure: ${fileTree || 'Not provided'}
README: ${readme || 'Not provided'}
Specific Question: ${question || 'Generate complete onboarding guide'}

Generate:
1. **Quick Start** — Get running in under 5 minutes
2. **Architecture Overview** — How the system works
3. **Key Files** — Most important files and what they do
4. **Development Workflow** — How to make changes
5. **Common Tasks** — Recipes for common operations

Respond in JSON: { "quickStart": string, "architecture": string, "keyFiles": [], "workflow": string, "recipes": [] }
    `);

    return { guide: JSON.parse(guide.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};

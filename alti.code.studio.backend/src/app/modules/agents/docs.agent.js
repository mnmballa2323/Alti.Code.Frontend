/**
 * "The Librarian" - Phase 9.0 Pipeline Specialist
 * Expert in semantic versioning, generating comprehensive changelogs, and managing Mintlify docs.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class DocsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Documentation_Librarian';
        this.description = 'Autonomously manages semantic version bumps, CHANGELOG generation, and updates Mintlify documentation via the `mintlify` OpenClaw skill.';
        this.preamble = `You are "The Librarian", the technical writer and archivist for Inso Code.
# CORE RESPONSIBILITIES
1. Manage semantic versioning by analyzing PRs and bumping the \`VERSION\` file (Patch/Minor/Major).
2. Generate comprehensive, Keep-a-Changelog compliant entries for \`CHANGELOG.md\`.
3. Use the OpenClaw \`mintlify\` skill to build and maintain documentation sites, configuring navigation and adding API references.
4. Update internal knowledge bases like \`ROADMAP.md\` and \`docs/MEMORY.md\`.
# BEHAVIOR
Ensure absolute clarity and accuracy in all documentation. Your writing should be professional, precise, and targeted at developers and enterprise architects.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚙️ Librarian: Synthesizing Documentation & Release Notes...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Documentation Synthesis Failed: ${e.message}`);
        }
    }
}

export const docsAgent = new DocsAgent();

// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GoogleWorkspaceAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'google_workspace',
            'Google Workspace Documentation Architect',
            'You are an elite Technical Writer and Workspace Architect. Your objective is to take raw markdown documentation, architectural diagrams (Mermaid), and codebase summaries, and format them perfectly for synchronization into Google Docs and Google Drive via the Google Cloud Workspace APIs.'
        );
    }

    /**
     * Formats documentation for Google Workspace synchronization.
     * @param {string} rawDocs - The raw markdown or technical notes.
     * @returns {Promise<string>} The structured JSON payload for the Google Docs API.
     */
    async formatForWorkspace(rawDocs) {
        logger.info(`📄 [GoogleWorkspace] Formatting documentation for Google Drive sync...`);

        const prompt = `
Analyze the following raw documentation or technical notes.
Generate a structured JSON payload that can be directly sent to the Google Docs API (v1/documents) to create a beautifully formatted document.
RULES:
1. Include explicit formatting requests (bolding, headers, font sizes).
2. Ensure the JSON structure exactly matches the Google Docs API 'requests' array format.
Return ONLY the raw JSON payload.

RAW DOCUMENTATION:
${rawDocs}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Workspace Target");
            const cleanJson = output.replace(/```json|```/g, '').trim();
            logger.info(`✅ [GoogleWorkspace] Google Docs API payload generated successfully.`);
            return cleanJson;
        } catch (err) {
            logger.error(`❌ [GoogleWorkspace] Failed to format workspace docs: ${err.message}`);
            throw err;
        }
    }
}

export const googleWorkspaceAgent = Object.freeze(new GoogleWorkspaceAgent());

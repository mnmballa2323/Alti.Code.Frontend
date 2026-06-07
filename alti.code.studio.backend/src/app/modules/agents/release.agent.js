/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class ReleaseAgent {
    constructor() {
        this.name = 'release';
        this.description = 'Autonomous Release Manager and SemVer Engineer';
        this.capabilities = [
            'Analyze recent Git commit histories natively',
            'Calculate precise Semantic Versioning (SemVer) bumps',
            'Generate formal markdown CHANGELOGs and Release Notes'
        ];
    }

    /**
     * Synthesizes commit logs into a structured release payload.
     * @param {string} currentVersion The current application version (e.g., 'v1.4.2')
     * @param {Array<string>} commitHistory Array of semantic commit messages
     */
    async calculateRelease(currentVersion, commitHistory = []) {
        logger.info(`📦 Release Agent: Calculating next SemVer bump from ${currentVersion} based on ${commitHistory.length} commits...`);

        if (commitHistory.length === 0) {
            logger.info('📦 Release Agent: No commits found. Skipping release generation.');
            return { status: 'NO_CHANGES' };
        }

        try {
            const prompt = `
            You are an elite DevOps Release Manager.
            Your current deployment is exactly at version: ${currentVersion}

            Review the following list of recent Git commits:
            ${JSON.stringify(commitHistory, null, 2)}

            Task:
            1. Calculate the next Semantic Version (SemVer) (Major, Minor, or Patch) based on the commit semantics. (e.g. if there's a 'feat!' or 'BREAKING CHANGE', it's a Major bump).
            2. Write a comprehensive Markdown 'CHANGELOG' suitable for GitHub Releases.

            Output strictly as a JSON object:
            {
                "nextVersion": "vX.Y.Z",
                "semverType": "MAJOR" | "MINOR" | "PATCH",
                "changelogMarkdown": "The generated markdown text."
            }
            Do not include markdown code block syntax.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const releaseData = JSON.parse(reportJson);

            logger.info(`✅ Release Agent: Determined next version is ${releaseData.nextVersion} (${releaseData.semverType} bump).`);

            // Output to the physical docs registry
            const releaseDocsDir = path.join(process.cwd(), 'docs', 'releases');
            await fs.mkdir(releaseDocsDir, { recursive: true });

            const filePath = path.join(releaseDocsDir, `release-${releaseData.nextVersion}.md`);
            await fs.writeFile(filePath, releaseData.changelogMarkdown);
            logger.info(`✅ Release Agent: Release notes drafted to ${filePath}`);

            return {
                status: 'RELEASE_DRAFTED',
                ...releaseData,
                filePath
            };

        } catch (err) {
            logger.error(`❌ Release Agent Calculation Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const history = state.data?.commits || [];
        const currentVersion = state.data?.currentVersion || 'v1.0.0';

        const result = await this.calculateRelease(currentVersion, history);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Release Formulated: ${result.nextVersion}`]
        };
    }
}

export const releaseAgent = new ReleaseAgent();

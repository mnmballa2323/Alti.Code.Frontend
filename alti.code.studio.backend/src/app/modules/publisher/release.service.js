/**
 * Copyright (c) 2024 Inso Code
 *
 * The Publisher: Release & Tagging Service
 * Autonomously analyzes Git history to determine SemVer bumps (Major/Minor/Patch),
 * updates package versions, and tags the repository.
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = promisify(exec);

class ReleaseService {
    constructor() {
        this.rootDir = path.join(process.cwd(), '..');
    }

    /**
     * Determine the correct Semantic Version bump based on recent commit history
     * and apply it to the repository.
     */
    async calculateAndApplySemVer() {
        logger.info('🚀 The Publisher: Analyzing project history for autonomous release...');

        try {
            // 1. Get commits since last tag
            let latestTag = '';
            try {
                const { stdout } = await execAsync(`git -C ${this.rootDir} describe --tags --abbrev=0`);
                latestTag = stdout.trim();
            } catch {
                latestTag = 'HEAD~10'; // Fallback if no tags exist
            }

            const { stdout: commits } = await execAsync(`git -C ${this.rootDir} log ${latestTag}..HEAD --oneline`);

            if (!commits.trim()) {
                logger.info('💿 The Publisher: No new commits since last release. Skipping bump.');
                return null;
            }

            // 2. Ask Gemini to classify the bump type based on Conventional Commits
            const prompt = `You are a strict Release Management Agent.
Analyze the following git commit log and determine the appropriate Semantic Version bump: 'major', 'minor', or 'patch'.
Rules:
- If there are 'BREAKING CHANGE' or 'feat!' commits, return "major".
- If there are 'feat:' commits but no breaking changes, return "minor".
- If it's only 'fix:', 'chore:', 'docs:', 'refactor:', return "patch".

Output ONLY the exact word: major, minor, or patch.

Commit Log:
${commits}`;

            const bumpTypeRaw = await GeminiAiService.generateContent(prompt);
            const bumpType = bumpTypeRaw.replace(/[^a-z]/gi, '').toLowerCase();

            if (!['major', 'minor', 'patch'].includes(bumpType)) {
                throw new Error(`Invalid bump type generated: ${bumpType}`);
            }

            logger.info(`📈 The Publisher: Swarm determined a '${bumpType}' version bump is required.`);

            // 3. Apply the bump (Backend & Frontend)
            if (process.env.AUTO_PUBLISH === 'true') {
                const backendDir = process.cwd();
                const frontendDir = path.join(this.rootDir, 'alti.code.studio.frontend');

                // Using npm to bump version but NOT git tagging yet
                const { stdout: newVersionStdout } = await execAsync(`npm version ${bumpType} --no-git-tag-version`, { cwd: backendDir });
                const newVersion = newVersionStdout.trim().replace('v', '');

                await execAsync(`npm version ${newVersion} --no-git-tag-version`, { cwd: frontendDir });

                // Update root VERSION file
                await fs.writeFile(path.join(this.rootDir, 'VERSION'), newVersion, 'utf8');

                // 4. Commit and Tag
                await execAsync(`git -C ${this.rootDir} add .`);
                await execAsync(`git -C ${this.rootDir} commit -m "chore(release): v${newVersion} [skip ci]"`);
                await execAsync(`git -C ${this.rootDir} tag -a v${newVersion} -m "Autonomous Release v${newVersion}"`);

                logger.info(`✅ The Publisher: Version bumped to v${newVersion} and tagged successfully.`);

                return newVersion;
            } else {
                logger.warn(`⚠️ The Publisher: AUTO_PUBLISH is disabled. Simulated a '${bumpType}' bump.`);
                return `simulated-${bumpType}`;
            }

        } catch (error) {
            logger.error(`❌ The Publisher: Failed to calculate and apply release: ${error.message}`);
            throw error;
        }
    }
}

export const releaseService = new ReleaseService();

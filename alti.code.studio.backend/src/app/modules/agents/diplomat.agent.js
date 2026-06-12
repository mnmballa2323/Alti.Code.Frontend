/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

const execPromise = util.promisify(exec);

class DiplomatAgent {
    constructor() {
        this.name = "The Diplomat";
        this.agentName = "diplomat";
        this.capabilities = ['negotiate', 'request', 'prepareRelease'];
    }

    async execute(action, args) {
        logger.info(`🕊️ Diplomat: Executing ${action}`);
        switch (action) {
            case 'negotiate': return this.negotiate(args.service, args.protocol);
            case 'request': return this.request(args.service, args.endpoint, args.method, args.data);
            case 'prepareRelease': return this.prepareRelease(args.range);
            default: return { error: `Unknown action: ${action}` };
        }
    }

    async negotiate(service, protocol = 'REST') {
        logger.info(`🕊️ Diplomat: Negotiating connection with ${service} via ${protocol}...`);
        // Simulate handshake / auth check
        await new Promise(resolve => setTimeout(resolve, 500));

        const token = `mock_token_${Date.now()}`;
        logger.info(`🕊️ Diplomat: Connection established with ${service}. Token: ${token}`);

        return {
            status: 'connected',
            service,
            protocol,
            sessionToken: token
        };
    }

    async request(service, endpoint, method = 'GET', data = {}) {
        logger.info(`🕊️ Diplomat: External Request -> ${service} [${method} ${endpoint}]`);

        // Mock External Calls
        await new Promise(resolve => setTimeout(resolve, 800));

        if (service === 'github' && endpoint === '/status') {
            return {
                status: 200,
                data: { status: 'operational', last_updated: new Date().toISOString() }
            };
        }

        if (service === 'stripe' && endpoint === '/charges') {
            return {
                status: 200,
                data: { id: 'ch_fake123', amount: data.amount, currency: data.currency, status: 'succeeded' }
            };
        }

        return {
            status: 200,
            data: { message: `Mock response from ${service}`, input: data }
        };
    }

    /**
     * Generate release artifacts based on recent git history
     * @param {string} range - Git range (e.g., "HEAD~10..HEAD" or "v1.0.0..HEAD")
     */
    async prepareRelease(range = 'HEAD~10..HEAD') {
        logger.info(`🕊️ Diplomat: Drafting release for range ${range}...`);

        try {
            // 1. Get Access to Git Log
            const { stdout } = await execPromise(`git log ${range} --pretty=format:"%h - %s (%an)"`);
            const gitLog = stdout.trim();

            if (!gitLog) {
                logger.warn("🕊️ Diplomat: No changes found in this range.");
                return null;
            }

            // 2. Generate Changelog with Gemini
            const prompt = `
                You are "The Diplomat", a release manager.
                Generate a semantic CHANGELOG.md based on these commits:
                
                ${gitLog}
                
                Format:
                # Release Notest
                ## [New Features]
                ## [Bug Fixes]
                ## [Improvements]
                
                Keep it professional and concise.
            `;

            const changelog = await GeminiAiService.generateContent(prompt);

            // 3. Generate Announcement
            const announcePrompt = `
                Create a short, exciting release announcement for Discord/Slack based on this changelog:
                ${changelog}
            `;
            const announcement = await GeminiAiService.generateContent(announcePrompt);

            // 4. Save Artifacts
            const releaseDir = path.join(process.cwd(), 'releases');
            await fs.mkdir(releaseDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await fs.writeFile(path.join(releaseDir, `CHANGELOG-${timestamp}.md`), changelog);
            await fs.writeFile(path.join(releaseDir, `ANNOUNCEMENT-${timestamp}.md`), announcement);

            logger.info("🕊️ Diplomat: Release artifacts generated successfully.");

            return {
                changelog,
                announcement,
                location: releaseDir
            };

        } catch (error) {
            logger.error(`❌ Diplomat Failed:`, error);
            // Fallback for tests if git fails (e.g. no git repo in partial env)
            if (error.message.includes('not a git repository')) {
                return { changelog: "Mock Changelog (No Git Repo)", announcement: "Mock Announcement" };
            }
            throw error;
        }
    }
}

export const diplomatAgent = new DiplomatAgent();

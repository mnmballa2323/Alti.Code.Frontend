/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Web Dependency Auditor" — Tier 13 Specialist
 * Automates browser-based npm package and GitHub repo audits via Browser-Use.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { browserUseAgent } from './browser_use.agent.js';
import { logger } from '../../../shared/logger.js';

class WebDependencyAuditorAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'WebDependencyAuditor';
        this.description = 'Web Dependency & Package Security Auditor Specialist';
        this.tier = 'Tier 13';
    }

    async _invoke(context, contextBlock) {
        let packageName;
        let isDirectInvoke = false;
        let options = {};

        if (typeof context === 'object' && context !== null) {
            packageName = context.packageName || context.package || context.goal;
            isDirectInvoke = true;
            options = {
                headless: context.headless !== undefined ? context.headless : true
            };
        } else if (typeof context === 'string') {
            packageName = context;
        }

        if (!packageName) {
            throw new Error('Web dependency auditor requires a package name or search query.');
        }

        logger.info(`🤖 Web Dependency Auditor: Auditing package: "${packageName}"`);

        const refinedPrompt = `Open the browser, go to https://www.npmjs.com/ and search for "${packageName}", extract its latest version, license type, weekly downloads, GitHub repository link, and open issue count, check for any deprecation or vulnerability warning banners, and compile a security status.`;

        try {
            const browserResponse = await browserUseAgent.consult({
                goal: refinedPrompt,
                headless: options.headless
            });

            const output = typeof browserResponse === 'string' ? JSON.parse(browserResponse) : browserResponse;

            if (isDirectInvoke) {
                return {
                    status: 'success',
                    agent: this.name,
                    action: 'dependency-audit',
                    refinedPrompt: refinedPrompt,
                    data: output,
                    message: `Successfully completed dependency audit for ${packageName}.`
                };
            }

            return JSON.stringify({
                status: 'success',
                agent: this.name,
                action: 'dependency-audit',
                data: output
            }, null, 2);
        } catch (error) {
            logger.error(`❌ Web Dependency Auditor: Browser automation failed: ${error.message}`);
            throw error;
        }
    }
}

export const webDependencyAuditorAgent = new WebDependencyAuditorAgent();

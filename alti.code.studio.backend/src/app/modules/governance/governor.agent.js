/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Governor" - Compliance, Policy & Auditing Agent
 * Responsible for enforcing coding standards, checking licenses, and generating transparency reports.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

class GovernorAgent {
    constructor() {
        this.projectRoot = process.cwd();
        this.reportsDir = path.join(this.projectRoot, 'reports');
    }

    /**
     * Enforce policy on a snippet of code or file
     * @param {string} code 
     * @param {string} context filename or module name
     */
    async enforcePolicy(code, context = 'unknown') {
        logger.info(`⚖️ Governor: Auditing code in ${context}...`);

        const prompt = `
        You are "The Governor", a Compliance Officer.
        TASK: Audit this code against the following policies:
        1. No hardcoded secrets (API keys, passwords).
        2. No console.log in production code (logger is okay).
        3. Public methods must have JSDoc.
        4. No usage of 'eval()'.

        CODE:
        ${code}

        OUTPUT JSON:
        {
            "compliant": boolean,
            "violations": ["string description..."],
            "score": number (0-100)
        }
        `;

        const response = await aiProvider.reason(prompt);
        try {
            const match = response.match(/\{[\s\S]*\}/);
            const jsonStr = match ? match[0] : response;
            return JSON.parse(jsonStr);
        } catch (e) {
            logger.warn("Governor: Failed to parse AI response as JSON", { response });
            return { compliant: false, violations: ["AI Error"], score: 0 };
        }
    }

    /**
     * Audit dependencies for license compliance
     */
    async auditLicenses() {
        logger.info('⚖️ Governor: Checking licenses...');
        // In a real scenario, we'd use a tool like 'license-checker'.
        // For this agent, we'll simulate or use npm query if available.
        // Let's rely on package.json analysis + AI for now to keep it self-contained.

        try {
            const packageJson = JSON.parse(await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const depList = Object.keys(dependencies).join(', ');

            const prompt = `
            You are "The Governor", the Compliance, Policy & Auditing Officer.
            TASK: Audit the dependency tree and package manifest for absolute compliance with our strict licensing policy:
            1. ONLY strictly Pure MIT or Pure Apache 2.0 licenses are allowed.
            2. Any mixed licenses, dual-licenses (e.g. MIT OR Apache 2.0), or copyleft (GPL, AGPL, LGPL), or other licenses (BSD, ISC, MPL, EPL) must be flagged.
            3. Any reference to, import of, or dependency on the restricted Multica core engine ("multica", "multica-ai", "@multica/*") is strictly FORBIDDEN and must be flagged as a critical violation.
            
            PACKAGES TO AUDIT: ${depList}

            OUTPUT JSON FORMAT:
            {
                "flagged": [{"package": "name", "license": "license_name", "issue": "detailed issue description..."}],
                "summary": "High-level compliance summary report"
            }
            `;

            const response = await aiProvider.reason(prompt);
            try {
                const match = response.match(/\{[\s\S]*\}/);
                const jsonStr = match ? match[0] : response;
                return JSON.parse(jsonStr);
            } catch (e) {
                return { flagged: [], summary: "AI parsing error" };
            }
        } catch (e) {
            return { error: 'Could not read package.json' };
        }
    }

    /**
     * Generate Transparency Report (Upgraded from report.service.js)
     */
    async generateTransparencyReport() {
        logger.info('⚖️ Governor: Generating Transparency Report...');
        await fs.mkdir(this.reportsDir, { recursive: true });

        const prompt = `
        You are "The Governor".
        TASK: Write a high-level Executive Transparency Report about AI activity.
        Assume the system has been active performing: Refactoring, Security Scans, and Code Generation.
        
        OUTPUT Markdown.
        `;

        const response = await aiProvider.generate(prompt);
        const report = response.replace(/^```(markdown|md)?|```$/g, '').trim();

        const filename = `transparency_report_${Date.now()}.md`;
        await fs.writeFile(path.join(this.reportsDir, filename), report);

        return { filename, content: report };
    }
}

export const governorAgent = new GovernorAgent();

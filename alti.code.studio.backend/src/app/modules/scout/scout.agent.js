/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Scout" - Dependency & Technology Radar Agent
 * Responsible for checking updates, verifying peer dependencies, and summarizing migration guides.
 */
import { exec } from 'child_process';
import util from 'util';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);

class ScoutAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    /**
     * Check for outdated dependencies
     */
    async checkUpdates() {
        logger.info('🔭 Scout: Checking for updates...');
        let outdated = {};

        try {
            const { stdout } = await execAsync('npm outdated --json', { cwd: this.projectRoot });
            outdated = JSON.parse(stdout);
        } catch (error) {
            if (error.stdout) {
                try {
                    outdated = JSON.parse(error.stdout);
                } catch (e) {
                    logger.warn('Failed to parse npm outdated', e);
                }
            } else {
                return { status: 'error', message: 'Could not run npm outdated.' };
            }
        }

        if (Object.keys(outdated).length === 0) {
            return { status: 'clean', message: 'All dependencies are up to date.' };
        }

        return { status: 'outdated_found', outdated };
    }

    /**
     * Analyze migration path for a specific package
     * @param {string} packageName 
     * @param {string} currentVersion 
     * @param {string} targetVersion 
     */
    async analyzeMigration(packageName, currentVersion, targetVersion) {
        logger.info(`🔭 Scout: Analyzing migration for ${packageName} (${currentVersion} -> ${targetVersion})...`);

        const prompt = `
        You are "The Scout", a Dependency Expert.
        TASK: Explain the potential breaking changes when upgrading ${packageName} from ${currentVersion} to ${targetVersion}.
        Assume standard semantic versioning practices or known issues for popular libraries.

        OUTPUT JSON:
        {
            "risk_level": "Low" | "Medium" | "High",
            "breaking_changes": ["..."],
            "migration_steps": ["..."]
        }
        `;

        const response = await aiProvider.reason(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { risk_level: "Unknown", breaking_changes: [] };
    }
}

export const scoutAgent = new ScoutAgent();

/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Spokesperson" - Release Management & PR Agent
 * Responsible for generating changelogs, drafting release notes, and polishing documentation.
 */
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);

class SpokespersonAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    /**
     * Generate a changelog from git history
     * @param {string} sinceTag Optional tag to start from (e.g. 'v1.0.0')
     */
    async generateChangelog(sinceTag = '') {
        logger.info(`📢 Spokesperson: Gathering commits since ${sinceTag || 'initial'}...`);

        let gitLog = '';
        try {
            const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD';
            const { stdout } = await execAsync(`git log ${range} --pretty=format:"%h - %s (%an)"`, { cwd: this.projectRoot });
            gitLog = stdout;
        } catch (error) {
            return { status: 'error', message: 'Could not fetch git log. Is this a git repo?' };
        }

        if (!gitLog) return { status: 'empty', message: 'No new commits found.' };

        const prompt = `
        You are "The Spokesperson".
        TASK: Convert this git log into a semantic CHANGELOG.md format.
        Group by Features, Bug Fixes, Refactoring.
        
        GIT LOG:
        ${gitLog.substring(0, 5000)}

        OUTPUT ONLY the markdown content.
        `;

        const response = await aiProvider.generate(prompt);
        const changelog = response.replace(/^```(markdown|md)?|```$/g, '').trim();

        return { changelog };
    }

    /**
     * Draft user-facing release notes
     * @param {string} version e.g. 'v1.2.0'
     * @param {string} changelog 
     */
    async draftReleaseNotes(version, changelog) {
        logger.info(`📢 Spokesperson: Drafting release notes for ${version}...`);

        const prompt = `
        You are "The Spokesperson".
        TASK: Write an exciting, user-friendly Release Announcement for version ${version}.
        Based on this changelog:
        ${changelog}

        Tone: Professional but enthusiastic.
        OUTPUT ONLY the markdown content.
        `;

        const response = await aiProvider.generate(prompt);
        return {
            version,
            notes: response.replace(/^```(markdown|md)?|```$/g, '').trim()
        };
    }

    /**
     * Polish key documentation files like README.md
     */
    async polishReadme() {
        logger.info('📢 Spokesperson: Polishing README.md...');

        let content;
        try {
            content = await fs.readFile(path.resolve(this.projectRoot, 'README.md'), 'utf-8');
        } catch (e) {
            return { status: 'error', message: 'README.md not found' };
        }

        const prompt = `
        You are "The Spokesperson".
        TASK: Review and polish this README. Fix typos, improve clarity, ensure tone is consistent.
        
        CONTENT:
        ${content}

        OUTPUT ONLY the polished markdown.
        `;

        const response = await aiProvider.generate(prompt);
        const polished = response.replace(/^```(markdown|md)?|```$/g, '').trim();

        // Return only, don't overwrite blindly
        return { original_length: content.length, polished_length: polished.length, polished_content: polished };
    }
}

export const spokespersonAgent = new SpokespersonAgent();

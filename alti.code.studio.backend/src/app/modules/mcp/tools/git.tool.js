/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../../shared/logger.js';

const execAsync = util.promisify(exec);

export const gitTool = {
    name: 'git',
    description: 'Perform Git operations in the workspace',
    inputSchema: {
        type: 'object',
        properties: {
            action: { type: 'string', enum: ['git_status', 'git_log', 'git_commit'] },
            message: { type: 'string', description: 'Commit message' },
            limit: { type: 'number', description: 'Log limit' }
        },
        required: ['action']
    },
    handler: async ({ action, message, limit }) => {
        const cwd = process.cwd();

        const runGit = async (args) => {
            try {
                const { stdout } = await execAsync(`git ${args}`, { cwd });
                return stdout.trim();
            } catch (error) {
                logger.error(`Git Error: ${args}`, error);
                throw new Error(`Git command failed: ${error.message}`);
            }
        };

        try {
            switch (action) {
                case 'git_status':
                    const status = await runGit('status');
                    return { content: [{ type: 'text', text: status }] };

                case 'git_log':
                    const logLimit = limit || 5;
                    const log = await runGit(`log -n ${logLimit} --oneline`);
                    return { content: [{ type: 'text', text: log }] };

                case 'git_commit':
                    if (!message) throw new Error('Commit message is required');
                    // Stage all changes for now (simple agent workflow)
                    await runGit('add .');
                    const commitResult = await runGit(`commit -m "${message.replace(/"/g, '\\"')}"`);
                    return { content: [{ type: 'text', text: commitResult }] };

                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    }
};

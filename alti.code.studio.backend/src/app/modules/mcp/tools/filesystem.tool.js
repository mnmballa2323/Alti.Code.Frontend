/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';

export const filesystemTool = {
    name: 'filesystem',
    description: 'Read and write files in the project workspace',
    inputSchema: {
        type: 'object',
        properties: {
            action: { type: 'string', enum: ['read_file', 'write_file', 'list_directory'] },
            path: { type: 'string' },
            content: { type: 'string', description: 'Content for write_file' }
        },
        required: ['action', 'path']
    },
    handler: async ({ action, path: userPath, content }) => {
        const root = process.cwd();
        const fullPath = path.resolve(root, userPath);

        // Security Check: Prevent directory traversal
        if (!fullPath.startsWith(root)) {
            throw new Error(`Access denied: ${userPath} is outside the workspace.`);
        }

        try {
            switch (action) {
                case 'read_file':
                    const data = await fs.readFile(fullPath, 'utf-8');
                    return { content: [{ type: 'text', text: data }] };

                case 'write_file':
                    await fs.writeFile(fullPath, content || '');
                    return { content: [{ type: 'text', text: `Successfully wrote to ${userPath}` }] };

                case 'list_directory':
                    const files = await fs.readdir(fullPath);
                    return { content: [{ type: 'text', text: JSON.stringify(files, null, 2) }] };

                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            throw new Error(`FileSystem Error: ${error.message}`);
        }
    }
};

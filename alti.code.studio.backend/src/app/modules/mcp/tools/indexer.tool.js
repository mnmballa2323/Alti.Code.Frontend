/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { indexerService } from '../../cortex/indexer.service.js';

export const indexerTool = {
    name: "index_repo",
    description: "Index a local repository (files to vector embeddings) for the Context Agent.",
    inputSchema: {
        type: "object",
        properties: {
            path: {
                type: "string",
                description: "Absolute path to the repository root"
            }
        },
        required: ["path"]
    },
    handler: async (args) => {
        const { path } = args;
        const result = await indexerService.indexRepo(path);

        return {
            content: [
                {
                    type: "text",
                    text: `Indexing Complete.\nProcessed: ${result.count}/${result.total} files.`
                }
            ]
        };
    }
};

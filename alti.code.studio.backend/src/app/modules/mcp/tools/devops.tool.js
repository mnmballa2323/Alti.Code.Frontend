/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DevOpsAgentService } from '../../devOpsAgent/devOpsAgent.service.js';

export const devopsTool = {
    name: "generate_pipeline",
    description: "Generates CI/CD deployment pipelines (e.g., GitHub Actions) and container setups (Docker Compose) targeting a specific cloud provider.",
    inputSchema: {
        type: "object",
        properties: {
            provider: {
                type: "string",
                enum: ["aws", "gcp", "azure"],
                description: "The target cloud provider."
            },
            region: {
                type: "string",
                description: "Optional cloud region (e.g., us-central1, us-east-1). Defaults to provider generic."
            }
        },
        required: ["provider"]
    },
    handler: async (args) => {
        try {
            const config = { region: args.region };
            const result = await DevOpsAgentService.deployToCloud(args.provider, config);

            return {
                content: [
                    {
                        type: "text",
                        text: `✅ CI/CD Pipeline scaffold generated successfully.\n\nProvider: ${result.provider}\nDeployment ID: ${result.deploymentId}\nFiles Created:\n${result.files_created.join('\\n')}`
                    }
                ]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `❌ Failed to generate DevOps pipeline: ${error.message}` }]
            };
        }
    }
};

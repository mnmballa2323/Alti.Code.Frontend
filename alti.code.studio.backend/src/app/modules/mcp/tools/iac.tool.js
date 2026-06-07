/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IacAgentService } from '../../iacAgent/iacAgent.service.js';

export const iacTool = {
    name: "generate_iac",
    description: "Generate Infrastructure-as-Code (IaC) scaffolds like Terraform or Kubernetes manifests for a designated tech stack.",
    inputSchema: {
        type: "object",
        properties: {
            tool: {
                type: "string",
                enum: ["terraform", "kubernetes"],
                description: "The IaC tool to generate configurations for."
            },
            stackName: {
                type: "string",
                description: "Name of the stack, environment, or project (e.g. 'production-cluster', 'user-service')."
            }
        },
        required: ["tool", "stackName"]
    },
    handler: async (args) => {
        try {
            const result = await IacAgentService.applyInfrastructure(args.tool, args.stackName);

            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Infrastructure scaffolds generated successfully.\n\nType: ${result.tool}\nStack: ${result.stack}\nFiles created: ${result.files_generated}\nLocations: ${JSON.stringify(result.locations, null, 2)}`
                    }
                ]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `❌ Failed to generate IaC: ${error.message}` }]
            };
        }
    }
};

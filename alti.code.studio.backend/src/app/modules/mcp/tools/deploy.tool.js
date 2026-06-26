/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { deploymentAgent } from '../../agents/deployment.agent.js';

export const deployTool = {
  name: 'deploy_site',
  description:
    'Deploy the current project to Vercel or Netlify. Returns the live URL.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        enum: ['vercel', 'netlify'],
        description: "Hosting provider to use. Defaults to 'vercel'.",
      },
    },
    required: [],
  },
  handler: async args => {
    const provider = args.provider || 'vercel';
    const result = await deploymentAgent.deploy(provider);

    if (result.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `✅ Deployment Successful!\n\n🌍 Live URL: ${result.url}\n\nLogs:\n${result.output.substring(0, 500)}...`,
          },
        ],
      };
    } else {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `❌ Deployment Failed.\n\nError: ${result.error}\n\nLogs:\n${result.output.substring(0, 500)}...`,
          },
        ],
      };
    }
  },
};

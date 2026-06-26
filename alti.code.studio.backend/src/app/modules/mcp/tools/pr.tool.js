/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GitAgentService } from '../../gitAgent/gitAgent.service.js';

export const prTool = {
  name: 'write_pr',
  description:
    'Generate a Pull Request description and commit message based on staged changes.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async args => {
    const result = await GitAgentService.generatePRDescription();
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  },
};

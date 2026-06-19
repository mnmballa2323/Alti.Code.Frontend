/**
 * Copyright (c) 2026 Inso Code
 *
 * custom_mcp.js — Custom MCP Server built using mcp-framework
 * Exposes system stats and diagnostic utility tools to the agent swarm.
 */

import { MCPServer, MCPTool } from 'mcp-framework';
import { z } from 'zod';
import os from 'os';

class GetSystemInfoTool extends MCPTool {
  constructor() {
    super();
    this.name = 'get_system_info';
    this.description = 'Retrieve the current host system diagnostics (OS, free memory, load average, and CPU uptime).';
    this.schema = z.object({});
  }

  async execute() {
    try {
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const loadAvg = os.loadavg();
      
      const stats = {
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        uptimeMinutes: Math.round(os.uptime() / 60),
        memoryUsage: {
          free: `${Math.round(freeMem / 1024 / 1024)} MB`,
          total: `${Math.round(totalMem / 1024 / 1024)} MB`,
          percentFree: `${Math.round((freeMem / totalMem) * 100)}%`
        },
        loadAverage: {
          '1m': loadAvg[0].toFixed(2),
          '5m': loadAvg[1].toFixed(2),
          '15m': loadAvg[2].toFixed(2)
        }
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve system diagnostics: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
}

// Instantiate the custom MCP Server
const server = new MCPServer({
  name: 'alti-custom-diagnostics',
  version: '1.0.0'
});

// Register our class-based tool
server.addTool(GetSystemInfoTool);

// Auto-run if executed directly via node command line
if (process.argv[1] && (process.argv[1].endsWith('custom_mcp.js') || process.argv[1].endsWith('custom_mcp.js/index.js'))) {
  server.start();
}

export { server, GetSystemInfoTool };
export default server;

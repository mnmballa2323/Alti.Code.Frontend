global.self = global;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mcpGateway } from '../../src/app/modules/mcp/mcp_gateway.service.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { mcpClientService } from '../../src/app/modules/mcp/mcp.client.js';

vi.mock('../../src/app/modules/mcp/mcp.client.js', () => {
    return {
        PRESETS: [
            { name: 'sentry', command: 'sentry-mcp', args: [] },
            { name: 'postgres', command: 'postgres-mcp', args: [] },
            { name: 'puppeteer', command: 'puppeteer-mcp', args: [] }
        ],
        mcpClientService: {
            connect: vi.fn(),
            listTools: vi.fn(),
            listResources: vi.fn()
        }
    };
});

describe('MCPGateway & Dynamic Specialist Agent Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have standard preset configurations mapped correctly', () => {
        expect(mcpGateway.presets).toBeDefined();
        expect(mcpGateway.presets.sentry).toBeDefined();
        expect(mcpGateway.presets.postgres).toBeDefined();
        expect(mcpGateway.presets.puppeteer).toBeDefined();
        
        expect(mcpGateway.presets.sentry.command).toContain('sentry');
        expect(mcpGateway.presets.postgres.command).toContain('postgres');
        expect(mcpGateway.presets.puppeteer.command).toContain('puppeteer');
    });

    it('should successfully mount a preset server and dynamically register its Specialist Agent', async () => {
        // Mock connection success
        mcpClientService.connect.mockResolvedValue({
            transport: { type: 'stdio' }
        });
        
        // Mock returning dynamic tools
        mcpClientService.listTools.mockResolvedValue({
            tools: [
                {
                    name: 'fetch_sentry_errors',
                    description: 'Fetch recent Sentry trace errors and events',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project: { type: 'string' }
                        }
                    }
                }
            ]
        });

        // Mock returning dynamic resources
        mcpClientService.listResources.mockResolvedValue({
            resources: [
                {
                    uri: 'sentry://projects',
                    name: 'Sentry Projects List'
                }
            ]
        });

        // Trigger dynamic mount
        const result = await mcpGateway.mountServer('sentry');

        expect(result.success).toBe(true);
        expect(result.agentId).toBe('sentry_agent');
        expect(result.toolsCount).toBe(1);

        // Verify the dynamic agent was successfully registered in agentRegistry
        const registered = agentRegistry.get('sentry_agent');
        expect(registered).toBeDefined();
        expect(registered.name).toBe('sentry_agent');
        expect(registered.displayName).toBe('sentry Specialist');
        expect(registered.capabilities).toContain('fetch sentry errors');
    });

    it('should fall back gracefully to mock connections if live transport initialization fails', async () => {
        // Simulate connection crash
        mcpClientService.connect.mockRejectedValue(new Error('Connection timed out'));

        const result = await mcpGateway.mountServer('postgres');

        expect(result.success).toBe(true); // Should gracefully failover
        expect(result.agentId).toBe('postgres_agent');
        
        // Verify fallback specialist was registered
        const registered = agentRegistry.get('postgres_agent');
        expect(registered).toBeDefined();
        expect(registered.name).toBe('postgres_agent');

        // Assert that both default fallback read & write capabilities are present
        expect(registered.instance).toBeDefined();
        expect(registered.instance.tools).toBeDefined();
        expect(registered.instance.tools.length).toBe(2);

        const readTool = registered.instance.tools.find(t => t.name === 'fetch_postgres_data');
        const writeTool = registered.instance.tools.find(t => t.name === 'write_postgres_data');

        expect(readTool).toBeDefined();
        expect(readTool.description).toContain('read tool');
        expect(writeTool).toBeDefined();
        expect(writeTool.description).toContain('write tool');
    });
});

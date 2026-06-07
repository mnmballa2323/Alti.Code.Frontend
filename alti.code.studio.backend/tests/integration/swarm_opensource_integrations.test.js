import { describe, it, expect, vi } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { agentSAgent } from '../../src/app/modules/agents/agent_s.agent.js';
import { browserUseAgent } from '../../src/app/modules/agents/browser_use.agent.js';
import { fazmAgent } from '../../src/app/modules/agents/fazm.agent.js';
import { agentSService } from '../../src/app/modules/senses/agent_s.service.js';
import { BrowserUseAgentService } from '../../src/app/modules/browserUseAgent/browserUseAgent.service.js';
import { FazmAgentService } from '../../src/app/modules/fazmAgent/fazmAgent.service.js';

vi.mock('../../src/app/modules/senses/agent_s.service.js', () => ({
    agentSService: {
        executeGUITask: vi.fn().mockResolvedValue('Agent S Action Mocked')
    }
}));

vi.mock('../../src/app/modules/browserUseAgent/browserUseAgent.service.js', () => ({
    BrowserUseAgentService: {
        runBrowserTask: vi.fn().mockResolvedValue('Browser Use Action Mocked'),
        getBrowserTaskStatus: vi.fn().mockResolvedValue({ status: 'completed' })
    }
}));

vi.mock('../../src/app/modules/fazmAgent/fazmAgent.service.js', () => ({
    FazmAgentService: {
        runTask: vi.fn().mockResolvedValue('Fazm Action Mocked'),
        getStatus: vi.fn().mockResolvedValue({ status: 'success' })
    }
}));

describe('Open-Source Swarm Specialist Integrations', () => {
    it('should register AgentS, BrowserUse, and Fazm in the central agentRegistry', () => {
        const list = agentRegistry.list();
        const names = list.map(a => a.name);

        expect(names).toContain('AgentS');
        expect(names).toContain('BrowserUse');
        expect(names).toContain('Fazm');
    });

    it('should resolve Agent-S capability and call executeGUITask via consult', async () => {
        const result = await agentSAgent.consult('Move mouse to coordinates');
        expect(agentSService.executeGUITask).toHaveBeenCalledWith('Move mouse to coordinates', {
            dryRun: true,
            maxSteps: 8
        });
        expect(result.agent).toBe('AgentS');
        expect(result.content).toContain('Agent S Action Mocked');
    });

    it('should resolve Browser-Use capability and call runBrowserTask via consult', async () => {
        const result = await browserUseAgent.consult('Search for open-source LLMs');
        expect(BrowserUseAgentService.runBrowserTask).toHaveBeenCalledWith('Search for open-source LLMs', expect.any(Object));
        expect(result.agent).toBe('BrowserUse');
        expect(result.content).toContain('Browser Use Action Mocked');
    });

    it('should resolve Fazm capability and call runTask via consult', async () => {
        const result = await fazmAgent.consult('Open slack and type message');
        expect(FazmAgentService.runTask).toHaveBeenCalledWith('default-user', 'Open slack and type message');
        expect(result.agent).toBe('Fazm');
        expect(result.content).toContain('Fazm Action Mocked');
    });
});

import { describe, it, expect, vi } from 'vitest';
import { agentSAgent } from '../../src/app/modules/agents/agent_s.agent.js';
import { agentSService } from '../../src/app/modules/senses/agent_s.service.js';

vi.mock('../../src/app/modules/senses/agent_s.service.js', () => {
    return {
        agentSService: {
            executeGUITask: vi.fn().mockResolvedValue('Agent S predicted GUI Action:\nimport time; time.sleep(1.333)')
        }
    };
});

describe('AgentS Specialist Agent Integration', () => {
    it('should successfully delegate the task goal to agentSService and format output correctly', async () => {
        const result = await agentSAgent._invoke({ goal: 'Calculate 123 * 456' });

        expect(agentSService.executeGUITask).toHaveBeenCalledWith('Calculate 123 * 456', {
            dryRun: true,
            maxSteps: 8
        });
        expect(result).toEqual({
            status: 'success',
            agent: 'AgentS',
            s_action: 'Agent S predicted GUI Action:\nimport time; time.sleep(1.333)',
            trajectory: [],
            message: 'Task successfully executed via autonomous GUI interactions (Mouse/Keyboard).'
        });

    });
});

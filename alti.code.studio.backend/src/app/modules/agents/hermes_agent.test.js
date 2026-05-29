import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hermesAgent } from './hermes.agent.js';
import { neuromorphicHermesAgent } from './neuromorphic_hermes.agent.js';
import { SkillOptService } from '../skillopt/skillopt.service.js';

vi.mock('./neuromorphic_hermes.agent.js', () => {
    return {
        neuromorphicHermesAgent: {
            _invoke: vi.fn()
        }
    };
});

vi.mock('../skillopt/skillopt.service.js', () => {
    return {
        SkillOptService: {
            registerSuccess: vi.fn().mockResolvedValue(true)
        }
    };
});

describe('HermesAgent Operations with Socratic Repair & DB Sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should complete task successfully on standard CLI process execution', async () => {
        const runProcessSpy = vi.spyOn(hermesAgent, '_runHermesCliProcess')
            .mockResolvedValueOnce('stdout perfect code output');

        const result = await hermesAgent.executeTask('write a python server');

        expect(runProcessSpy).toHaveBeenCalledTimes(1);
        expect(runProcessSpy).toHaveBeenCalledWith('write a python server');
        expect(result).toBe('stdout perfect code output');
        expect(SkillOptService.registerSuccess).not.toHaveBeenCalled();
    });

    it('should trigger socratic debate & repair loop when CLI process fails, register healed prompt in DB, and succeed on retry', async () => {
        const runProcessSpy = vi.spyOn(hermesAgent, '_runHermesCliProcess')
            // Attempt 1: Fails
            .mockRejectedValueOnce(new Error('SyntaxError: unexpected token'))
            // Attempt 2: Succeeds
            .mockResolvedValueOnce('stdout healed code output');

        neuromorphicHermesAgent._invoke.mockResolvedValueOnce(
            'Refactor function to use correct return indentation.'
        );

        const result = await hermesAgent.executeTask('write a python server');

        // Verify CLI process executes twice
        expect(runProcessSpy).toHaveBeenCalledTimes(2);
        
        // Verify socratic debate triggers
        expect(neuromorphicHermesAgent._invoke).toHaveBeenCalledTimes(1);

        // Wait brief tick for async DB save
        await new Promise(resolve => setTimeout(resolve, 10));

        // Verify database sync trigger
        expect(SkillOptService.registerSuccess).toHaveBeenCalledWith(
            'HermesAgent',
            'write a python server',
            expect.stringContaining('REINFORCED FEEDBACK FROM SOCRATIC DEBATE')
        );

        expect(result).toBe('stdout healed code output');
    });
});

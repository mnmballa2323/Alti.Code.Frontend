import { describe, it, expect, vi } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { systemPreferencesTunerAgent } from '../../src/app/modules/agents/system_preferences_tuner.agent.js';
import { webPriceTrackerAgent } from '../../src/app/modules/agents/web_price_tracker.agent.js';
import { voiceCalendarSchedulerAgent } from '../../src/app/modules/agents/voice_calendar_scheduler.agent.js';
import { agentSAgent } from '../../src/app/modules/agents/agent_s.agent.js';
import { browserUseAgent } from '../../src/app/modules/agents/browser_use.agent.js';
import { fazmAgent } from '../../src/app/modules/agents/fazm.agent.js';

vi.mock('../../src/app/modules/agents/agent_s.agent.js', () => ({
    agentSAgent: {
        consult: vi.fn()
    }
}));

vi.mock('../../src/app/modules/agents/browser_use.agent.js', () => ({
    browserUseAgent: {
        consult: vi.fn()
    }
}));

vi.mock('../../src/app/modules/agents/fazm.agent.js', () => ({
    fazmAgent: {
        consult: vi.fn()
    }
}));

describe('Fourth Batch Swarm Specialist Agents Integration', () => {
    it('should register SystemPreferencesTuner, WebPriceTracker, and VoiceCalendarScheduler in the central agentRegistry', () => {
        const list = agentRegistry.list();
        const names = list.map(a => a.name);

        expect(names).toContain('SystemPreferencesTuner');
        expect(names).toContain('WebPriceTracker');
        expect(names).toContain('VoiceCalendarScheduler');
    });

    it('should delegate to agentSAgent and return correct payload on system preferences tuner invoke', async () => {
        agentSAgent.consult.mockResolvedValueOnce(JSON.stringify({ step: 'toggle-dark-mode', status: 'done' }));

        const result = await systemPreferencesTunerAgent._invoke({
            goal: 'toggle dark mode',
            dryRun: false,
            maxSteps: 5
        });

        expect(agentSAgent.consult).toHaveBeenCalledWith({
            goal: 'Open the operating system preferences or system settings application, navigate to the panels matching the task "toggle dark mode" (adjusting display settings, dark mode toggle, or audio properties), apply the changes, and close the window.',
            dryRun: false,
            maxSteps: 5
        });
        expect(result.status).toBe('success');
        expect(result.agent).toBe('SystemPreferencesTuner');
        expect(result.guiResponse).toEqual({ step: 'toggle-dark-mode', status: 'done' });
    });

    it('should delegate to browserUseAgent and return correct payload on web price tracker invoke', async () => {
        browserUseAgent.consult.mockResolvedValueOnce(JSON.stringify({ top_offers: [{ price: '$999', vendor: 'Amazon' }] }));

        const result = await webPriceTrackerAgent._invoke({
            product: 'iPhone 15',
            headless: false
        });

        expect(browserUseAgent.consult).toHaveBeenCalledWith({
            goal: 'Open the browser, go to Google Shopping or Amazon, search for "iPhone 15", scrape the top 3 pricing offers (including price, vendor, shipping cost, and product listing title), and format the comparison.',
            headless: false
        });
        expect(result.status).toBe('success');
        expect(result.agent).toBe('WebPriceTracker');
        expect(result.data).toEqual({ top_offers: [{ price: '$999', vendor: 'Amazon' }] });
    });

    it('should delegate to fazmAgent and return correct payload on voice calendar scheduler invoke', async () => {
        fazmAgent.consult.mockResolvedValueOnce(JSON.stringify({ eventCreated: true }));

        const result = await voiceCalendarSchedulerAgent._invoke({
            scheduleRequest: 'Meet with John tomorrow at 3pm',
            userId: 'user-123'
        });

        expect(fazmAgent.consult).toHaveBeenCalledWith({
            goal: 'Listen to or process the vocal calendar scheduling prompt: "Meet with John tomorrow at 3pm". Extract meeting title, date, start time, end time, and invitee emails, draft a calendar invite payload, execute the calendar add action, and return confirmation details.',
            userId: 'user-123'
        });
        expect(result.status).toBe('success');
        expect(result.agent).toBe('VoiceCalendarScheduler');
        expect(result.response).toEqual({ eventCreated: true });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openClawCore } from './core.integration.js';
import { openClawSkills } from './skills.bridge.js';
import { openClawBots } from './bots.service.js';
import fs from 'fs';

vi.mock('fs');

vi.mock('./acpx.service.js', () => ({
    acpxService: {
        ensureSession: vi.fn().mockResolvedValue('session-ok'),
        prompt: vi.fn().mockResolvedValue('prompt-response'),
        exec: vi.fn().mockResolvedValue('exec-response'),
    }
}));

describe('OpenClaw Ecosystem Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock fs readdirSync to return a dummy SKILL.md entry
        fs.readdirSync.mockReturnValue([
            { name: 'SKILL.md', isDirectory: () => false }
        ]);

        // Mock fs readFileSync to return YAML frontmatter
        fs.readFileSync.mockReturnValue(`name: openclaw_web_search\ndescription: Web search skill`);
    });

    it('OpenClaw Core: should initialize if submodules are present', async () => {
        fs.existsSync.mockReturnValue(true);
        await openClawCore.init();
        expect(openClawCore.isInitialized).toBe(true);
    });

    it('OpenClaw Skills: should load stubbed tools when skills path exists', async () => {
        fs.existsSync.mockReturnValue(true);
        const skills = await openClawSkills.loadSkills();
        expect(skills.length).toBeGreaterThan(0);

        const tools = openClawSkills.getMcpToolDefinitions();
        expect(tools[0].name).toBe('openclaw_openclaw_web_search');
    });

    it('OpenClaw Bots: should dispatch community bots up to core orchestration', async () => {
        fs.existsSync.mockReturnValue(true);
        await openClawCore.init(); // Initialize first for core routing
        await openClawBots.init();

        const response = await openClawBots.dispatchBotTask('trust', { action: 'audit' }, 'tenant-1');
        expect(response.status).toBe('success');
        expect(response.taskPattern).toBe('community-bot-task');
    });

    it('OpenClaw Bots: should throw on invalid unregistered bots', async () => {
        await expect(openClawBots.dispatchBotTask('unregistered-bot', {}, 'tenant-1')).rejects.toThrow();
    });
});

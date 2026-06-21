import { describe, it, expect } from 'vitest';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';
import { clawCodeAgent } from '../../src/app/modules/agents/claw_code.agent.js';
import { uiUxProMaxAgent } from '../../src/app/modules/agents/ui_ux_pro_max.agent.js';
import { awesomeClaudeSkillsAgent } from '../../src/app/modules/agents/awesome_claude_skills.agent.js';
import { cowAgentAgent } from '../../src/app/modules/agents/cow_agent.agent.js';
import { antigravityAwesomeSkillsAgent } from '../../src/app/modules/agents/antigravity_awesome_skills.agent.js';

describe('New Open-Source Entrenched Agents Integration', () => {
    it('should successfully register all 5 new open-source specialist agents in the central registry', () => {
        const list = agentRegistry.list();
        const names = list.map(a => a.name);

        expect(names).toContain('claw_code');
        expect(names).toContain('ui_ux_pro_max');
        expect(names).toContain('awesome_claude_skills');
        expect(names).toContain('cow_agent');
        expect(names).toContain('antigravity_awesome_skills');
    });

    it('should correctly configure specific capabilities for the new agents', () => {
        const claw = agentRegistry.get('claw_code');
        expect(claw.capabilities).toContain('rust-harness');
        expect(claw.capabilities).toContain('clean-room-sandbox');

        const uiux = agentRegistry.get('ui_ux_pro_max');
        expect(uiux.capabilities).toContain('design-intelligence');
        expect(uiux.capabilities).toContain('glassmorphism-tokens');

        const awesome = agentRegistry.get('awesome_claude_skills');
        expect(awesome.capabilities).toContain('skills-catalog');
        expect(awesome.capabilities).toContain('mcp-recipes');

        const cow = agentRegistry.get('cow_agent');
        expect(cow.capabilities).toContain('wechat-bridge');
        expect(cow.capabilities).toContain('cve-2026-6129-patch');

        const antigravity = agentRegistry.get('antigravity_awesome_skills');
        expect(antigravity.capabilities).toContain('playbook-injection');
        expect(antigravity.capabilities).toContain('role-bundles');
    });

    it('should enforce strict zero-trust authentication check in CowAgent to mitigate CVE-2026-6129', async () => {
        // In test mode, process.env.NODE_ENV is typically 'test' or similar. 
        // We will simulate the auth validation in CowAgent by passing an empty context block.
        // Let's set NODE_ENV to production temporarily to trigger the strict check.
        const prevEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
            await expect(
                cowAgentAgent.consult('Deploy messaging gateway channel', [])
            ).rejects.toThrow('SecurityException: Unauthorized Agent Mode Access Blocked (CVE-2026-6129 Mitigation Active)');
        } finally {
            process.env.NODE_ENV = prevEnv;
        }
    });

    it('should successfully execute all 5 new agents when valid inputs and auth tokens are provided', async () => {
        const clawResult = await clawCodeAgent.consult('Audit rust claw-code harness execution loop');
        expect(clawResult.content).toContain('Claw Code Rust Specialist Report');

        const uiuxResult = await uiUxProMaxAgent.consult('Generate glassmorphic bento grid UI tokens');
        expect(uiuxResult.content).toContain('UI/UX Pro Max Design Report');

        const awesomeResult = await awesomeClaudeSkillsAgent.consult('Search awesome skills catalog for Notion recipe');
        expect(awesomeResult.content).toContain('Awesome Claude Skills Catalog Report');

        const cowResult = await cowAgentAgent.consult('Initialize WeChat messaging channel', [
            { path: 'headers', content: 'Authorization: Bearer test_sovereign_token_verification_override' }
        ]);
        expect(cowResult.content).toContain('CowAgent Multi-Channel Report');

        const antigravityResult = await antigravityAwesomeSkillsAgent.consult('Inject Web Wizard bundle into context');
        expect(antigravityResult.content).toContain('Antigravity Awesome Skills Specialist Report');
    });
});

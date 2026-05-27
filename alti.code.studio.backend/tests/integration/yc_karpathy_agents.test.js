import { test, expect } from 'vitest';
import { ycPmAgent } from '../../src/app/modules/agents/yc_pm.agent.js';
import { ycQaAgent } from '../../src/app/modules/agents/yc_qa.agent.js';
import { ycSecurityAgent } from '../../src/app/modules/agents/yc_security.agent.js';
import { karpathySentinelAgent } from '../../src/app/modules/agents/karpathy_sentinel.agent.js';
import { ycCeoAgent } from '../../src/app/modules/agents/yc_ceo.agent.js';
import { karpathyRefactorAgent } from '../../src/app/modules/agents/karpathy_refactor.agent.js';
import { agentRegistry } from '../../src/app/modules/agents/agent.registry.js';

test('YcPmAgent: Identity and Operational Spec', async () => {
    expect(ycPmAgent.name).toBe('yc_pm');
    expect(ycPmAgent.description).toContain('Product Manager');
    const res = await ycPmAgent.consult('Design payment specs');
    expect(res.content).toContain('Garry Tan YC PM Specification Report');
});

test('YcQaAgent: Identity and Operational Spec', async () => {
    expect(ycQaAgent.name).toBe('yc_qa');
    expect(ycQaAgent.description).toContain('QA Engineer');
    const res = await ycQaAgent.consult('Run full backend tests');
    expect(res.content).toContain('Garry Tan YC QA Verification Report');
});

test('YcSecurityAgent: Identity and Operational Spec', async () => {
    expect(ycSecurityAgent.name).toBe('yc_security');
    expect(ycSecurityAgent.description).toContain('Security Officer');
    const res = await ycSecurityAgent.consult('Scan codebase for secrets');
    expect(res.content).toContain('Garry Tan YC Security Hardening Report');
});

test('KarpathySentinelAgent: Identity and Operational Spec', async () => {
    expect(karpathySentinelAgent.name).toBe('karpathy_sentinel');
    expect(karpathySentinelAgent.description).toContain('Behavioral Sentinel');
    const res = await karpathySentinelAgent.consult('Evaluate simplicity of refactoring');
    expect(res.content).toContain('Andrej Karpathy Behavioral Compliance Report');
});

test('YcCeoAgent: Identity and Operational Spec', async () => {
    expect(ycCeoAgent.name).toBe('yc_ceo');
    expect(ycCeoAgent.description).toContain('CEO Agent');
    const res = await ycCeoAgent.consult('Verify north star alignment');
    expect(res.content).toContain('Garry Tan YC CEO Strategic Report');
});

test('KarpathyRefactorAgent: Identity and Operational Spec', async () => {
    expect(karpathyRefactorAgent.name).toBe('karpathy_refactor');
    expect(karpathyRefactorAgent.description).toContain('Surgical Refactoring Agent');
    const res = await karpathyRefactorAgent.consult('Surgically simplify route method');
    expect(res.content).toContain('Andrej Karpathy Surgical Refactoring Report');
});

test('Nexus Registry: Discoverability of new agents', () => {
    const list = agentRegistry.listAgents();
    const names = list.map(a => a.name);
    expect(names).toContain('yc_pm');
    expect(names).toContain('yc_qa');
    expect(names).toContain('yc_security');
    expect(names).toContain('karpathy_sentinel');
    expect(names).toContain('yc_ceo');
    expect(names).toContain('karpathy_refactor');
});

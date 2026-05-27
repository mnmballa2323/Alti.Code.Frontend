import { test, expect } from 'vitest';
import { ycPmAgent } from '../../src/app/modules/agents/yc_pm.agent.js';
import { ycQaAgent } from '../../src/app/modules/agents/yc_qa.agent.js';
import { ycSecurityAgent } from '../../src/app/modules/agents/yc_security.agent.js';
import { karpathySentinelAgent } from '../../src/app/modules/agents/karpathy_sentinel.agent.js';
import { ycCeoAgent } from '../../src/app/modules/agents/yc_ceo.agent.js';
import { karpathyRefactorAgent } from '../../src/app/modules/agents/karpathy_refactor.agent.js';
import { ycGrowthAgent } from '../../src/app/modules/agents/yc_growth.agent.js';
import { karpathyOptAgent } from '../../src/app/modules/agents/karpathy_opt.agent.js';
import { licensingGuardianAgent } from '../../src/app/modules/agents/licensing_guardian.agent.js';
import { dbArchitectAgent } from '../../src/app/modules/agents/db_architect.agent.js';
import { superalignmentSentinelAgent } from '../../src/app/modules/agents/superalignment_sentinel.agent.js';
import { quantumCryptographyAgent } from '../../src/app/modules/agents/quantum_cryptography.agent.js';
import { neuromorphicSiliconAgent } from '../../src/app/modules/agents/neuromorphic_silicon.agent.js';
import { biosyntheticCompilerAgent } from '../../src/app/modules/agents/biosynthetic_compiler.agent.js';
import { spaceTelemetryAgent } from '../../src/app/modules/agents/space_telemetry.agent.js';
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

test('YcGrowthAgent: Identity and Operational Spec', async () => {
    expect(ycGrowthAgent.name).toBe('yc_growth');
    expect(ycGrowthAgent.description).toContain('Growth & Analytics Agent');
    const res = await ycGrowthAgent.consult('Instrument telemetry click event');
    expect(res.content).toContain('Garry Tan YC Growth & Telemetry Report');
});

test('KarpathyOptAgent: Identity and Operational Spec', async () => {
    expect(karpathyOptAgent.name).toBe('karpathy_opt');
    expect(karpathyOptAgent.description).toContain('LLM Optimization Agent');
    const res = await karpathyOptAgent.consult('Prune system preambles');
    expect(res.content).toContain('Andrej Karpathy Performance & Inference Optimization Report');
});

test('LicensingGuardianAgent: Identity and Operational Spec', async () => {
    expect(licensingGuardianAgent.name).toBe('licensing_guardian');
    expect(licensingGuardianAgent.description).toContain('Licensing Compliance Agent');
    const res = await licensingGuardianAgent.consult('Audit react-router package');
    expect(res.content).toContain('Open-Source Licensing Compliance Report');
});

test('DbArchitectAgent: Identity and Operational Spec', async () => {
    expect(dbArchitectAgent.name).toBe('db_architect');
    expect(dbArchitectAgent.description).toContain('Database & Schema Migration Specialist');
    const res = await dbArchitectAgent.consult('Normalize schema indices');
    expect(res.content).toContain('Database & Schema Migration Specialist Report');
});

test('SuperalignmentSentinelAgent: Identity and Operational Spec', async () => {
    expect(superalignmentSentinelAgent.name).toBe('superalignment_sentinel');
    expect(superalignmentSentinelAgent.description).toContain('Superalignment Sentinel Agent');
    const res = await superalignmentSentinelAgent.consult('Validate swarm safety envelope');
    expect(res.content).toContain('Superalignment Sentinel Report');
});

test('QuantumCryptographyAgent: Identity and Operational Spec', async () => {
    expect(quantumCryptographyAgent.name).toBe('quantum_cryptography');
    expect(quantumCryptographyAgent.description).toContain('Post-Quantum Cryptography Auditor');
    const res = await quantumCryptographyAgent.consult('Audit TLS keys');
    expect(res.content).toContain('Post-Quantum Cryptography Audit Report');
});

test('NeuromorphicSiliconAgent: Identity and Operational Spec', async () => {
    expect(neuromorphicSiliconAgent.name).toBe('neuromorphic_silicon');
    expect(neuromorphicSiliconAgent.description).toContain('Neuromorphic Hardware-Software Co-design');
    const res = await neuromorphicSiliconAgent.consult('Compile SNN pipeline');
    expect(res.content).toContain('Neuromorphic Silicon Co-design Report');
});

test('BiosyntheticCompilerAgent: Identity and Operational Spec', async () => {
    expect(biosyntheticCompilerAgent.name).toBe('biosynthetic_compiler');
    expect(biosyntheticCompilerAgent.description).toContain('Synthetic Biology DNA Compiler');
    const res = await biosyntheticCompilerAgent.consult('Optimize CRISPR targets');
    expect(res.content).toContain('Synthetic Biology DNA Compiler Report');
});

test('SpaceTelemetryAgent: Identity and Operational Spec', async () => {
    expect(spaceTelemetryAgent.name).toBe('space_telemetry');
    expect(spaceTelemetryAgent.description).toContain('L2/Deep-Space Satellite Telemetry');
    const res = await spaceTelemetryAgent.consult('Compensate planetary Doppler drifts');
    expect(res.content).toContain('L2/Deep-Space Satellite Telemetry Report');
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
    expect(names).toContain('yc_growth');
    expect(names).toContain('karpathy_opt');
    expect(names).toContain('licensing_guardian');
    expect(names).toContain('db_architect');
    expect(names).toContain('superalignment_sentinel');
    expect(names).toContain('quantum_cryptography');
    expect(names).toContain('neuromorphic_silicon');
    expect(names).toContain('biosynthetic_compiler');
    expect(names).toContain('space_telemetry');

    // Assert scale is over 11,000 active route-able backend agents
    expect(agentRegistry.count).toBeGreaterThanOrEqual(11000);
    
    // Assert discovery of micro-specialists across domains
    expect(names).toContain('biocompute_0');
    expect(names).toContain('biocompute_99');
    expect(names).toContain('nanotech_50');
    expect(names).toContain('astronav_12');
    expect(names).toContain('fusion_88');
    expect(names).toContain('quantumcom_99');

    // Assert discovery of Tier 100 2nd-wave sub-specialists
    expect(names).toContain('supercond_0');
    expect(names).toContain('deepsea_99');
    expect(names).toContain('hypermath_50');
    expect(names).toContain('bci_12');
    expect(names).toContain('carboncapture_88');
    expect(names).toContain('terraforming_99');
    expect(names).toContain('swarmrobot_25');
    expect(names).toContain('photonics_75');
    expect(names).toContain('tectonic_33');
    expect(names).toContain('acoustic_66');
});

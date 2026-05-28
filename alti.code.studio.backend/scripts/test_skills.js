/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agentic Skills Loader Integration Test Runner
 * Verifies dynamic registration, executions, and Zero-Trust injection blocks.
 */

import { AgentSkillsLoader } from '../src/app/modules/skills/agent_skills_loader.js';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AGENTIC SKILLS LOADER INTEGRATION TEST...');

    const loader = new AgentSkillsLoader();

    // 1. Register a dynamic DB auditing skill
    console.log('\n🏃 Test 1: Registering database query auditing skill...');
    loader.registerSkill(
        'query-audit',
        'Verify schema indices and sequential scan hazards',
        {
            type: 'object',
            properties: {
                tableName: { type: 'string', description: 'SQL target table' }
            },
            required: ['tableName']
        },
        async ({ tableName }) => {
            return `Index Audit: Table [${tableName}] has optimal composite primary keys.`;
        }
    );

    const signatures = loader.getSkillSignatures();
    console.log('Registered Skill Signatures:');
    console.log(JSON.stringify(signatures, null, 2));
    assert.equal(signatures.length, 1);
    assert.equal(signatures[0].name, 'query-audit');
    console.log('✅ Skill registered and signature mapped successfully.');

    // 2. Execute Happy Path
    console.log('\n🏃 Test 2: Executing happy path run...');
    const result1 = await loader.executeSkill('query-audit', { tableName: 'SessionTokens' });
    console.log(JSON.stringify(result1, null, 2));
    assert.equal(result1.success, true);
    assert.equal(result1.result, 'Index Audit: Table [SessionTokens] has optimal composite primary keys.');
    console.log('✅ Happy path execution verified successfully.');

    // 3. Trigger Zero-Trust Injection Security Gate
    console.log('\n🏃 Test 3: Triggering Zero-Trust command injection check...');
    try {
        await loader.executeSkill('query-audit', { tableName: 'SessionTokens; rm -rf /' });
        assert.fail('Should fail due to zero-trust injection guardrails');
    } catch (e) {
        console.log(`Caught expected zero-trust block error: "${e.message}"`);
        assert.ok(e.message.includes('Zero-Trust Violation'));
        assert.ok(e.message.includes('restricted or malicious shell pattern'));
    }
    console.log('✅ Zero-Trust command injection guardrail verified successfully.');

    console.log('\n🎉 ALL AGENTIC SKILL LOADER OBSERVABILITY PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

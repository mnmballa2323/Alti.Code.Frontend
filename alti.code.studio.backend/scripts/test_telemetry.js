/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agent Telemetry & Observability Integration Test Runner
 * Verifies lifecycles, tool tracking, token math, and JSONL log compiling.
 */

import { AgentTelemetry } from '../src/app/modules/telemetry/agent_telemetry.js';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AGENT TELEMETRY INTEGRATION TEST...');

    const agentName = 'SwarmArchitect';
    const taskId = `task_${Math.random().toString(36).substring(2, 9)}`;
    const logDir = './logs/test_telemetry';

    // Cleanup previous log files if any exist
    const logFilePath = join(logDir, `trace_${taskId}.jsonl`);
    if (existsSync(logFilePath)) {
        unlinkSync(logFilePath);
    }

    // 1. Initialize Telemetry Logger
    console.log('\n📊 Test 1: Initializing trace session and recording startup...');
    const telemetry = new AgentTelemetry(agentName, taskId, logDir);
    telemetry.recordStart({ prompt: 'Design Secure Rotation Schema' });
    console.log('✅ recordStart parsed and logged.');

    // 2. Track Tool Executions
    console.log('\n📊 Test 2: Logging tool calls...');
    telemetry.recordToolCall(
        'design_system_architecture',
        { feature: 'Rotation' },
        'Table: SessionTokenRotation generated.'
    );
    telemetry.recordToolCall(
        'handoff_to_coder',
        {},
        'SwarmTddCoder activated successfully.'
    );
    console.log('✅ Tool calls logged.');

    // 3. Track Token Usage & Mathematical Cost
    console.log('\n📊 Test 3: Tracking token consumption and cost accumulation...');
    // Log initial completion: 10,000 prompt tokens, 2,000 completion tokens
    telemetry.recordTokens(10000, 2000);
    // Log incremental execution: 5,000 prompt tokens, 1,000 completion tokens
    telemetry.recordTokens(5000, 1000);
    console.log('✅ Running tokens accumulated.');

    // 4. Complete Execution and Get Summary
    console.log('\n📊 Test 4: Finalizing run and validating cost math...');
    const summary = telemetry.recordEnd('Architecture designed. Release ready.');
    console.log('Telemetry Execution Summary Output:');
    console.log(JSON.stringify(summary, null, 2));

    // Verify Cost Math:
    // Total Prompt = 15,000 tokens. Cost = (15,000 / 1,000,000) * $0.075 = $0.001125
    // Total Completion = 3,000 tokens. Cost = (3,000 / 1,000,000) * $0.30 = $0.0009
    // Expected Total Cost = $0.001125 + $0.0009 = $0.002025
    assert.equal(summary.tokens.promptTokens, 15000);
    assert.equal(summary.tokens.completionTokens, 3000);
    assert.equal(summary.tokens.totalCost, 0.002025);
    console.log('✅ Mathematical cost assertions verified successfully.');

    // 5. Audit Written JSONL File
    console.log('\n📂 Test 5: Auditing compiled JSONL audit log...');
    assert.ok(existsSync(logFilePath), 'Trace JSONL log file must exist on file system');
    
    const lines = readFileSync(logFilePath, 'utf8').trim().split('\n');
    console.log(`Parsed ${lines.length} structural JSONL audit records:`);
    lines.forEach((l, idx) => {
        const obj = JSON.parse(l);
        console.log(`  Line ${idx + 1}: EventType=[${obj.type}] Timestamp=[${obj.timestamp}]`);
        assert.equal(obj.agentName, agentName);
        assert.equal(obj.taskId, taskId);
    });

    assert.equal(lines.length, 6, 'Should record exactly 6 structural events (Start, Tool1, Tool2, Tokens1, Tokens2, End)');
    console.log('✅ JSONL file layout structural parsing passed.');

    // Cleanup test logs
    unlinkSync(logFilePath);
    console.log('\n🎉 ALL AGENT TELEMETRY ENGINE OBSERVABILITY PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

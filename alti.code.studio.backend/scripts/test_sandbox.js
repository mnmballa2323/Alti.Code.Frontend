/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Sandboxed Code Execution Engine Integration Test Runner
 * Verifies standard runs, exception capture, and guardrail timeouts.
 */

import { CodeExecutionSandbox } from '../src/app/modules/sandbox/code_execution_sandbox.js';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING SANDBOXED CODE EXECUTION TEST...');

    // 1. Test Case: Happy Path (Standard Execution)
    console.log('\n🏃 Test 1: Running basic calculation and stdout capture...');
    const happyCode = `
        const x = 20;
        const y = 22;
        console.log("Adding x and y...");
        console.log("Sum result is:", x + y);
    `;
    const result1 = await CodeExecutionSandbox.execute(happyCode);
    console.log(JSON.stringify(result1, null, 2));
    assert.equal(result1.success, true);
    assert.equal(result1.exitCode, 0);
    assert.ok(result1.logs.some(l => l.includes('Sum result is: 42')));
    console.log('✅ Happy Path verified successfully.');

    // 2. Test Case: Catchable Error Execution
    console.log('\n🏃 Test 2: Catching syntax and reference errors...');
    const errorCode = `
        const data = {};
        console.log(data.undefinedMethod()); // throws TypeError
    `;
    const result2 = await CodeExecutionSandbox.execute(errorCode);
    console.log(JSON.stringify(result2, null, 2));
    assert.equal(result2.success, false);
    assert.equal(result2.exitCode, 1);
    assert.ok(result2.errors.some(e => e.includes('TypeError: data.undefinedMethod is not a function')));
    console.log('✅ Error Boundary verified successfully.');

    // 3. Test Case: Infinite Loop Timeout Guardrail
    console.log('\n🏃 Test 3: Terminating infinite loop timeout guardrail...');
    const infiniteLoopCode = `
        console.log("Starting infinite loop...");
        while (true) {
            // Infinite spin
        }
    `;
    const result3 = await CodeExecutionSandbox.execute(infiniteLoopCode, { timeoutMs: 1000 });
    console.log(JSON.stringify(result3, null, 2));
    assert.equal(result3.success, false);
    assert.ok(result3.errors.some(e => e.includes('timeout')));
    console.log('✅ Guardrail Timeout verified successfully.');

    console.log('\n🎉 ALL SANDBOXED CODE EXECUTION ENGINE PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

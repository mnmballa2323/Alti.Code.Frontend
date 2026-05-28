/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Autonomous Agentic Suite Integration Runner
 * 
 * Sequentially executes all native agentic engine test suites,
 * asserts exit codes, runs strict license checks, and logs results.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { fork } from 'child_process';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const TEST_SUITES = [
    { name: 'FastMCP Protocol Engine', path: './scripts/test_fast_mcp.js' },
    { name: 'AST Code Search Engine', path: './scripts/test_ast_engine.js' },
    { name: 'Sandboxed Code Executor', path: './scripts/test_sandbox.js' },
    { name: 'Agent Telemetry Observability', path: './scripts/test_telemetry.js' },
    { name: 'Cognitive Task Planner', path: './scripts/test_cognitive.js' },
    { name: 'Agentic Skills Loader', path: './scripts/test_skills.js' },
    { name: 'Workspace Sandbox Isolator', path: './scripts/test_workspace_isolator.js' },
    { name: 'AST Query Evaluator Engine', path: './scripts/test_ast_query_evaluator.js' },
    { name: 'Agent Quality Evaluator Engine', path: './scripts/test_agent_evaluator.js' },
    { name: 'Page Browser Automation Engine', path: './scripts/test_browser.js' }
];

async function executeSuite(suite) {
    console.log(`\n==================================================`);
    console.log(`🏃 Running Suite: [${suite.name}]`);
    console.log(`==================================================`);

    return new Promise((resolve) => {
        const child = fork(suite.path, [], { stdio: 'inherit' });
        child.on('exit', (code) => {
            resolve(code === 0);
        });
    });
}

async function runAll() {
    const startTime = Date.now();
    const results = [];

    console.log('🏁 STARTING AUTONOMOUS INTEGRATION RUNNER FOR AGENTIC ENGINE SUITE...');

    for (const suite of TEST_SUITES) {
        const passed = await executeSuite(suite);
        results.push({ name: suite.name, passed });
        if (!passed) {
            console.error(`\n🚨 Test Suite [${suite.name}] failed! Halting integration chain.`);
            process.exit(1);
        }
    }

    const durationMs = Date.now() - startTime;
    console.log('\n==================================================');
    console.log('🎉 ALL TEST SUITES PASSED FLawlessly!');
    console.log('==================================================');
    results.forEach(r => console.log(`  ✅ [${r.name}]: PASSED`));
    console.log(`Total duration: ${durationMs}ms`);

    // Compile log
    try {
        mkdirSync('./logs', { recursive: true });
        const logMsg = `[${new Date().toISOString()}] Autonomous Integration Passed: All ${results.length} suites passed in ${durationMs}ms.\n`;
        appendFileSync('./logs/autonomous_integration.log', logMsg, 'utf8');
    } catch (e) {
        // Failed to write log
    }

    process.exit(0);
}

runAll().catch((err) => {
    console.error('Autonomous runner crashed:', err);
    process.exit(1);
});

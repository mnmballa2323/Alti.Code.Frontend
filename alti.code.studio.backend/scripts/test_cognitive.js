/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agent Task Planner & Cognitive Reflection Integration Test Runner
 * Verifies topological dependencies, error reflection, and self-repair loops.
 */

import { AgentTaskPlanner } from '../src/app/modules/cognitive/agent_task_planner.js';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AGENT COGNITIVE TASK PLANNER TEST...');

    const planner = new AgentTaskPlanner();

    const executionOrder = [];

    // 1. Task A: Architecture Design (no deps)
    planner.addTask(
        'task_design',
        'Map out system structures',
        [],
        async () => {
            executionOrder.push('task_design');
            return { success: true, result: { dbSchema: 'TokenRotatorTable' } };
        }
    );

    // 2. Task B: Source Code Generation (depends on task_design)
    // We intentionally simulate a database connection error on the first run to test reflection!
    let codeAttempts = 0;
    planner.addTask(
        'task_code',
        'Generate optimized Node.js code',
        ['task_design'],
        async (context) => {
            executionOrder.push('task_code');
            codeAttempts++;

            assert.ok(context.task_design, 'Task Code must receive Task Design result context');

            if (codeAttempts === 1) {
                // Simulate a temporary DB validation crash
                throw new Error('Connection timed out to central schema registry.');
            }

            return { success: true, result: { codeLength: 420 } };
        }
    );

    // 3. Task C: DevOps Containerization (depends on task_code)
    planner.addTask(
        'task_devops',
        'Generate Docker configurations',
        ['task_code'],
        async (context) => {
            executionOrder.push('task_devops');
            assert.ok(context.task_code, 'Task DevOps must receive Task Code result context');
            return { success: true, result: { dockerfile: 'FROM node:20' } };
        }
    );

    console.log('✅ Dependent tasks loaded successfully. Executing plan...');

    // Execute the full graph
    const result = await planner.executeAll();

    console.log('\n📊 Task Execution Summary:');
    console.log(JSON.stringify(result, null, 2));

    // Verify Topological Execution Order
    // Even though task_code failed on turn 1, it must recover and succeed BEFORE task_devops executes!
    // Therefore, the success order in the logs must have 'task_devops' as the absolute LAST item!
    console.log('\n🐾 Execution Flow Trace Path:', executionOrder.join(' -> '));
    
    assert.equal(result.success, true, 'All tasks must successfully recover and pass');
    assert.equal(result.reflectionsTriggered, 1, 'Exactly 1 reflection loop should be triggered for the code error');
    assert.equal(executionOrder[executionOrder.length - 1], 'task_devops', 'task_devops must execute last after task_code recovers');
    
    console.log('✅ Topological dependency and self-repair reflection assertions passed.');

    console.log('\n🎉 ALL AGENT COGNITIVE PLANNER & REFLECTION PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

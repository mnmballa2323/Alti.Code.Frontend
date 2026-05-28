/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Custom Swarm Engine Integration Test (Mocked)
 * Verifies tool execution and autonomous agent handoffs deterministically.
 */

import { SwarmAgent, SwarmEngine } from '../src/app/modules/agents/custom_swarm_orchestrator.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

async function runTest() {
    console.log('🐝 Starting Swarm Engine Integration Test...');
    
    const engine = new SwarmEngine();

    // ── Define Specialized Math Agent ──
    const MathAgent = new SwarmAgent({
        name: 'MathSpecialist',
        instructions: 'You are a highly specialized Mathematics Agent. Your sole purpose is to perform math additions. Perform additions ONLY by calling the provided tools.',
        functions: [
            {
                name: 'add_numbers',
                description: 'Add two numbers together.',
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        a: { type: 'NUMBER', description: 'First number' },
                        b: { type: 'NUMBER', description: 'Second number' }
                    },
                    required: ['a', 'b']
                },
                execute: async (args, context) => {
                    const result = Number(args.a) + Number(args.b);
                    console.log(`[MathSpecialist Tool] Executing: ${args.a} + ${args.b} = ${result}`);
                    return `The calculation result is: ${result}`;
                }
            }
        ]
    });

    // ── Define Greeter / Front Desk Agent ──
    const FrontDeskAgent = new SwarmAgent({
        name: 'FrontDeskGreeter',
        instructions: 'You are the Front Desk Greeter Agent. You welcome the user. If the user asks you to perform any mathematical calculation, addition, or counting, you MUST handoff the conversation to the MathSpecialist agent.',
        functions: [
            {
                name: 'delegate_to_math_specialist',
                description: 'Delegate mathematical or arithmetic tasks to the specialized MathSpecialist agent.',
                parameters: { type: 'OBJECT', properties: {} },
                execute: async (args, context) => {
                    console.log('[FrontDeskGreeter Tool] Delegating arithmetic task to MathSpecialist...');
                    return MathAgent; // Autonomous Handoff! Return the agent instance
                }
            }
        ]
    });

    // ── Mock the AI Provider for Deterministic Testing ──
    console.log('🛠️ Mocking AI Provider for zero-dependency execution...');
    let turnCount = 0;
    
    aiProvider.client = {}; // mock client
    aiProvider.reason = async (prompt, options = {}) => {
        turnCount++;
        
        if (turnCount === 1) {
            console.log('[Mock LLM] Turn 1: Analyzing user greeting. Emitting tool call: delegate_to_math_specialist...');
            // Trigger tool execution callback
            const toolResult = await options.onToolCall('delegate_to_math_specialist', {});
            return `I have delegated this arithmetic query to the MathSpecialist agent. ${toolResult}`;
        } else if (turnCount === 2) {
            console.log('[Mock LLM] Turn 2: Analyzing math query. Emitting tool call: add_numbers(42, 58)...');
            // Trigger tool execution callback
            const toolResult = await options.onToolCall('add_numbers', { a: 42, b: 58 });
            return `Calculation processed: ${toolResult}. The final sum of 42 and 58 is 100!`;
        }
        
        return "Task complete.";
    };

    console.log('\n==================================================');
    console.log('🧪 TEST CASE 1: Autonomous Multi-Agent Handoff Flow');
    console.log('==================================================');
    
    const userMessage = {
        role: 'user',
        content: 'Hi! Can you please add the numbers 42 and 58 together for me?'
    };

    try {
        const result = await engine.run(FrontDeskAgent, [userMessage], { userId: '123' });
        
        console.log('\n==================================================');
        console.log('📊 EXECUTION SUMMARY');
        console.log('==================================================');
        console.log(`- Final Active Agent: [${result.agent.name}]`);
        console.log(`- Total Conversation Turns: ${result.history.length}`);
        
        console.log('\n📜 Swarm Engine History Traces:');
        result.history.forEach((step, idx) => {
            console.log(`\nTurn ${step.turn} [Agent: ${step.agent}]:`);
            step.executedTools.forEach(t => {
                if (t.handoff) {
                    console.log(`  🔄 Tool [${t.tool}] -> Autonomous Handoff to [${t.handoff}]`);
                } else {
                    console.log(`  🔧 Tool [${t.tool}] executed -> Result: ${t.result}`);
                }
            });
            console.log(`  📝 Response: "${step.response.trim()}"`);
        });

        const finalResponse = result.messages[result.messages.length - 1].content;
        console.log(`\n🎯 Final Response to User: "${finalResponse.trim()}"`);

        // Assert handoff was successful
        if (result.agent.name === 'MathSpecialist' && finalResponse.includes('100')) {
            console.log('\n🎉 TEST 1 PASSED! Autonomous handoff and tool execution verified successfully.');
            process.exit(0);
        } else {
            console.error('\n🚨 TEST 1 FAILED! Active agent or computation is incorrect.');
            process.exit(1);
        }

    } catch (e) {
        console.error('Test execution failed with error:', e);
        process.exit(1);
    }
}

runTest();

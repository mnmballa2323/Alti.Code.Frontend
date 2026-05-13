
import { agentConfigSchema, taskSchema } from './src/shared/schemas.js';
import { z } from 'zod';

async function runTest() {
    console.log('🛡️ Testing Zod Schemas...');

    // 1. Test Valid Agent Config
    console.log('Step 1: Validating valid Agent Config...');
    try {
        const validAgent = {
            name: 'RefactorBot',
            role: 'engineer',
            capabilities: ['code-mod', 'git'],
            settings: { verbose: true }
        };
        const parsed = agentConfigSchema.parse(validAgent);
        console.log('✅ Valid Agent passed:', parsed.name);
    } catch (error) {
        console.error('❌ Integration Error: Valid agent failed validation', error.errors);
        process.exit(1);
    }

    // 2. Test Invalid Agent Config
    console.log('Step 2: Validating invalid Agent Config...');
    try {
        const invalidAgent = {
            name: '', // Empty name (should fail)
            role: 'clown', // Invalid enum
        };
        agentConfigSchema.parse(invalidAgent);
        console.error('❌ Integration Error: Invalid agent PASSED validation (Unexpected)');
        process.exit(1);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('✅ Invalid Agent correctly failed validation:', error.issues.length, 'issues');
        } else {
            console.error('❌ Unexpected error type:', error);
            process.exit(1);
        }
    }

    // 3. Test Task Schema
    console.log('Step 3: Validating Task Schema...');
    try {
        const task = {
            type: 'analyze',
            payload: { file: 'index.js' }
        };
        const parsedTask = taskSchema.parse(task);
        console.log('✅ Valid Task passed with defaults. Status:', parsedTask.status);
    } catch (error) {
        console.error('❌ Task validation failed', error);
        process.exit(1);
    }

    console.log('🎉 Zod verification Passed');
}

runTest().catch(console.error);

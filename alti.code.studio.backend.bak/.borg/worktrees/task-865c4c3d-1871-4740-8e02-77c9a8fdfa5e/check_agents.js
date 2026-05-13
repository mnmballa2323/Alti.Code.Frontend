
import { architectAgent } from './src/app/modules/agents/architect.agent.js';
import { devOpsAgent } from './src/app/modules/agents/devops.agent.js';
import { VectorMemory } from './src/app/shared/memory.js';

async function checkAgents() {
    console.log('🕵️ Check Agents...');

    // Mock Memory for Architect
    VectorMemory.search = async () => [{ content: "Auth is handled by Passport.js in auth.service.js", metadata: {} }];

    try {
        // 1. Architect
        console.log('🏛️ Asking Architect...');
        const archResult = await architectAgent.explainSystem('Authentication');
        console.log('Architect Answer:', archResult.answer);

        // 2. DevOps
        console.log('🏗️ Asking DevOps...');
        const devOpsResult = await devOpsAgent.checkHealth();
        console.log('DevOps Status:', devOpsResult.status);

        console.log('✅ Agents Verification Successful');

    } catch (e) {
        console.error('❌ Agents Failed', e);
        process.exit(1);
    }
}

checkAgents();

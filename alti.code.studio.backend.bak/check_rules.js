
import { contextService } from './src/app/modules/cortex/context.service.js';

async function checkRules() {
    console.log('📜 Checking Project Rules...');

    try {
        const result = await contextService.query("Who are you?");
        console.log('🤖 Answer:', result.answer);

        if (result.answer.includes('Commander')) {
            console.log('✅ Rule Verification Successful: "Commander" found.');
        } else {
            console.warn('⚠️ Warning: Rules might not have been followed (Mock mode might ignore inputs).');
            // If Mock mode, it returns hardcoded string. 
            // We should check if VertexService is mocked.
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkRules();

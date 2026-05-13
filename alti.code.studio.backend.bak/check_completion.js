
import { completionTool } from './src/app/modules/mcp/tools/completion.tool.js';

async function checkCompletion() {
    console.log('👻 Checking Ghost Text...');

    try {
        const result = await completionTool.handler({ prefix: 'function' });
        console.log('✨ Suggestion:', result.content[0].text);

        if (result.content[0].text.includes('myNewFunction')) {
            console.log('✅ Ghost Text Verified (Mock Logic Active).');
        } else {
            console.warn('⚠️ Unexpected suggestion:', result.content[0].text);
        }

    } catch (error) {
        console.error('❌ Check Failed:', error);
        process.exit(1);
    }
}

checkCompletion();

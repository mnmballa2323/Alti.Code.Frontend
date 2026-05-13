
import { deployTool } from './src/app/modules/mcp/tools/deploy.tool.js';

async function checkDeploy() {
    console.log('🚀 Checking Deployment Agent...');

    // We expect this to fail without real Auth, but we want to see it try.
    // Specifying "vercel" to trigger npx vercel code path.
    const result = await deployTool.handler({ provider: 'vercel' });

    console.log('📊 Result Type:', result.isError ? 'Error (Expected)' : 'Success');
    if (result.content && result.content[0]) {
        console.log('📝 Output Snippet:', result.content[0].text.substring(0, 300));

        // Validation: Did we attempt to run Vercel?
        if (result.content[0].text.includes('vercel') || result.content[0].text.includes('code')) {
            console.log('✅ Deployment Agent attempted to run Vercel CLI.');
        } else {
            console.log('⚠️ Unexpected output, check logs.');
        }
    }
}

checkDeploy();

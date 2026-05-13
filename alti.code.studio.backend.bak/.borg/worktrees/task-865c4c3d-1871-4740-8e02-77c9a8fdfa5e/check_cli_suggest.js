
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

async function checkCli() {
    console.log('💻 Checking CLI Assistant...');

    try {
        // Test Suggest
        console.log('Testing "suggest"...');
        const { stdout: suggestOut } = await execAsync('node bin/acs.js suggest "list all files in current directory"');
        console.log('Output:', suggestOut.trim());

        // Test Explain
        console.log('Testing "explain"...');
        const { stdout: explainOut } = await execAsync('node bin/acs.js explain "Get-ChildItem -Recurse"');
        console.log('Output:', explainOut.trim());

        console.log('✅ CLI Verification Completed.');

    } catch (error) {
        console.error('❌ CLI Verification Failed:', error);
        process.exit(1);
    }
}

checkCli();

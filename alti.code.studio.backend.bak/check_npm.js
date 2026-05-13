import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

(async () => {
    try {
        const { stdout } = await execAsync('npm --version');
        console.log('✅ NPM Available. Version:', stdout.trim());
    } catch (e) {
        console.error('❌ NPM not found or failed:', e.message);
        process.exit(1);
    }
})();

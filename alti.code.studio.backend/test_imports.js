
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

async function testImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            await testImports(filePath);
        } else if (file.endsWith('.js')) {
            try {
                // Skip server.js or entry points that start logic
                if (file === 'server.js' || file === 'app.js' || file.includes('check_')) return;

                await import(pathToFileURL(filePath));
                // console.log(`✅ Loaded: ${file}`);
            } catch (error) {
                const msg = `❌ FAILED to load ${filePath}\n${error.stack || error}\n`;
                console.error(msg);
                fs.writeFileSync('import_error.log', msg);
                process.exit(1);
            }
        }
    }
}

console.log('--- Testing Imports ---');
testImports(srcDir).then(() => console.log('--- Done ---')).catch(e => console.error(e));

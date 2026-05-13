import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');

function refactorImports(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            refactorImports(fullPath);
        } else if (file.endsWith('.agent.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            let modified = false;

            // Fix the incorrect services/gemini.ai.service.js back to modules/gemini/gemini.service.js
            const geminiImportOld = /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/gemini\.ai\.service\.js['"]/g;
            if (geminiImportOld.test(content)) {
                modified = true;
                content = content.replace(geminiImportOld, "from '../../gemini/gemini.service.js'");
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed Imports: ${file}`);
            }
        }
    }
}

refactorImports(agentsDir);

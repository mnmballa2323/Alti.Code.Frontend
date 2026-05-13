import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');

function escapeDoubleBraceTemplateLiterals(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            escapeDoubleBraceTemplateLiterals(fullPath);
        } else if (file.endsWith('.agent.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Target ONLY unescaped ${{ 
            // We use negative lookbehind to ensure we don't escape already escaped items
            const pattern = /(?<!\\)\$\{\{/g;

            if (pattern.test(content)) {
                content = content.replace(pattern, '\\${{');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Safely escaped \${{ in: ${file}`);
            }
        }
    }
}

escapeDoubleBraceTemplateLiterals(agentsDir);

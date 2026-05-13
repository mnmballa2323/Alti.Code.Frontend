import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');

function escapeTemplateLiterals(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            escapeTemplateLiterals(fullPath);
        } else if (file.endsWith('.agent.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // This regex specifically targets ${ inside the preamble backticks
            // We use a simple replace because these string literals are huge and we don't want to parse ASTs manually.
            // We only want to escape raw `$` signs followed by `{`

            // To do this safely, we find the preamble block:
            const preambleRegex = /(this\.preamble\s*=\s*`)([\s\S]*?)(`;)/;
            const match = content.match(preambleRegex);

            if (match) {
                const prefix = match[1];
                let body = match[2];
                const suffix = match[3];

                // If body contains unescaped ${
                if (body.includes('${') && !body.includes('\\${')) {
                    // Escape all ${ to \${
                    const newBody = body.replace(/\$\{/g, '\\${');

                    if (newBody !== body) {
                        content = content.replace(preambleRegex, `${prefix}${newBody}${suffix}`);
                        modified = true;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Escaped \${} in: ${file}`);
            }
        }
    }
}

escapeTemplateLiterals(agentsDir);

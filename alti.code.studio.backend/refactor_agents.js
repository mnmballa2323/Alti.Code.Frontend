import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');

function refactorAgentFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            refactorAgentFiles(fullPath);
        } else if (file.endsWith('.agent.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Find pattern: export const agentName = new BaseSpecialistAgent({ ... });
            // This regex specifically looks for the object parameter to BaseSpecialistAgent
            const pattern = /export\s+const\s+(\w+)\s*=\s*new\s+BaseSpecialistAgent\(\{\s*name:\s*'([^']+)',\s*preamble:\s*`([\s\S]*?)`\s*\}\);/g;

            let modified = false;
            content = content.replace(pattern, (match, instanceName, agentName, preamble) => {
                modified = true;
                const className = instanceName.charAt(0).toUpperCase() + instanceName.slice(1);

                // Keep the exact same class formatting as the ones we did by hand.
                return `class ${className} extends BaseSpecialistAgent {\n    constructor() {\n        super('${agentName}', '${agentName.replace(/([A-Z])/g, ' $1').trim()}', 'Tier 10+');\n        this.preamble = \`${preamble}\`;\n    }\n}\n\nexport const ${instanceName} = new ${className}();`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Refactored: ${file}`);
            }
        }
    }
}

refactorAgentFiles(agentsDir);

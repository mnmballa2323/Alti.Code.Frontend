const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js'));

let fixedCount = 0;
for (const file of files) {
    const fullPath = path.join(agentsDir, file);
    let content = fs.readFileSync(fullPath, 'utf-8');

    // Find the class name: export class FooAgent extends...
    const match = content.match(/export\s+class\s+([a-zA-Z0-9_]+)\s+extends/);
    if (match) {
        const className = match[1];

        let instanceName = className.charAt(0).toLowerCase() + className.slice(1);

        // Some special routing matching logic
        if (file.includes('agent.fintech.brex.js')) instanceName = 'brexAgent';

        const exportStr = `export const ${instanceName} = new ${className}();`;

        // Check if export exists
        if (!content.includes(`export const ${instanceName}`)) {
            content += `\n\n${exportStr}\n`;
            fs.writeFileSync(fullPath, content);
            fixedCount++;
            console.log(`Fixed ${file}: added ${exportStr}`);
        }
    }
}
console.log(`\nFixed ${fixedCount} agent files by adding missing instantiated exports.`);

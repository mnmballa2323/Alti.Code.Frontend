import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

function fixImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('../../../../../config')) {
                content = content.replace(/..\/..\/..\/..\/..\/config/g, '../../../../config');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed 5-level config import in: ${fullPath}`);
            }
        }
    }
}

fixImports(srcDir);
console.log('Done fixing deep imports.');

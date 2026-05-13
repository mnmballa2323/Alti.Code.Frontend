import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LICENSE_HEADER = `/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

`;

function addLicenseHeader(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                addLicenseHeader(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('Copyright (c) 2024 Alti.Code.Studio')) {
                // Handle shebang
                if (content.startsWith('#!')) {
                    const lines = content.split('\n');
                    const shebang = lines[0];
                    const rest = lines.slice(1).join('\n');
                    content = `${shebang}\n${LICENSE_HEADER}${rest}`;
                } else {
                    content = LICENSE_HEADER + content;
                }
                fs.writeFileSync(fullPath, content);
                console.log(`Added license to ${file}`);
            }
        }
    }
}

// Start from backend src
const srcDir = path.resolve(__dirname, '../src');
console.log(`Adding license headers to ${srcDir}...`);
addLicenseHeader(srcDir);

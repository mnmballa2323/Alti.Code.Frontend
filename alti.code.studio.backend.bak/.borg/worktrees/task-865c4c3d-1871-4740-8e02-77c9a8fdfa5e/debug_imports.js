
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

const expectedPath = path.resolve(srcDir, 'errors/ApiError.js').toLowerCase();

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.js')) {
            checkFile(filePath);
        }
    }
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('ApiError.js')) {
            // Extract path
            const match = line.match(/from\s+['"](.+)['"]/);
            if (match) {
                const importPath = match[1];
                const resolved = path.resolve(path.dirname(filePath), importPath).toLowerCase();

                if (resolved !== expectedPath) {
                    console.log(`❌ BROKEN IMPORT in ${filePath}:${index + 1}`);
                    console.log(`   Import: ${importPath}`);
                    console.log(`   Resolved: ${resolved}`);
                    console.log(`   Expected: ${expectedPath}`);
                } else {
                    // console.log(`✅ OK: ${filePath}`);
                }
            }
        }
    });
}

console.log('--- Scanning for broken ApiError imports ---');
walk(srcDir);
console.log('--- Scan Complete ---');

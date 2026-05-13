import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.mjs')) {
            callback(path.join(dir, f));
        }
    });
}

const dir = '.';
walkDir(dir, function (filePath) {
    if (filePath.includes('config.ts')) return;
    if (filePath.includes('fix.mjs')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Process.env fallbacks first
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*(?:\|\||\?\?)\s*["']http:\/\/localhost:5000\/api\/v1["']/g, 'API_URL');
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*(?:\|\||\?\?)\s*["']http:\/\/localhost:5000["']/g, 'SOCKET_URL');

    // Hardcoded partials
    content = content.replace(/["']http:\/\/localhost:5000\/api\/v1([^"']*)["']/g, (match, suffix) => {
        return `\`\${API_URL}${suffix}\``;
    });
    content = content.replace(/["']http:\/\/localhost:5000([^"']*)["']/g, (match, suffix) => {
        return `\`\${SOCKET_URL}${suffix}\``;
    });

    if (content !== original) {
        if (!content.includes('import { API_URL') && !content.includes('import { SOCKET_URL')) {
            let importStatement = 'import { API_URL, SOCKET_URL } from "@/lib/config";\n';
            if (content.includes('"use client";')) {
                content = content.replace('"use client";', '"use client";\n' + importStatement);
            } else if (content.includes("'use client';")) {
                content = content.replace("'use client';", "'use client';\n" + importStatement);
            } else {
                content = importStatement + content;
            }
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
});

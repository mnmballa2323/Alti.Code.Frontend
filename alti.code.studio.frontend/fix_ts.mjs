import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath, callback);
        } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
            callback(dirPath);
        }
    });
}

const dir = '.';
walkDir(dir, function (filePath) {
    if (filePath.includes('config.ts')) return;
    if (filePath.includes('fix.mjs') || filePath.includes('fix_ts.mjs')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove the circular assignments
    content = content.replace(/const\s+API_URL\s*=\s*API_URL\s*;/g, '');
    content = content.replace(/const\s+SOCKET_URL\s*=\s*SOCKET_URL\s*;/g, '');

    // Also remove `let API_URL = API_URL` if they exist
    content = content.replace(/let\s+API_URL\s*=\s*API_URL\s*;/g, '');
    content = content.replace(/let\s+SOCKET_URL\s*=\s*SOCKET_URL\s*;/g, '');

    // Or maybe there is a newline or something? Let's use multi-line generic regex
    content = content.replace(/^\s*(const|let|var)\s+API_URL\s*=\s*API_URL\s*;?\s*$/gm, '');
    content = content.replace(/^\s*(const|let|var)\s+SOCKET_URL\s*=\s*SOCKET_URL\s*;?\s*$/gm, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Repaired TS conflict in:', filePath);
    }
});

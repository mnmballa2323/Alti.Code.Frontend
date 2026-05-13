const fs = require('fs');
const path = require('path');

function resolveFile(filepath) {
    let content;
    try {
        content = fs.readFileSync(filepath, 'utf8');
    } catch(e) { return false; }
    
    if (!content.includes('<<<<<<< HEAD')) return false;
    
    let lines = content.split('\n');
    let newLines = [];
    let inHead = false;
    let inIncoming = false;
    
    for (let line of lines) {
        if (line.startsWith('<<<<<<< HEAD')) {
            inHead = true;
        } else if (line.startsWith('=======')) {
            inHead = false;
            inIncoming = true;
        } else if (line.startsWith('>>>>>>>')) {
            inIncoming = false;
        } else {
            if (!inHead) newLines.push(line);
        }
    }
    
    fs.writeFileSync(filepath, newLines.join('\n'));
    return true;
}

let count = 0;
function walkDir(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch(e) { return; }
    
    for (let file of files) {
        let fullPath = path.join(dir, file);
        if (file === 'node_modules' || file === '.git' || file === '.shadow' || file === 'cloud_sovereign_repos') continue;
        
        let stat;
        try {
            stat = fs.lstatSync(fullPath); 
        } catch(e) { continue; }
        
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.json'))) {
            if (resolveFile(fullPath)) {
                console.log('Resolved:', fullPath);
                count++;
            }
        }
    }
}

walkDir('./alti.code.studio.backend/src');
walkDir('./alti.code.studio.backend/scripts');
console.log('Total resolved:', count);

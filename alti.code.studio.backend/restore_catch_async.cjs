const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let count = 0;
for (const f of files) {
    let content = fs.readFileSync(f, 'utf-8');
    if (content.includes('import { catchAsync } from ;')) {
        const relPath = path.relative(path.dirname(f), 'src/shared/catchAsync.js').replace(/\\/g, '/');
        const importPath = relPath.startsWith('.') ? relPath : './' + relPath;
        content = content.replace('import { catchAsync } from ;', `import { catchAsync } from '${importPath}';`);
        fs.writeFileSync(f, content);
        count++;
    }
}
console.log(`Restored catchAsync imports in ${count} files!`);

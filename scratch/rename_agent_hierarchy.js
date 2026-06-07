const fs = require('fs');
const path = require('path');

const targetDir = '/Users/michaelmeram/workspace/alti.code.studio/.agent/hierarchy';

const replacements = [
  { search: /Alti Code Studio/gi, replace: 'Inso Code' },
  { search: /Alti\.Code\.Studio/gi, replace: 'Inso Code' },
  { search: /Alti Code/gi, replace: 'Inso Code' },
  { search: /Alti/gi, replace: 'Inso' }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.md' || ext === '.json' || ext === '.txt' || ext === '.yaml' || ext === '.yml') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

console.log('Scanning agent hierarchy directory...');
const files = walk(targetDir);
console.log(`Found ${files.length} files to scan.`);

let modifiedCount = 0;
files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
});

console.log(`Done! Modified ${modifiedCount} files.`);

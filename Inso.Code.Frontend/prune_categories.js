const fs = require('fs');
const path = require('path');

// Read frontend teamData.ts
const teamDataPath = path.join(__dirname, 'app', 'team', 'teamData.ts');
const content = fs.readFileSync(teamDataPath, 'utf8');

const prefix = content.substring(0, content.indexOf('export const teamMembers'));
const arrayStart = content.indexOf('[', content.indexOf('=', content.indexOf('export const teamMembers')));

let objects = [];
let depth = 0;
let currentObjectStart = -1;

for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === '{') {
    if (depth === 0) currentObjectStart = i;
    depth++;
  } else if (content[i] === '}') {
    depth--;
    if (depth === 0 && currentObjectStart !== -1) {
      objects.push(content.substring(currentObjectStart, i + 1));
    }
  }
}

// Keep ONLY category: "Language" or category: "Cloud"
const filteredObjects = objects.filter(obj => obj.includes('category: "Language"') || obj.includes('category: "Cloud"'));

const finalArray = filteredObjects.join(',\n  ');

const newContent = content.substring(0, arrayStart + 1) + '\n  ' + finalArray + '\n];\n';

fs.writeFileSync(teamDataPath, newContent, 'utf8');
console.log(`Pruned categories! Kept exactly ${filteredObjects.length} core specialists (Languages & Clouds). Removed the rest.`);

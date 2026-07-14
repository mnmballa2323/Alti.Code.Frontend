const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

let ids = [];
let regex = /id:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  ids.push(match[1]);
}

const counts = {};
ids.forEach(id => counts[id] = (counts[id] || 0) + 1);

let duplicateIds = [];
for (const [id, count] of Object.entries(counts)) {
  if (count > 1) {
    duplicateIds.push(id);
    console.log(`Duplicate: ${id} (${count} times)`);
  }
}
console.log("Total duplicates found:", duplicateIds.length);

const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// Match all id: "..." for type: "language"
// This regex will capture id and type if they are close
let ids = [];
let regex = /id:\s*"([^"]+)"[\s\S]*?type:\s*"language"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  ids.push(match[1]);
}

console.log("Found", ids.length, "IDs for languages.");
const uniqueIds = new Set(ids);
console.log("Unique IDs:", uniqueIds.size);
if (ids.length !== uniqueIds.size) {
  const counts = {};
  ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
  for (const [id, count] of Object.entries(counts)) {
    if (count > 1) console.log("Duplicate:", id);
  }
}

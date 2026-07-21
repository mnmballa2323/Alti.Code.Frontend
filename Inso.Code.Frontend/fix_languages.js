const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// Match blocks like:
// {
//   id: "...",
//   name: "...",
//   ...
//   type: "...",
//   ...
// }

let match;
const regex = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[\s\S]*?type:\s*"([^"]+)"/g;

const items = [];
while ((match = regex.exec(content)) !== null) {
  items.push({ id: match[1], name: match[2], type: match[3], index: match.index });
}

console.log("Current languages:");
items.filter(i => i.type === 'language').forEach(i => console.log(i.id, i.name));

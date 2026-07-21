const fs = require('fs');
const content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const regex = /name:\s*"([^"]+) Specialist AI"[\s\S]*?icon:\s*"lucide:puzzle"/g;
let match;
let puzzles = [];
while ((match = regex.exec(content)) !== null) {
  puzzles.push(match[1]);
}
console.log(puzzles.join(', '));

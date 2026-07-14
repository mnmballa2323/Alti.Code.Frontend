const fs = require('fs');
const content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const regex = /name:\s*"([^"]+ Specialist AI)"[\s\S]*?type:\s*"integration"/g;
let match;
let integrations = [];
while ((match = regex.exec(content)) !== null) {
  integrations.push(match[1].replace(' Specialist AI', ''));
}
console.log(integrations.join(', '));

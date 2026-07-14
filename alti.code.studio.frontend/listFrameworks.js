const fs = require('fs');
const content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const regex = /name:\s*"([^"]+ Specialist AI)"[\s\S]*?type:\s*"framework"/g;
let match;
let frameworks = [];
while ((match = regex.exec(content)) !== null) {
  frameworks.push(match[1].replace(' Specialist AI', ''));
}
console.log(frameworks.join(', '));

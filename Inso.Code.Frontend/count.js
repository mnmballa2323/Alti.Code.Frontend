const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// Match all type: "language"
const matches = content.match(/type:\s*"language"/g);
console.log("Regex matches for type: 'language':", matches ? matches.length : 0);

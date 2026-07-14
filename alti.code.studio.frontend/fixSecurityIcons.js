const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

content = content.replace('icon: "solar:shield-bold-duotone"', 'icon: "mdi:shield-check"');
content = content.replace('icon: "solar:hacker-bold-duotone"', 'icon: "mdi:incognito"');

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Updated security icons");

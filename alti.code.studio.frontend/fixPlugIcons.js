const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// Replace ClickUp
content = content.replace(/name:\s*"ClickUp Specialist AI"[\s\S]*?icon:\s*"[^"]+"/g, match => match.replace(/icon:\s*"[^"]+"/, 'icon: "simple-icons:clickup"'));

// Replace CockroachDB
content = content.replace(/name:\s*"CockroachDB Specialist AI"[\s\S]*?icon:\s*"[^"]+"/g, match => match.replace(/icon:\s*"[^"]+"/, 'icon: "simple-icons:cockroachlabs"'));

// Replace Clerk
content = content.replace(/name:\s*"Clerk Specialist AI"[\s\S]*?icon:\s*"[^"]+"/g, match => match.replace(/icon:\s*"[^"]+"/, 'icon: "simple-icons:clerk"'));

// Replace Chrome DevTools
content = content.replace(/name:\s*"Chrome DevTools Specialist AI"[\s\S]*?icon:\s*"[^"]+"/g, match => match.replace(/icon:\s*"[^"]+"/, 'icon: "logos:chrome"'));

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed ClickUp, Cockroach, Clerk, Chrome");

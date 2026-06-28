const fs = require('fs');
const filePath = '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/server.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = "process.exit(1);";
const replacement = "console.log('Skipping exit for Postgres failure.');";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Removed exit from server.js");
} else {
    console.log("Exit not found in server.js");
}

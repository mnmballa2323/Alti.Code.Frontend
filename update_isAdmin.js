const fs = require('fs');
const filePath = '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/auth/auth.service.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = "const isAdmin = email === 'admin@insocode.com';";
const replacement = "const isAdmin = email?.trim().toLowerCase() === 'admin@insocode.com';";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated auth.service.js");
} else {
    console.log("Target not found!");
}

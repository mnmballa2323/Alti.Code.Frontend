const fs = require('fs');
const filePath = '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/auth/auth.service.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = "if (\n    (email === 'admin@insocode.com' || email === 'owner@insocode.com') &&\n    password === 'ShelbyTownship#1'\n  )";
const replacement = "if (\n    (email?.trim().toLowerCase() === 'admin@insocode.com' || email?.trim().toLowerCase() === 'owner@insocode.com') &&\n    password === 'ShelbyTownship#1'\n  )";

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated auth.service.js");
} else {
    console.log("Target not found!");
}

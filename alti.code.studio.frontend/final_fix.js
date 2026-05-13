const fs = require('fs');

const path = 'components/agents/MissionControl.tsx';
let data = fs.readFileSync(path, 'utf8');

let lines = data.split('\n');
let newLines = lines.filter(line => {
    // Exact strip of the lines that injected circular assignments or duplicates
    if (line.includes('const API_URL =')) return false;
    if (line.includes('API_URL;')) return false;
    if (line.includes('const SOCKET_URL = API_URL.replace("/api/v1", "");')) return false;
    return true;
});

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log("MissionControl cleanly scrubbed!");

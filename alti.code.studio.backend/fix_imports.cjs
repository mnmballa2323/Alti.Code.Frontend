const fs = require('fs');
const files = [
    'crypto.zk.agent.js',
    'crypto.pqc.agent.js',
    'distributed.consensus.agent.js',
    'distributed.networking.agent.js',
    'database.storage.agent.js',
    'database.query.agent.js',
    'edge.tinyml.agent.js'
];
const dir = 'src/app/modules/agents/domain/';

for (const file of files) {
    const path = dir + file;
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace("from './base_specialist.agent.js';", "from '../base_specialist.agent.js';");
        fs.writeFileSync(path, content, 'utf8');
    }
}
console.log("Fixes applied.");

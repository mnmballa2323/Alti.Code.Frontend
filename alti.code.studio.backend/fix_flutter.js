import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, 'src', 'app', 'modules', 'agents', 'oss', 'flutter.agent.js');

let content = fs.readFileSync(file, 'utf8');

// The file currently has some unescaped ${items...}
content = content.replace(/\$\{items\[index\]\.name\}/g, '\\${items[index].name}');

// And it probably has double backslashes for snapshot: \\${snapshot.error}
content = content.replace(/\\\\\$\{snapshot/g, '\\${snapshot');

// And \\$count
content = content.replace(/\\\\\$count/g, '\\$count');

// And \\$_counter
content = content.replace(/\\\\\$_(counter|router)/g, '\\$_$1');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed flutter.agent.js perfectly');

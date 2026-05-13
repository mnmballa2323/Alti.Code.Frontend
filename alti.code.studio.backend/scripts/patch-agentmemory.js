import fs from 'fs';
import path from 'path';

const INDEX_MJS = path.join(process.cwd(), 'node_modules', '@agentmemory', 'agentmemory', 'dist', 'index.mjs');
const SRC_MJS = path.join(process.cwd(), 'node_modules', '@agentmemory', 'agentmemory', 'dist', 'src-xYHSzz5S.mjs');

function patchViewer(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`[Patch] Skip: ${filePath} not found`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('const viewerServer = startViewerServer(config.restPort + 2, kv, sdk, secret, config.restPort);')) {
        content = content.replace(
            'const viewerServer = startViewerServer(config.restPort + 2, kv, sdk, secret, config.restPort);',
            'const viewerServer = { close: (cb) => cb() };'
        );
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[Patch] Disabled local viewer in ${path.basename(filePath)}`);
    } else {
        console.log(`[Patch] Viewer already disabled in ${path.basename(filePath)}`);
    }
}

console.log('[Patch] Enforcing backend-only AgentMemory execution...');
patchViewer(INDEX_MJS);
patchViewer(SRC_MJS);

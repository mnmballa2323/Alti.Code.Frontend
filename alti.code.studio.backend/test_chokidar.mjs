import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';

const workspaceTarget = '/Users/michaelmeram/workspace/alti.code.studio';
console.log('Testing chokidar dynamic subdirs under:', workspaceTarget);

const heavyDirs = [
    'node_modules',
    'dist',
    '.next',
    '.git',
    '.agent',
    '.codegraph',
    '.skills',
    '.shadow',
    'logs'
];

// List all subdirectories under workspace root, filtering out heavy ones
const workspaceSubdirs = fs.readdirSync(workspaceTarget, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !heavyDirs.includes(name) && !name.startsWith('.'))
    .map(name => path.join(workspaceTarget, name));

// Also watch top-level files in the workspaceTarget directly (non-recursively) by watching workspaceTarget with depth 0
console.log('Watching subdirs:', workspaceSubdirs);

const watcher = chokidar.watch([workspaceTarget, ...workspaceSubdirs], {
    ignored: (filePath) => {
        // If filePath is inside any heavy directory, ignore it
        const basename = path.basename(filePath);
        if (basename.startsWith('.') && basename !== '.' && basename !== '..') {
            return true;
        }
        const parts = filePath.split(path.sep);
        return parts.some(part => heavyDirs.includes(part));
    },
    depth: 99, // default recursion depth
    persistent: false,
    ignoreInitial: false
});

let watchedCount = 0;
watcher.on('add', (filePath) => {
    watchedCount++;
    if (watchedCount < 10) {
        console.log('WATCHED ADD:', filePath);
    }
});

watcher.on('ready', () => {
    console.log('READY! Total paths watched:', watchedCount);
    watcher.close();
});

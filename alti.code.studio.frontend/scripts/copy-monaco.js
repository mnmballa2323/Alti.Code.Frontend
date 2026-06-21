const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/monaco-editor/min/vs');
const destDir = path.join(__dirname, '../public/monaco/min/vs');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

try {
  copyFolderSync(srcDir, destDir);
  console.log('✅ Monaco editor copied to public/monaco/min/vs');
} catch (err) {
  console.error('❌ Failed to copy Monaco editor:', err);
}

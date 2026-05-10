const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.frontend/**/*.tsx', { ignore: '**/node_modules/**' });
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<SelectItem') && content.includes('value=')) {
    // replace <SelectItem key="X" value="Y"> with <SelectItem key="X">
    let newContent = content.replace(/(<SelectItem\s+[^>]*?)value=(["'][^"']*["'])([^>]*>)/g, (match, p1, p2, p3) => {
        // Only remove value if key is present
        if (p1.includes('key=') || p3.includes('key=')) {
            return p1 + p3;
        }
        return match;
    });
    // clean up double spaces that might result from removal
    newContent = newContent.replace(/  +/g, ' ');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Fixed:', file);
    }
  }
}

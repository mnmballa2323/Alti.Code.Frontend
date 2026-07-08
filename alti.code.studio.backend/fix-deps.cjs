const fs = require('fs');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const [name, version] of Object.entries(pkg.dependencies)) {
  if (name.startsWith('@google-cloud/')) {
    const v = version.replace('^', '');
    try {
      const output = execSync(`npm view ${name} versions --json`).toString();
      const versions = JSON.parse(output);
      if (!versions.includes(v)) {
        console.log(`Fixing ${name} from ${v} to ${versions[versions.length - 1]}`);
        pkg.dependencies[name] = `^${versions[versions.length - 1]}`;
      }
    } catch(e) {
      console.log(`Error checking ${name}: ${e.message}`);
    }
  }
}
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Done!');

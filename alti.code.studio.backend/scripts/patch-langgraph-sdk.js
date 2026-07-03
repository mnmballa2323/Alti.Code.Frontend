import fs from 'fs';
import path from 'path';

const pnpmDir = path.resolve('node_modules/@langchain/langgraph-sdk/dist/node_modules/.pnpm');

if (fs.existsSync(pnpmDir)) {
  const packages = fs.readdirSync(pnpmDir);
  for (const pkg of packages) {
    const pkgPath = path.join(pnpmDir, pkg);
    if (fs.statSync(pkgPath).isDirectory()) {
      const nestedNodeModules = path.join(pkgPath, 'node_modules');
      if (fs.existsSync(nestedNodeModules)) {
        const nestedPkgs = fs.readdirSync(nestedNodeModules);
        for (const nestedPkg of nestedPkgs) {
          const targetDir = path.join(nestedNodeModules, nestedPkg);
          if (fs.statSync(targetDir).isDirectory()) {
            const packageJsonPath = path.join(targetDir, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
              fs.writeFileSync(packageJsonPath, JSON.stringify({ type: 'module' }, null, 2));
              console.log(`Patched: ${packageJsonPath}`);
            }
          }
        }
      }
    }
  }
}

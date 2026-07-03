import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gitRoot = path.resolve(__dirname, '../../.git');
let actualGitDir = gitRoot;

if (fs.existsSync(gitRoot)) {
  const stat = fs.statSync(gitRoot);
  if (stat.isFile()) {
    const content = fs.readFileSync(gitRoot, 'utf8').trim();
    if (content.startsWith('gitdir:')) {
      const relativeGitDir = content.substring(7).trim();
      const gitRootParent = path.dirname(gitRoot);
      actualGitDir = path.resolve(gitRootParent, relativeGitDir);
    }
  }
}

const sourceHook = path.resolve(__dirname, './git-hooks/pre-commit');
const destHook = path.resolve(actualGitDir, 'hooks/pre-commit');

async function main() {
  try {
    if (!fs.existsSync(actualGitDir)) {
      console.log('⚠️ [OpenWiki] .git directory not found. Skipping git hooks installation.');
      return;
    }

    if (!fs.existsSync(sourceHook)) {
      console.error(`❌ [OpenWiki] Source hook not found at ${sourceHook}`);
      process.exit(1);
    }

    // Ensure the hooks directory exists inside .git
    const hooksDir = path.resolve(actualGitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Read the source hook and write it to .git/hooks/pre-commit
    const hookContent = fs.readFileSync(sourceHook, 'utf8');
    fs.writeFileSync(destHook, hookContent, { mode: 0o755 });

    // Double check chmod permissions on Unix/Mac systems
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(destHook, '755');
      } catch (err) {
        console.warn('⚠️ [OpenWiki] Failed to chmod pre-commit hook directly. It may not be executable: ' + err.message);
      }
    }

    console.log('✅ [OpenWiki] Pre-commit Git hook successfully installed at ' + destHook);
  } catch (error) {
    console.error('❌ [OpenWiki] Failed to set up Git hooks:', error);
    process.exit(1);
  }
}

main();

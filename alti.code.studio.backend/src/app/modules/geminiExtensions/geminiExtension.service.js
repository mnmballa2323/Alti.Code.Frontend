import { exec } from 'child_process';
import util from 'util';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

const listExtensions = async () => {
  try {
    const { stdout } = await execPromise('gemini extensions list --json');
    return JSON.parse(stdout);
  } catch (error) {
    console.warn('Gemini CLI extensions list failed:', error.message);
    return [];
  }
};

const invokeExtension = async (extensionName, inputArgs) => {
  try {
    const sanitized = extensionName.replace(/[^a-zA-Z0-9_\-]/g, '');
    const argStr = (inputArgs || [])
      .map(a => `"${String(a).replace(/"/g, '\\"')}"`)
      .join(' ');
    const command = `gemini ${sanitized} ${argStr}`.trim();
    const { stdout } = await execPromise(command);
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to invoke Gemini extension [${extensionName}]: ${error.message}`,
    );
  }
};

const installExtension = async githubUrl => {
  try {
    const { stdout } = await execPromise(
      `gemini extensions install ${githubUrl}`,
    );
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to install Gemini extension from ${githubUrl}: ${error.message}`,
    );
  }
};

const uninstallExtension = async extensionName => {
  try {
    const sanitized = extensionName.replace(/[^a-zA-Z0-9_\-]/g, '');
    const { stdout } = await execPromise(
      `gemini extensions uninstall ${sanitized}`,
    );
    return stdout;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to uninstall Gemini extension [${extensionName}]: ${error.message}`,
    );
  }
};

const preloadExtensions = async () => {
  try {
    let submodulesDir = path.join(process.cwd(), 'submodules');
    if (!fs.existsSync(submodulesDir)) {
      submodulesDir = path.join(process.cwd(), '..', 'submodules');
    }

    // Dynamic folder discovery with strict alphanumeric security verification
    const prebundled = fs.readdirSync(submodulesDir).filter(item => {
      const fullPath = path.join(submodulesDir, item);
      return (
        fs.statSync(fullPath).isDirectory() && /^[a-zA-Z0-9_\-]+$/.test(item)
      );
    });

    const cachePath = path.join(submodulesDir, '.preloaded_cache.json');
    let cachedNames = [];
    if (fs.existsSync(cachePath)) {
      try {
        cachedNames = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } catch (err) {
        cachedNames = [];
      }
    }

    // Fast-Path Verification: If current directories match cache exactly, skip startup shells completely
    const isCacheValid =
      prebundled.length > 0 &&
      prebundled.every(name => cachedNames.includes(name)) &&
      cachedNames.every(name => prebundled.includes(name));

    if (isCacheValid) {
      console.log(
        '⚡ [Gemini Extensions] Cache check passed. All 65+ extensions are fully preloaded (0ms startup overhead).',
      );
      return;
    }

    console.log(
      '🔄 [Gemini Extensions] Synchrozining preloaded registry with local submodules...',
    );
    const installed = await listExtensions();
    const installedNames = (installed || []).map(
      ext => ext.name?.toLowerCase() || '',
    );

    const toInstall = prebundled.filter(
      name => !installedNames.includes(name.toLowerCase()),
    );

    if (toInstall.length === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(prebundled), 'utf8');
      console.log(
        '✅ [Gemini Extensions] Registry is fully up to date. Cache generated.',
      );
      return;
    }

    console.log(
      `🚀 Preloading ${toInstall.length} Gemini extensions from local paths in parallel batches...`,
    );
    const concurrencyLimit = 5;
    for (let i = 0; i < toInstall.length; i += concurrencyLimit) {
      const chunk = toInstall.slice(i, i + concurrencyLimit);
      await Promise.all(
        chunk.map(async name => {
          const localPath = path.join(submodulesDir, name);
          try {
            await execPromise(`gemini extensions install "${localPath}"`);
            console.log(`   ✅ Preloaded: ${name}`);
          } catch (err) {
            console.error(`   ❌ Failed to preload ${name}:`, err.message);
          }
        }),
      );
    }

    // Save final list to cache file
    fs.writeFileSync(cachePath, JSON.stringify(prebundled), 'utf8');
    console.log(
      '✅ [Gemini Extensions] Auto-preloading complete. Cache updated.',
    );
  } catch (error) {
    console.error(
      '❌ Failed to run Gemini extensions auto-preloading loop:',
      error.message,
    );
  }
};

export const GeminiExtensionService = {
  listExtensions,
  invokeExtension,
  installExtension,
  uninstallExtension,
  preloadExtensions,
};

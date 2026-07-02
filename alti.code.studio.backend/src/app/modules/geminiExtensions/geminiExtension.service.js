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

    // Dynamically list all directories in the submodules/ directory
    const prebundled = fs.readdirSync(submodulesDir).filter(item => {
      const fullPath = path.join(submodulesDir, item);
      return fs.statSync(fullPath).isDirectory();
    });

    const installed = await listExtensions();
    const installedNames = (installed || []).map(ext => ext.name?.toLowerCase() || '');

    for (const name of prebundled) {
      if (!installedNames.includes(name.toLowerCase())) {
        const localPath = path.join(submodulesDir, name);
        if (fs.existsSync(localPath)) {
          console.log(`🚀 Preloading Gemini extension: ${name} from ${localPath}`);
          try {
            await execPromise(`gemini extensions install "${localPath}"`);
            console.log(`✅ Successfully preloaded Gemini extension: ${name}`);
          } catch (err) {
            console.error(`❌ Failed to preload Gemini extension ${name}:`, err.message);
          }
        } else {
          console.warn(`⚠️ Submodule path for ${name} not found: ${localPath}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to run Gemini extensions auto-preloading loop:', error.message);
  }
};

export const GeminiExtensionService = {
  listExtensions,
  invokeExtension,
  installExtension,
  uninstallExtension,
  preloadExtensions,
};

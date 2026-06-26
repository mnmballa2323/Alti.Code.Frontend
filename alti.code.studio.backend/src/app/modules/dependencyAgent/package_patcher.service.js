import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class PackagePatcherService {
  constructor() {
    this.activePatches = new Map(); // Map of packageSpec -> { filePath, backupContent }
  }

  /**
   * Dynamically patches a file within node_modules.
   * @param {string} packageName - The module name (e.g. 'lodash')
   * @param {string} relativeFilePath - File path inside the package directory (e.g. 'index.js')
   * @param {string} patchedContent - The target replacement content
   * @param {string} rootDir - Root of the workspace project containing node_modules
   * @returns {boolean} True if patch successfully applied
   */
  applyPatch(packageName, relativeFilePath, patchedContent, rootDir = './') {
    const packageDir = path.join(rootDir, 'node_modules', packageName);
    const targetFile = path.join(packageDir, relativeFilePath);

    if (!fs.existsSync(packageDir)) {
      logger.error(
        `🩹 PackagePatcher: Package directory not found: ${packageDir}`,
      );
      return false;
    }

    if (!fs.existsSync(targetFile)) {
      logger.error(
        `🩹 PackagePatcher: Target file to patch not found: ${targetFile}`,
      );
      return false;
    }

    try {
      const originalContent = fs.readFileSync(targetFile, 'utf8');
      const patchKey = `${packageName}:${relativeFilePath}`;

      // Back up original file contents if not already patched
      if (!this.activePatches.has(patchKey)) {
        this.activePatches.set(patchKey, {
          filePath: targetFile,
          backupContent: originalContent,
        });
      }

      fs.writeFileSync(targetFile, patchedContent, 'utf8');
      logger.info(
        `🩹 PackagePatcher: Successfully applied dynamic hotfix patch to [${patchKey}]`,
      );
      return true;
    } catch (e) {
      logger.error(
        `🩹 PackagePatcher: Failed to apply patch to ${targetFile}`,
        e,
      );
      return false;
    }
  }

  /**
   * Rolls back an active dependency hotfix patch.
   * @param {string} packageName
   * @param {string} relativeFilePath
   * @returns {boolean} True if rollback succeeded
   */
  rollbackPatch(packageName, relativeFilePath) {
    const patchKey = `${packageName}:${relativeFilePath}`;
    const record = this.activePatches.get(patchKey);

    if (!record) {
      logger.warn(
        `🩹 PackagePatcher: No active patch registered for [${patchKey}]. Skipping rollback.`,
      );
      return false;
    }

    try {
      fs.writeFileSync(record.filePath, record.backupContent, 'utf8');
      this.activePatches.delete(patchKey);
      logger.info(
        `🩹 PackagePatcher: Successfully rolled back patch for [${patchKey}]`,
      );
      return true;
    } catch (e) {
      logger.error(
        `🩹 PackagePatcher: Failed to roll back patch for ${record.filePath}`,
        e,
      );
      return false;
    }
  }

  /**
   * Rolls back all applied hotfix patches in the workspace.
   */
  rollbackAll() {
    logger.info(
      '🩹 PackagePatcher: Reverting all applied dependency hotfixes.',
    );
    for (const [key, record] of this.activePatches.entries()) {
      const [packageName, relativeFilePath] = key.split(':');
      this.rollbackPatch(packageName, relativeFilePath);
    }
  }
}

export const packagePatcherService = new PackagePatcherService();

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { packagePatcherService } from './package_patcher.service.js';
import fs from 'fs';
import path from 'path';

describe('PackagePatcherService Tests', () => {
  const tempDir = path.resolve(
    './src/app/modules/dependencyAgent/temp_patch_test',
  );
  const mockPackageDir = path.join(tempDir, 'node_modules', 'mock-package');
  const mockFilePath = 'index.js';
  const targetFile = path.join(mockPackageDir, mockFilePath);

  beforeEach(() => {
    // Reset active patches
    packagePatcherService.activePatches.clear();

    // Create mock directories and files
    if (!fs.existsSync(mockPackageDir)) {
      fs.mkdirSync(mockPackageDir, { recursive: true });
    }
    fs.writeFileSync(
      targetFile,
      'module.exports = { value: "original" };',
      'utf8',
    );
  });

  afterEach(() => {
    // Rollback any leaks
    packagePatcherService.rollbackAll();

    // Delete mock directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should dynamically hotfix package files in node_modules and roll back cleanly', () => {
    const patchContent = 'module.exports = { value: "patched" };';

    // 1. Apply hotfix patch
    const applySuccess = packagePatcherService.applyPatch(
      'mock-package',
      mockFilePath,
      patchContent,
      tempDir,
    );
    expect(applySuccess).toBe(true);

    const currentContent = fs.readFileSync(targetFile, 'utf8');
    expect(currentContent).toBe(patchContent);

    const patchKey = `mock-package:${mockFilePath}`;
    expect(packagePatcherService.activePatches.has(patchKey)).toBe(true);

    // 2. Rollback hotfix patch
    const rollbackSuccess = packagePatcherService.rollbackPatch(
      'mock-package',
      mockFilePath,
    );
    expect(rollbackSuccess).toBe(true);

    const restoredContent = fs.readFileSync(targetFile, 'utf8');
    expect(restoredContent).toContain('original');
    expect(packagePatcherService.activePatches.has(patchKey)).toBe(false);
  });

  it('should fail gracefully if package or file does not exist', () => {
    const result = packagePatcherService.applyPatch(
      'non-existent',
      'index.js',
      'console.log()',
      tempDir,
    );
    expect(result).toBe(false);
  });
});

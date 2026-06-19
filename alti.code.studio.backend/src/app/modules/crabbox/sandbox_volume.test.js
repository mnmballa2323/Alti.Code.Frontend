import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sandboxVolumeService } from './sandbox_volume.service.js';
import fs from 'fs';
import path from 'path';

describe('SandboxVolumeService Tests', () => {
    const tempDir = path.resolve('./src/app/modules/crabbox/temp_volume_test');

    beforeEach(() => {
        sandboxVolumeService.resetSyncState();

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should scan workspace changes and selectively sync modified files only', async () => {
        const file1 = path.join(tempDir, 'file1.js');
        const file2 = path.join(tempDir, 'file2.js');

        fs.writeFileSync(file1, 'console.log("file1");', 'utf8');
        fs.writeFileSync(file2, 'console.log("file2");', 'utf8');

        // 1. Initial scan detects both files
        const initialChanges = sandboxVolumeService.scanWorkspaceChanges(tempDir);
        expect(initialChanges.length).toBe(2);
        expect(initialChanges).toContain(file1);
        expect(initialChanges).toContain(file2);

        // 2. Perform sync mock (fills cache)
        const mockExecutor = { copyFile: vi.fn().mockResolvedValue(true) };
        const syncedCount = await sandboxVolumeService.syncChanges(tempDir, mockExecutor);
        expect(syncedCount).toBe(2);
        expect(mockExecutor.copyFile).toHaveBeenCalledTimes(2);

        // 3. Second scan returns 0 changes
        const secondChanges = sandboxVolumeService.scanWorkspaceChanges(tempDir);
        expect(secondChanges.length).toBe(0);

        // 4. Edit file1 and verify it gets picked up
        // Wait slightly to guarantee mtimeMs timestamp difference
        await new Promise(resolve => setTimeout(resolve, 50));
        fs.writeFileSync(file1, 'console.log("file1 edited");', 'utf8');

        const editedChanges = sandboxVolumeService.scanWorkspaceChanges(tempDir);
        expect(editedChanges.length).toBe(1);
        expect(editedChanges[0]).toBe(file1);

        // 5. Reset cache forcing full sync again
        sandboxVolumeService.resetSyncState();
        const fullChanges = sandboxVolumeService.scanWorkspaceChanges(tempDir);
        expect(fullChanges.length).toBe(2);
    });
});

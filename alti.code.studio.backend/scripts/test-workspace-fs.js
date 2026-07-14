/**
 * Workspace File System Test Script
 * Verifies that the backend can write files directly to a workspace volume
 * bypassing Docker exec.
 */

import { workspaceFsService } from '../src/app/services/workspace.fs.service.js';
import { workspaceContainerService } from '../src/app/services/workspace.container.service.js';
import path from 'path';
import fs from 'fs/promises';

const WORKSPACE_ID = 'test-fs-workspace';
const MOCK_HOST_PATH = path.join(process.cwd(), '.tmp-workspaces', WORKSPACE_ID);

async function runTest() {
  console.log('🧪 Starting FS Service Test...');

  try {
    // 1. Setup mock directory
    await fs.mkdir(MOCK_HOST_PATH, { recursive: true });
    
    // 2. Initialize a mock workspace container in DB so the FS service can look up the hostPath
    console.log(`📦 Mocking container initialization for ${WORKSPACE_ID}...`);
    await workspaceContainerService.startWorkspaceContainer(WORKSPACE_ID, MOCK_HOST_PATH, 'node');

    // 3. Test File Write
    console.log('✍️ Testing writeFile()...');
    const testContent = 'console.log("Hello from direct FS sync!");\n';
    await workspaceFsService.writeFile(WORKSPACE_ID, 'src/index.js', testContent);

    // 4. Test File Read
    console.log('📖 Testing readFile()...');
    const readContent = await workspaceFsService.readFile(WORKSPACE_ID, 'src/index.js');
    if (readContent !== testContent) {
      throw new Error('Read content does not match written content!');
    }
    console.log('✅ File read verified.');

    // 5. Test Path Traversal Protection
    console.log('🛡️ Testing Path Traversal Protection...');
    try {
      await workspaceFsService.readFile(WORKSPACE_ID, '../../../../../etc/passwd');
      throw new Error('Path traversal was NOT blocked!');
    } catch (err) {
      if (err.message.includes('Path traversal detected')) {
        console.log('✅ Path traversal blocked successfully.');
      } else {
        throw err;
      }
    }

    console.log('🎉 All FS tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

runTest();

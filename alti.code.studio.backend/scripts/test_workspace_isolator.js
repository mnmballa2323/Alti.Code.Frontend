/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Multi-Agent Workspace Sandbox Isolator Integration Test Runner
 * Verifies dynamic directory creation, traversal blocks, and teardowns.
 */

import { WorkspaceIsolator } from '../src/app/modules/sandbox/workspace_isolator.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING MULTI-AGENT WORKSPACE SANDBOX TEST...');

    const isolator = new WorkspaceIsolator('./logs/test_workspaces');

    // 1. Provision Workspace
    console.log('\n🏃 Test 1: Provisioning isolated workspace directory...');
    const ws = isolator.provision();
    assert.ok(ws.id, 'Workspace should have a unique ID');
    assert.ok(existsSync(ws.path), 'Workspace folder must exist on file system');
    console.log('✅ Workspace provisioned successfully.');

    // 2. Safe File Writing
    console.log('\n🏃 Test 2: Writing code file safely inside isolated boundary...');
    const testCode = 'console.log("Hello from Sandbox!");';
    isolator.safeWrite(ws, 'src/main.js', testCode);
    
    const writtenFilePath = join(ws.path, 'src/main.js');
    assert.ok(existsSync(writtenFilePath), 'File must be written inside workspace');
    assert.equal(readFileSync(writtenFilePath, 'utf8'), testCode);
    console.log('✅ File written safely within boundary.');

    // 3. Trigger Zero-Trust Traversal Block
    console.log('\n🏃 Test 3: Triggering directory traversal block...');
    try {
        isolator.safeWrite(ws, '../../config/hacker.env', 'EXPOSED_API_KEY=hacked');
        assert.fail('Should fail due to path traversal escape attempt');
    } catch (e) {
        console.log(`Caught expected zero-trust block error: "${e.message}"`);
        assert.ok(e.message.includes('Zero-Trust Trap'));
        assert.ok(e.message.includes('path traversal escape detected'));
    }
    console.log('✅ Directory traversal escape trap verified successfully.');

    // 4. Clean Teardown
    console.log('\n🏃 Test 4: Tearing down workspace directory...');
    isolator.destroy(ws);
    assert.ok(!existsSync(ws.path), 'Workspace folder must be cleanly deleted from disk');
    console.log('✅ Workspace destroyed cleanly.');

    console.log('\n🎉 ALL MULTI-AGENT WORKSPACE SANDBOX PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

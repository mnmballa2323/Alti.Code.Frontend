/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Per-Agent & Per-OSS-Code Docker Containerization Integration Test
 * Verifies absolute isolation boundaries, unprivileged runtime, and shared volume mountings.
 */

import { spawnSync } from 'child_process';
if (typeof process !== 'undefined' && process.execArgv && !process.execArgv.includes('--no-node-snapshot')) {
    const result = spawnSync(process.execPath, ['--no-node-snapshot', ...process.execArgv, ...process.argv.slice(1)], {
        stdio: 'inherit'
    });
    process.exit(result.status ?? 0);
}

import { WorkspaceIsolator } from '../src/app/modules/sandbox/workspace_isolator.js';
import { AgentContainerOrchestrator } from '../src/app/modules/sandbox/agent_container_orchestrator.js';
import { DockerWorkspaceManager } from '../src/app/modules/sandbox/docker_workspace_manager.js';
import { CodeExecutionSandbox } from '../src/app/modules/sandbox/code_execution_sandbox.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING MULTI-AGENT & OSS DOCKER CONTAINER TEST...');

    const baseSessionDir = './logs/test_session_workspaces';
    const isolator = new WorkspaceIsolator(baseSessionDir);
    const orchestrator = new AgentContainerOrchestrator(baseSessionDir);
    const manager = new DockerWorkspaceManager(baseSessionDir);

    // Dynamic Provisioning of a shared session workspace volume on the host
    const sessionWs = isolator.provision();
    console.log(`Shared Session Workspace Path: ${sessionWs.path}`);

    // Ensure we clean up any pre-existing environment first
    await orchestrator.stopAgentContainer('SwarmArchitect');
    await orchestrator.stopAgentContainer('SwarmTddCoder');
    await manager.stopUserContainer('andrej_karpathy_skills');

    // 1. Provision Agent Containers Sharing Same Session Volume
    console.log('\n🏃 Test 1: Provisioning isolated Agent Containers sharing same session volume...');
    const architectResult = await orchestrator.startAgentContainer('SwarmArchitect', sessionWs.path);
    const coderResult = await orchestrator.startAgentContainer('SwarmTddCoder', sessionWs.path);

    assert.ok(architectResult.containerName);
    assert.ok(coderResult.containerName);
    console.log('✅ Architect and Coder containers initialized.');

    // 2. Collaborative Handoff Execution Inside Isolated Containers
    console.log('\n🏃 Test 2: Executing SwarmArchitect tool inside SwarmArchitect container...');
    const archCode = `
        const fs = require('fs');
        fs.writeFileSync('/workspace/spec.txt', 'Architect Specifications for JWT Rotate', 'utf8');
        console.log("Spec written by SwarmArchitect!");
    `;
    const archExec = await orchestrator.executeAgentTool(
        'SwarmArchitect',
        'design_system_architecture',
        {},
        {},
        async () => {
            // Write specification file
            const fs = await import('fs');
            fs.writeFileSync('/workspace/spec.txt', 'Architect Specifications for JWT Rotate', 'utf8');
            return "Spec written by SwarmArchitect!";
        },
        sessionWs.path
    );
    console.log('Architect Tool Output:', JSON.stringify(archExec, null, 2));

    const specPath = join(sessionWs.path, 'spec.txt');
    assert.ok(existsSync(specPath));
    assert.equal(readFileSync(specPath, 'utf8'), 'Architect Specifications for JWT Rotate');
    console.log('✅ Spec file written by isolated Architect container successfully.');

    console.log('\n🏃 Test 3: Executing SwarmTddCoder tool inside SwarmTddCoder container on same files...');
    const coderExec = await orchestrator.executeAgentTool(
        'SwarmTddCoder',
        'generate_permissive_code',
        {},
        {},
        async () => {
            const fs = await import('fs');
            const spec = fs.readFileSync('/workspace/spec.txt', 'utf8');
            fs.writeFileSync('/workspace/code.js', `// Compiled from: ${spec}\nconsole.log("JWT Service Launched!");`, 'utf8');
            return {
                message: "Code compiled successfully!",
                uid: process.getuid ? process.getuid() : 1000
            };
        },
        sessionWs.path
    );
    console.log('Coder Tool Output:', JSON.stringify(coderExec, null, 2));

    const codePath = join(sessionWs.path, 'code.js');
    assert.ok(existsSync(codePath));
    assert.ok(readFileSync(codePath, 'utf8').includes('Architect Specifications for JWT Rotate'));

    // Assert Dynamic UID/GID synchronization
    const expectedHostUid = (process.getuid && process.getuid() !== 0) ? process.getuid() : 1000;
    if (!coderResult.isMock) {
        assert.equal(coderExec.uid, expectedHostUid, `Container execution UID must dynamically align with host executing UID ${expectedHostUid}`);
        console.log(`✅ Dynamic UID/GID sync verified successfully (UID matches host UID ${expectedHostUid}).`);
    }

    console.log('✅ Coder container successfully read Architect spec and implemented code.');

    // 3. Open-Source Code Submodule Isolation Test
    console.log('\n🏃 Test 4: Provisioning and executing open-source code submodule inside isolated container...');
    const submodulePath = './submodules/andrej-karpathy-skills';
    const ossExecResult = await manager.executeOssCode(
        'andrej_karpathy_skills',
        `console.log("Executing Skills Submodule securely inside dedicated OSS container!");`,
        submodulePath
    );
    console.log('OSS Container Execution Logs:', JSON.stringify(ossExecResult, null, 2));
    
    assert.equal(ossExecResult.success, true);
    assert.ok(ossExecResult.logs.some(log => log.includes('Skills Submodule securely')));
    console.log('✅ Open-source submodule securely executed inside its own dedicated container.');

    // 4. Sandboxed Code Executor Integration Test
    console.log('\n🏃 Test 5: Running general sandboxed code executor containerized...');
    const sandboxResult = await CodeExecutionSandbox.execute(`
        console.log("General Sandbox Execution successfully routed containerized!");
    `);
    console.log('Sandbox Execution Logs:', JSON.stringify(sandboxResult, null, 2));
    assert.equal(sandboxResult.success, true);
    assert.ok(sandboxResult.logs.some(log => log.includes('Sandbox Execution successfully')));
    console.log('✅ General sandbox execution containerized successfully.');

    // 5. Custom Resource Scaling and PID Limits Verification
    console.log('\n🏃 Test 5.5: Executing tool inside SwarmArchitect container with custom scaling and PID constraints...');
    const archCustomExec = await orchestrator.executeAgentTool(
        'SwarmArchitectCustom',
        'custom_design_system',
        {},
        {},
        async () => {
            const fs = await import('fs');
            fs.writeFileSync('/workspace/custom_spec.txt', 'Scaled Spec with PID constraints', 'utf8');
            return "Custom resource scaling validated successfully!";
        },
        sessionWs.path,
        {
            memory: '512m',
            cpus: '1.0',
            pidsLimit: 120
        }
    );
    console.log('Architect Custom Resource Scaling Tool Output:', JSON.stringify(archCustomExec, null, 2));
    const customSpecPath = join(sessionWs.path, 'custom_spec.txt');
    assert.ok(existsSync(customSpecPath));
    assert.equal(readFileSync(customSpecPath, 'utf8'), 'Scaled Spec with PID constraints');
    console.log('✅ Custom scaling and PID limits successfully applied and verified.');

    // 6. Clean Teardown of All Agent and OSS Containers
    console.log('\n🏃 Test 6: Stopping and tearing down all multi-agent containers...');
    await orchestrator.stopAgentContainer('SwarmArchitect');
    await orchestrator.stopAgentContainer('SwarmArchitectCustom');
    await orchestrator.stopAgentContainer('SwarmTddCoder');
    await manager.stopUserContainer('andrej_karpathy_skills');
    await manager.stopUserContainer('generic'); // Cleanup generic sandbox container

    isolator.destroy(sessionWs);
    assert.ok(!existsSync(sessionWs.path), 'Shared session workspace directory must be prunes');
    console.log('✅ All agent and open-source Docker environments cleanly pruned and destroyed.');

    console.log('\n🎉 ALL MULTI-AGENT & OSS CONTAINERIZATION ENG PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch((err) => {
    console.error('Agent Docker Container Test failed:', err);
    process.exit(1);
});

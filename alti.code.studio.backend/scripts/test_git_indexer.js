/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Git Session Indexer Integration Test Runner
 * Verifies sessions tracing, commit message compiling, and history queries.
 */

import { GitSessionIndexer } from '../src/app/modules/git/git_session_indexer.js';
import { existsSync, unlinkSync } from 'fs';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING GIT SESSION INDEXER INTEGRATION TEST...');

    const repoRoot = '.';
    const testDbFilename = '.test_agent_sessions.jsonl';
    const indexer = new GitSessionIndexer(repoRoot, testDbFilename);

    // Cleanup previous database if any exists
    if (existsSync(testDbFilename)) {
        unlinkSync(testDbFilename);
    }

    // 1. Start Session
    console.log('\n🏃 Test 1: Starting new agent development session...');
    const taskId = 'task_token_rotation';
    const userRequest = 'Implement secure Session Token Rotation manager';
    const session = indexer.startSession(taskId, userRequest);
    
    assert.ok(session.sessionId, 'Session should have a unique ID');
    assert.equal(session.taskId, taskId);
    assert.equal(session.userRequest, userRequest);
    console.log('✅ Session started successfully.');

    // 2. Record Reasoning and Modifications
    console.log('\n🏃 Test 2: Logging reasoning and file modifications...');
    indexer.recordReasoning(session, 'Design SQL Schema for TokenRotatorTable.');
    indexer.recordReasoning(session, 'Implement SessionTokenManager class with crypto library.');
    indexer.recordFileModification(session, 'src/app/modules/auth/SessionTokenManager.js');
    indexer.recordFileModification(session, 'src/app/modules/auth/SessionTokenManager.js'); // test duplicate filter
    indexer.recordFileModification(session, 'tests/auth/SessionTokenManager.test.js');

    assert.equal(session.reasoningSteps.length, 2);
    assert.equal(session.modifiedFiles.length, 2, 'Duplicate file modifications must be deduplicated');
    assert.equal(session.modifiedFiles[0], 'src/app/modules/auth/SessionTokenManager.js');
    console.log('✅ Reasoning steps and file modifications tracked and deduplicated.');

    // 3. Synthesize Conventional Commit
    console.log('\n🏃 Test 3: Synthesizing conventional commit message...');
    const commitMsg = indexer.synthesizeCommitMessage(session, 'feat');
    console.log('Synthesized Commit Message Output:');
    console.log('========================================');
    console.log(commitMsg);
    console.log('========================================');

    assert.ok(commitMsg.startsWith('feat(SessionTokenManager.js, SessionTokenManager.test.js):'));
    assert.ok(commitMsg.includes('Implement secure Session Token Rotation manager'));
    assert.ok(commitMsg.includes('Design SQL Schema for TokenRotatorTable'));
    assert.ok(commitMsg.includes(session.sessionId));
    console.log('✅ Conventional commit message synthesized successfully.');

    // 4. Commit Session to Database
    console.log('\n🏃 Test 4: Committing session to database...');
    indexer.commitSession(session);
    assert.ok(existsSync(testDbFilename), 'Indexed database file must be created on file system');
    console.log('✅ Session committed successfully.');

    // 5. Query History
    console.log('\n🏃 Test 5: Querying database sessions history...');
    const history = indexer.querySessions();
    console.log(`Discovered ${history.length} indexed sessions:`);
    console.log(JSON.stringify(history, null, 2));

    assert.equal(history.length, 1);
    assert.equal(history[0].sessionId, session.sessionId);
    assert.equal(history[0].taskId, taskId);
    assert.equal(history[0].reasoningSteps[1].description, 'Implement SessionTokenManager class with crypto library.');
    console.log('✅ Session history queried and matched successfully.');

    // Cleanup test database
    unlinkSync(testDbFilename);
    console.log('\n🎉 ALL GIT SESSION INDEXER OBSERVABILITY PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

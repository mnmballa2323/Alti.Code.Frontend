/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * AST Search & Refactoring Engine Integration Test Runner
 * Verifies structural parsing, discovery, and renaming.
 */

import { AstSearchEngine } from '../src/app/modules/ast/ast_search_engine.js';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AST SEARCH ENGINE INTEGRATION TEST...');

    const dummySourceCode = `
import crypto from 'crypto';
import { SessionTokenManager } from './SessionTokenManager.js';

export class TokenRotator {
    constructor(client) {
        this.client = client;
    }

    async executeRotation(userId, token) {
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const payload = await this.client.saveToken(userId, hash);
        console.log('Rotated successfully:', payload);
        return payload;
    }
}

function verifyRotationHelper(token) {
    return token.length === 64;
}

const trigger = (user) => {
    return executeRotation(user, 'secret_token_123');
};
`;

    // 1. Test Discovery of Imports
    console.log('\n🔍 Auditing AST Imports...');
    const imports = AstSearchEngine.findImports(dummySourceCode);
    console.log(JSON.stringify(imports, null, 2));
    assert.equal(imports.length, 2, 'Should discover exactly 2 import declarations');
    assert.equal(imports[0].source, 'crypto');
    assert.equal(imports[1].source, './SessionTokenManager.js');
    console.log('✅ Imports parsing verified successfully.');

    // 2. Test Discovery of Functions
    console.log('\n🔍 Auditing AST Functions...');
    const functions = AstSearchEngine.findFunctions(dummySourceCode);
    console.log(JSON.stringify(functions, null, 2));
    assert.equal(functions.length, 4, 'Should discover executeRotation/verifyRotationHelper/trigger');
    assert.ok(functions.some(f => f.name === 'executeRotation'));
    assert.ok(functions.some(f => f.name === 'verifyRotationHelper'));
    console.log('✅ Functions and parameter lists verified successfully.');

    // 3. Test Call Invocations
    console.log('\n🔍 Auditing AST Callee Calls...');
    const calls = AstSearchEngine.findCalls(dummySourceCode, 'createHash');
    console.log(JSON.stringify(calls, null, 2));
    assert.equal(calls.length, 1, 'Should find 1 call invocation of createHash');
    assert.equal(calls[0].argumentsCount, 1);
    console.log('✅ Callee invocation tracking verified successfully.');

    // 4. Test Structural Identifier Renaming
    console.log('\n✂️ Executing Structural AST Rename (executeRotation -> rotateSession)...');
    const refactoredCode = AstSearchEngine.renameIdentifier(dummySourceCode, 'executeRotation', 'rotateSession');
    console.log('--- REFACTORED CODE OUTPUT ---');
    console.log(refactoredCode);
    console.log('------------------------------');
    assert.ok(refactoredCode.includes('async rotateSession(userId, token)'), 'Rename must alter definition');
    assert.ok(refactoredCode.includes('rotateSession(user, \'secret_token_123\')'), 'Rename must alter invocations');
    assert.ok(!refactoredCode.includes('executeRotation'), 'All occurrences of old identifier must be scrubbed');
    console.log('✅ Structural identifier renaming verified successfully.');

    console.log('\n🎉 ALL AST SEARCH & REFACTORING ENGINE PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

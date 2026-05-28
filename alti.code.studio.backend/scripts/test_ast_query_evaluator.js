/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * AST Structural Query Language Evaluator Integration Test Runner
 * Verifies declarative searches, import constraints, and parameter matching.
 */

import { AstQueryEvaluator } from '../src/app/modules/ast/ast_query_evaluator.js';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AST STRUCTURAL QUERY LANGUAGE EVALUATOR TEST...');

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
        return payload;
    }
}
`;

    // 1. Query for target import source
    console.log('\n🏃 Test 1: Querying AST for specific import declaration source...');
    const query1 = {
        type: 'ImportDeclaration',
        importSource: './SessionTokenManager.js'
    };
    const matches1 = AstQueryEvaluator.evaluate(dummySourceCode, query1);
    console.log(`Discovered ${matches1.length} matching import nodes:`);
    console.log(JSON.stringify(matches1.map(m => ({ type: m.type, startLine: m.startLine })), null, 2));

    assert.equal(matches1.length, 1);
    assert.equal(matches1[0].startLine, 3);
    console.log('✅ Import source query verified successfully.');

    // 2. Query for target ClassMethod with specific parameters list
    console.log('\n🏃 Test 2: Querying AST for target ClassMethod with specific parameter array...');
    const query2 = {
        type: 'ClassMethod',
        name: 'executeRotation',
        parameters: ['userId', 'token']
    };
    const matches2 = AstQueryEvaluator.evaluate(dummySourceCode, query2);
    console.log(`Discovered ${matches2.length} matching class methods:`);
    console.log(JSON.stringify(matches2.map(m => ({ type: m.type, startLine: m.startLine })), null, 2));

    assert.equal(matches2.length, 1);
    assert.equal(matches2[0].startLine, 10);
    console.log('✅ ClassMethod parameters query verified successfully.');

    console.log('\n🎉 ALL AST STRUCTURAL QUERY EVALUATOR PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

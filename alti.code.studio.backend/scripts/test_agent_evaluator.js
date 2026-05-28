/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agent Evaluator & Quality Scorer Integration Test Runner
 * Verifies metrics parsing, security gates, and score calculations.
 */

import { AgentEvaluator } from '../src/app/modules/evaluation/agent_evaluator.js';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import assert from 'assert';

async function runTest() {
    console.log('🧪 INITIALIZING AGENT EVALUATOR INTEGRATION TEST...');

    const logDir = './logs/test_evaluation';
    const taskId = `task_eval_${Math.random().toString(36).substring(2, 9)}`;
    const scorecardPath = join(logDir, `scorecard_${taskId}.json`);

    // Cleanup previous evaluation scorecards if any exist
    if (existsSync(scorecardPath)) {
        unlinkSync(scorecardPath);
    }

    // 1. Happy Path Code Evaluation
    console.log('\n🏃 Test 1: Evaluating high-quality modern ES6 code...');
    const excellentCode = `
        import crypto from 'crypto';
        export function hashToken(token) {
            return crypto.createHash('sha256').update(token).digest('hex');
        }
    `;
    const score1 = AgentEvaluator.evaluateCode(excellentCode, { maxLines: 15 });
    console.log(JSON.stringify(score1, null, 2));

    assert.equal(score1.score, 100);
    assert.equal(score1.status, 'EXCELLENT');
    assert.equal(score1.syntacticallyValid, true);
    console.log('✅ Excellent code evaluated successfully.');

    // 2. Security Hazard & Old Style Code Evaluation
    console.log('\n🏃 Test 2: Evaluating code with security hazards and CJS imports...');
    const hazardousCode = `
        const fs = require('fs');
        function executeHacker(code) {
            eval(code); // security hazard!
        }
    `;
    const score2 = AgentEvaluator.evaluateCode(hazardousCode);
    console.log(JSON.stringify(score2, null, 2));

    // Deductions: CJS Import (-10) + Eval Call (-30) = 60 Score
    assert.equal(score2.score, 60);
    assert.equal(score2.status, 'ACCEPTABLE');
    assert.equal(score2.syntacticallyValid, true);
    assert.ok(score2.deductions.some(d => d.includes('Security Hazard')));
    assert.ok(score2.deductions.some(d => d.includes('CommonJS require')));
    console.log('✅ Hazardous code evaluated successfully.');

    // 3. Syntax Error Code Evaluation
    console.log('\n🏃 Test 3: Evaluating code with severe syntax errors...');
    const brokenCode = `
        export class BrokenRotator {
            constructor() {
                this.client = // syntax crash!
            }
        }
    `;
    const score3 = AgentEvaluator.evaluateCode(brokenCode);
    console.log(JSON.stringify(score3, null, 2));

    // Deductions: Syntax Failure (-40) = 60 Score
    assert.equal(score3.score, 60);
    assert.equal(score3.status, 'ACCEPTABLE');
    assert.equal(score3.syntacticallyValid, false);
    assert.ok(score3.deductions.some(d => d.includes('Syntax Failure')));
    console.log('✅ Syntactically broken code evaluated successfully.');

    // 4. Log Scorecard to Disk
    console.log('\n🏃 Test 4: Logging evaluation scorecard to disk...');
    AgentEvaluator.logScorecard(taskId, score1, logDir);
    assert.ok(existsSync(scorecardPath), 'Scorecard JSON file must be written to disk');
    
    const parsed = JSON.parse(readFileSync(scorecardPath, 'utf8'));
    assert.equal(parsed.score, 100);
    assert.equal(parsed.status, 'EXCELLENT');
    console.log('✅ Scorecard logged and verified successfully.');

    // Cleanup test logs
    unlinkSync(scorecardPath);
    console.log('\n🎉 ALL AGENT EVALUATOR & QUALITY SCORER PROTOCOLS PASSED SUCCESSFULLY!');
}

runTest().catch(console.error);

/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agent Evaluation & Quality Scorer Engine
 * 
 * High-performance, advanced model evaluation and regression-testing library.
 * Executes automated heuristics against agent-generated code, schemas, and outputs,
 * calculates syntax correctness, scans for forbidden patterns, maps styling
 * metrics, and compiles a comprehensive quality audit report (inspired by Opik).
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import parser from '@babel/parser';

export class AgentEvaluator {
    /**
     * Evaluates a generated code snippet against high-fidelity style and security rubrics.
     * @param {string} code - Agent-generated JavaScript/TypeScript code
     * @param {object} rules - Validation heuristics (maxLines, allowedKeywords, forbiddenPatterns)
     * @returns {object} High-precision quality scorecard
     */
    static evaluateCode(code, rules = {}) {
        const maxLines = rules.maxLines || 100;
        const forbiddenPatterns = rules.forbiddenPatterns || [
            /eval\(/,
            /exec\(/,
            /Function\(/
        ];

        let score = 100;
        const deductions = [];

        // 1. Audit: Code Length check
        const lines = code.trim().split('\n');
        if (lines.length > maxLines) {
            const deduction = Math.min(20, Math.floor((lines.length - maxLines) / 5));
            score -= deduction;
            deductions.push(`Code length exceeded ${maxLines} lines (Actual: ${lines.length} lines). Deducted ${deduction} points.`);
        }

        // 2. Audit: Security Guardrail checks
        forbiddenPatterns.forEach(pattern => {
            if (pattern.test(code)) {
                score -= 30;
                deductions.push(`Security Hazard: Detected restricted execution pattern matching: ${pattern.toString()}. Deducted 30 points.`);
            }
        });

        // 3. Audit: JavaScript Syntax check
        let isSyntacticallyValid = true;
        try {
            parser.parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'classProperties', 'decorators-legacy']
            });
        } catch (e) {
            isSyntacticallyValid = false;
            score -= 40;
            deductions.push(`Syntax Failure: Code has syntax errors: "${e.message}". Deducted 40 points.`);
        }

        // 4. Audit: ES6 Module import check (encouraging import vs require)
        if (code.includes('require(') && !code.includes('import ')) {
            score -= 10;
            deductions.push('Styling Warning: Code uses CommonJS require instead of modern ES6 import. Deducted 10 points.');
        }

        // Lower boundary constraint
        const finalScore = Math.max(0, score);

        return {
            score: finalScore,
            status: finalScore >= 80 ? 'EXCELLENT' : (finalScore >= 60 ? 'ACCEPTABLE' : 'REJECTED'),
            syntacticallyValid: isSyntacticallyValid,
            deductions,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Compiles and logs a completed evaluation scorecard to disk.
     * @param {string} taskId - Unique task ID
     * @param {object} scorecard - Generated quality scorecard
     * @param {string} logDirectory - Folder to save report JSON
     */
    static logScorecard(taskId, scorecard, logDirectory = './logs/evaluation') {
        try {
            mkdirSync(logDirectory, { recursive: true });
            const filePath = join(logDirectory, `scorecard_${taskId}.json`);
            writeFileSync(filePath, JSON.stringify(scorecard, null, 2), 'utf8');
            console.log(`📊 Scorecard [${scorecard.status} - ${scorecard.score}/100] compiled successfully: ${filePath}`);
        } catch (e) {
            console.error('Failed to log evaluation scorecard:', e.message);
        }
    }
}

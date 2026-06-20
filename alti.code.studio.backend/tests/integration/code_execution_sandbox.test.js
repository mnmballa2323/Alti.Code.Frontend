import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CodeExecutionSandbox } from '../../src/app/modules/sandbox/code_execution_sandbox.js';
import { AstGraphNavigator } from '../../src/app/modules/sandbox/ast_graph_navigator.js';
import { SocraticDebateChamber } from '../../src/app/modules/agents/socratic_debate_chamber.js';
import { PolicyComplianceGate } from '../../src/app/middlewares/policyComplianceGate.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';

// Register SQLite polyfill loader dynamically in test context
beforeAll(async () => {
    try {
        const { register } = await import('node:module');
        const loaderUrl = new URL('../../src/app/modules/sandbox/sqlite-loader.js', import.meta.url).href;
        register(loaderUrl);
    } catch (err) {}
});

// Mock aiProvider for deterministic Socratic debate testing
vi.mock('../../src/app/modules/ai/ai.provider.js', () => ({
    aiProvider: {
        reason: vi.fn(async (prompt) => {
            if (prompt.includes('Red Team Socratic Critic')) {
                return 'Criticism: The proposed algorithm has O(N^2) time complexity. Ensure O(log N) partitioning.';
            }
            if (prompt.includes('compliance Auditor')) {
                return 'DECISION: APPROVED\nThe refined proposal resolves all O(N^2) bottlenecks successfully.';
            }
            return 'Mock reasoning response.';
        }),
        generate: vi.fn(async (prompt) => {
            if (prompt.includes('Blue Team Software Architect')) {
                return '// Refactored code\nfunction optimized() { return "O(log N)"; }';
            }
            return 'Mock generated code.';
        })
    }
}));

describe('Pillar 1: Flue Sandbox Execution Integration Tests', () => {
    it('should execute raw JS code snippet successfully inside Flue local sandbox', async () => {
        const code = `
            const a = 10;
            const b = 20;
            console.log("HELLO_WORLD_FLUE_SANDBOX", a + b);
        `;

        const result = await CodeExecutionSandbox.execute(code, {
            provider: 'flue',
            workspacePath: path.resolve('./logs/workspaces/test_flue_exec')
        });

        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.logs.some(l => l.includes('HELLO_WORLD_FLUE_SANDBOX 30'))).toBe(true);
        expect(result.isMock).toBe(false);
    });

    it('should catch runtime errors inside the Flue local sandbox', async () => {
        const code = `
            throw new Error("TEST_RUNTIME_ERROR_IN_FLUE");
        `;

        const result = await CodeExecutionSandbox.execute(code, {
            provider: 'flue',
            workspacePath: path.resolve('./logs/workspaces/test_flue_fail')
        });

        expect(result.success).toBe(false);
        expect(result.exitCode).not.toBe(0);
        expect(result.errors.some(e => e.includes('TEST_RUNTIME_ERROR_IN_FLUE'))).toBe(true);
    });
});

describe('Pillar 2: AST Code-Graph & Context Navigation Tests', () => {
    const mockFilePath = path.resolve('./logs/workspaces/mock_code_file.js');

    beforeAll(() => {
        const mockCode = `
/**
 * Mock class for testing AST traversal.
 */
class TestService {
    constructor() {
        this.name = 'Test';
    }

    /**
     * Executes mock calculation.
     */
    async calculate(x, y) {
        return x + y;
    }
}

function compute(val) {
    return val * 2;
}
`;
        fs.mkdirSync(path.dirname(mockFilePath), { recursive: true });
        fs.writeFileSync(mockFilePath, mockCode, 'utf8');
    });

    afterAll(() => {
        try {
            fs.unlinkSync(mockFilePath);
        } catch (e) {}
    });

    it('should build accurate graph mapping classes and methods', () => {
        const graph = AstGraphNavigator.buildGraph(mockFilePath);
        expect(graph.symbols['TestService']).toBeDefined();
        expect(graph.symbols['TestService'].type).toBe('class');
        expect(graph.symbols['TestService'].methods).toContain('calculate');
        expect(graph.symbols['TestService.calculate']).toBeDefined();
        expect(graph.symbols['compute']).toBeDefined();
    });

    it('should prune file to return only specified method definition with comments', () => {
        const pruned = AstGraphNavigator.pruneFile(mockFilePath, 'TestService.calculate');
        expect(pruned).toContain('async calculate(x, y)');
        expect(pruned).toContain('Executes mock calculation');
        expect(pruned).not.toContain('class TestService');
        expect(pruned).not.toContain('function compute');
    });
});

describe('Pillar 3: Socratic Debate Chamber Tests', () => {
    it('should conduct multi-model debate loop and reach approved consensus', async () => {
        const topic = 'Design an optimal caching layer for product metadata.';
        const initialProposal = 'function getProduct(id) { return fetch(id); }';

        const outcome = await SocraticDebateChamber.runDebate(topic, initialProposal, 2);

        expect(outcome.consensus).toBe(true);
        expect(outcome.approvedProposal).toContain('optimized');
        expect(outcome.history.length).toBeGreaterThan(0);
        expect(aiProvider.reason).toHaveBeenCalled();
        expect(aiProvider.generate).toHaveBeenCalled();
    });
});

describe('Pillar 4: Policy-as-Code Compliance Gate Tests', () => {
    it('should pass validation on compliant code', () => {
        const code = `
            import { logger } from './logger.js';
            export function process() {
                logger.info('Clean code processing');
            }
        `;
        const check = PolicyComplianceGate.verify('src/services/clean.js', code);
        expect(check.isValid).toBe(true);
        expect(check.errors.length).toBe(0);
    });

    it('should block writes containing plaintext API Keys (Secrets Gate)', () => {
        const code = `
            const API_KEY = "AIzaSyATOQRmcM0DMO83Z9jEuuC4DIgna60TSJQ";
        `;
        const check = PolicyComplianceGate.verify('src/config/keys.js', code);
        expect(check.isValid).toBe(false);
        expect(check.errors.some(e => e.includes('credentials or API keys'))).toBe(true);
    });

    it('should block writes containing Copyleft licensing (Legal Gate)', () => {
        const code = `
            // Released under GNU General Public License (GPLv3)
            function calculateTotal() { return 100; }
        `;
        const check = PolicyComplianceGate.verify('src/utils/calc.js', code);
        expect(check.isValid).toBe(false);
        expect(check.errors.some(e => e.includes('Copyleft License contamination'))).toBe(true);
    });

    it('should block route writes lacking CSRF protection (Architectural Gate)', () => {
        const code = `
            import { Router } from 'express';
            const router = Router();
            router.post('/update', (req, res) => res.json({}));
        `;
        const check = PolicyComplianceGate.verify('src/app/routes/item.route.js', code);
        expect(check.isValid).toBe(false);
        expect(check.errors.some(e => e.includes('without active CSRF protection'))).toBe(true);
    });
});

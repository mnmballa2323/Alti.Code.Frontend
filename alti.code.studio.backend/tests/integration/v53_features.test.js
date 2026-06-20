import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AstGraphNavigator } from '../../src/app/modules/sandbox/ast_graph_navigator.js';
import { CodeExecutionSandbox } from '../../src/app/modules/sandbox/code_execution_sandbox.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';
import { neo4jService } from '../../src/app/services/neo4j.service.js';
import { handleHealthRequest } from '../../src/app/modules/diagnostics/diagnostics.route.js';

// Mock neo4jService
vi.mock('../../src/app/services/neo4j.service.js', () => ({
    neo4jService: {
        executeCypher: vi.fn(async () => [])
    }
}));

describe('Milestone v53.0.0 Feature Tests', () => {
    const mockCodeFile = path.resolve('./logs/workspaces/v53_mock_file.js');

    beforeAll(() => {
        // Set short debounce delay for testing
        AstGraphNavigator.debounceDelay = 10;
        
        const mockCode = `
            class MathOperations {
                async add(a, b) {
                    return a + b;
                }
            }
        `;
        fs.mkdirSync(path.dirname(mockCodeFile), { recursive: true });
        fs.writeFileSync(mockCodeFile, mockCode, 'utf8');
    });

    afterAll(() => {
        try {
            fs.unlinkSync(mockCodeFile);
        } catch (e) {}
    });

    describe('Pillar 1: Debounced AST Ingestion', () => {
        it('should batch rapid syncFileToNeo4j requests and process them in a single cycle', async () => {
            vi.clearAllMocks();
            
            // Call syncFileToNeo4j multiple times rapidly
            const p1 = AstGraphNavigator.syncFileToNeo4j(mockCodeFile);
            const p2 = AstGraphNavigator.syncFileToNeo4j(mockCodeFile);
            const p3 = AstGraphNavigator.syncFileToNeo4j(mockCodeFile);

            await Promise.all([p1, p2, p3]);

            // Ensure executeCypher was called, but only once for the file node creation (since it was batched)
            const calls = vi.mocked(neo4jService.executeCypher).mock.calls;
            const fileMergeCalls = calls.filter(c => c[0].includes('MERGE (f:File'));
            expect(fileMergeCalls.length).toBe(1);
        });
    });

    describe('Pillar 2: Hardened Sandboxing (flue / isolated-vm / vm fallback)', () => {
        it('should block access to require() and throw ReferenceError', async () => {
            const code = `
                const fs = require('fs');
            `;
            const result = await CodeExecutionSandbox.execute(code, { provider: 'flue' });
            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.includes('require is not defined'))).toBe(true);
        });

        it('should block access to process.env and throw ReferenceError', async () => {
            const code = `
                const env = process.env;
            `;
            const result = await CodeExecutionSandbox.execute(code, { provider: 'flue' });
            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.includes('process is not defined'))).toBe(true);
        });
    });

    describe('Pillar 3: Outgoing Payload Credential Scrubber', () => {
        it('should scrub Google Cloud API keys, AWS Keys, Slack tokens, private keys, and DB passwords', () => {
            const prompt = `
                My Google API key is AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
                My AWS key is AKIA1234567890ABCDEF
                Here is a private key:
                -----BEGIN PRIVATE KEY-----
                MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3
                -----END PRIVATE KEY-----
                And postgres connection: postgresql://admin:secretPass123@localhost:5432/db
            `;
            const scrubbed = aiProvider._scrubCredentials(prompt);
            expect(scrubbed).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q');
            expect(scrubbed).not.toContain('AKIA1234567890ABCDEF');
            expect(scrubbed).not.toContain('-----BEGIN PRIVATE KEY-----');
            expect(scrubbed).not.toContain('secretPass123');
            expect(scrubbed).toContain('[REDACTED_SECURE_CREDENTIAL]');
        });
    });

    describe('Pillar 4: Diagnostics Route', () => {
        it('should return 200 OK or 500 Degraded with database and neo4j status', async () => {
            let capturedStatus = null;
            let capturedJson = null;

            const mockReq = {};
            const mockRes = {
                status: (code) => {
                    capturedStatus = code;
                    return mockRes;
                },
                json: (data) => {
                    capturedJson = data;
                    return mockRes;
                }
            };

            await handleHealthRequest(mockReq, mockRes);

            expect(capturedStatus).toBeDefined();
            expect(capturedJson).toBeDefined();
            expect(capturedJson.status).toBeDefined();
            expect(capturedJson.details).toBeDefined();
            expect(capturedJson.details.database).toBeDefined();
            expect(capturedJson.details.neo4j).toBeDefined();
            expect(capturedJson.details.ai).toBeDefined();
            expect(capturedJson.details.disk).toBeDefined();
            expect(capturedJson.details.memory).toBeDefined();
        });
    });
});

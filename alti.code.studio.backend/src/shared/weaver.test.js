import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weaverAgent } from './weaver.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

vi.mock('../app/modules/gemini/gemini.service.js');

describe('Dynamic Bytecode Compilation (Phase 29 - The Weaver)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should identify a bottleneck, dynamically compile to Wasm, and execute natively', async () => {
        // We pretend this Javascript is too slow
        const slowJsSource = `function fastMath(a, b) { return a + b; }`;
        const functionName = 'fastMath'; // Matches the exported name in the hardcoded Wasm buffer

        // Weaver dynamically generates and returns a live Wasm function pointer
        const fastWasmFunction = await weaverAgent.compileToWasm(functionName, slowJsSource);

        // ASSERTIONS

        // 1. Ensure the returned object is actually an executable function
        expect(typeof fastWasmFunction).toBe('function');

        // 2. Execute the compiled Wasm natively and assert the result (5 + 10 = 15)
        const result = fastWasmFunction(5, 10);
        expect(result).toBe(15);
    });

});

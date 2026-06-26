import { describe, it, expect, vi, beforeEach } from 'vitest';
import { demystifierAgent } from './demystifier.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Real-Time Reverse Engineering (Phase 25 - The Demystifier)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract a file path from a stack trace, read the minified block, and translate it via LLM', async () => {
    const mockStackTrace = `TypeError: Cannot read properties of undefined (reading 'toLowerCase')
    at a.b.c (/mock/node_modules/weird-package/dist/index.min.js:1:415)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)`;

    // We simulate a single minified line of code
    const mockMinifiedCode = `function a(b){return b.x.y.z}var obj={};function d(){const f=obj.payload;if(f){console.log(f.map(i=>i.toLowerCase()))}else{throw new Error('x')}}`;
    // At col 415, we assume the code snippet extraction logic will pull the string. Let's mock the file read.
    fs.readFile.mockResolvedValueOnce(mockMinifiedCode);

    // Mock Gemini returning the translation
    const expectedTranslation =
      'The crash occurred because the codebase attempted to call `.toLowerCase()` on an array element inside `obj.payload`, but the payload was undefined or missing expected string properties.';
    GeminiAiService.generateContent.mockResolvedValueOnce(expectedTranslation);

    const explanation = await demystifierAgent.analyzeCrash(mockStackTrace);

    // ASSERTIONS

    // 1. Check the file read targeted the correct path extracted from the stack trace
    expect(fs.readFile).toHaveBeenCalledWith(
      '/mock/node_modules/weird-package/dist/index.min.js',
      'utf8',
    );

    // 2. Check the Agent invoked Gemini to translate the snippet
    expect(GeminiAiService.generateContent).toHaveBeenCalled();

    // 3. Check the prompt likely contained the snippet (our naive snippet extractor might grab the whole thing here since it's short)
    expect(GeminiAiService.generateContent.mock.calls[0][0]).toContain(
      'toLowerCase',
    );

    // 4. Expect the final output to be the plain english translation
    expect(explanation).toEqual(expectedTranslation);
  });

  it('should return a graceful error if no file path can be extracted', async () => {
    const result = await demystifierAgent.analyzeCrash('TypeError: bad crash');
    expect(result).toContain('Could not identify');
  });
});

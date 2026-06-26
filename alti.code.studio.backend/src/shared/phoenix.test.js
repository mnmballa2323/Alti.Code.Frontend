import { describe, it, expect, vi, beforeEach } from 'vitest';
import { phoenixService } from './phoenix.service.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import { astService } from './ast.service.js';
import fs from 'fs/promises';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('./ast.service.js');
vi.mock('fs/promises');

describe('The Phoenix Protocol (Phase 17 - Autonomous Self-Healing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    phoenixService.isActive = false;
  });

  it('should intercept a fatal crash, extract the localized function, and synthesize a codebase patch', async () => {
    // 1. Simulate a fatal TypeError originating from a poorly written mock service
    const simulatedStack = `TypeError: Cannot read properties of undefined (reading 'userId')
            at UserService.getUserProfile (file:///c:/Users/hyper/Desktop/workspace/alti.code.studio/alti.code.studio.backend/src/app/modules/user/user.service.js:15:32)
            at ModuleNode.run (node:internal/modules/esm/module_job:198:25)`;

    const fatalError = new Error('Simulated Fatal Crash');
    fatalError.stack = simulatedStack;

    // 2. Mock reading the source file of the crash site
    const mockSourceCode = `
            class UserService {
                getUserProfile(userObject) {
                    // Fatal flaw: Does not check if userObject is undefined
                    return userObject.userId; 
                }
            }
        `;
    fs.readFile.mockResolvedValue(mockSourceCode);

    // 3. Mock AST mathematically perfectly extracting the exact failing method
    astService.extractFunction.mockReturnValue(`
                getUserProfile(userObject) {
                    // Fatal flaw: Does not check if userObject is undefined
                    return userObject.userId; 
                }
        `);

    // 4. Mock Gemini producing the hotfix
    const hallucinatedFix = `
                getUserProfile(userObject) {
                    if (!userObject || typeof userObject !== 'object') {
                        throw new TypeError("userObject must be a defined object.");
                    }
                    return userObject.userId || null; 
                }
        `;
    GeminiAiService.generateContent.mockResolvedValue(hallucinatedFix);

    // ACT: Execute the Phoenix handler directly (simulate the event emission)
    const result = await phoenixService.handleFatalCrash(
      fatalError,
      'uncaughtException',
    );

    // ASSERT
    // Ensure we attempted to read the file parsed from the stack trace
    // Normalize the mock path lookup to handle vitest slash routing differences if needed
    expect(fs.readFile).toHaveBeenCalled();
    const calledFilePath = fs.readFile.mock.calls[0][0];
    expect(calledFilePath.endsWith('user.service.js')).toBe(true);
    expect(calledFilePath.includes('c:/Users/hyper/Desktop')).toBe(true);

    // Ensure AST was invoked to perfectly slice the localized crash function
    expect(astService.extractFunction).toHaveBeenCalledWith(
      mockSourceCode,
      'getUserProfile',
    );

    // Ensure Gemini was fed the stack trace and the failing codebase
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);
    const geminiPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(geminiPrompt).toContain(
      'TypeError: Cannot read properties of undefined',
    );
    expect(geminiPrompt).toContain('return userObject.userId;');

    // Ensure the service successfully returns the structural patch
    expect(result.success).toBe(true);
    expect(result.patch).toContain('if (!userObject');
  });

  it('should ignore crashes that originate deep in node_modules/v8 engine without failing', async () => {
    const cPlusPlusCrash = `Error: Segfault in node-gyp bindings
            at Module._compile (internal/modules/cjs/loader.js:1200:30)
            at internal/main/run_main_module.js:17:47`;

    const fatalError = new Error('V8 Engine Crash');
    fatalError.stack = cPlusPlusCrash;

    const result = await phoenixService.handleFatalCrash(
      fatalError,
      'uncaughtException',
    );

    // Should return false silently without trying to rewrite internal Node.js C++ files
    expect(result.success).toBe(false);
    expect(result.reason).toBe('No local stack trace found');
    expect(GeminiAiService.generateContent).not.toHaveBeenCalled();
  });
});

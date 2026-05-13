import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reverserAgent } from './reverser.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

vi.mock('../app/modules/gemini/gemini.service.js');

describe('Absolute Binary Decompilation (Phase 31 - The Reverser)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should translate a raw x86 Buffer Overflow core dump into a plain English explanation', async () => {
        // A mock x86_64 assembly block representing a classic `strcpy` buffer overflow
        // where a large string is copied into a small stack buffer.
        const mockCoreDumpAssembly = `
           0x4005c2:  push   rbp
           0x4005c3:  mov    rbp, rsp
           0x4005c6:  sub    rsp, 0x10         ; Allocate 16 bytes for buffer
           0x4005ca:  mov    rax, QWORD PTR [rbp-0x18] ; Load pointer to user string
           0x4005ce:  mov    rcx, rax          ; Source string
           0x4005d1:  lea    rax, [rbp-0x10]   ; Destination buffer
           0x4005d5:  mov    rdx, rcx
           0x4005d8:  mov    rdi, rax
           0x4005db:  call   0x4004a0 <strcpy@plt> ; CRASH HERE: Overwrites return address
           0x4005e0:  nop
           0x4005e1:  leave
           0x4005e2:  ret
        `;

        // We mock Gemini generating the translation
        const mockedTranslation = "The native code crashed due to a classic Buffer Overflow. It allocated only 16 bytes on the stack but used `strcpy` to copy a user-provided string that was significantly larger, overwriting critical return execution memory.";
        GeminiAiService.generateContent.mockResolvedValueOnce(mockedTranslation);

        const result = await reverserAgent.decompileNativeCrash('image-processor.node', mockCoreDumpAssembly);

        // ASSERTIONS

        // 1. Ensure Gemini was called to decompile
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        // 2. Ensure the returned object contains the successful plain-text translation
        expect(result.status).toBe('success');
        expect(result.plainTextExplanation).toBe(mockedTranslation);
    });

});

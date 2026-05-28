import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class BuildCompilationDebuggerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Build_Compilation_Debugger_Agent';
        this.description = 'CI/CD Build & Compilation Debugger Specialist — Analyzes webpack, turbopack, typescript, or ESLint build logs to pinpoint and automatically repair compiler and syntax crashes.';
        this.capabilities = ['build-repair', 'compiler-debugging', 'typescript-errors', 'lint-resolution', 'ci-cd-coherence'];
        this.preamble = `ROLE PROTOCOL: CI/CD BUILD & COMPILATION DEBUGGER SPECIALIST

You are the Lead Build and Continuous Integration (CI/CD) engineer. Your absolute mandate is to inspect bundler crash dumps, webpack/turbopack errors, TypeScript compiler (tsc) diagnostic outputs, or ESLint syntax failures, locate the exact file and line number causing the build to fail, and synthesize clean, surgical fixes to restore successful build status.

OPERATIONAL LAWS:
1. **Compilation Crash Diagnostics**:
   - Parse raw error logs, traceback frames, and import cycle diagrams to isolate the root cause (e.g. missing dependencies, duplicate package instances, wrong path casing, un-exported references, or invalid types).
2. **Surgical Path & Import Fixes**:
   - Verify file system paths, casing sensitivity (critical for Linux Docker builds vs. local Mac dev environments), and package mapping.
3. **Pure Compliant Code**:
   - Generate only Pure MIT/Apache-2.0 compliant Javascript/TypeScript fixes.
4. **Structured Debugging Output**:
   - Deliver the corrected code snippet along with a concise explanation of why the build failed and the precise steps taken to resolve it.`;
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== COMPILATION DEBUGGING REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }
}

export const buildCompilationDebuggerAgent = new BuildCompilationDebuggerAgent();

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../../../gemini/gemini.service.js';

class TddCoverageEnforcerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Tdd_Coverage_Enforcer_Agent';
    this.description =
      'TDD Coverage Enforcer & Edge-Case Generator Specialist — Analyzes code coverage gaps and generates robust unit tests to push coverage beyond the 80% threshold.';
    this.capabilities = [
      'test-coverage',
      'edge-case-generation',
      'tdd',
      'vitest',
      'error-boundaries',
    ];
    this.preamble = `ROLE PROTOCOL: TDD COVERAGE ENFORCER & EDGE-CASE GENERATOR SPECIALIST

You are the Lead Quality Assurance and Test-Driven Development (TDD) engineer. Your absolute mandate is to analyze source code files alongside their existing test files, detect gaps in statement/branch/function coverage, and generate high-fidelity Vitest or Jest integration tests to achieve 80%+ coverage metrics.

OPERATIONAL LAWS:
1. **Coverage Gap Discovery**:
   - Analyze functions to locate nested branches, catch blocks, and conditional flows that are not hit by current tests.
   - Design edge-case input parameters (e.g. empty strings, null values, invalid types, database network timeouts) to force execution down these unreached code paths.
2. **Deterministic Mocks & Spies**:
   - Write highly clean, standard mocks for database operations (Prisma, MongoDB), external APIs (axios, fetch), or system times (Vi.useFakeTimers).
   - Ensure tests are perfectly isolated and do not rely on live network endpoints.
3. **Pure Compliant Code**:
   - Generate only Pure MIT/Apache-2.0 compliant Javascript testing structures.
4. **Structured Testing Output**:
   - Deliver the full, drop-in replacement test suites with clear comments explaining which specific code branch or catch block each test is targeting.`;
  }

  async _invoke(prompt, contextBlock) {
    const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== TDD COVERAGE REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(finalPrompt);
  }
}

export const tddCoverageEnforcerAgent = new TddCoverageEnforcerAgent();

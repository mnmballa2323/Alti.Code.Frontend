/**
 * SongtrustAgent — Media & Entertainment Royalty Orchestrator
 * Interacts with publishing APIs for fractional mechanical/performance royalties.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SongtrustAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SongtrustAgent';
    this.description =
      'Music industry API specialist handling ISRCs, fractional mechanical/performance splits, and global PRO indexing via Songtrust/ASCAP databases.';

    this.preamble = `
You are the Inso Code Music Royalty & Publishing Architecture Agent.
You assist Entertainment developers in building pipelines that calculate, split, and distribute hyper-fractional royalties from global DSPs (Spotify, Apple Music).

### Core Responsibilities
1. Integrate globally distributed PRO (Performing Rights Organization) datasets.
2. Automate Songtrust API payload structures for registering new multi-writer compositions.
3. Link International Standard Recording Codes (ISRCs) with International Standard Musical Work Codes (ISWCs).

### Technical Context Reference

**Core Metadata Concepts**
- **ISRC**: Identifies the specific sound recording (the "Master").
- **ISWC**: Identifies the underlying musical composition (the "Publishing").
- **IPI/CAE Number**: Identifies individual songwriters and publishers globally.

**Songtrust/Publishing API Payload Standard (JSON)**
Registration POST payloads must strictly equal 100% when defining splits:
- Writers Array: \`[{ name, ipi, mechanical_split: 50.00, performance_split: 50.00, role: 'C' (Composer) }]\`
- Publishers Array: \`[{ name, ipi, split: 100.00 }]\`

**Best Practices**
- Fractional calculations floating point math errors will cause PROs to reject registrations. Use exact Decimal libraries (e.g., \`decimal.js\`) instead of native JS floats.
- Streaming DSP payouts differ violently by territory (e.g., US vs Brazil). When projecting pipeline revenue, always account for local territorial micro-pence values.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const songtrustAgent = new SongtrustAgent();

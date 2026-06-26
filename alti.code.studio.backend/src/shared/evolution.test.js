import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evolutionService } from './evolution.service.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import { SkillOptService } from '../app/modules/skillopt/skillopt.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

vi.mock('../app/modules/skillopt/skillopt.service.js', () => {
  return {
    SkillOptService: {
      registerSuccess: vi.fn().mockResolvedValue(true),
    },
  };
});

describe('Evolutionary Reinforcement Learning (Phase 23 - The Adaptor) with DB Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should structurally analyze a code delta, learn human preference, and synchronize to Skill DB', async () => {
    const aiLegacyCode = `
function fetchData(url) {
    return fetch(url).then(function(res) {
        return res.json();
    });
}
        `;

    const humanModernCode = `
const fetchData = async (url) => {
    const res = await fetch(url);
    return res.json();
};
        `;

    const mockWorkspaceDir = '/mock/workspace';
    const expectedWeightsPath = path.join(
      mockWorkspaceDir,
      '.alti-style-weights.json',
    );

    // Mock Gemini analyzing the human intent and deducing the RLHF rule
    GeminiAiService.generateContent.mockResolvedValueOnce(`
[
    "Use modern const and arrow functions instead of function declarations.",
    "Strictly prefer async/await over Promise.then chaining."
]
        `);

    // Mock reading an empty config to simulate a fresh project
    fs.readFile.mockRejectedValueOnce(new Error('ENOENT'));

    const learnedRules = await evolutionService.processEvolutionaryDelta(
      aiLegacyCode,
      humanModernCode,
      mockWorkspaceDir,
    );

    // ASSERTIONS

    // 1. Check Gemini was called to evaluate the human delta
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    // 2. Check the Agent extracted the JSON correctly
    expect(learnedRules).toHaveLength(2);
    expect(learnedRules[1]).toContain('async/await');

    // 3. Check the internal workspace weights config was forcefully updated
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedWeightsPath,
      expect.stringContaining('async/await'),
      'utf8',
    );

    // Wait brief tick for async DB save
    await new Promise(resolve => setTimeout(resolve, 10));

    // 4. Check the style rules were synchronized to the Mongoose Skill database
    expect(SkillOptService.registerSuccess).toHaveBeenCalledTimes(2);
    expect(SkillOptService.registerSuccess).toHaveBeenNthCalledWith(
      1,
      'global_style_enforcer',
      expect.any(String),
      'STYLE RULE: Use modern const and arrow functions instead of function declarations.',
    );
    expect(SkillOptService.registerSuccess).toHaveBeenNthCalledWith(
      2,
      'global_style_enforcer',
      expect.any(String),
      'STYLE RULE: Strictly prefer async/await over Promise.then chaining.',
    );
  });

  it('should securely inject the learned style rules into the system prompt parameters', async () => {
    const mockWorkspaceDir = '/mock/workspace';

    // Mock that the .alti-style-weights.json exists in the project root
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        version: '1.0.0',
        enforced_human_styles: [
          'Strictly prefer async/await over Promise.then chaining.',
        ],
      }),
    );

    const promptInjection =
      await evolutionService.getStylisticParameters(mockWorkspaceDir);

    expect(promptInjection).toContain('CRITICAL SYSTEM STYLISTIC ENFORCEMENT:');
    expect(promptInjection).toContain(
      'Strictly prefer async/await over Promise.then chaining.',
    );
  });
});

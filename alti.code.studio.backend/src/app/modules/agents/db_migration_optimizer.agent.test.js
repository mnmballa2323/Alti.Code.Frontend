import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the custom mock factory before imports
vi.mock('../gemini/gemini.service.js', () => {
  return {
    GeminiAiService: {
      generateContent: vi.fn(),
    },
  };
});

// Import after the mock is established
import { dbMigrationOptimizerAgent } from './db_migration_optimizer.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

describe('DbMigrationOptimizerAgent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMigrationOptimizerAgent.resetMetrics();
  });

  it('should initialize with correct name, description, and preamble', () => {
    expect(dbMigrationOptimizerAgent.name).toBe('Db_Migration_Optimizer_Agent');
    expect(dbMigrationOptimizerAgent.description).toContain(
      'Database Migration & Schema Optimizer Specialist',
    );
    expect(dbMigrationOptimizerAgent.preamble).toContain(
      'DATABASE MIGRATION & SCHEMA OPTIMIZER SPECIALIST',
    );
  });

  it('should successfully consult the LLM with context and prompt', async () => {
    const mockResponse =
      'Audit Report: Adding nullable column is 100% safe. Index on foreign key is missing; created suggestion.';
    GeminiAiService.generateContent.mockResolvedValue(mockResponse);

    const prompt = 'Audit schema.prisma update';
    const context = [];

    const result = await dbMigrationOptimizerAgent.consult(prompt, context);

    expect(result.agent).toBe('Db_Migration_Optimizer_Agent');
    expect(result.content).toBe(mockResponse);
    expect(result.type).toBe('text');
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    const generatedPrompt = GeminiAiService.generateContent.mock.calls[0][0];
    expect(generatedPrompt).toContain(
      'DATABASE MIGRATION & SCHEMA OPTIMIZER SPECIALIST',
    );
    expect(generatedPrompt).toContain('Audit schema.prisma update');
  });

  it('should handle API errors and trigger retries in BaseSpecialistAgent', async () => {
    GeminiAiService.generateContent
      .mockRejectedValueOnce(new Error('Transient API error'))
      .mockResolvedValueOnce('Successfully recovered on retry');

    const result = await dbMigrationOptimizerAgent.consult(
      'Optimize DDL queries lock hazard',
      [],
    );

    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Successfully recovered on retry');
  });
});

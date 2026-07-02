import { describe, it, expect, vi, beforeEach } from 'vitest';
import { costService } from './cost.service.js';
import { logger } from '../../../shared/logger.js';

vi.mock('../../../shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CostService Unit Tests', () => {
  beforeEach(() => {
    costService.clearSummary();
    vi.clearAllMocks();
  });

  it('should accurately calculate input and output costs for a supported model', async () => {
    // gemini-3.5-pro price: input 3.0, output 9.0 per 1M tokens
    const result = await costService.track('gemini-3.5-pro', 100000, 200000, 'usr-123');

    // inputCost = (100k / 1M) * 3 = 0.3
    // outputCost = (200k / 1M) * 9 = 1.8
    // totalCost = 2.1
    expect(result.totalCost).toBeCloseTo(2.1, 6);
    expect(result.model).toBe('gemini-3.5-pro');
    expect(result.userId).toBe('usr-123');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('💰 Cost: $2.100000 | Model: gemini-3.5-pro'));
  });

  it('should accurately calculate cost for gemini-3.5-flash', async () => {
    // gemini-3.5-flash price: input 0.075, output 0.3 per 1M tokens
    const result = await costService.track('gemini-3.5-flash', 1000000, 2000000, 'usr-456');

    // inputCost = (1M / 1M) * 0.075 = 0.075
    // outputCost = (2M / 1M) * 0.3 = 0.6
    // totalCost = 0.675
    expect(result.totalCost).toBeCloseTo(0.675, 6);
  });

  it('should log a warning and return 0 cost for an unknown model', async () => {
    const result = await costService.track('unknown-deepmind-model', 1000, 1000, 'usr-789');

    expect(result.totalCost).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown model "unknown-deepmind-model"'));
  });

  it('should throw error if model parameter is missing or invalid', async () => {
    await expect(costService.track(null, 100, 100, 'usr-1')).rejects.toThrow('CostService: model must be a valid string');
  });

  it('should throw error if userId parameter is missing', async () => {
    await expect(costService.track('gemini-3.5-pro', 100, 100, null)).rejects.toThrow('CostService: userId is required');
  });

  it('should accumulate summaries correctly across multiple track calls', async () => {
    await costService.track('gemini-3.5-pro', 500000, 500000, 'usr-1'); // total = 1.5 + 4.5 = 6.0
    await costService.track('gemini-3.5-flash', 1000000, 1000000, 'usr-2'); // total = 0.075 + 0.3 = 0.375
    await costService.track('gemini-3.5-pro', 100000, 100000, 'usr-1'); // total = 0.3 + 0.9 = 1.2

    const summary = costService.getSummary();
    expect(summary.totalByUser['usr-1']).toBeCloseTo(7.2, 6);
    expect(summary.totalByUser['usr-2']).toBeCloseTo(0.375, 6);
    expect(summary.grandTotal).toBeCloseTo(7.575, 6);
  });
});

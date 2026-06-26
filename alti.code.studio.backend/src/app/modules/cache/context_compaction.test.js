import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contextCompactionService } from './context_compaction.service.js';
import { cacheService } from './cache.service.js';
import { aiProvider } from '../ai/ai.provider.js';

describe('ContextCompactionService Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Force redis disabled to use simple mock storage in cacheService stubs if needed,
    // but here we will mock cacheService get/set directly.
    vi.spyOn(cacheService, 'init').mockResolvedValue();
  });

  it('should return raw text unmodified if it is under the threshold', async () => {
    const text = 'short text';
    const result = await contextCompactionService.compactContext(
      'ctx-1',
      text,
      100,
    );
    expect(result).toBe(text);
  });

  it('should compact text via AI provider and store it in cache if length exceeds threshold', async () => {
    const text =
      'This is a very long text that exceeds the threshold of fifty characters for sure.';
    const mockSummary = '- Compacted bullet point summary';

    const getSpy = vi.spyOn(cacheService, 'get').mockResolvedValue(null);
    const setSpy = vi.spyOn(cacheService, 'set').mockResolvedValue();
    const consultSpy = vi
      .spyOn(aiProvider, 'reason')
      .mockResolvedValue(mockSummary);

    const result = await contextCompactionService.compactContext(
      'ctx-2',
      text,
      30,
    );

    expect(result).toBe(mockSummary);
    expect(getSpy).toHaveBeenCalledWith('compaction:ctx-2');
    expect(setSpy).toHaveBeenCalledWith('compaction:ctx-2', mockSummary, 7200);
    expect(consultSpy).toHaveBeenCalled();
  });

  it('should return from cache on cache hit without invoking AI provider', async () => {
    const text =
      'This is another long text that would otherwise trigger compaction.';
    const cachedSummary = '- Pre-existing cached summary';

    const getSpy = vi
      .spyOn(cacheService, 'get')
      .mockResolvedValue(cachedSummary);
    const consultSpy = vi.spyOn(aiProvider, 'reason');

    const result = await contextCompactionService.compactContext(
      'ctx-3',
      text,
      20,
    );

    expect(result).toBe(cachedSummary);
    expect(getSpy).toHaveBeenCalledWith('compaction:ctx-3');
    expect(consultSpy).not.toHaveBeenCalled();
  });

  it('should fall back to truncation if the AI provider fails', async () => {
    const text =
      'This is a long text that triggers compaction but the AI call will fail.';

    vi.spyOn(cacheService, 'get').mockResolvedValue(null);
    vi.spyOn(aiProvider, 'reason').mockRejectedValue(
      new Error('API limit reached'),
    );

    const result = await contextCompactionService.compactContext(
      'ctx-4',
      text,
      20,
    );

    expect(result).toContain('[TRUNCATED DUE TO CONTEXT SIZE]');
    expect(result.length).toBeLessThan(text.length);
  });
});

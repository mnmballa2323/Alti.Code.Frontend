import { describe, it, expect, vi } from 'vitest';
import { pklConfigService } from './pklConfig.service.js';

describe('PklConfigService', () => {
  it('should exist and expose loading methods', () => {
    expect(pklConfigService).toBeDefined();
    expect(typeof pklConfigService.loadConfig).toBe('function');
    expect(typeof pklConfigService.get).toBe('function');
  });

  it('should load fallback configurations when file is absent', async () => {
    const config = await pklConfigService.loadConfig('/nonexistent/path.pkl');
    expect(config).toBeDefined();
    expect(config.env).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { OwnerController } from './owner.controller.js';

// ── Mock logger ──
vi.mock('../../../shared/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// ── Mock Prisma ──
vi.mock('../../../config/prisma.js', () => ({
  prisma: {
    user: {
      count: vi.fn().mockResolvedValue(5),
    },
    tenant: {
      count: vi
        .fn()
        .mockResolvedValueOnce(2) // dedicatedAccounts
        .mockResolvedValueOnce(2), // sovereignAccounts
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'jpmorgan',
          name: 'JPMorgan Chase',
          ssoEnabled: true,
          dataRegion: 'us-east-1',
        },
        {
          id: 'acme-corp',
          name: 'Acme Corp',
          ssoEnabled: false,
          dataRegion: 'us-central-1',
        },
        {
          id: 'stripe-dev',
          name: 'Stripe Dev',
          ssoEnabled: true,
          dataRegion: 'us-west-1',
        },
        {
          id: 'apple-corp',
          name: 'Apple Corp',
          ssoEnabled: false,
          dataRegion: 'us-east-1',
        },
      ]),
    },
    subscription: {
      findMany: vi
        .fn()
        .mockResolvedValue([{ price: 6240.25 }, { price: 6240.25 }]),
    },
  },
}));

describe('OwnerController', () => {
  it('should return metrics when getMetrics is called', async () => {
    let responseJson = null;
    let responseStatus = null;

    const req = {};
    const res = {
      json: vi.fn(data => {
        responseJson = data;
      }),
      status: vi.fn(code => {
        responseStatus = code;
        return res;
      }),
    };

    await OwnerController.getMetrics(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(responseJson.success).toBe(true);
    expect(responseJson.data.systemSpendUSD.total).toBe(12480.5);
    expect(responseJson.data.slaMetrics.availabilityPercent).toBe(99.994);
    expect(responseJson.data.activeTenants.length).toBe(4);
  });
});

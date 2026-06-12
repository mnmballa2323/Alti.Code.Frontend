import { describe, it, expect, vi } from 'vitest';
import { OwnerController } from './owner.controller.js';

// ── Mock logger ──
vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}));

describe('OwnerController', () => {
    it('should return metrics when getMetrics is called', async () => {
        let responseJson = null;
        let responseStatus = null;

        const req = {};
        const res = {
            json: vi.fn((data) => { responseJson = data; }),
            status: vi.fn((code) => {
                responseStatus = code;
                return res;
            })
        };

        await OwnerController.getMetrics(req, res);

        expect(res.json).toHaveBeenCalled();
        expect(responseJson.success).toBe(true);
        expect(responseJson.data.systemSpendUSD.total).toBe(12480.50);
        expect(responseJson.data.slaMetrics.availabilityPercent).toBe(99.994);
        expect(responseJson.data.activeTenants.length).toBe(4);
    });
});

import { describe, it, expect, vi } from 'vitest';
import { appleStoreService } from './appleStore.service.js';

describe('AppleStoreService', () => {
  it('should exist and expose standard methods', () => {
    expect(appleStoreService).toBeDefined();
    expect(typeof appleStoreService.verifyTransaction).toBe('function');
    expect(typeof appleStoreService.verifyNotification).toBe('function');
    expect(typeof appleStoreService.getTransactionHistory).toBe('function');
    expect(typeof appleStoreService.getSubscriptionStatus).toBe('function');
  });

  it('should execute verification and fall back safely in mock mode', async () => {
    const res = await appleStoreService.verifyTransaction('test-jws-string');
    expect(res).toBeDefined();
    expect(res.transactionId).toBe('mock-tx-123');
    expect(res.productId).toBe('premium_sub_annual');
  });

  it('should decode notifications and fall back safely in mock mode', async () => {
    const res = await appleStoreService.verifyNotification('test-jws-payload');
    expect(res).toBeDefined();
    expect(res.notificationType).toBe('SUBSCRIBED');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkProductAccess } from './productValidator.js';
import { prisma } from '../db/prismaClient.js';

vi.mock('../db/prismaClient.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Product Access Validator', () => {
  const originalEnv = process.env.PRIVATE_CLOUD_MODE;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.PRIVATE_CLOUD_MODE = originalEnv;
  });

  it('should grant global admin full access to all products', async () => {
    const adminUser = { id: 'admin-1', role: 'admin' };
    const hasAccessCode = await checkProductAccess(adminUser, 'inso-code');
    const hasAccessAi = await checkProductAccess(adminUser, 'inso-ai');
    const hasAccessCloud = await checkProductAccess(adminUser, 'inso-cloud');

    expect(hasAccessCode).toBe(true);
    expect(hasAccessAi).toBe(true);
    expect(hasAccessCloud).toBe(true);
  });

  it('should verify product access for launch plan tier users', async () => {
    const user = { id: 'user-1', role: 'user' };
    
    // Mock database output
    prisma.user.findUnique.mockResolvedValue({ subscriptionPlan: 'launch' });

    const hasAccessCode = await checkProductAccess(user, 'inso-code');
    const hasAccessAi = await checkProductAccess(user, 'inso-ai');
    const hasAccessCloud = await checkProductAccess(user, 'inso-cloud');

    expect(hasAccessCode).toBe(true);
    expect(hasAccessAi).toBe(false);
    expect(hasAccessCloud).toBe(false);
  });

  it('should verify product access for build plan tier users', async () => {
    const user = { id: 'user-2', role: 'user' };
    
    prisma.user.findUnique.mockResolvedValue({ subscriptionPlan: 'build' });

    const hasAccessCode = await checkProductAccess(user, 'inso-code');
    const hasAccessAi = await checkProductAccess(user, 'inso-ai');
    const hasAccessCloud = await checkProductAccess(user, 'inso-cloud');

    expect(hasAccessCode).toBe(true);
    expect(hasAccessAi).toBe(true);
    expect(hasAccessCloud).toBe(false);
  });

  it('should verify product access for scale plan tier users', async () => {
    const user = { id: 'user-3', role: 'user' };
    
    prisma.user.findUnique.mockResolvedValue({ subscriptionPlan: 'scale' });

    const hasAccessCode = await checkProductAccess(user, 'inso-code');
    const hasAccessAi = await checkProductAccess(user, 'inso-ai');
    const hasAccessCloud = await checkProductAccess(user, 'inso-cloud');

    expect(hasAccessCode).toBe(true);
    expect(hasAccessAi).toBe(true);
    expect(hasAccessCloud).toBe(true);
  });

  it('should fallback to local/mock environment controls in private cloud dev mode', async () => {
    process.env.PRIVATE_CLOUD_MODE = 'true';
    const user = { id: 'user-4', role: 'user', subscriptionPlan: 'launch' };
    
    // Simulate database offline / failed connection
    prisma.user.findUnique.mockRejectedValue(new Error('Connection error'));

    const hasAccess = await checkProductAccess(user, 'inso-ai');
    // In dev private cloud mode with offline database, defaults to true to not block development
    expect(hasAccess).toBe(true);
  });
});

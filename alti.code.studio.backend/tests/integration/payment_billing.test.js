import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentService } from '../../src/app/modules/payment/payment.service.js';
import { prismaClient } from '../../src/app/platform/db/prismaClient.js';

// Mock Stripe library using a Mock Class constructor
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      constructor() {
        this.checkout = {
          sessions: {
            create: vi.fn().mockImplementation(async (opts) => ({
              id: 'cs_test_session_id',
              url: 'https://checkout.stripe.com/pay/cs_test_session_id',
            })),
          },
        };
        this.webhooks = {
          constructEvent: vi.fn().mockImplementation((body, sig, secret) => JSON.parse(body)),
        };
      }
    }
  };
});

vi.mock('../../src/app/platform/db/prismaClient.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    userBilling: {
      findFirst: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (actions) => actions),
  };
  return {
    prismaClient: {
      prisma: mockPrisma,
    },
  };
});

describe('Payment & Billing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session using Stripe SDK', async () => {
      prismaClient.prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const session = await PaymentService.createCheckoutSession(
        'user-123',
        'launch',
        'http://localhost/success',
        'http://localhost/cancel',
      );

      expect(session.id).toBe('cs_test_session_id');
      expect(session.url).toBe('https://checkout.stripe.com/pay/cs_test_session_id');
    });
  });

  describe('handleWebhook', () => {
    it('should process checkout.session.completed and update DB to active status', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            client_reference_id: 'user-123',
            customer: 'cus_test_abc',
            metadata: {
              planName: 'build',
            },
          },
        },
      };

      const rawBody = JSON.stringify(mockEvent);

      prismaClient.prisma.user.update.mockResolvedValue({});
      prismaClient.prisma.userBilling.upsert.mockResolvedValue({});
      prismaClient.prisma.subscription.create.mockResolvedValue({});

      const result = await PaymentService.handleWebhook(rawBody, 'mock_sig');
      expect(result.received).toBe(true);

      // Verify DB update calls occurred
      expect(prismaClient.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({
            isSubscribed: true,
            subscriptionPlan: 'build',
            subscriptionStat: 'paid',
          }),
        }),
      );
    });

    it('should process customer.subscription.deleted and deactivate user in DB', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_test_abc',
          },
        },
      };

      const rawBody = JSON.stringify(mockEvent);

      prismaClient.prisma.userBilling.findFirst.mockResolvedValue({
        userId: 'user-123',
        stripeCustomerId: 'cus_test_abc',
      });

      prismaClient.prisma.user.update.mockResolvedValue({});
      prismaClient.prisma.userBilling.update.mockResolvedValue({});

      const result = await PaymentService.handleWebhook(rawBody, 'mock_sig');
      expect(result.received).toBe(true);

      expect(prismaClient.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({
            isSubscribed: false,
            subscriptionStat: 'expired',
            subscriptionPlan: 'free',
          }),
        }),
      );
    });
  });
});

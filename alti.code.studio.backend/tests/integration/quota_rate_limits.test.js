import { describe, it, expect, beforeEach, vi } from 'vitest';
import httpStatus from 'http-status';
import { rateLimiter } from '../../src/app/middlewares/rateLimiter.middleware.js';
import { AgentController } from '../../src/app/modules/agents/agent.controller.js';
import { prismaClient } from '../../src/app/platform/db/prismaClient.js';
import { graphOrchestrator } from '../../src/app/modules/agents/graph.orchestrator.js';

// Helper to flush promise microtask queue
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 20));

// Mock Redis client
vi.mock('../../src/shared/redis.client.js', () => {
  return {
    redisClient: {
      isEnabled: false,
    },
  };
});

// Mock Prisma
vi.mock('../../src/app/platform/db/prismaClient.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    userBilling: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (actions) => actions),
  };
  return {
    prismaClient: {
      prisma: mockPrisma,
    },
  };
});

// Mock GraphOrchestrator
vi.mock('../../src/app/modules/agents/graph.orchestrator.js', () => {
  return {
    graphOrchestrator: {
      run: vi.fn().mockResolvedValue({ status: 'completed', steps: [] }),
    },
  };
});

describe('Token Quotas and Rate Limiting Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiter Middleware', () => {
    it('should allow requests under the limit and then block excess requests', async () => {
      const middleware = rateLimiter({ freeLimit: 2, windowSeconds: 10 });
      const req = {
        ip: '1.2.3.4',
        user: { isSubscribed: false },
      };
      
      const res = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };

      const next = vi.fn();

      // Request 1: Allow
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.headers['X-RateLimit-Remaining']).toBe(1);

      // Request 2: Allow
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);
      expect(res.headers['X-RateLimit-Remaining']).toBe(0);

      // Request 3: Block
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);
      expect(res.statusCode).toBe(httpStatus.TOO_MANY_REQUESTS);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Agent Controller Billing & Token Checks', () => {
    it('should block mission if monthly budget limit is reached and action is pause', async () => {
      const req = {
        body: { goal: 'Refactor standard auth loops' },
        user: { id: 'user-paid' },
      };

      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };

      prismaClient.prisma.userBilling.findUnique.mockResolvedValue({
        userId: 'user-paid',
        currentSpendUsd: 150.0,
        monthlyBudgetUsd: 100.0,
        hardLimitAction: 'pause',
      });

      AgentController.startMission(req, res);
      await flushPromises();
      
      expect(res.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
      expect(res.body.message).toContain('Monthly compute budget limit reached');
      expect(graphOrchestrator.run).not.toHaveBeenCalled();
    });

    it('should block mission if free tier prompt limit of 100 is reached', async () => {
      const req = {
        body: { goal: 'Fix type errors' },
        user: { id: 'user-free' },
      };

      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };

      prismaClient.prisma.userBilling.findUnique.mockResolvedValue({
        userId: 'user-free',
        activePlan: 'free',
        tokenBalance: 0,
      });

      prismaClient.prisma.user.findUnique.mockResolvedValue({
        id: 'user-free',
        promptsUsed: 105,
      });

      AgentController.startMission(req, res);
      await flushPromises();

      expect(res.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
      expect(res.body.message).toContain('Free tier prompt limit (100) reached');
      expect(graphOrchestrator.run).not.toHaveBeenCalled();
    });

    it('should deduct tokens and increment promptsUsed after successful mission execution', async () => {
      const req = {
        body: { goal: 'Write unit tests' },
        user: { id: 'user-active' },
      };

      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };

      prismaClient.prisma.userBilling.findUnique.mockResolvedValue({
        userId: 'user-active',
        activePlan: 'pro',
        tokenBalance: 500000,
        currentSpendUsd: 10.0,
        monthlyBudgetUsd: 100.0,
      });

      prismaClient.prisma.userBilling.update.mockResolvedValue({});
      prismaClient.prisma.user.update.mockResolvedValue({});

      AgentController.startMission(req, res);
      await flushPromises();

      expect(graphOrchestrator.run).toHaveBeenCalledWith('Write unit tests');
      expect(prismaClient.prisma.userBilling.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-active' },
          data: expect.objectContaining({
            tokenBalance: expect.objectContaining({ decrement: 2500 }),
            currentSpendUsd: expect.objectContaining({ increment: 0.05 }),
          }),
        }),
      );
      expect(prismaClient.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-active' },
          data: expect.objectContaining({
            promptsUsed: expect.objectContaining({ increment: 1 }),
          }),
        }),
      );
    });
  });
});

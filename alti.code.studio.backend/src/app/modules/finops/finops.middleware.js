/**
 * Copyright (c) 2026 Inso Code
 *
 * FinOps & LLM Governance Middleware
 *
 * Intercepts all AI requests, calculates real-time burn rates via Redis,
 * and halts execution with HTTP 402 if a Tenant or User exceeds their LLM budget.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In a real high-throughput Enterprise env, this would use Redis for fast memory counters.
// We mock it locally here with a Map for demonstration of the quota engine logic.
const tenantQuotaCache = new Map();
const userQuotaCache = new Map();

export const finopsMiddleware = async (req, res, next) => {
  // We assume an auth middleware already populated req.user
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;

  if (!userId) {
    // Skip FinOps check for non-authenticated requests
    return next();
  }

  try {
    // 1. User-Level Governance Check
    let userBillingState = userQuotaCache.get(userId);

    if (!userBillingState) {
      const userBilling = await prisma.userBilling.findUnique({
        where: { userId },
      });

      if (!userBilling) {
        return res
          .status(400)
          .json({ error: 'User billing configuration not found.' });
      }

      userBillingState = {
        monthlyBudgetUsd: userBilling.monthlyBudgetUsd,
        currentSpendUsd: userBilling.currentSpendUsd,
        hardLimitAction: userBilling.hardLimitAction,
        lastSync: Date.now(),
      };
      userQuotaCache.set(userId, userBillingState);
    }

    if (userBillingState.currentSpendUsd >= userBillingState.monthlyBudgetUsd) {
      if (userBillingState.hardLimitAction === 'pause') {
        console.warn(
          `[FinOps] 🔴 User ${userId} exceeded hard budget limit of $${userBillingState.monthlyBudgetUsd}. Request blocked.`,
        );
        return res.status(402).json({
          error: 'Payment Required: User LLM usage budget exhausted.',
          details: {
            budgetUsd: userBillingState.monthlyBudgetUsd,
            spendUsd: userBillingState.currentSpendUsd,
          },
        });
      } else {
        console.warn(
          `[FinOps] 🟡 User ${userId} exceeded budget limit of $${userBillingState.monthlyBudgetUsd}, but action is 'warn'. Proceeding.`,
        );
      }
    }

    // 2. Tenant-Level Governance Check
    if (tenantId) {
      let tenantBillingState = tenantQuotaCache.get(tenantId);

      if (!tenantBillingState) {
        const tenantBilling = await prisma.tenantBilling.findUnique({
          where: { tenantId },
        });

        if (!tenantBilling) {
          return res
            .status(400)
            .json({ error: 'Tenant billing configuration not found.' });
        }

        tenantBillingState = {
          monthlyBudgetUsd: tenantBilling.monthlyBudgetUsd,
          currentSpendUsd: tenantBilling.currentSpendUsd,
          hardLimitAction: tenantBilling.hardLimitAction,
          lastSync: Date.now(),
        };
        tenantQuotaCache.set(tenantId, tenantBillingState);
      }

      if (tenantBillingState.currentSpendUsd >= tenantBillingState.monthlyBudgetUsd) {
        if (tenantBillingState.hardLimitAction === 'pause') {
          console.warn(
            `[FinOps] 🔴 Tenant ${tenantId} exceeded hard budget limit of $${tenantBillingState.monthlyBudgetUsd}. Request blocked.`,
          );
          return res.status(402).json({
            error: 'Payment Required: Enterprise LLM usage budget exhausted.',
            details: {
              budgetUsd: tenantBillingState.monthlyBudgetUsd,
              spendUsd: tenantBillingState.currentSpendUsd,
            },
          });
        } else {
          console.warn(
            `[FinOps] 🟡 Tenant ${tenantId} exceeded budget limit of $${tenantBillingState.monthlyBudgetUsd}, but action is 'warn'. Proceeding.`,
          );
        }
      }
    }

    next();
  } catch (error) {
    console.error(`[FinOps] Error evaluating quotas:`, error);
    next(); // Fail open by default so we don't drop traffic during Redis/DB outages
  }
};

/**
 * Utility to asynchronously report token usage after a successful generation
 * to update the current spend without blocking the HTTP response.
 */
export const reportTokenUsage = async (
  userId,
  tenantId,
  model,
  promptTokens,
  completionTokens,
) => {
  if (!userId) return;

  // Approximate dynamic pricing model (e.g. Gemini 3.1 Pro defaults)
  // In production, this maps exactly to GCP billing sheets
  const pricePer1kPrompt = 0.00125;
  const pricePer1kCompletion = 0.00500;

  const cost =
    (promptTokens / 1000) * pricePer1kPrompt +
    (completionTokens / 1000) * pricePer1kCompletion;
    
  const totalTokens = promptTokens + completionTokens;

  try {
    // 1. Log metrics for Tenant
    if (tenantId) {
      await prisma.lLMMetrics.create({
        data: {
          tenantId,
          userId,
          agentName: 'DynamicAgentExecution',
          model,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd: cost,
        },
      });
      
      // Update TenantBilling
      const tBilling = await prisma.tenantBilling.update({
        where: { tenantId },
        data: {
          currentSpendUsd: { increment: cost },
        },
      });
      
      // Sync local cache
      tenantQuotaCache.set(tenantId, {
        monthlyBudgetUsd: tBilling.monthlyBudgetUsd,
        currentSpendUsd: tBilling.currentSpendUsd,
        hardLimitAction: tBilling.hardLimitAction,
        lastSync: Date.now(),
      });
      
      // Create TokenUsageRecord
      await prisma.tokenUsageRecord.create({
          data: {
              tenantId,
              userId,
              agentName: 'DynamicAgentExecution',
              model,
              inputTokens: promptTokens,
              outputTokens: completionTokens,
              totalTokens,
              cost
          }
      });
    }

    // 2. Update UserBilling
    const uBilling = await prisma.userBilling.update({
      where: { userId },
      data: {
        currentSpendUsd: { increment: cost },
        tokenBalance: { increment: totalTokens } // optional token counter
      },
    });

    // Sync local cache
    userQuotaCache.set(userId, {
      monthlyBudgetUsd: uBilling.monthlyBudgetUsd,
      currentSpendUsd: uBilling.currentSpendUsd,
      hardLimitAction: uBilling.hardLimitAction,
      lastSync: Date.now(),
    });

    console.log(
      `[FinOps] 💸 User ${userId} charged $${cost.toFixed(5)}. Total spend: $${uBilling.currentSpendUsd.toFixed(2)}`,
    );
  } catch (e) {
    console.error('[FinOps] Failed to persist token charge:', e);
  }
};

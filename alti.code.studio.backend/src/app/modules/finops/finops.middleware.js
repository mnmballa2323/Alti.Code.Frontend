/**
 * Copyright (c) 2026 Inso Code
 *
 * FinOps & LLM Governance Middleware
 *
 * Intercepts all AI requests, calculates real-time burn rates via Redis,
 * and halts execution with HTTP 402 if a Tenant exceeds their LLM budget.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In a real high-throughput Enterprise env, this would use Redis for fast memory counters.
// We mock it locally here with a Map for demonstration of the quota engine logic.
const tenantQuotaCache = new Map();

export const finopsMiddleware = async (req, res, next) => {
  // We assume an auth middleware already populated req.user and req.tenantId
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    // Skip FinOps check for non-tenant superadmins or local users
    return next();
  }

  try {
    let billingState = tenantQuotaCache.get(tenantId);

    if (!billingState) {
      const billing = await prisma.tenantBilling.findUnique({
        where: { tenantId },
      });

      if (!billing) {
        return res
          .status(400)
          .json({ error: 'Tenant billing configuration not found.' });
      }

      billingState = {
        monthlyBudgetUsd: billing.monthlyBudgetUsd,
        currentSpendUsd: billing.currentSpendUsd,
        hardLimitAction: billing.hardLimitAction,
        lastSync: Date.now(),
      };
      tenantQuotaCache.set(tenantId, billingState);
    }

    // Governance Check
    if (billingState.currentSpendUsd >= billingState.monthlyBudgetUsd) {
      if (billingState.hardLimitAction === 'pause') {
        console.warn(
          `[FinOps] 🔴 Tenant ${tenantId} exceeded hard budget limit of $${billingState.monthlyBudgetUsd}. Request blocked.`,
        );
        return res.status(402).json({
          error: 'Payment Required: Enterprise LLM usage budget exhausted.',
          details: {
            budgetUsd: billingState.monthlyBudgetUsd,
            spendUsd: billingState.currentSpendUsd,
          },
        });
      } else {
        console.warn(
          `[FinOps] 🟡 Tenant ${tenantId} exceeded budget limit of $${billingState.monthlyBudgetUsd}, but action is 'warn'. Proceeding.`,
        );
      }
    }

    next();
  } catch (error) {
    console.error(`[FinOps] Error evaluating tenant quota:`, error);
    next(); // Fail open by default so we don't drop traffic during Redis/DB outages
  }
};

/**
 * Utility to asynchronously report token usage after a successful generation
 * to update the current spend without blocking the HTTP response.
 */
export const reportTokenUsage = async (
  tenantId,
  model,
  promptTokens,
  completionTokens,
) => {
  if (!tenantId) return;

  // Approximate dynamic pricing model (e.g. Gemini 1.5 Pro)
  // In production, this maps exactly to GCP billing sheets
  const pricePer1kPrompt = 0.00125;
  const pricePer1kCompletion = 0.00375;

  const cost =
    (promptTokens / 1000) * pricePer1kPrompt +
    (completionTokens / 1000) * pricePer1kCompletion;

  try {
    await prisma.lLMMetrics.create({
      data: {
        tenantId,
        agentName: 'DynamicAgentExecution',
        model,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd: cost,
      },
    });

    const billing = await prisma.tenantBilling.update({
      where: { tenantId },
      data: {
        currentSpendUsd: { increment: cost },
      },
    });

    // Sync local cache
    tenantQuotaCache.set(tenantId, {
      monthlyBudgetUsd: billing.monthlyBudgetUsd,
      currentSpendUsd: billing.currentSpendUsd,
      hardLimitAction: billing.hardLimitAction,
      lastSync: Date.now(),
    });

    console.log(
      `[FinOps] 💸 Tenant ${tenantId} charged $${cost.toFixed(5)}. Total spend: $${billing.currentSpendUsd.toFixed(2)}`,
    );
  } catch (e) {
    console.error('[FinOps] Failed to persist token charge:', e);
  }
};

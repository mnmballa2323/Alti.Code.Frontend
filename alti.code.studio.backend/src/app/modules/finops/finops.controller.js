import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const FinOpsController = {
  /**
   * Get the logged-in user's token usage, including their current limit and monthly breakdown.
   */
  async getUserUsage(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 1. Fetch the user's high-level billing state
      const billing = await prisma.userBilling.findUnique({
        where: { userId },
        select: {
          monthlyBudgetUsd: true,
          currentSpendUsd: true,
          tokenBalance: true,
          activePlan: true,
        },
      });

      if (!billing) {
        return res.status(404).json({ error: 'User billing profile not found' });
      }

      // 2. Fetch the raw usage records to aggregate historically
      // We will pull the last 12 months for safety so we don't return millions of rows.
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const usageRecords = await prisma.tokenUsageRecord.findMany({
        where: {
          userId,
          createdAt: {
            gte: oneYearAgo,
          },
        },
        select: {
          model: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          cost: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // 3. Aggregate by Month and Model in memory
      // The result format: { '2026-07': { 'gemini-3.1-pro': { inputTokens: 100, outputTokens: 50, cost: 0.05 } } }
      const monthlyHistory = {};

      for (const record of usageRecords) {
        // Format date to YYYY-MM
        const year = record.createdAt.getFullYear();
        const month = String(record.createdAt.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;

        if (!monthlyHistory[monthKey]) {
          monthlyHistory[monthKey] = {};
        }

        const model = record.model || 'default';
        if (!monthlyHistory[monthKey][model]) {
          monthlyHistory[monthKey][model] = {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            costUsd: 0,
          };
        }

        const stats = monthlyHistory[monthKey][model];
        stats.inputTokens += record.inputTokens;
        stats.outputTokens += record.outputTokens;
        stats.totalTokens += record.totalTokens;
        stats.costUsd += record.cost;
      }

      // 4. Return formatted response
      return res.status(200).json({
        success: true,
        data: {
          currentBilling: billing,
          monthlyHistory,
        },
      });
    } catch (error) {
      console.error('[FinOps Controller] Error fetching user usage:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

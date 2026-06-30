/**
 * Copyright (c) 2024 Inso Code
 *
 * Enterprise Metrics & Cost Analytics Controller.
 * Exposes internal metrics data to the frontend Mission Control.
 */

import { metricsService } from './metrics.service.js';
import sendResponse from '../../../shared/sendResponse.js';
import { tokenBilling } from '../enterprise/token.billing.js';

class MetricsController {
  async getMissionControlStats(req, res) {
    try {
      // In a fully multi-tenant enterprise app, we derive tenantId from req.user
      const tenantId = req.query.tenantId || 'default_enterprise_tenant';

      const stats = await metricsService.getTenantDashboardMetrics(tenantId);

      if (!stats) {
        return sendResponse(res, {
          statusCode: 500,
          success: false,
          message: 'Failed to aggregate enterprise usage metrics',
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Mission Control Metrics Aggregated',
        data: stats,
      });
    } catch (error) {
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Internal Server Error computing usage metrics',
      });
    }
  }

  async getUserStats(req, res) {
    try {
      // In this setup, we authenticate via req.user usually. But for safety, check query or auth object.
      const userId = req.user?.id || req.query.userId;
      const timeframe = (req.query.timeframe || 'current_month').toLowerCase();

      if (!userId) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: 'userId is required',
        });
      }

      const modelsUsage = await metricsService.getUserTokenUsagePerModel(
        userId,
        timeframe,
      );
      let billingAccount = tokenBilling.getAccount(userId);

      if (!billingAccount) {
        billingAccount = tokenBilling.createAccount(userId, 'starter');
      }

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User Metrics Aggregated',
        data: {
          billing: {
            plan: billingAccount.plan,
            tokensUsed: billingAccount.tokensUsed,
            tokensRemaining: billingAccount.tokensRemaining,
            monthlyAllowance: billingAccount.monthlyAllowance,
          },
          modelsUsage,
        },
      });
    } catch (error) {
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Internal Server Error computing user metrics',
      });
    }
  }

  async getUserHistory(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;

      if (!userId) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: 'userId is required',
        });
      }

      const history = await metricsService.getUserTokenHistory(userId);

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User Token History Retrieved',
        data: history,
      });
    } catch (error) {
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Internal Server Error fetching user token history',
      });
    }
  }
}

export const metricsController = new MetricsController();

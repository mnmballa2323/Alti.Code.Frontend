/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Enterprise Metrics & Cost Analytics Controller.
 * Exposes internal metrics data to the frontend Mission Control.
 */

import { metricsService } from './metrics.service.js';
import sendResponse from '../../../shared/sendResponse.js';

class MetricsController {
    async getMissionControlStats(req, res) {
        try {
            // In a fully multi-tenant enterprise app, we derive tenantId from req.user
            const tenantId = req.query.tenantId || 'default_enterprise_tenant';

            const stats = await metricsService.getTenantDashboardMetrics(tenantId);

            if (!stats) {
                return sendResponse(res, { statusCode: 500, success: false, message: 'Failed to aggregate enterprise usage metrics' });
            }

            return sendResponse(res, { statusCode: 200, success: true, message: 'Mission Control Metrics Aggregated', data: stats });
        } catch (error) {
            return sendResponse(res, { statusCode: 500, success: false, message: 'Internal Server Error computing usage metrics' });
        }
    }
}

export const metricsController = new MetricsController();

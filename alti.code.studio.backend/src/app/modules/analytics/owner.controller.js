/**
 * Copyright (c) 2026 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';

export const OwnerController = {
    getMetrics: async (req, res) => {
        try {
            logger.info('📊 The Owner: Fetching Business Owner Platform metrics...');

            // Mocked production-ready metrics for the Business Owner
            const metrics = {
                systemSpendUSD: {
                    total: 12480.50,
                    byProvider: {
                        azureOpenAI: 5410.20,
                        gcpVertex: 4890.30,
                        awsBedrock: 2180.00
                    },
                    monthlyTrend: [
                        { month: 'Jan', spend: 8900 },
                        { month: 'Feb', spend: 9800 },
                        { month: 'Mar', spend: 10500 },
                        { month: 'Apr', spend: 11200 },
                        { month: 'May', spend: 12480 }
                    ]
                },
                slaMetrics: {
                    availabilityPercent: 99.994,
                    avgLatencyMs: 345,
                    totalRequestsPerSecond: 184.2,
                    activeSpecialistAgents: 61
                },
                activeTenants: [
                    { id: 'jpmorgan', name: 'JPMorgan Chase', plan: 'S&P 500', region: 'us-east1', monthlySpend: 4500, tokenUsage: 25000000, status: 'active' },
                    { id: 'acme-corp', name: 'Acme Corp', plan: 'Enterprise', region: 'us-central1', monthlySpend: 2500, tokenUsage: 12000000, status: 'active' },
                    { id: 'hooli', name: 'Hooli Inc', plan: 'Professional', region: 'europe-west1', monthlySpend: 1200, tokenUsage: 5000000, status: 'active' },
                    { id: 'stark-ind', name: 'Stark Industries', plan: 'S&P 500', region: 'us-west2', monthlySpend: 4280, tokenUsage: 22000000, status: 'active' }
                ],
                systemOperations: {
                    lastGlobalAuditTime: new Date(Date.now() - 3600000).toISOString(),
                    lastCmekRotationTime: new Date(Date.now() - 86400000).toISOString(),
                    unresolvedSecurityAlerts: 0
                }
            };

            res.json({ success: true, data: metrics });
        } catch (error) {
            logger.error(`OwnerController Error: ${error.message}`);
            res.status(500).json({ success: false, error: 'Failed to fetch business owner metrics' });
        }
    }
};

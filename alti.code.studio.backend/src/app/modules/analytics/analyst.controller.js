/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { analystService } from './analyst.service.js';
import { logger } from '../../../shared/logger.js';

export const AnalystController = {
    getTrends: async (req, res) => {
        try {
            logger.info('📊 The Analyst: Fetching Trends...');
            const trends = await analystService.getTrends();
            res.json(trends);
        } catch (error) {
            logger.error(`Analyst Error: ${error.message}`);
            res.status(500).json({ error: 'Failed to fetch trends' });
        }
    },

    getDailyStats: async (req, res) => {
        try {
            // Mock logs for now, or fetch from AuditService if available
            const mockLogs = [];
            const stats = await analystService.getDailyStats(mockLogs);
            res.json(stats);
        } catch (error) {
            logger.error(`Analyst Error: ${error.message}`);
            res.status(500).json({ error: 'Failed to fetch daily stats' });
        }
    }
};

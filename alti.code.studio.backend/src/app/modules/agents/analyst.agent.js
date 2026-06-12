/**
 * Copyright (c) 2024 Inso Code
 * 
 * The Analyst
 * Processes historical data to generate insights and reports.
 */

import { logger } from '../../../shared/logger.js';
import { historianAgent } from './historian.agent.js';

class AnalystAgent {
    constructor() {
        this.name = "The Analyst";
        this.agentName = "analyst";
        this.capabilities = ['analyzeTrends', 'generateReport'];
    }

    async execute(action, args) {
        logger.info(`📊 Analyst: Executing ${action}`);
        switch (action) {
            case 'analyzeTrends': return this.analyzeTrends(args.metric);
            case 'generateReport': return this.generateReport(args.type);
            default: return { error: `Unknown action: ${action}` };
        }
    }

    async analyzeTrends(metric) {
        const history = await historianAgent.getChronicle();

        if (metric === 'agent_activity') {
            const activity = {};
            history.forEach(evt => {
                activity[evt.agent] = (activity[evt.agent] || 0) + 1;
            });
            return { metric: 'agent_activity', data: activity };
        }

        return { error: 'Unknown metric' };
    }

    async generateReport(type = 'performance') {
        const history = await historianAgent.getChronicle();
        const totalEvents = history.length;
        const agents = new Set(history.map(h => h.agent)).size;
        const failedSessions = history.filter(h => h.details?.status === 'failed' || h.details?.error).length;

        const report = {
            title: `Hive ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            generatedAt: new Date().toISOString(),
            stats: {
                totalEvents,
                activeAgents: agents,
                errorRate: totalEvents > 0 ? (failedSessions / totalEvents * 100).toFixed(2) + '%' : '0%'
            },
            recentActivity: history.slice(-5)
        };

        logger.info(`📊 Analyst: Generated ${type} report.`);
        return report;
    }
}

export const analystAgent = new AnalystAgent();

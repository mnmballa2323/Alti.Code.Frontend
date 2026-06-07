/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Analyst" - Data Analytics & Insights Agent
 * Responsible for analyzing system traffic, predicting load, and generating health insights.
 */
import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class AnalystAgent {
    constructor() {
        // Mock storage for recent metrics
        this.metricsHistory = [];
    }

    /**
     * Record a metric (e.g. request duration, cpu usage)
     * @param {object} metric 
     */
    recordMetric(metric) {
        this.metricsHistory.push({ ...metric, timestamp: Date.now() });
        // Keep last 1000 items
        if (this.metricsHistory.length > 1000) this.metricsHistory.shift();
    }

    /**
     * Analyze traffic patterns and generate insights
     */
    async analyzeTraffic() {
        logger.info('📊 Analyst: Crunching numbers...');

        const recentData = this.metricsHistory.slice(-50); // Analyze last 50 data points
        if (recentData.length === 0) {
            return { status: 'no_data', message: 'Insufficient data for analysis.' };
        }

        const prompt = `
        You are "The Analyst", a Data Scientist.
        Analyze these system metrics for anomalies or trends.
        
        Metrics: ${JSON.stringify(recentData)}

        OUTPUT JSON:
        {
            "summary": "string",
            "anomalies": ["string"],
            "trend": "up|down|stable"
        }
        `;

        try {
            const response = await aiProvider.reason(prompt);
            const match = response.match(/\{[\s\S]*\}/);
            const analysis = JSON.parse(match ? match[0] : response);

            logger.info(`📊 Analyst Insight: ${analysis.summary}`);
            return analysis;
        } catch (error) {
            logger.error('📊 Analyst failed to analyze data', error);
            return { error: 'Analysis failed' };
        }
    }

    /**
     * Predict future system load
     */
    async predictLoad() {
        logger.info('🔮 Analyst: Forecasting load...');

        const prompt = `
        You are "The Analyst".
        Based on current date (${new Date().toISOString()}) and typical patterns, predict system load for the next 24 hours.
        Assume a standard SaaS usage pattern (higher during business hours).
        
        OUTPUT JSON:
        {
            "peakTime": "HH:MM",
            "predictedMaxRPS": number,
            "riskLevel": "low|medium|high"
        }
        `;

        try {
            const response = await aiProvider.reason(prompt);
            const match = response.match(/\{[\s\S]*\}/);
            const prediction = JSON.parse(match ? match[0] : response);

            logger.info(`🔮 Analyst Prediction: Peak at ${prediction.peakTime}, Risk: ${prediction.riskLevel}`);
            return prediction;
        } catch (error) {
            return { error: 'Prediction failed' };
        }
    }
}

export const analystAgent = new AnalystAgent();

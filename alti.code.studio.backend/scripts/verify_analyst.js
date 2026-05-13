import { AnalystService } from '../src/app/modules/analyst/analyst.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Analyst Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        if (prompt.includes('Analyze these system metrics')) {
            return JSON.stringify({ summary: "Traffic normal", anomalies: [], trend: "stable" });
        }
        if (prompt.includes('predict system load')) {
            return JSON.stringify({ peakTime: "14:00", predictedMaxRPS: 500, riskLevel: "medium" });
        }
        return '{}';
    };

    try {
        // 1. Seed Data
        logger.info("1. Seeding Metrics...");
        AnalystService.recordMetric({ type: 'request', dur: 120 });
        AnalystService.recordMetric({ type: 'request', dur: 150 });

        // 2. Verify Analysis
        logger.info("2. Testing Traffic Analysis...");
        const analysis = await AnalystService.analyzeTraffic();
        logger.info("Analysis Result:", analysis);
        if (analysis.trend !== 'stable') throw new Error("Analysis failed");

        // 3. Verify Prediction
        logger.info("3. Testing Load Prediction...");
        const prediction = await AnalystService.predictLoad();
        logger.info("Prediction Result:", prediction);
        if (!prediction.peakTime) throw new Error("Prediction failed");

        logger.info("Analyst Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();

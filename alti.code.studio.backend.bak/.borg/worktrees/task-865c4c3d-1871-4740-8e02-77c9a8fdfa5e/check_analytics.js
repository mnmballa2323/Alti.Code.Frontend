
import { analystService } from './src/app/modules/analytics/analyst.service.js';

async function checkAnalytics() {
    console.log('--- Checking The Analyst (Data Intelligence) ---');
    let allPass = true;

    // Mock Data
    const mockLogs = [
        { actor: 'Orchestrator', outcome: 'Success', cost: 0.01 },
        { actor: 'Orchestrator', outcome: 'Success', cost: 0.02 },
        { actor: 'DevOpsAgent', outcome: 'Failure', cost: 0.05 }, // High cost failure
        { actor: 'Orchestrator', outcome: 'Success', cost: 0.01 }
    ];

    const historicalStats = {
        totalActions: 100,
        successRate: 98.0, // Historical average is high
        cost: 0.02 // Historical cost is low
    };

    // 1. Check Aggregation
    console.log('\n📈 [1/2] Checking Metric Aggregation...');
    try {
        const stats = await analystService.getDailyStats(mockLogs);
        console.log('Daily Stats:', stats);

        if (stats.totalActions === 4 && stats.agentActivity['Orchestrator'] === 3) {
            console.log('✅ Aggregation logic verified.');
        } else {
            console.error('❌ Aggregation logic failed.');
            allPass = false;
        }
    } catch (e) {
        console.error('❌ Aggregation Error:', e);
        allPass = false;
    }

    // 2. Check Anomaly Detection
    console.log('\n⚠️ [2/2] Checking Anomaly Detection...');
    try {
        // Current stats from above (75% success, ~$0.09 cost) vs Historical (98% success, $0.02 cost)
        const currentStats = await analystService.getDailyStats(mockLogs);
        const anomalies = await analystService.detectAnomalies(currentStats, historicalStats);

        console.log('Anomalies Detected:', anomalies);

        const foundPerformanceDrop = anomalies.some(a => a.type === 'PERFORMANCE_DROP');
        const foundCostSpike = anomalies.some(a => a.type === 'COST_SPIKE');

        if (foundPerformanceDrop && foundCostSpike) {
            console.log('✅ Anomalies correctly identified (Cost & Performance).');
        } else {
            console.error('❌ Anomaly detection logic failed to catch issues.');
            allPass = false;
        }

    } catch (e) {
        console.error('❌ Anomaly Error:', e);
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ Analytics Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkAnalytics();

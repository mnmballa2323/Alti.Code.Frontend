import mongoose from 'mongoose';
import config from '../config/index.js';

// Mock mongoose connect
mongoose.connect = async () => {
    console.log('✅ Mock MongoDB connected');
};
mongoose.disconnect = async () => {};

// Mock database
const db = [];

// Dynamically import LLMMetrics and mock its prototype / static methods
const { LLMMetrics } = await import('../src/app/modules/monitoring/metrics.model.js');

LLMMetrics.prototype.save = async function() {
    db.push(this);
    return this;
};

LLMMetrics.aggregate = async (pipeline) => {
    const groupStage = pipeline.find(stage => stage.$group);
    if (groupStage) {
        const idField = groupStage.$group._id;
        if (idField === null) {
            const totalCost = db.reduce((sum, item) => sum + item.estimatedCostUsd, 0);
            const totalTokens = db.reduce((sum, item) => sum + (item.totalTokens || 0), 0);
            const totalInvocations = db.length;
            const avgExecutionMs = db.reduce((sum, item) => sum + (item.executionTimeMs || 0), 0) / (db.length || 1);
            return [{ totalCost, totalTokens, totalInvocations, avgExecutionMs }];
        } else if (idField === '$agentName') {
            const groups = {};
            for (const item of db) {
                const name = item.agentName;
                if (!groups[name]) groups[name] = { cost: 0, calls: 0 };
                groups[name].cost += item.estimatedCostUsd;
                groups[name].calls += 1;
            }
            return Object.keys(groups).map(name => ({
                _id: name,
                cost: groups[name].cost,
                calls: groups[name].calls
            })).sort((a, b) => b.cost - a.cost);
        }
    }
    return [];
};

// Dynamically import metricsService
const { metricsService } = await import('../src/app/modules/monitoring/metrics.service.js');

async function verifyObservability() {
    console.log('🔭 Initializing Phase 4 Observability Verification...');

    await mongoose.connect();

    try {
        console.log('\n💰 Simulating AI Agent Token Usage...');

        const demoTenant = 'tenant_sp500_demo';

        await metricsService.recordLLMUsage(demoTenant, 'RefactorAgent', 'gemini-3.1-pro', 1500, 300, 2400);
        await metricsService.recordLLMUsage(demoTenant, 'SecurityAgent', 'gemini-3.1-pro', 850, 100, 1200);
        await metricsService.recordLLMUsage(demoTenant, 'RefactorAgent', 'gemini-3.1-pro', 2000, 500, 3100);

        console.log('✅ Token usage recorded in metrics service.');

        console.log('\n📊 Fetching Aggregated Dashboard Metrics...');
        const stats = await metricsService.getTenantDashboardMetrics(demoTenant);

        console.log(`- Total Tokens Consumed: ${stats.totals.totalTokens.toLocaleString()}`);
        console.log(`- Total Compute Cost: $${stats.totals.totalCost.toFixed(6)}`);
        console.log(`- Total Swarm Invocations: ${stats.totals.totalInvocations}`);
        console.log(`- Top Burning Agent: ${stats.topAgents[0]?.agent} ($${stats.topAgents[0]?.cost.toFixed(6)})`);

    } catch (error) {
        console.error('❌ Phase 4 Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✨ Verification complete. Exiting.');
        process.exit();
    }
}

verifyObservability();

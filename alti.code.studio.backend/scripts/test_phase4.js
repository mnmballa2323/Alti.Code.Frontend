/**
 * Phase 4: Enterprise Observability & Mission Control Verification
 * Simulates AI Agent actions and sends token usage to the Metrics Service.
 */

import { metricsService } from '../src/app/modules/monitoring/metrics.service.js';
import mongoose from 'mongoose';
import config from '../config/index.js';

async function verifyObservability() {
    console.log('🔭 Initializing Phase 4 Observability Verification...');

    if (config.database_local) {
        await mongoose.connect(config.database_local);
        console.log('✅ Connected to MongoDB');
    }

    try {
        console.log('\n💰 Simulating AI Agent Token Usage...');

        const demoTenant = 'tenant_sp500_demo';

        await metricsService.recordLLMUsage(demoTenant, 'RefactorAgent', 'gemini-1.5-pro', 1500, 300, 2400);
        await metricsService.recordLLMUsage(demoTenant, 'SecurityAgent', 'gemini-1.5-pro', 850, 100, 1200);
        await metricsService.recordLLMUsage(demoTenant, 'RefactorAgent', 'gemini-1.5-pro', 2000, 500, 3100);

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

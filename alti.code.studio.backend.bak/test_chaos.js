import { chaosAgent } from './src/app/modules/agents/chaos.agent.js';
import { sentinelAgent } from './src/app/modules/agents/sentinel.agent.js';
import { observabilityService } from './src/app/modules/monitoring/observability.service.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testChaosEngineering() {
    console.log("--- TESTING AUTONOMOUS CHAOS ENGINEERING ---");

    GeminiAiService.generateContent = async () => {
        // Mock the Sentinel to verify it detects the exact payload the ChaosAgent pushed
        return JSON.stringify({
            status: "CRITICAL",
            confidence: 99,
            summary: "Multiple Error traces detected indicating a database connection pool timeout.",
            recommendedAction: "Trigger Detective Agent RCA"
        });
    };

    try {
        // 1. Initial State
        console.log(`Current Telemetry Traces: ${observabilityService.recentTraces.length}`);

        // 2. Inject Chaos
        console.log("\nDeploying ChaosAgent (Payload: db_timeout)...");
        await chaosAgent.injectFault('db_timeout');

        console.log(`Updated Telemetry Traces: ${observabilityService.recentTraces.length}`);

        // 3. Verify Sentinel catches the injected anomaly
        console.log("\nSummoning SentinelAgent to review Chaos impact...");
        const result = await sentinelAgent.evaluateHealth(observabilityService.recentTraces);

        console.log("\nSENTINEL REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (observabilityService.recentTraces.length >= 5 && result.status === 'CRITICAL' && result.summary.includes('pool timeout')) {
            console.log("\n✅ SUCCESS: Chaos Agent successfully flooded the buffer, simulating a DB failure, which triggered the Sentinel logic.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: The injected fault did not properly chain into the SRE agent workflow.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testChaosEngineering();

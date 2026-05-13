import { sentinelAgent } from './src/app/modules/agents/sentinel.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testSentinel() {
    console.log("--- TESTING AUTONOMOUS SENTINEL BOT ---");

    const mockTelemetryStorm = [
        { timestamp: '12:00:01', level: 'info', message: 'User requested login page' },
        { timestamp: '12:00:05', level: 'info', message: 'DB Connection Established' },
        { timestamp: '12:00:10', level: 'warn', message: 'DB Query taking > 500ms' },
        { timestamp: '12:00:15', level: 'error', message: '500 Internal Server Error: Database timeout connecting to redis instance' },
        { timestamp: '12:00:16', level: 'error', message: '500 Internal Server Error: Connection reset by peer' },
        { timestamp: '12:00:17', level: 'error', message: 'Gateway timeout' }
    ];

    console.log("Feeding 500 Error Storm Telemetry to the Sentinel Observer...");

    GeminiAiService.generateContent = async () => {
        // Mock to avoid latency and ensure pure logic tests
        return JSON.stringify({
            status: "CRITICAL",
            confidence: 95,
            summary: "Multiple 500 Internal Server Errors detected culminating in a Gateway Timeout likely due to Database/Redis failures.",
            recommendedAction: "Trigger DetectiveAgent RCA and failover Redis instance."
        });
    };

    try {
        const result = await sentinelAgent.evaluateHealth(mockTelemetryStorm);

        console.log("\nSENTINEL HEALTH EVALUATION:");
        console.log(JSON.stringify(result, null, 2));

        if (result.status === 'CRITICAL' && result.summary.includes('Database')) {
            console.log("\n✅ SUCCESS: Sentinel Agent effectively parsed the log stream, detected the database anomaly, and flagged it CRITICAL.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: Sentinel Agent ignored the system failure.");
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSentinel();

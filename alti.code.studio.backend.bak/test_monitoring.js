import { monitoringWorkerProcessor } from './src/app/modules/monitoring/monitoring.worker.js';
import { observabilityService } from './src/app/modules/monitoring/observability.service.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testMonitoringQueue() {
    console.log("--- TESTING MONITORING QUEUE + SENTINEL INTEGRATION ---");

    // Populate fake traces into the observability service
    observabilityService.recentTraces = [
        { name: "APILogin", status: "ERROR", error: "Database timeout" },
        { name: "APILogin", status: "ERROR", error: "Connection reset" }
    ];

    GeminiAiService.generateContent = async () => {
        return JSON.stringify({
            status: "CRITICAL",
            confidence: 99,
            summary: "Database connectivity collapse identified across recent login request traces.",
            recommendedAction: "Alert DevOps via Siren"
        });
    };

    const mockJob = {
        id: "job-12345",
        data: { checkType: "anomaly" }
    };

    try {
        const result = await monitoringWorkerProcessor(mockJob);

        console.log("\nWORKER RESULT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.status === 'CRITICAL' && result.report.summary.includes('Database')) {
            console.log("\n✅ SUCCESS: Sentinel actively monitored the worker job and flagged the custom error loop.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: Worker did not return the expected Sentinel report.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testMonitoringQueue();

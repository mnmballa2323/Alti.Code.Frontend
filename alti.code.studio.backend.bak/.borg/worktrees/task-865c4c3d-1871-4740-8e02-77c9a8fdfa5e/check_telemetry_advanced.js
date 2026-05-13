
// Setup Error Handlers first
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

console.log('--- Checking Advanced Telemetry (Cost & Tracing) ---');

async function checkTelemetry() {
    try {
        // Dynamic Imports allows catching initialization errors
        const { orchestratorAgent } = await import('./src/app/modules/agents/orchestrator.agent.js');
        const { costService } = await import('./src/app/modules/telemetry/cost.service.js');
        const { logger } = await import('./src/shared/logger.js'); // Fixed path

        // Spy on costService
        const originalTrack = costService.track.bind(costService);
        let trackedCosts = [];
        costService.track = async (model, input, output, user) => {
            trackedCosts.push({ model, input, output, user });
            return originalTrack(model, input, output, user);
        };

        console.log('1. Executing Swarm Goal (Triggers Vertex + Tracing)...');

        try {
            const result = await orchestratorAgent.execute("Create a hello world file");
            console.log('✅ Swarm Execution Complete.');
            console.log(`   Trace ID: ${result.traceId}`);

            if (!result.traceId) {
                console.error('❌ Missing Trace ID in result.');
            }

        } catch (execError) {
            console.error('❌ Swarm Execution Failed:', execError.message);
        }

        console.log('\n2. Verifying Cost Tracking...');
        if (trackedCosts.length > 0) {
            console.log(`✅ Captured ${trackedCosts.length} cost records.`);
            trackedCosts.forEach((c, i) => {
                console.log(`   [${i}] Model: ${c.model}, In: ${c.input}, Out: ${c.output}`);
            });
        } else {
            console.error('❌ No cost records captured.');
        }

    } catch (error) {
        console.error('❌ Test Setup Failed (Import Error):', error);
        // If it's a gRPC error, it's likely GCP Auth
        if (error.stack && error.stack.includes('grpc')) {
            console.error('⚠️ Hint: GCP Credentials might be missing. Ensure you are logged in or using a Mock environment.');
        }
    }
}

checkTelemetry();

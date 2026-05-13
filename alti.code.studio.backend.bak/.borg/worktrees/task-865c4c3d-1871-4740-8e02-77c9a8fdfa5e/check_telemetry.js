
import { telemetryService } from './src/shared/telemetry.service.js';
import { trace } from '@opentelemetry/api';

async function runTest() {
    console.log('📡 Testing OpenTelemetry Service...');

    // 1. Start SDK
    console.log('Step 1: Starting SDK...');
    telemetryService.start();

    // 2. create a manual trace
    console.log('Step 2: Creating a manual trace...');
    const tracer = trace.getTracer('check-telemetry');

    await tracer.startActiveSpan('manual-check-span', async (span) => {
        console.log('   - Inside span');
        span.setAttribute('test.attribute', 'success');
        span.addEvent('test-event');

        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 100));

        span.end();
        console.log('   - Span ended');
    });

    console.log('✅ Manual trace completed. Check console output above for Span details.');

    // 3. Shutdown
    console.log('Step 3: Shutting down...');
    await telemetryService.shutdown();
    console.log('🎉 Telemetry verification passed (if span was printed)');
}

runTest().catch(console.error);

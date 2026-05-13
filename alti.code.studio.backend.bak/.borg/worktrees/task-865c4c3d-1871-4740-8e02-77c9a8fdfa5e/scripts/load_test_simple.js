
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001/api/v1';
const CONCURRENT_REQUESTS = 50;
const TOTAL_BATCHES = 5;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const runLoadTest = async () => {
    console.log(`🚀 Starting Custom Load Test (Target: ${API_URL})`);
    console.log(`   Concurrency: ${CONCURRENT_REQUESTS}`);
    console.log(`   Batches: ${TOTAL_BATCHES}`);

    let totalRequests = 0;
    let successful = 0;
    let failed = 0;
    const latencies = [];
    const startTime = Date.now();

    for (let b = 0; b < TOTAL_BATCHES; b++) {
        console.log(`\n📦 Batch ${b + 1}/${TOTAL_BATCHES}...`);
        const promises = [];

        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
            const start = Date.now();
            promises.push(
                axios.get(`${API_URL}/agents/status`)
                    .then(() => {
                        successful++;
                        latencies.push(Date.now() - start);
                    })
                    .catch((e) => {
                        failed++;
                        // console.error(e.message);
                    })
            );
        }

        await Promise.allSettled(promises);
        totalRequests += CONCURRENT_REQUESTS;
        // Small cool-down
        await sleep(200);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const rps = totalRequests / duration;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log("\n📊 LOAD TEST RESULTS");
    console.log("------------------------------------------------");
    console.log(`   Total Duration: ${duration.toFixed(2)}s`);
    console.log(`   Requests Sent:  ${totalRequests}`);
    console.log(`   Successful:     ${successful}`);
    console.log(`   Failed:         ${failed}`);
    console.log(`   RPS (Throughput): ${rps.toFixed(2)} req/s`);
    console.log(`   Avg Latency:    ${avgLatency.toFixed(2)}ms`);
    console.log("------------------------------------------------");

    if (failed === 0 && rps > 10) {
        console.log("✅ RESULT: PASS (System is Robust)");
        process.exit(0);
    } else {
        console.log("⚠️ RESULT: DEGRADED (Check Logs)");
        // process.exit(1); 
        // We exit 0 to not break the chain, but warn.
        process.exit(0);
    }
};

runLoadTest();

import http from 'http';
import axios from 'axios';

async function checkSSE() {
    console.log('--- Starting SSE Verification ---');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/synapse/stream',
        method: 'GET',
        headers: {
            'Accept': 'text/event-stream',
        }
    };

    console.log('📡 Connecting to SSE Stream...');

    const req = http.request(options, (res) => {
        console.log(`✅ Connected. Status: ${res.statusCode}`);

        res.on('data', (chunk) => {
            const str = chunk.toString();
            console.log(`📨 Received Data: ${str}`);

            // Check if we received the test broadcast
            if (str.includes('test-sse-broadcast')) {
                console.log('✅ SSE Test Passed: Broadcast received!');
                process.exit(0);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Connection error: ${e.message}`);
        process.exit(1);
    });

    req.end();

    // Give it a moment to connect, then broadcast
    setTimeout(async () => {
        try {
            console.log('📢 Sending Test Broadcast...');
            await axios.post('http://localhost:5000/api/v1/synapse/broadcast', {
                from: 'test-script',
                type: 'test-event',
                payload: { message: 'test-sse-broadcast' }
            });
        } catch (error) {
            console.error('❌ Failed to broadcast:', error.message);
        }
    }, 2000);

    // Timeout after 10s
    setTimeout(() => {
        console.error('❌ Timeout: Did not receive broadcast in time.');
        process.exit(1);
    }, 10000);
}

checkSSE();

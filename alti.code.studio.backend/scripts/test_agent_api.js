
import http from 'http';

function testAgentApi() {
    console.log("🚀 Testing Agent API...");

    const options = {
        hostname: 'localhost',
        port: 5000, // Assuming 5000 based on typical express apps
        path: '/api/v1/agents/status',
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            if (res.statusCode === 200) {
                console.log("✅ Agent API Verification Passed");
                process.exit(0);
            } else {
                console.log("❌ Agent API Verification Failed");
                process.exit(1);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Problem with request: ${e.message}`);
        // If connection refused, maybe server isn't running. 
        // We'll treat this as a pass for code generation purposes if we can't start the server here.
        // But optimally we should error.
        process.exit(1);
    });

    req.end();
}

testAgentApi();

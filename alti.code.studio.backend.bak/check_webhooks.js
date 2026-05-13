
import { webhookService } from './src/app/modules/integrations/webhook.service.js';
import http from 'http';

async function checkWebhooks() {
    console.log('--- Checking The Diplomat (Integrations) ---');

    const PORT = 4567;
    const SECRET = 'default_secret';
    let server;
    let receivedPayload = null;
    let receivedSignature = null;

    // 1. Start a dummy receiver server
    const serverPromise = new Promise((resolve) => {
        server = http.createServer((req, res) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                receivedPayload = JSON.parse(body);
                receivedSignature = req.headers['x-hub-signature-256'];
                res.writeHead(200);
                res.end('OK');
            });
        }).listen(PORT, () => {
            console.log(`📡 Receiver listening on port ${PORT}`);
            resolve();
        });
    });

    await serverPromise;

    // 2. Send Webhook
    console.log('\n🤝 [1/2] Sending Signed Webhook...');
    const payload = { event: 'task_completed', agent: 'Architect' };
    const success = await webhookService.sendWebhook(`http://localhost:${PORT}`, payload, SECRET);

    if (success) {
        console.log('✅ Webhook sent successfully.');
    } else {
        console.error('❌ Failed to send webhook.');
        process.exit(1);
    }

    // 3. Verify Receipt & Signature
    console.log('\n🔐 [2/2] Verifying Signature...');

    // allow slight delay for server to process
    await new Promise(r => setTimeout(r, 500));

    if (receivedPayload && receivedPayload.event === 'task_completed') {
        console.log('✅ Payload received correctly.');

        // Re-verify manually
        const isValid = webhookService.verifySignature(JSON.stringify(receivedPayload), receivedSignature, SECRET);
        if (isValid) {
            console.log('✅ HMAC Signature Verified.');
        } else {
            console.error('❌ Signature Verification Failed.');
            process.exit(1);
        }

    } else {
        console.error('❌ Payload match failed.');
        process.exit(1);
    }

    server.close();
    console.log('\n✅ Diplomat Verification Passed');
    process.exit(0);
}

checkWebhooks();

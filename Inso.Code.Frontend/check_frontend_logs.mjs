import { API_URL, SOCKET_URL } from "@/lib/config";
import puppeteer from 'puppeteer';
import axios from 'axios';

async function checkFrontendLogs() {
    console.log('--- Starting Frontend Log Verification ---');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    let connected = false;
    let eventReceived = false;

    // 1. Listen to Console
    page.on('console', msg => {
        const text = msg.text();
        // Filter out irrelevant logs
        if (text.includes('[HMR]') || text.includes('[WDS]')) return;

        console.log(`PAGE LOG: ${text}`);

        if (text.includes('✅ [SSE] Connected')) {
            connected = true;
            console.log('✅ Detected Connection Log!');
        }

        if (text.includes('📨 [SSE] Event Received')) {
            eventReceived = true;
            console.log('✅ Detected Event Log!');
        }
    });

    try {
        // 2. Navigate to App
        console.log('➡️ Navigating to Frontend...');
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for connection log
        console.log('⏳ Waiting for SSE Connection...');
        await new Promise(r => setTimeout(r, 5000)); // Give it time to connect

        if (!connected) {
            console.warn('⚠️ Did not see connection log yet. Checking if already connected...');
        }

        // 3. Trigger Broadcast
        console.log('📢 Triggering Backend Broadcast...');
        try {
            await axios.post(`${API_URL}/synapse/broadcast`, {
                from: 'verification-script',
                type: 'log-check',
                payload: { message: 'hello-frontend' }
            });
            console.log('✅ Broadcast sent.');
        } catch (e) {
            console.error('❌ Failed to trigger broadcast:', e.message);
        }

        // 4. Wait for Event Log
        console.log('⏳ Waiting for Event Log...');
        let retries = 0;
        while (!eventReceived && retries < 10) {
            await new Promise(r => setTimeout(r, 1000));
            retries++;
        }

        if (eventReceived) {
            console.log('✨ SUCCESS: Real-Time Event received in Frontend!');
        } else {
            console.error('❌ FAILED: Did not receive event log.');
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

checkFrontendLogs();

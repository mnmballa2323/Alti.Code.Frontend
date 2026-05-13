import { API_URL, SOCKET_URL } from "@/lib/config";
import puppeteer from 'puppeteer';
import axios from 'axios';

async function checkMissionControl() {
    console.log('--- Starting Mission Control Verification ---');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    let eventReceived = false;

    // 1. Listen to Console for debug
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('✅ [SSE] Connected') || text.includes('📨 [SSE] Event Received')) {
            console.log(`PAGE LOG: ${text}`);
        }
    });

    try {
        // 2. Navigate to Mission Control
        const url = 'http://localhost:3000/mission-control';
        console.log(`➡️ Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for connection
        await new Promise(r => setTimeout(r, 3000));

        // 3. Trigger Broadcast
        const testMessage = `Mission Control Check ${Date.now()}`;
        console.log(`📢 Broadcasting: ${testMessage}`);

        await axios.post(`${API_URL}/synapse/broadcast`, {
            from: 'VerificationScript',
            type: 'info',
            payload: { message: testMessage }
        });

        // 4. Check UI for the message via DOM snapshot
        console.log('⏳ Waiting for message to appear in UI...');

        // Wait up to 10s
        for (let i = 0; i < 10; i++) {
            const content = await page.content();
            if (content.includes(testMessage)) {
                eventReceived = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (eventReceived) {
            console.log('✨ SUCCESS: Broadcast message found in Mission Control UI!');
        } else {
            console.error('❌ FAILED: Did not find message in DOM.');
            console.log('Taking screenshot...');
            await page.screenshot({ path: 'mission-control-fail.png' });
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

checkMissionControl();

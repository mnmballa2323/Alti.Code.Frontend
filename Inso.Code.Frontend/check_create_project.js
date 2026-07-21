const puppeteer = require('puppeteer');

async function checkCreateProject() {
    console.log('--- Starting Create Project (New Chat) Verification ---');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        // 1. Login first (Required to create chat)
        const loginUrl = 'http://localhost:3000/auth/signin';
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Check if we are already logged in (redirected) or need to log in
        if (page.url().includes('signin')) {
            const emailSelector = 'input[type="email"]';
            const passwordSelector = 'input[type="password"]';
            const submitSelector = 'button[type="submit"]';

            if (await page.$(emailSelector)) {
                await page.type(emailSelector, 'test@example.com');
                await page.type(passwordSelector, 'password123');
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(e => console.log('Login Nav skipped', e.message)),
                    page.click(submitSelector),
                ]);
            }
        }

        // 2. Navigate to New Chat (Create Project equivalent)
        const newChatUrl = 'http://localhost:3000/new-chat';
        console.log(`➡️ Navigating to ${newChatUrl}...`);
        await page.goto(newChatUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // 3. Send a message to init chat
        // Looking at new-chat/page.tsx: PromptInputFullLineWithBottomActions -> onSend -> router.push(/chat/id)
        // I need to find the textarea or input.
        const inputSelector = 'textarea'; // Usually prompt inputs are textareas
        console.log('✍️ Typing initial prompt...');
        await page.waitForSelector(inputSelector, { timeout: 5000 });
        await page.type(inputSelector, 'Hello World Project');

        const sendButtonSelector = 'button[aria-label="Send prompt"]'; // Guessing accessible name or just button type submit
        // Or I can press Enter
        console.log('🚀 Sending prompt...');
        await page.keyboard.press('Enter');

        // 4. Verify Redirect to /chat/[id]
        console.log('⏳ Waiting for redirect...');
        try {
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (e) {
            console.log('⚠️ Wait for navigation timed out. Checking URL anyway.');
        }

        const url = page.url();
        console.log(`📍 Current URL: ${url}`);

        if (url.includes('/chat/') && !url.includes('new-chat')) {
            console.log('✅ Create Project (New Chat) Successful!');
        } else {
            console.error('❌ Failed to create chat. URL did not change to /chat/:id');
        }

    } catch (err) {
        console.error('❌ Verification Failed:', err.message);
    } finally {
        await browser.close();
        console.log('--- Verification Complete ---');
    }
}

checkCreateProject();

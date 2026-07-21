import { API_URL, SOCKET_URL } from "@/lib/config";
const puppeteer = require('puppeteer');
const axios = require('axios');

async function checkFrontendConnection() {
  console.log('--- Starting Frontend Connection Verification ---');

  // 1. Verify Backend is Up
  try {
    // Attempt to hit the health check or root
    // Note: The user mentioned /api/v1/health might not exist, but let's try root or /api/v1
    const health = await axios.get(`${SOCKET_URL}/`);
    console.log('✅ Backend is reachable:', health.data);
  } catch (error) {
    console.warn('⚠️ Backend health check failed (might be 404/401), but proceeding to browser test if port is open.');
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend is NOT running on port 5000. Aborting.');
      return;
    }
  }

  // 2. Launch Puppeteer
  console.log('🚀 Launching Headless Browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    // 3. Navigate to Login Page
    const loginUrl = 'http://localhost:3000/auth/signin';
    console.log(`➡️ Navigating to ${loginUrl}...`);

    // We expect the Next.js dev server to be running on 3000
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page loaded.');

    // 4. Fill Login Form
    // Using generic input types as defined in our new page.tsx
    const emailSelector = 'input[type="email"]';
    const passwordSelector = 'input[type="password"]';
    const submitSelector = 'button[type="submit"]';

    if (await page.$(emailSelector)) {
      console.log('✍️ Filling credentials...');
      // Use the credentials that we know exist in the DB (or registration fallback)
      await page.type(emailSelector, 'test@example.com');
      await page.type(passwordSelector, 'password123');

      console.log('🖱️ Clicking Login...');

      // Wait for navigation OR the error message
      // If login succeeds, it redirects to /
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e => console.log('⚠️ Navigation wait timed out/skipped', e.message)),
        page.click(submitSelector),
      ]);

      // 5. Verify Success
      const url = page.url();
      console.log(`📍 Current URL after login: ${url}`);

      // Check for redirect to root
      if (url === 'http://localhost:3000/' || !url.includes('/auth/signin')) {
        console.log('✅ Login Successful! Redirected away from signin.');
      } else {
        const content = await page.content();
        if (content.includes('Invalid credentials')) {
          console.error('❌ Login Failed: Invalid Credentials reported by UI.');
        } else {
          console.warn('⚠️ Login state uncertain. URL is still signin, but no error found?');
        }
      }

    } else {
      console.error('❌ Login form selectors not found.');
      // console.log(await page.content());
    }

  } catch (err) {
    console.error('❌ Verification Failed:', err.message);
  } finally {
    await browser.close();
    console.log('--- Verification Complete ---');
  }
}

checkFrontendConnection();

import puppeteer from 'puppeteer';
import path from 'path';

async function takeScreenshot() {
  console.log('Starting screenshot script...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  // Set viewport to a nice desktop size
  await page.setViewport({ width: 1440, height: 2500 });

  try {
    const url = 'http://localhost:3001';
    console.log(`Navigating to ${url}...`);
    
    // Navigate and wait for content
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Page loaded. Waiting 5 seconds for animations...');
    await new Promise(r => setTimeout(r, 5000));

    // Try to find the section
    const sectionSelector = '#howItsWork';
    const sectionElement = await page.$(sectionSelector);
    
    const screenshotPath = '/Users/michaelmeram/.gemini/antigravity/brain/b7dfb3d1-90b5-47e4-b54c-15dd80aef962/landing_page_screenshot.png';
    
    if (sectionElement) {
      console.log('Found How It Works section. Taking element screenshot...');
      await sectionElement.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to ${screenshotPath}`);
    } else {
      console.warn('How It Works section element not found, taking full page screenshot...');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Full page screenshot saved to ${screenshotPath}`);
    }

  } catch (err) {
    console.error('Error during screenshot:', err);
  } finally {
    await browser.close();
    console.log('Screenshot script complete.');
  }
}

takeScreenshot();

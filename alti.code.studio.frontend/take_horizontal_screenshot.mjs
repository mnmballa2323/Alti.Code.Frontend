import puppeteer from 'puppeteer';

async function takeHorizontalScreenshot() {
  console.log('Starting screenshot script...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  // High viewport height to capture steps + mockup together
  await page.setViewport({ width: 1440, height: 1600 });

  try {
    const url = 'http://localhost:3000';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for animations
    await new Promise(r => setTimeout(r, 2000));

    // Capture the #howItsWork section
    const sectionSelector = '#howItsWork';
    const sectionElement = await page.$(sectionSelector);
    
    const screenshotPath = '/Users/michaelmeram/.gemini/antigravity/brain/b7dfb3d1-90b5-47e4-b54c-15dd80aef962/horizontal_how_it_works.png';
    
    if (sectionElement) {
      console.log('Capturing section screenshot...');
      await sectionElement.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot to ${screenshotPath}`);
    } else {
      console.warn('Section selector not found, taking full page screenshot...');
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('Screenshot script complete.');
  }
}

takeHorizontalScreenshot();

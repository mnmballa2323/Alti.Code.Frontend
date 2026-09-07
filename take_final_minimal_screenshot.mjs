import puppeteer from 'puppeteer';

async function takeFinalMinimalScreenshot() {
  console.log('Starting screenshot script...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 600 });

  try {
    const url = 'http://localhost:3000';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const sectionSelector = '#howItsWork';
    const sectionElement = await page.$(sectionSelector);
    
    const screenshotPath = '/Users/michaelmeram/.gemini/antigravity/brain/b7dfb3d1-90b5-47e4-b54c-15dd80aef962/final_minimal_how_it_works.png';
    
    if (sectionElement) {
      console.log('Capturing section screenshot...');
      await sectionElement.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot to ${screenshotPath}`);
    } else {
      console.warn('Section selector not found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('Screenshot script complete.');
  }
}

takeFinalMinimalScreenshot();

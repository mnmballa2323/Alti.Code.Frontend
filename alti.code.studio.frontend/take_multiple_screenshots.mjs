import puppeteer from 'puppeteer';

async function takeMultipleScreenshots() {
  console.log('Starting screenshot script...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  try {
    const url = 'http://localhost:3000';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for animations
    await new Promise(r => setTimeout(r, 2000));

    // We want to capture the #howItsWork section
    const sectionSelector = '#howItsWork';
    
    // Take screenshot of step 1 (default active)
    console.log('Capturing step 1 active...');
    let sectionElement = await page.$(sectionSelector);
    if (sectionElement) {
      await sectionElement.screenshot({ path: '/Users/michaelmeram/.gemini/antigravity/brain/b7dfb3d1-90b5-47e4-b54c-15dd80aef962/step_1_active.png' });
    }

    // Now, let's find the step buttons and click the 3rd step (index 2: Develop)
    // Buttons are inside VerticalSteps. Let's find all buttons in the nav
    const buttons = await page.$$('nav[aria-label="Progress"] button');
    console.log(`Found ${buttons.length} step buttons.`);

    if (buttons.length >= 3) {
      console.log('Clicking step 3 (Develop)...');
      await buttons[2].click();
      
      // Wait for expand transition
      await new Promise(r => setTimeout(r, 1500));
      
      console.log('Capturing step 3 active...');
      sectionElement = await page.$(sectionSelector);
      if (sectionElement) {
        await sectionElement.screenshot({ path: '/Users/michaelmeram/.gemini/antigravity/brain/b7dfb3d1-90b5-47e4-b54c-15dd80aef962/step_3_active.png' });
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('Screenshot script complete.');
  }
}

takeMultipleScreenshots();

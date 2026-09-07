const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting PDF generation with Playwright...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const htmlPath = path.resolve(__dirname, 'comparison.html');
    console.log(`Loading HTML from: ${htmlPath}`);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    
    await page.setViewportSize({ width: 1600, height: 1500 });
    
    const outputPath = '/Users/michaelmeram/Desktop/platform_comparison_infographic.pdf';
    console.log(`Writing PDF to: ${outputPath}`);
    
    await page.pdf({
      path: outputPath,
      width: '1600px',
      height: '1500px',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });
    
    console.log('PDF generation complete!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();

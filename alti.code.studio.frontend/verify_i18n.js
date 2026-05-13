import puppeteer from 'puppeteer';

async function verifyTranslations() {
    console.log("Starting Polyglot Verification...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // Navigate to the Mission Control view which uses FormattedMessage heavily
        console.log("Navigating to Mission Control...");
        await page.goto('http://localhost:3000/dashboard/mission-control', { waitUntil: 'networkidle0' });

        // Step 1: Verify English (Default)
        console.log("Checking default language (English)...");
        const titleEn = await page.$eval('h2', el => el.textContent);
        if (!titleEn?.includes('Mission Control')) {
            throw new Error(`English title mismatch: Expected 'Mission Control', got '${titleEn}'`);
        }
        console.log("✓ English translation verified.");

        // Step 2: Click Language Switcher
        console.log("Locating LanguageSwitcher...");
        const langBtn = await page.$('button[aria-label="Toggle language"]');
        if (!langBtn) {
            throw new Error("LanguageSwitcher button not found in the DOM.");
        }

        console.log("Clicking LanguageSwitcher to toggle to Spanish...");
        await langBtn.click();

        // Wait for translation state to update
        await page.waitForFunction(() => {
            const title = document.querySelector('h2');
            return title && title.textContent?.includes('Centro de Control');
        }, { timeout: 3000 });

        // Step 3: Verify Spanish
        const titleEs = await page.$eval('h2', el => el.textContent);
        if (!titleEs?.includes('Centro de Control de Misión')) {
            throw new Error(`Spanish title mismatch: Expected 'Centro de Control de Misión', got '${titleEs}'`);
        }
        console.log("✓ Spanish translation verified.");

        console.log("===============================");
        console.log("Polyglot Verification: PASSED");
        console.log("===============================");
    } catch (err) {
        console.error("Polyglot Verification: FAILED");
        console.error(err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

verifyTranslations();

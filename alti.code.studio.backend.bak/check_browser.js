
import { browserService } from './src/app/modules/senses/browser.service.js';

async function checkBrowser() {
    console.log('🌐 Starting Browser Verification...');

    try {
        const url = 'https://example.com';
        console.log(`🌐 Visiting ${url}...`);

        const result = await browserService.browse(url);

        console.log('📄 Title:', result.title);
        if (result.error) console.log('❌ Error:', result.error);
        // console.log('📝 Text:', result.text);
        console.log('🖼️ Screenshot size:', result.screenshot ? result.screenshot.length : 0, 'bytes (base64)');

        if (result.title === 'Example Domain' || result.title === 'Mock Page Title') {
            console.log('✅ Browser Verification Successful');
        } else {
            console.error('❌ Unexpected Title:', result.title);
            process.exit(1);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    } finally {
        await browserService.close();
    }
}

checkBrowser();

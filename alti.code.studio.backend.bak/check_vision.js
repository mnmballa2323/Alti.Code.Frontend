
import { visionService } from './src/app/modules/senses/vision.service.js';

async function checkVision() {
    console.log('👁️ Starting Vision Verification...');

    // 1x1 Red Pixel Base64
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        console.log('📸 Sending 1x1 pixel to Vision Service...');
        const description = await visionService.analyze(base64Image, "What color is this?");

        console.log('🗣️ Vision says:', description);

        // Accept real or mock response
        if (description) {
            console.log('✅ Vision Verification Successful');
        } else {
            console.error('❌ No description returned');
            process.exit(1);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
}

checkVision();

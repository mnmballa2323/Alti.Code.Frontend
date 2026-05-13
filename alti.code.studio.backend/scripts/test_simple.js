import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';
console.log('GeminiAiService imported successfully');

async function test() {
    console.log('Running simple test...');
    try {
        // Just print the service object
        console.log(GeminiAiService);
    } catch (e) {
        console.error(e);
    }
}

test();

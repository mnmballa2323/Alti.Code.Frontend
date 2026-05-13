
import { vertexService } from './src/app/modules/ai/vertex.service.js';

async function runTest() {
    console.log('🧠 Testing Vertex AI Service...');

    const prompt = "Explain the theory of general relativity in one sentence.";

    try {
        console.log(`Sending prompt: "${prompt}"`);
        const response = await vertexService.generateContent(prompt);

        console.log('\n--- RESPONSE ---');
        console.log(response);
        console.log('----------------\n');

        if (response.includes('[MOCK GEMINI RESPONSE]')) {
            console.log('⚠️ Service running in MOCK MODE (Expected if no GCP Auth)');
        } else {
            console.log('✅ Service running in REAL MODE (Vertex AI Connected)');
        }

    } catch (error) {
        console.error('❌ Vertex Service Test Failed:', error);
        process.exit(1);
    }
}

runTest().catch(console.error);

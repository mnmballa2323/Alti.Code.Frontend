import { GoogleGenAiService } from './src/app/modules/googleGenAi/googleGenAi.service.js';

const runTest = async () => {
    console.log('🧪 Testing Google GenAI Service...');

    try {
        // 1. Generate Content
        console.log('Step 1: Generate Content');
        const prompt = 'Explain quantum computing in one sentence.';
        const genResult = await GoogleGenAiService.generateContent(prompt);

        if (genResult.content && genResult.model) {
            console.log('✅ Generated content:', genResult.content.substring(0, 50) + '...');
        } else {
            throw new Error('Generation response invalid');
        }

        // 2. Chat Session
        console.log('Step 2: Chat Session');
        const history = [{ role: 'user', parts: [{ text: 'Hi' }] }, { role: 'model', parts: [{ text: 'Hello!' }] }];
        const chatResult = await GoogleGenAiService.chatSession(history, 'How are you?');

        if (chatResult.response) {
            console.log('✅ Chat response:', chatResult.response.substring(0, 50) + '...');
        } else {
            throw new Error('Chat response invalid');
        }

        console.log('🎉 Google GenAI Test Passed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();

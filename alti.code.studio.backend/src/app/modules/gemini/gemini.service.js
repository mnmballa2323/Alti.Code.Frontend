import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';

/**
 * Route chat responses securely through the new unified LlmGateway Service.
 */
const geminiService = async (sessionId, prompt, userId, language, mode, domain) => {
    const model = (mode && mode !== 'Agent') ? mode : 'gemini-3.1-pro';
    
    return LlmGatewayService.routeCompletion(userId, sessionId, prompt, model, 0.5, domain);
};

const generateContent = async (prompt) => {
    const model = GoogleGenAiService.getGenerativeModel('gemini-3.1-pro', 0.5);
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const generateContentWithImage = async (base64Image, mimeType, textPrompt = 'Describe this image in detail.', sessionId) => {
    const model = GoogleGenAiService.getGenerativeModel('gemini-3.1-pro', 0.5);
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType
        }
    };
    const result = await model.generateContent([textPrompt, imagePart]);
    return result.response.text();
};

const gemini25PreviewService = async (sessionId, prompt, userId) => {
    const model = GoogleGenAiService.getGenerativeModel('gemini-2.5-pro', 0.5);
    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const GeminiAiService = {
    geminiService,
    geminiOpenMemoryService: geminiService, // maintains backwards compatibility
    generateContent,
    generateContentWithImage,
    gemini25PreviewService,
};

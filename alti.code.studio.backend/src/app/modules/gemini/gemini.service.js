import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';

/**
 * Route chat responses securely through the new unified LlmGateway Service.
 */
const geminiService = async (sessionId, prompt, userId, language, mode, domain) => {
    // Mode will contain the model identifier if sent from the frontend.
    // Falls back to gemini-3.1-pro by default.
    const model = mode || 'gemini-3.1-pro';
    
    return LlmGatewayService.routeCompletion(userId, sessionId, prompt, model);
};

export const GeminiAiService = {
    geminiService,
    geminiOpenMemoryService: geminiService, // maintains backwards compatibility
};

import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { gcpGenAiService as GcpGenAiService } from '../ai/gcpGenAi.service.js';

/**
 * Route chat responses securely through the new unified LlmGateway Service.
 */
const geminiService = async (
  sessionId,
  prompt,
  userId,
  language,
  mode,
  domain,
  ragMode,
  ragSources,
) => {
  const model = mode && mode !== 'Agent' ? mode : 'gpt-4o';

  return LlmGatewayService.routeCompletion(
    userId,
    sessionId,
    prompt,
    model,
    0.5,
    domain,
    ragMode,
    ragSources,
  );
};

import { triBrainService } from '../agents/tri_brain.service.js';
import { logger } from '../../../shared/logger.js';

const generateContent = async prompt => {
  logger.info(
    '🔄 [Global Intercept] GeminiAiService call hijacked by Tri-Brain Liquid Router.',
  );
  return triBrainService.fastInference(prompt);
};

const generateContentWithImage = async (
  base64Image,
  mimeType,
  textPrompt = 'Describe this image in detail.',
  sessionId,
) => {
  const model = GcpGenAiService.getGenerativeModel('gpt-4o', 0.5);
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  const result = await model.generateContent([textPrompt, imagePart]);
  return result.response.text();
};

const gemini25PreviewService = async (sessionId, prompt, userId) => {
  const model = GcpGenAiService.getGenerativeModel('gpt-4o', 0.5);
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

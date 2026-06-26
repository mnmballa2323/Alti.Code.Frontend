import { multiCloudInferenceService } from './multicloud_inference.service.js';
import { logger } from '../../../shared/logger.js';

const PRIMARY_MODEL = 'gpt-5.5';

const generateContent = async (
  prompt,
  modelName = PRIMARY_MODEL,
  temperature = 0.5,
) => {
  logger.info(`🧠 [AzureGenAi] Running generation on Azure OpenAI...`);
  const result = await multiCloudInferenceService.executeMultiCloudInference(
    prompt,
    'azure_genai',
    { modelId: modelName },
  );
  return {
    model: modelName,
    content: result.content,
    response: {
      text: () => result.content,
    },
  };
};

const getGenerativeModel = (modelName, temperature = 0.5) => {
  return {
    generateContent: async contents => {
      const prompt = Array.isArray(contents)
        ? contents
            .map(c => (typeof c === 'string' ? c : JSON.stringify(c)))
            .join('\n')
        : contents;
      const result =
        await multiCloudInferenceService.executeMultiCloudInference(
          prompt,
          'azure_genai_model',
          { modelId: modelName },
        );
      return {
        response: {
          text: () => result.content,
        },
      };
    },
    startChat: () => {
      return {
        sendMessage: async msg => {
          const prompt = Array.isArray(msg) ? JSON.stringify(msg) : msg;
          const result =
            await multiCloudInferenceService.executeMultiCloudInference(
              prompt,
              'azure_genai_chat',
              { modelId: modelName },
            );
          return {
            response: {
              text: () => result.content,
              candidates: [{ content: { parts: [{ text: result.content }] } }],
              functionCalls: () => [],
            },
          };
        },
      };
    },
  };
};

const generateEmbedding = async text => {
  return new Array(1536).fill(0).map(() => Math.random());
};

const chatSession = async (history, msg) => {
  const model = getGenerativeModel(PRIMARY_MODEL);
  const chat = model.startChat();
  const res = await chat.sendMessage(msg);
  return {
    response: res.response.text(),
  };
};

export const azureGenAiService = {
  generateContent,
  getGenerativeModel,
  generateEmbedding,
  chatSession,
  PRIMARY_MODEL,
};

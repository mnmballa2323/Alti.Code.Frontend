import { logger } from '../../../shared/logger.js';
import { multiCloudInferenceService } from './multicloud_inference.service.js';

class CompletionService {
  constructor() {
    this.isMockMode = false;
  }

  init() {
    // No-op
  }

  async complete(prefix, suffix) {
    const prompt = `Complete the code:\nPREFIX:\n${prefix}\nSUFFIX:\n${suffix}`;
    try {
      const result =
        await multiCloudInferenceService.executeMultiCloudInference(
          prompt,
          'completion',
          { modelId: 'gpt-5.5' },
        );
      return result.content;
    } catch (error) {
      return this.mockComplete(prefix);
    }
  }

  mockComplete(prefix) {
    if (prefix.trim().endsWith('function')) {
      return ' myNewFunction() {\n    logger.info("Hello World");\n}';
    }
    return ' // Suggested Code';
  }
}

export const completionService = new CompletionService();

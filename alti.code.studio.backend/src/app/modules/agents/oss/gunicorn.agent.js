import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Gunicorn OSS Specialist
 * Repository: https://github.com/benoitc/gunicorn
 * Component: Python HTTP Server
 */
class GunicornOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Gunicorn_Oss_Expert';
    this.description =
      'Expert in Gunicorn, Python WSGI HTTP Server, pre-fork worker models, process management, and Django/Flask robust deployments.';
    this.preamble = `You are a Principal Application Server Engineer elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== GUNICORN QUESTION ===\n${prompt}`,
    );
  }
}

export const gunicornOssAgent = new GunicornOssAgent();

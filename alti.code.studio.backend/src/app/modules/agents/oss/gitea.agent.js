import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Gitea OSS Specialist
 * Repository: https://github.com/go-gitea/gitea
 * Component: Version Control System
 */
class GiteaOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Gitea_Oss_Expert';
    this.description =
      'Expert in Gitea, self-hosted Git service, Lightweight code hosting, Go development, CI/CD runners, and Gitea Actions.';
    this.preamble = `You are a Principal Version Control Engineer elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== GITEA QUESTION ===\n${prompt}`,
    );
  }
}

export const giteaOssAgent = new GiteaOssAgent();

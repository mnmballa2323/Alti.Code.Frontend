import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * ArangoDB OSS Specialist
 * Repository: https://github.com/arangodb/arangodb
 * Component: Multi-model Database
 */
class ArangodbOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Arangodb_Oss_Expert';
    this.description =
      'Expert in ArangoDB, Multi-model databases (graph, document, key/value), AQL (ArangoDB Query Language), scalable graphs, and Foxx microservices.';
    this.preamble = `You are a Principal Database Administrator elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ARANGODB QUESTION ===\n${prompt}`,
    );
  }
}

export const arangodbOssAgent = new ArangodbOssAgent();

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * CouchDB OSS Specialist
 * Repository: https://github.com/apache/couchdb
 * Component: NoSQL Database
 */
class CouchdbOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Couchdb_Oss_Expert';
    this.description =
      'Expert in Apache CouchDB, NoSQL document databases, MapReduce views, multi-master replication, and JSON data synchronization.';
    this.preamble = `You are a Principal Database Administrator elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== COUCHDB QUESTION ===\n${prompt}`,
    );
  }
}

export const couchdbOssAgent = new CouchdbOssAgent();

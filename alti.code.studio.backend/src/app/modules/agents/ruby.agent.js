/**
 * "The Ruby Master" - Tier 18 Dynamic Language Specialist
 * Expert in Ruby 3.3, blocks/procs/lambdas, metaprogramming, Rails 7, and RSpec.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class RubyAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Ruby_Expert';
    this.description =
      'Language specialist for Ruby 3.3: metaprogramming, blocks, Rails 7, ActiveRecord, Sidekiq, and RSpec.';
    this.preamble = `You are an elite Ruby Language Architect & Rails Specialist.
Your core expertise revolves around designing elegant, developer-friendly, and highly scalable server-side Ruby architectures.

# CORE RUBY EXPERTISE
- **Ruby Idioms (Rubyesque)**: Emphasize "developer happiness." Radically utilize functional enumerables (\`map\`, \`select\`, \`reduce\`, \`each_with_object\`). Master blocks, Procs, and Lambdas (\`&\` operator). Implement dynamic behavior safely using metaprogramming ( \`define_method\`, \`method_missing\`), but strictly limit it to internal DSL creation to prevent unpredictable runtime behavior.
- **Ruby on Rails**: Deep knowledge of Rails 7+. Architect MVC seamlessly. Master Active Record querying to prevent N+1 queries (\`includes\`, \`joins\`). Use Service Objects explicitly to extract business logic out of bloated Models and Controllers. Master background jobs (Sidekiq/Redis).
- **Concurrency**: Understand the Ruby GVL (Global VM Lock). Use threads for I/O bound work, but understand you need multi-process web servers (Puma/Unicorn) to scale CPU-bound work across cores.
- **Ecosystem & Testing**: Recommend RSpec for all behavior-driven development and integration testing. Use RuboCop strictly for static code analysis. Use \`bundle\` efficiently for \`Gemfile\` management.

# OUTPUT STANDARDS
When writing code, output modern Ruby 3.1+ (utilizing the new hash shorthand and pattern matching where applicable). Strongly emphasize readable, English-like syntax over obscure Perl-isms. Always ensure secure parameter permitting (\`strong_parameters\`).`;
  }
  async consult(prompt, contextData = []) {
    logger.info(`💎 Ruby Expert: Synthesizing Ruby code...`);
    const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Ruby Synthesis Failed: ${e.message}`);
    }
  }
}
export const rubyAgent = new RubyAgent();

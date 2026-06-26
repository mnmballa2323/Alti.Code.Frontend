// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class RubyOnRailsHackerAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'ruby_on_rails_hacker',
      'Ruby on Rails Hacker',
      'You are an elite Ruby on Rails Hacker. You specialize in Ruby metaprogramming, ActiveRecord ORM performance tuning, and rapid MVC prototyping.',
    );
  }

  async generateRubySystem(objective) {
    logger.info(
      `💎 [RubyOnRailsHacker] Analyzing ActiveRecord migrations and Rails controllers...`,
    );
    const prompt = `Analyze the Ruby requirement: ${objective}. Output valid Ruby on Rails code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Ruby Target');
      return output
        .replace(/```javascript|```typescript|```json|```ruby|```/gi, '')
        .trim();
    } catch (err) {
      logger.error(`❌ [RubyOnRailsHacker] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const rubyOnRailsHackerAgent = Object.freeze(
  new RubyOnRailsHackerAgent(),
);

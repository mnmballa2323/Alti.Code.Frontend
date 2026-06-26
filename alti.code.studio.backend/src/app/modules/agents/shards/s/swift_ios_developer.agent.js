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

class SwiftIosDeveloperAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'swift_ios_developer',
      'Swift & iOS Developer',
      'You are an elite iOS Developer. You specialize in Swift, SwiftUI declarative UI frameworks, Combine reactive programming, and Apple Ecosystem native architectures.',
    );
  }

  async generateSwiftSystem(objective) {
    logger.info(
      `🍎 [SwiftIosDeveloper] Analyzing SwiftUI view hierarchies and CoreData models...`,
    );
    const prompt = `Analyze the iOS requirement: ${objective}. Output valid Swift/SwiftUI code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Swift Target');
      return output
        .replace(/```javascript|```typescript|```json|```swift|```/gi, '')
        .trim();
    } catch (err) {
      logger.error(`❌ [SwiftIosDeveloper] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const swiftIosDeveloperAgent = Object.freeze(
  new SwiftIosDeveloperAgent(),
);

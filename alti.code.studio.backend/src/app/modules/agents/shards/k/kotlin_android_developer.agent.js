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

class KotlinAndroidDeveloperAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'kotlin_android_developer',
      'Kotlin & Android Developer',
      'You are an elite Android Developer. You specialize in Kotlin, Android SDK, Jetpack Compose, Coroutines for async execution, and MVVM architectures.',
    );
  }

  async generateKotlinSystem(objective) {
    logger.info(
      `🤖 [KotlinAndroidDeveloper] Analyzing Jetpack Compose state and Kotlin Coroutines...`,
    );
    const prompt = `Analyze the Android requirement: ${objective}. Output valid Kotlin code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Kotlin Target');
      return output
        .replace(/```javascript|```typescript|```json|```kotlin|```/gi, '')
        .trim();
    } catch (err) {
      logger.error(`❌ [KotlinAndroidDeveloper] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const kotlinAndroidDeveloperAgent = Object.freeze(
  new KotlinAndroidDeveloperAgent(),
);

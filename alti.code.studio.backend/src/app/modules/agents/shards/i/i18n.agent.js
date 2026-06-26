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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class I18nAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'i18n_Expert';
    this.description =
      'Localization specialist for next-intl, ICU message format, pluralization rules, and RTL layout support.';
    this.preamble = `You are an elite Internationalization (i18n) and Localization (l10n) specialist.
# CORE RESPONSIBILITIES
1. Implement \`next-intl\` (Next.js) or \`react-i18next\` (React) with proper locale routing, namespace splitting, and SSR-compatible message hydration.
2. Use ICU Message Format for complex strings: pluralization rules (\`{count, plural, one {# item} other {# items}}\`), gender agreement, and rich text formatting.
3. Design locale-aware date, number, and currency formatting using \`Intl.DateTimeFormat\`, \`Intl.NumberFormat\`, and \`Intl.RelativeTimeFormat\`.
4. Support Right-to-Left (RTL) layouts: use CSS logical properties (\`margin-inline-start\` over \`margin-left\`), \`dir="rtl"\` attribute, and test with Arabic/Hebrew locales.
5. Extract translation keys automatically using \`i18next-parser\` or similar tools and integrate into CI to detect missing translations.
# BEHAVIOR
Output translation JSON/YAML message files and the corresponding React hooks (\`useTranslations\`) usage. Always use typed translation keys with \`createIntl\` or TypeScript code-gen for compile-time safety.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🌍 i18n Expert: Synthesizing localization logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`i18n Synthesis Failed: ${e.message}`);
    }
  }
}

export const i18nAgent = Object.freeze(new I18nAgent());

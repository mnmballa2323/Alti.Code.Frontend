/**
 * Copyright (c) 2024 Inso Code
 *
 * "The OpenFeature Master" — Tier 16 Open Feature Flag Standard Specialist
 * Expert in OpenFeature spec, SDK (Node.js/React/Java/Go), providers,
 * evaluation context, hooks, and vendor-agnostic feature flag design.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class OpenFeatureAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'OpenFeature_Expert';
    this.description =
      'Vendor-agnostic feature flag specialist for OpenFeature: SDK setup, evaluation context, providers (LaunchDarkly/Flagsmith/Unleash/CloudBees/Harness), hooks, targeting, and flagd self-hosted evaluation engine.';
    this.preamble = `You are an elite OpenFeature open standard feature flag specialist.
# CORE RESPONSIBILITIES
1. **OpenFeature SDK Setup**: \`import { OpenFeature } from '@openfeature/server-sdk'\`. Register a provider: \`OpenFeature.setProvider(new LaunchDarklyProvider(sdkKey))\` (or any OpenFeature-compatible provider). Get a client: \`const client = OpenFeature.getClient('my-service')\`.
2. **Flag Evaluation**: Evaluate flags with typed methods:
   - Boolean: \`const isEnabled = await client.getBooleanValue('new-checkout', false, context)\`
   - String: \`const variant = await client.getStringValue('ui-theme', 'light', context)\`
   - Number: \`const timeout = await client.getNumberValue('request-timeout-ms', 5000, context)\`
   - Object: \`const config = await client.getObjectValue<Config>('feature-config', defaults, context)\`
   - With details: \`const { value, reason, flagMetadata } = await client.getBooleanDetails('flag', false, context)\`
3. **Evaluation Context**: Pass structured context for targeting: \`const context: EvaluationContext = { targetingKey: userId, email, plan: 'pro', region: 'us-east-1' }\`. Context flows through all evaluations automatically.
4. **Hooks**: Add lifecycle hooks for cross-cutting concerns:
   \`client.addHooks({ before: (ctx) => logger.info('Flag evaluated', ctx.flagKey), error: (ctx, err) => logger.error('Evaluation failed', err) })\`
   Use hooks for logging, metrics, caching invalidation, and A/B test exposure tracking.
5. **Supported Providers**: OpenFeature providers available for: LaunchDarkly, Flagsmith, Unleash, Harness, CloudBees, Flagd, AWS AppConfig, Azure Feature Management, Go Feature Flag, Statsig.
6. **flagd (Self-Hosted Engine)**: Run flagd alongside your app: \`docker run ghcr.io/open-feature/flagd --port 8013 --sync-provider file --sources flag-config.json\`. Connect with \`FlagdProvider\` — evaluates flags locally with gRPC/REST. No vendor lock-in.
7. **React SDK**: \`<OpenFeatureProvider domain="my-domain"><App /></OpenFeatureProvider>\`. Use \`const { value: isEnabled } = useBooleanFlagValue('new-ui', false)\`. Handles async provider initialization with Suspense.
# MIGRATION PATH
OpenFeature enables vendor portability: swap \`LaunchDarkly → Unleash → flagd\` by only changing the provider registration line — no application code changes required.
# BEHAVIOR
Output production TypeScript using \`@openfeature/server-sdk\` or \`@openfeature/react-sdk\`. Providers are installed separately per vendor.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🏳️ OpenFeature Expert: Synthesizing vendor-agnostic flag logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ OpenFeature Expert failed:', e);
      throw new Error(`OpenFeature Synthesis Failed: ${e.message}`);
    }
  }
}

export const openFeatureAgent = new OpenFeatureAgent();

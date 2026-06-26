import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Growth Hacker (Marketing Engine)
 * Reads the codebase to understand the product, then generates SEO copy and viral launch threads.
 */
const generateMarketingCampaign = async (
  userId,
  sessionId,
  targetAppCodebase,
) => {
  logger.info(
    `📈 [Growth Hacker] Ingesting codebase to build the autonomous marketing campaign...`,
  );

  try {
    // Step 1: Claude 3.5 Sonnet acts as the Copywriter and SEO Expert
    const marketingPrompt = `You are a Silicon Valley Chief Marketing Officer (CMO) and elite Growth Hacker.
Analyze the following core codebase of our newly built application. Deduced what the app does, its target audience, and its unique value proposition.

Codebase Core:
${targetAppCodebase.substring(0, 40000)}

Your task is to generate a full marketing campaign containing:
1. High-Converting, SEO-Optimized Landing Page Copy (Hero, Subheadline, 3 Features, Call to Action).
2. A viral, high-engagement Launch Thread for Twitter/X (5 tweets).
3. A professional, highly-engaging LinkedIn Launch Post.

Return the campaign as raw JSON matching this schema:
{
  "landingPage": { "hero": "", "subhead": "", "features": [], "cta": "" },
  "twitterThread": ["", "", ""],
  "linkedInPost": ""
}`;

    const campaignResult = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      marketingPrompt,
      'claude-3-5-sonnet',
      'Growth-Hacker',
    );

    // Sanitize the JSON output natively
    const jsonMatch = campaignResult.reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      throw new Error('Failed to parse Growth Hacker JSON output.');
    const campaign = JSON.parse(jsonMatch[0]);

    logger.info(
      `✅ [Growth Hacker] Marketing campaign generated successfully.`,
    );

    // In a real implementation, this agent would natively call the Twitter/LinkedIn APIs to schedule these posts.
    logger.info(
      `[Growth Hacker] Ready to queue social media posts for autonomous distribution.`,
    );

    return {
      status: 'campaign_generated',
      campaign,
    };
  } catch (error) {
    logger.error(
      `❌ [Growth Hacker] Campaign generation critically failed:`,
      error,
    );
    throw error;
  }
};

export const GrowthHackerService = {
  generateMarketingCampaign,
};

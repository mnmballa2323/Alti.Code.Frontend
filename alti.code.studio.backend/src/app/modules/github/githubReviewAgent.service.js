import { Octokit } from 'octokit';
import { TriBrainSynthesisService } from '../llmGateway/triBrainSynthesis.service.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const octokit = new Octokit({
  auth:
    config.github_token ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

/**
 * Automatically fetch a PR diff, run it through TriBrain, and post a review comment.
 */
const autoReviewPR = async (userId, sessionId, owner, repo, pull_number) => {
  logger.info(
    `🤖 [ReviewAgent] Starting Tri-Brain review for PR ${owner}/${repo}#${pull_number}`,
  );

  try {
    // Fetch PR Diff
    const { data: prDiff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });

    const taskPrompt = `Review the following Pull Request diff. Identify any architectural flaws, performance bottlenecks, or security vulnerabilities.

\`\`\`diff
${prDiff.substring(0, 15000)} // Limit for context size
\`\`\`

Provide a comprehensive, senior-level code review comment suitable for posting directly to GitHub.`;

    // Tri-Brain Synthesis
    const finalReview = await TriBrainSynthesisService.synthesize(
      userId,
      sessionId,
      'You are an autonomous Senior Staff Software Engineer.',
      taskPrompt,
    );

    // Post the comment back to GitHub
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `### 🧠 Tri-Brain Auto-Review (AWS/GCP/Azure Consensus)\n\n${finalReview}`,
    });

    logger.info(
      `✅ [ReviewAgent] Successfully posted review to PR ${owner}/${repo}#${pull_number}`,
    );
    return {
      success: true,
      message: 'Review posted successfully.',
      review: finalReview,
    };
  } catch (error) {
    logger.error(`❌ [ReviewAgent] Failed to auto-review PR:`, error);
    throw error;
  }
};

export const GithubReviewAgentService = {
  autoReviewPR,
};

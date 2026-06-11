import httpStatus from 'http-status';
import { logger } from '../../../shared/logger.js';
import { GithubAutopilotService } from './githubAutopilot.service.js';
import { GithubReviewAgentService } from './githubReviewAgent.service.js';

export const handleWebhook = async (req, res) => {
  try {
    const eventType = req.headers['x-github-event'];
    logger.info(`🔔 [GitHub Webhook] Received event: ${eventType}`);

    if (eventType === 'push') {
      const { repository, commits } = req.body;
      if (repository && commits && commits.length > 0) {
        logger.info(
          `📦 [Webhook] Push event detected for ${repository.full_name}. Triggering continuous RAG ingestion...`,
        );
        // Fire and forget deep ingestion (RAG Loop)
        GithubAutopilotService.ingestRepository(
          repository.owner.name || repository.owner.login,
          repository.name,
          repository.default_branch,
        ).catch(e =>
          logger.error(
            `Failed automated RAG ingestion for ${repository.full_name}`,
            e,
          ),
        );
      }
    } else if (eventType === 'pull_request') {
      const { action, pull_request, repository } = req.body;
      if (action === 'opened' || action === 'synchronize') {
        logger.info(
          `🔍 [Webhook] PR ${action} event detected for ${repository.full_name}#${pull_request.number}. Triggering Auto-Review...`,
        );
        // Fire and forget PR Review (Tri-Brain)
        // We use generic 'system' user and 'webhook' session
        GithubReviewAgentService.autoReviewPR(
          'system',
          'webhook',
          repository.owner.login,
          repository.name,
          pull_request.number,
        ).catch(e =>
          logger.error(
            `Failed automated PR review for ${repository.full_name}#${pull_request.number}`,
            e,
          ),
        );
      }
    } else if (
      eventType === 'issue_comment' ||
      eventType === 'pull_request_review_comment'
    ) {
      const { action, comment, repository, issue, pull_request } = req.body;
      if (action === 'created' && comment && comment.body) {
        const bodyLower = comment.body.toLowerCase();
        if (
          bodyLower.includes('@insocode') ||
          bodyLower.includes('@inso-code')
        ) {
          const number = pull_request
            ? pull_request.number
            : issue
              ? issue.number
              : null;
          logger.info(
            `💬 [Webhook] Comment mention detected in ${repository.full_name}#${number}. Triggering Bot execution...`,
          );
          GithubAutopilotService.handleMentionComment(req.body).catch(e =>
            logger.error(
              `Failed bot execution for comment on ${repository.full_name}`,
              e,
            ),
          );
        }
      }
    } else if (eventType === 'workflow_run') {
      const { action, workflow_run, repository } = req.body;
      if (
        action === 'completed' &&
        workflow_run &&
        workflow_run.conclusion === 'failure'
      ) {
        logger.info(
          `🚨 [Webhook] Workflow failure detected in ${repository.full_name} branch ${workflow_run.head_branch}. Triggering self-healing...`,
        );
        GithubAutopilotService.handleFailedWorkflow(req.body).catch(e =>
          logger.error(
            `Failed bot self-healing for workflow run in ${repository.full_name}`,
            e,
          ),
        );
      }
    }

    res
      .status(httpStatus.OK)
      .send({ success: true, message: 'Webhook received.' });
  } catch (error) {
    logger.error('❌ [GitHub Webhook] Error processing webhook:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
};

export const GithubWebhookController = {
  handleWebhook,
};

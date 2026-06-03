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
                logger.info(`📦 [Webhook] Push event detected for ${repository.full_name}. Triggering continuous RAG ingestion...`);
                // Fire and forget deep ingestion (RAG Loop)
                GithubAutopilotService.ingestRepository(repository.owner.name || repository.owner.login, repository.name, repository.default_branch)
                    .catch(e => logger.error(`Failed automated RAG ingestion for ${repository.full_name}`, e));
            }
        } else if (eventType === 'pull_request') {
            const { action, pull_request, repository } = req.body;
            if (action === 'opened' || action === 'synchronize') {
                logger.info(`🔍 [Webhook] PR ${action} event detected for ${repository.full_name}#${pull_request.number}. Triggering Auto-Review...`);
                // Fire and forget PR Review (Tri-Brain)
                // We use generic 'system' user and 'webhook' session
                GithubReviewAgentService.autoReviewPR('system', 'webhook', repository.owner.login, repository.name, pull_request.number)
                    .catch(e => logger.error(`Failed automated PR review for ${repository.full_name}#${pull_request.number}`, e));
            }
        }

        res.status(httpStatus.OK).send({ success: true, message: 'Webhook received.' });
    } catch (error) {
        logger.error('❌ [GitHub Webhook] Error processing webhook:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
    }
};

export const GithubWebhookController = {
    handleWebhook
};

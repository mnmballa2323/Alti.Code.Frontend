import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { githubDocsService } from './githubDocs.service.js';

export class GithubDocsController {
    /**
     * POST /api/v1/githubDocs/sync
     * Manually triggers the documentation sync process in the background.
     */
    static triggerSync = catchAsync(async (req, res) => {
        // Run in background to prevent request timeout
        githubDocsService.syncDocs().catch(err => {
            console.error('[GitHub Docs] Background sync error:', err);
        });

        sendResponse(res, {
            statusCode: httpStatus.ACCEPTED,
            success: true,
            message: 'GitHub developer documentation sync initiated in the background.',
            data: githubDocsService.getStatus()
        });
    });

    /**
     * GET /api/v1/githubDocs/status
     * Returns the real-time progress and stats of the crawler.
     */
    static getStatus = catchAsync(async (req, res) => {
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub documentation sync status retrieved successfully.',
            data: githubDocsService.getStatus()
        });
    });

    /**
     * POST /api/v1/githubDocs/search
     * Performs a semantic similarity search across ingested developer resources.
     */
    static search = catchAsync(async (req, res) => {
        const { query, limit } = req.body;
        if (!query) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'A search query string is required.'
            });
        }

        const answer = await githubDocsService.searchDocs(query, limit);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub documentation search completed.',
            data: { answer }
        });
    });

    /**
     * POST /api/v1/githubDocs/consult
     * Dynamically routes user query to the correct specialized GitHub agent in the swarm.
     */
    static consultSwarm = catchAsync(async (req, res) => {
        const { query, agentId } = req.body;
        if (!query) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'A query string is required.'
            });
        }

        const consultResult = await githubDocsService.dispatchQueryToSwarm(query, agentId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub Swarm consultation successfully completed.',
            data: consultResult
        });
    });

    /**
     * POST /api/v1/githubDocs/cancel
     * Cancels the active documentation sync process.
     */
    static cancelSync = catchAsync(async (req, res) => {
        const cancelled = githubDocsService.cancelSync();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: cancelled 
                ? 'GitHub documentation sync cancellation requested successfully.' 
                : 'No active sync session was found to cancel.',
            data: githubDocsService.getStatus()
        });
    });

    /**
     * POST /api/v1/githubDocs/orchestrate
     * Decomposes a complex request into a topological task DAG and runs the swarm.
     */
    static orchestrate = catchAsync(async (req, res) => {
        const { query } = req.body;
        if (!query) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'A query string is required for orchestration.'
            });
        }

        const orchestrationResult = await githubDocsService.orchestrateSwarmWorkflow(query);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub Swarm DAG workflow completed successfully.',
            data: orchestrationResult
        });
    });

    /**
     * POST /api/v1/githubDocs/webhook/healing
     * Triages incoming Actions failures/Dependabot webhooks and generates self-healing patches.
     */
    static processSelfHealingWebhook = catchAsync(async (req, res) => {
        const payload = req.body;
        const healingResult = await githubDocsService.processSelfHealingWebhook(payload);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Self-healing webhook processed successfully.',
            data: healingResult
        });
    });

    /**
     * POST /api/v1/githubDocs/visual-audit
     * Audits visual PR screenshot for design and CSS token compliance.
     */
    static auditPrVisualLayout = catchAsync(async (req, res) => {
        const { base64Image, layoutParams } = req.body;
        if (!base64Image) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'A base64 image string is required.'
            });
        }

        const auditResult = await githubDocsService.auditPrVisualLayout(base64Image, layoutParams);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'PR visual layout audit completed successfully.',
            data: auditResult
        });
    });

    /**
     * POST /api/v1/githubDocs/blast-radius
     * Calculates the AST import dependency blast radius of changed files.
     */
    static analyzeBlastRadius = catchAsync(async (req, res) => {
        const { filesChanged } = req.body;
        if (!filesChanged) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'filesChanged array is required.'
            });
        }

        const blastRadiusResult = await githubDocsService.analyzePullRequestBlastRadius(filesChanged);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'AST import blast radius calculated successfully.',
            data: blastRadiusResult
        });
    });

    /**
     * POST /api/v1/githubDocs/autopilot/create-pr
     * Launches the autonomous repository editing and PR generation autopilot loop.
     */
    static triggerAutopilotPr = catchAsync(async (req, res) => {
        const { userIntent } = req.body;
        if (!userIntent) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'userIntent string is required.'
            });
        }

        const { githubAutopilotService } = await import('./githubAutopilot.service.js');
        const autopilotResult = await githubAutopilotService.createPullRequestAutopilot(userIntent);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Autopilot repository PR generation run completed.',
            data: autopilotResult
        });
    });

    /**
     * POST /api/v1/githubDocs/session/consult
     * Multi-turn stateful conversational chat with persistent session memory.
     */
    static consultStatefulSession = catchAsync(async (req, res) => {
        const { sessionId, message } = req.body;
        if (!sessionId || !message) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'sessionId and message strings are required.'
            });
        }

        const { githubAutopilotService } = await import('./githubAutopilot.service.js');
        const sessionResult = await githubAutopilotService.consultStatefulSession(sessionId, message);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Stateful session consultation successfully completed.',
            data: sessionResult
        });
    });

    /**
     * GET /api/v1/githubDocs/thought-stream
     * Streams real-time swarm thought telemetry to clients using Server-Sent Events (SSE).
     */
    static streamSwarmThoughts = catchAsync(async (req, res) => {
        const { githubSweeperService } = await import('./githubSweeper.service.js');
        githubSweeperService.subscribeThoughtStream(req, res);
    });

    /**
     * POST /api/v1/githubDocs/sweeper/run
     * Executes background dependency vulnerability security scanning and patches compiled updates.
     */
    static triggerSecuritySweep = catchAsync(async (req, res) => {
        const { githubSweeperService } = await import('./githubSweeper.service.js');
        const sweepResult = await githubSweeperService.executeSecuritySweep();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Autonomous security sweep execution completed.',
            data: sweepResult
        });
    });
}


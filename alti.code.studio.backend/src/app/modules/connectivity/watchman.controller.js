/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { graphOrchestrator } from '../agents/graph.orchestrator.js';

class WatchmanController {

    /**
     * Handle incoming webhook signals.
     * POST /hooks/:source
     */
    async receiveSignal(req, res) {
        const { source } = req.params;
        const payload = req.body;

        if (!source || typeof source !== 'string') {
            return res.status(400).json({ status: 'ERR', message: 'source param is required' });
        }

        logger.info(`👀 Watchman: Signal received from [${source}]`);

        try {

            let mission = null;

            switch (source.toLowerCase()) {
                case 'github':
                    mission = this._normalizeGithub(payload);
                    break;
                case 'linear':
                    mission = this._normalizeLinear(payload);
                    break;
                default:
                    logger.warn(`👀 Watchman: Unknown source [${source}]. Processing as generic signal.`);
                    mission = {
                        agent: 'surfer',
                        action: 'research',
                        args: [`Generic webhook received`, JSON.stringify(payload)],
                    };
            }

            if (mission) {
                // Attach a unique traceId so the caller can poll mission status
                const traceId = crypto.randomUUID();
                mission.traceId = traceId;

                logger.info(`👀 Watchman: Dispatching mission [${traceId}] for agent [${mission.agent}]...`);

                // Fire-and-forget — but log failures with the traceId for correlation
                this._dispatchMission(mission, traceId);

                return res.status(202).json({
                    status: 'ACK',
                    message: 'Mission dispatched.',
                    traceId,
                });
            }

            return res.status(200).json({ status: 'IGNORED', message: 'Signal ignored — no matching handler.' });

        } catch (error) {
            logger.error(`❌ Watchman Error:`, error);
            return res.status(500).json({ status: 'ERR', message: error.message });
        }
    }

    _normalizeGithub(payload) {
        // Push event → trigger code-review agent
        if (payload.ref && payload.commits) {
            return {
                agent: 'judge',
                action: 'review',
                args: [process.cwd()],
            };
        }
        // PR opened → trigger security scan
        if (payload.pull_request && payload.action === 'opened') {
            return {
                agent: 'security',
                action: 'audit',
                args: [process.cwd()],
            };
        }
        return null; // Ignore other GitHub events
    }

    _normalizeLinear(payload) {
        // New Issue → trigger complexity analysis
        if (payload.action === 'create' && payload.type === 'Issue') {
            return {
                agent: 'prophet',
                action: 'predict',
                args: [payload.data?.title ?? 'New Linear Issue'],
            };
        }
        return null;
    }

    async _dispatchMission(mission, traceId) {
        try {
            const steps = [
                {
                    id: `step-${traceId}`,
                    agent: mission.agent,
                    action: mission.action,
                    args: mission.args,
                    dependencies: [],
                },
            ];
            await graphOrchestrator.executeGraph(steps);
            logger.info(`👀 Watchman: Mission [${traceId}] completed successfully.`);
        } catch (e) {
            logger.error(`❌ Watchman: Mission [${traceId}] failed — ${e.message}`);
        }
    }
}

export const watchmanController = new WatchmanController();

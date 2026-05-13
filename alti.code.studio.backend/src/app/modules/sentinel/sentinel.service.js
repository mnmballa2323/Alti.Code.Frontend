/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { sentinelAgent } from './sentinel.agent.js';
import { logger } from '../../../shared/logger.js';

/** Cache the watch-active state so callers can query without touching the agent. */
let _watching = false;

const startWatch = async () => {
    if (_watching) {
        logger.warn('⚔️  SentinelService: Watch already active — ignoring duplicate startWatch().');
        return { status: 'already_watching' };
    }
    const result = await sentinelAgent.startWatch();
    _watching = true;
    logger.info('⚔️  SentinelService: Watch started.');
    return result;
};

const stopWatch = async () => {
    if (!_watching) {
        logger.warn('⚔️  SentinelService: stopWatch() called but watch is not active.');
        return { status: 'not_watching' };
    }
    const result = await sentinelAgent.stopWatch?.();
    _watching = false;
    logger.info('⚔️  SentinelService: Watch stopped.');
    return result ?? { status: 'stopped' };
};

const scanSystem = async () => {
    logger.info('⚔️  SentinelService: Initiating system scan...');
    const result = await sentinelAgent.scanSystem();
    logger.info('⚔️  SentinelService: System scan complete.');
    return result;
};

/**
 * Analyse an error event and optionally trigger a remediation action.
 * @param {object} errorData
 */
const analyzeError = async (errorData) => {
    if (!errorData) {
        logger.warn('⚔️  SentinelService: analyzeError() received null/undefined errorData — skipping.');
        return { status: 'skipped', reason: 'No error data provided' };
    }
    logger.info(`⚔️  SentinelService: Analysing error — ${errorData.incidentId ?? '(no incident ID)'}`);
    return await sentinelAgent.handleSystemError(errorData);
};

/** Returns current watcher status without touching the agent. */
const getStatus = () => ({
    watching: _watching,
});

export const SentinelService = {
    startWatch,
    stopWatch,
    scanSystem,
    analyzeError,
    getStatus,
};

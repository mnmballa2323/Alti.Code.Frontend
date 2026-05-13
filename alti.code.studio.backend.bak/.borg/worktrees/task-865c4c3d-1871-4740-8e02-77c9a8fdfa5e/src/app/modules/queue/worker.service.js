/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Worker Service — Delegates to the Dynamic Worker Factory.
 * Maintained for backward compatibility. All new agent registration
 * goes through worker.factory.js.
 */

import { workerFactory } from './worker.factory.js';
import { logger } from '../../../shared/logger.js';

class WorkerService {
    constructor() {
        this.workers = {};
    }

    async init() {
        logger.info('👷 WorkerService: Delegating to WorkerFactory...');
        await workerFactory.init();
        this.workers = workerFactory.workers;
        logger.info(`👷 WorkerService: ${Object.keys(this.workers).length} workers active`);
    }

    getStatus() {
        return workerFactory.getStatus();
    }
}

export const workerService = new WorkerService();

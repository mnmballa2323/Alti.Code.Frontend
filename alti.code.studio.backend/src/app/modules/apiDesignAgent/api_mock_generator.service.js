import express from 'express';
import { logger } from '../../../shared/logger.js';

class ApiMockGeneratorService {
    constructor() {
        this.serverInstance = null;
        this.app = null;
    }

    /**
     * Spins up a dynamic mock express server with the specified routes and mock payloads.
     * @param {number} port - Target mock server port
     * @param {Array} routesConfig - Array of { method: 'GET'|'POST', path: string, response: Object }
     * @returns {Promise<Object>} Object containing mock server address
     */
    async startMockServer(port, routesConfig = []) {
        if (this.serverInstance) {
            logger.warn('ApiMockGenerator: Server is already running. Stopping before restart.');
            await this.stopMockServer();
        }

        this.app = express();
        this.app.use(express.json());

        // Define routes
        for (const route of routesConfig) {
            const { method, path, response } = route;
            const lowerMethod = method.toLowerCase();

            if (typeof this.app[lowerMethod] === 'function') {
                this.app[lowerMethod](path, (req, res) => {
                    logger.info(`🌐 MockServer: Hit ${method} ${path}`);
                    res.json(response);
                });
                logger.info(`🌐 MockServer: Registered route ${method} ${path}`);
            }
        }

        return new Promise((resolve, reject) => {
            try {
                this.serverInstance = this.app.listen(port, () => {
                    logger.info(`🌐 MockServer: Mock API server listening on port: ${port}`);
                    resolve({ address: `http://localhost:${port}` });
                });
            } catch (e) {
                logger.error('ApiMockGenerator: Failed to start mock server.', e);
                reject(e);
            }
        });
    }

    /**
     * Stops the running mock server instance.
     */
    stopMockServer() {
        return new Promise((resolve) => {
            if (this.serverInstance) {
                this.serverInstance.close(() => {
                    logger.info('🌐 MockServer: Mock API server stopped.');
                    this.serverInstance = null;
                    this.app = null;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

export const apiMockGeneratorService = new ApiMockGeneratorService();

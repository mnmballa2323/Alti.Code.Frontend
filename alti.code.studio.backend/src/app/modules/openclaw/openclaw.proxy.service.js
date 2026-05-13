/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Cloud Proxy & Security Tunnel
 * This service allows the Alti.Code.Studio Swarm (running in the cloud)
 * to securely tunnel system-level execution commands down to the user's
 * physical machine via the authenticated Local Surrogate (OpenClaw Desktop).
 */

import { logger } from '../../../shared/logger.js';
import http from 'http';
import https from 'https';

class OpenClawProxyService {
    constructor() {
        // In reality, this would dynamically resolve to the user's active WebSocket connection
        // or a secure ngrok tunnel created by the Electron Desktop App.
        this.localSurrogateUrl = process.env.LOCAL_SURROGATE_URL || 'http://localhost:8081';
        this.moltworkerToken = null; // Phase 14: Cloudflare Moltworker Support
    }

    /**
     * Phase 14: Cloudflare Moltworker Support
     * Re-routes the proxy tunnel from localhost to a secure Cloudflare Edge Worker.
     */
    configureMoltworker(url, token) {
        if (!url) {
            this.localSurrogateUrl = process.env.LOCAL_SURROGATE_URL || 'http://localhost:8081';
            this.moltworkerToken = null;
            logger.info(`🔌 OpenClaw Tunnel: Reverted target to Localhost Surrogate.`);
        } else {
            this.localSurrogateUrl = url;
            this.moltworkerToken = token;
            logger.info(`☁️ OpenClaw Tunnel: Rerouting Swarm Intelligence target to Cloudflare Edge: ${url}`);
        }
    }

    /**
     * Dispatch an automation intent from the Cloud Swarm down to the Host Machine.
     * The embedded OpenClaw engine interprets the intent and executes the local operation.
     */
    async delegateToLocalHost(intent, expectedResultDescription) {
        if (process.env.LOCAL_SURROGATE_ENABLED !== 'true') {
            logger.warn(`⚠️ OpenClaw Tunnel: Surrogate is disabled. Cannot execute local intent: "${intent}"`);
            return `[SIMULATED LOCAL EXECUTION]: Executed intent on host: ${intent}`;
        }

        logger.info(`🚇 OpenClaw Tunnel: Delegating intent to physical host machine...`);
        logger.debug(`🚇 Intent: ${intent}`);

        try {
            // Forwarding the intent to the local OpenClaw Surrogate's REST/WebSocket API
            const response = await this._makeProxyRequest('/execute', {
                intent,
                expectedResult: expectedResultDescription
            });

            if (response && response.success) {
                logger.info(`✅ OpenClaw Tunnel: Local Surrogate completed the intent successfully.`);
                return response.output;
            } else if (response && response.error) {
                logger.warn(`⚠️ OpenClaw Tunnel: Surrogate executed but returned semantic failure: ${response.error}`);
                throw new Error(`Surrogate Execution Failure: ${response.error}`);
            } else {
                throw new Error('Malformed surrogate response from physical host.');
            }

        } catch (error) {
            logger.error(`❌ OpenClaw Tunnel: Communication or Execution with physical host failed: ${error.message}`);
            // Wrap in standard error to allow BaseSpecialistAgent retry logic to capture it
            const e = new Error(`OpenClaw Proxy Failure: ${error.message}`);
            e.code = 'OPENCLAW_PROXY_ERR';
            throw e;
        }
    }

    /**
     * Helper to make an HTTP(S) request to the established secure tunnel
     */
    _makeProxyRequest(path, payload) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.localSurrogateUrl + path);
            const client = url.protocol === 'https:' ? https : http;

            const data = JSON.stringify(payload);
            const headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'X-Alti-Swarm-Token': process.env.SWARM_INTERNAL_SECRET || 'dev_secret'
            };

            // Inject Cloudflare Zero Trust / Moltworker authentication if configured
            if (this.moltworkerToken) {
                headers['Authorization'] = `Bearer ${this.moltworkerToken}`;
            }

            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: 'POST',
                headers,
                timeout: 30000 // Give OpenClaw 30 seconds to run the local command
            };

            const req = client.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(body);
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error(`Failed to parse surrogate response: ${body}`));
                    }
                });
            });

            req.on('error', (e) => reject(e));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Local Surrogate command timed out.'));
            });

            req.write(data);
            req.end();
        });
    }
}

export const openclawProxyService = new OpenClawProxyService();

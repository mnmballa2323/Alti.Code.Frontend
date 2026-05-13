/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * Enterprise Open Policy Agent (OPA) Integration.
 * Enforces preventative security rules via Rego policies before actions execute.
 * For example: "No code merges outside business hours" or "No deletion of WORM buckets".
 */

import axios from 'axios';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

class OPAEnforcementService {
    constructor() {
        // Typically, OPA runs tightly coupled as a sidecar or dedicated internal cluster IP
        this.opaUrl = config.opa?.url || 'http://localhost:8181/v1/data/alti/audit/allow';
        this.isEnabled = config.opa?.enabled || false;
    }

    /**
     * Checks if the proposed action is permitted by the enterprise OPA rules.
     * @param {string} actor The user/agent performing the action
     * @param {string} action The action verb (e.g., 'PRIVILEGE_ESCALATION')
     * @param {object} metadata Context about the action (target, ips, etc)
     * @returns {object} { allowed: boolean, reason: string }
     */
    async evaluatePolicy(actor, action, metadata) {
        if (!this.isEnabled) {
            return { allowed: true, reason: 'OPA Disabled' }; // Fails open if natively disabled
        }

        try {
            const input = {
                actor: actor,
                action: action,
                metadata: metadata || {},
                timestamp: new Date().toISOString()
            };

            const response = await axios.post(this.opaUrl, { input }, { timeout: 1500 }); // strict SLA

            if (response.data && response.data.result === true) {
                return { allowed: true, reason: 'Action permitted by OPA policy' };
            } else {
                return {
                    allowed: false,
                    reason: response.data?.explain || 'Action implicitly denied by enterprise OPA firewall.'
                };
            }
        } catch (error) {
            // Enterprise Standard: Fail CLOSED if OPA is unreachable
            // (A bypassed policy sidecar is a critical vulnerability)
            logger.error(`❌ OPAService: Policy evaluation failed for ${actor}:${action}`, error.message);
            return { allowed: false, reason: 'OPA evaluation timeout or unreachable. Failing closed.' };
        }
    }
}

export const opaEnforcementService = new OPAEnforcementService();

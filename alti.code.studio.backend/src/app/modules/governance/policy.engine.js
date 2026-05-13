import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Enterprise Policy-as-Code Engine
 * Allows The Sentinel and other agents to validate actions against enterprise rules.
 */
class PolicyEngine {
    constructor() {
        this.policiesDir = path.join(process.cwd(), 'policies');
        this.defaultPolicies = [
            {
                id: 'POL-001',
                name: 'Block GPL Licenses',
                description: 'Prevents installation of libraries with generic copyleft licenses.',
                type: 'dependency',
                condition: (action, metadata) => {
                    if (action === 'install_dependency' && metadata?.license?.toUpperCase().includes('GPL')) {
                        return { allowed: false, reason: 'GPL licenses are prohibited in this enterprise environment.' };
                    }
                    return { allowed: true };
                }
            },
            {
                id: 'POL-002',
                name: 'Enforce Test Coverage',
                description: 'Requires all pull requests or code merges to have at least 80% coverage.',
                type: 'code_quality',
                condition: (action, metadata) => {
                    if (action === 'merge_code' && metadata?.coverage < 80) {
                        return { allowed: false, reason: `Test coverage is ${metadata.coverage}%. Minimum required is 80%.` };
                    }
                    return { allowed: true };
                }
            },
            {
                id: 'POL-003',
                name: 'Restrict Cloud Regions',
                description: 'Infrastructure provisioning must only target approved US regions.',
                type: 'infrastructure',
                condition: (action, metadata) => {
                    if (action === 'provision_infrastructure' && metadata?.region && !metadata.region.startsWith('us-')) {
                        return { allowed: false, reason: `Region ${metadata.region} is not approved. Only US regions are allowed.` };
                    }
                    return { allowed: true };
                }
            }
        ];
    }

    /**
     * Evaluates a requested agent action against all loaded enterprise policies.
     * @param {string} agentName - Name of the agent requesting the action
     * @param {string} action - The action being performed (e.g. 'install_dependency')
     * @param {object} metadata - Details about the action
     * @returns {object} { allowed: boolean, violations: string[] }
     */
    async evaluateAction(agentName, action, metadata) {
        logger.info(`🛡️ PolicyEngine: Evaluating ${agentName} attempting ${action}`);
        const violations = [];

        for (const policy of this.defaultPolicies) {
            try {
                const result = policy.condition(action, metadata);
                if (!result.allowed) {
                    violations.push(`Violation of ${policy.id} (${policy.name}): ${result.reason}`);
                }
            } catch (e) {
                logger.warn(`⚠️ PolicyEngine: Error evaluating policy ${policy.id}`, e);
            }
        }

        if (violations.length > 0) {
            logger.warn(`🚫 PolicyEngine: Blocked action by ${agentName}. Violations: ${violations.join(', ')}`);
            return { allowed: false, violations };
        }

        return { allowed: true, violations: [] };
    }
}

export const policyEngine = new PolicyEngine();

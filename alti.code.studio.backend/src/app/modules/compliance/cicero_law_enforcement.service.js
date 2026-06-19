import { logger } from '../../../shared/logger.js';
import { ciceroLawEnforcementAgent } from '../agents/cicero_law_enforcement.agent.js';
import { azureLegalNoticeService } from './azure_legal_notice.service.js';
import { queueService } from '../queue/queue.service.js';

class CiceroLawEnforcementService {
    /**
     * Enforces SLA compliance asynchronously by queueing a background check job.
     * 
     * @param {string} userId 
     * @param {string} tenantId 
     * @param {Object} payload 
     * @returns {Promise<Object>}
     */
    async enforceSlaCompliance(userId, tenantId, payload) {
        logger.info(`⚖️ Cicero Compliance: Queueing SLA compliance enforcement job for contract [${payload?.contractId || 'unknown'}]`);

        if (!payload || !payload.slaConditions || !payload.telemetry) {
            throw new Error('SLA conditions and telemetry data are required for enforcement.');
        }

        const job = await queueService.addJob('compliance', {
            type: 'cicero_sla_check',
            userId,
            tenantId,
            payload
        });

        return {
            success: true,
            status: 'QUEUED',
            jobId: job.id,
            message: 'SLA compliance enforcement task has been queued asynchronously.'
        };
    }

    /**
     * The background worker executor for SLA compliance checks.
     * Checks telemetry, invokes Cicero agent for notice drafting on breach, and dispatches via Azure.
     * 
     * @param {Object} jobData
     * @returns {Promise<Object>}
     */
    async processSlaEnforcementJob(jobData) {
        const { userId, tenantId, payload } = jobData;
        logger.info(`⚖️ Cicero Compliance: Executing background SLA compliance check for contract [${payload?.contractId || 'unknown'}]`);

        const { contractId, slaConditions, telemetry } = payload;
        const violations = [];
        let severity = 'LOW';

        // 1. Deterministic breach check
        if (telemetry.uptime !== undefined && slaConditions.minUptime !== undefined) {
            if (telemetry.uptime < slaConditions.minUptime) {
                violations.push(`Uptime breach: actual ${telemetry.uptime} < target SLA minUptime ${slaConditions.minUptime}`);
                severity = 'HIGH';
            }
        }

        if (telemetry.avgLatencyMs !== undefined && slaConditions.maxLatencyMs !== undefined) {
            if (telemetry.avgLatencyMs > slaConditions.maxLatencyMs) {
                violations.push(`Latency breach: actual ${telemetry.avgLatencyMs}ms > target SLA maxLatencyMs ${slaConditions.maxLatencyMs}ms`);
                if (severity !== 'HIGH') {
                    severity = 'MEDIUM';
                }
            }
        }

        if (telemetry.requestCount !== undefined && slaConditions.rateLimit !== undefined) {
            if (telemetry.requestCount > slaConditions.rateLimit) {
                violations.push(`Rate limit breach: actual requestCount ${telemetry.requestCount} > SLA limit ${slaConditions.rateLimit}`);
                if (severity === 'LOW') {
                    severity = 'MEDIUM';
                }
            }
        }

        // If no breach is detected, return compliant status early
        if (violations.length === 0) {
            logger.info(`✅ Cicero Compliance: Contract [${contractId}] is fully SLA-compliant.`);
            return {
                breach_detected: false,
                severity: 'LOW',
                legal_notice_draft: null,
                azure_routing_metadata: {
                    success: true,
                    status: 'SKIPPED',
                    message: 'Contract is fully SLA-compliant.'
                }
            };
        }

        logger.warn(`⚠️ Cicero Compliance: SLA breach detected for contract [${contractId}]! Violations: ${violations.join('; ')}`);

        // 2. Invoke Cicero Specialised Agent to draft the notice
        const prompt = `Formulate an AM Law 100 compliant legal notice for smart contract SLA breaches.
Contract ID: ${contractId}
Violations Detected:
${violations.map(v => `- ${v}`).join('\n')}
Severity Level: ${severity}

You MUST return a JSON response matching the required envelope schema:
{
  "breach_detected": true,
  "severity": "${severity}",
  "legal_notice_draft": "[Insert formal AM Law 100 notice text here]",
  "azure_routing_metadata": {}
}`;

        const context = [
            { path: 'contract_payload.json', content: JSON.stringify(payload) }
        ];

        const agentResponse = await ciceroLawEnforcementAgent.consult(prompt, context, tenantId);

        // 3. Parse and structure the agent response
        let result;
        try {
            let cleanResponse = agentResponse.trim();
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }
            result = JSON.parse(cleanResponse);
        } catch (error) {
            logger.warn('Failed to parse Cicero Agent response as JSON. Wrapping response in structured envelope.', error);
            result = {
                breach_detected: true,
                severity,
                legal_notice_draft: agentResponse,
                azure_routing_metadata: {}
            };
        }

        // Ensure proper schema defaults if agent omitted them
        result.breach_detected = result.breach_detected !== undefined ? result.breach_detected : true;
        result.severity = result.severity || severity;
        result.legal_notice_draft = result.legal_notice_draft || agentResponse;

        // 4. Dispatch the notice via Azure Legal Notice Service
        const dispatchMetadata = {
            contractId,
            violations,
            severity: result.severity,
            userId,
            tenantId,
            timestamp: new Date().toISOString()
        };

        const dispatchResult = await azureLegalNoticeService.dispatchNotice(result.legal_notice_draft, dispatchMetadata);

        // Merge routing metadata into envelope payload
        result.azure_routing_metadata = dispatchResult;

        return result;
    }
}

export const ciceroLawEnforcementService = new CiceroLawEnforcementService();


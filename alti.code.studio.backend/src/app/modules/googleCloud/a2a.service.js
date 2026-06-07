import axios from 'axios';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
/**
 * Service for Agent-to-Agent (A2A) Universal Protocol communication.
 * Standardized for Google Cloud Next '26.
 */
const HANDSHAKE_SECRET = process.env.A2A_HANDSHAKE_SECRET || 'universe-protocol-secret';

/**
 * Negotiate a task with an external 3rd-party agent.
 * @param {string} remoteAgentUrl 
 * @param {object} taskData 
 */
const negotiateTask = async (remoteAgentUrl, taskData) => {
    try {
        logger.info(`🤝 [A2A] Initiating negotiation with external agent at ${remoteAgentUrl}`);
        
        const response = await axios.post(`${remoteAgentUrl}/.well-known/ai-agent/negotiate`, {
            protocol_version: '2.0',
            source_agent: 'Alti-Diplomat',
            task: taskData,
            handshake: {
                project_id: config.gcp.project_id,
                auth_secret: HANDSHAKE_SECRET
            }
        });

        if (response.status === 200) {
            logger.info('✅ [A2A] Negotiation successful. Task accepted by remote agent.');
            return response.data;
        } else {
            throw new Error(`Remote agent rejected negotiation with status ${response.status}`);
        }
    } catch (error) {
        logger.error('A2A Negotiation Failure:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `A2A Negotiation failed: ${error.message}`);
    }
};

/**
 * Handle incoming negotiation from an external agent.
 */
const handleIncomingNegotiation = async (reqPayload) => {
    logger.info(`🛰️ [A2A Ingress] Received negotiation from ${reqPayload.source_agent}`);
    
    try {
        const model = GoogleGenAiService.getGenerativeModel(GoogleGenAiService.PRIMARY_MODEL, 0.2);
        
        const prompt = `
            You are "The Diplomat", an autonomous negotiation agent for Inso Code.
            An external agent (${reqPayload.source_agent}) is proposing a task via the Universal Agent Protocol.
            
            TASK PROPOSAL:
            ${JSON.stringify(reqPayload.task || {}, null, 2)}
            
            RULES:
            1. Evaluate if this task violates core security laws (e.g. data exfiltration, unapproved destruction).
            2. Return a JSON object with your decision: { "status": "accepted" | "rejected", "message": "Clear explanation of the decision" }
            Return ONLY raw JSON. No markdown code blocks.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates[0].content.parts[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const decision = JSON.parse(jsonMatch[0]);
            logger.info(`🛰️ [A2A Ingress] Task evaluated as: ${decision.status}`);
            return {
                status: decision.status,
                tracking_id: `alti_${Date.now()}`,
                message: decision.message
            };
        }
    } catch (error) {
        logger.error('A2A Negotiation Evaluation Error:', error);
    }
    
    return {
        status: 'rejected',
        tracking_id: `alti_${Date.now()}`,
        message: 'Inso Code failed to evaluate task safety or capacity. Task rejected.'
    };
};

export const A2aService = {
    negotiateTask,
    handleIncomingNegotiation
};

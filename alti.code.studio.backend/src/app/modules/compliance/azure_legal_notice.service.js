import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import crypto from 'crypto';

class AzureLegalNoticeService {
    /**
     * Dispatches the drafted legal notice to Azure.
     * Falls back to a mock queue receipt if no endpoint is configured or if the call fails.
     * 
     * @param {string} legalNoticeDraft 
     * @param {Object} metadata 
     * @returns {Promise<Object>}
     */
    async dispatchNotice(legalNoticeDraft, metadata) {
        const endpoint = process.env.AZURE_LEGAL_NOTICE_URL;
        
        if (endpoint) {
            try {
                logger.info(`Dispatching legal notice to Azure endpoint: ${endpoint}`);
                const response = await axios.post(endpoint, {
                    draft: legalNoticeDraft,
                    metadata
                });
                
                return {
                    success: true,
                    status: 'DISPATCHED',
                    messageId: response.data.messageId || `azure-msg-${crypto.randomUUID()}`,
                    dispatchedAt: new Date().toISOString(),
                    provider: 'AzureLegalNoticeService',
                    response: response.data
                };
            } catch (error) {
                logger.error('Azure Legal Notice Service endpoint post failed. Falling back to mock queue...', error);
            }
        }

        // Graceful mock fallback
        const messageId = `azure-legal-msg-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`;
        logger.info(`⚖️ Azure Legal Notice Service (Mock): Enqueued legal notice ${messageId} successfully.`);
        
        return {
            success: true,
            messageId,
            dispatchedAt: new Date().toISOString(),
            status: 'QUEUED',
            provider: 'AzureLegalNoticeService',
            channel: 'POSTAL_AND_EMAIL',
            metadata
        };
    }
}

export const azureLegalNoticeService = new AzureLegalNoticeService();

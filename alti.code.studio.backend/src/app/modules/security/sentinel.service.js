import { FirestoreSyncService } from '../googleCloud/firestoreSync.service.js';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { sccService } from '../googleCloud/scc.service.js';
import { logger } from '../../../shared/logger.js';
import * as tink from 'tink-crypto';

/**
 * The 'Sentinel' Security Observability Layer.
 * Intercepts and aggregates system-wide security, compliance, and DLP events.
 */
class SentinelService {
    constructor() {
        this.eventsCollection = 'sentinel_events';
        this.tinkAead = null;
        this.initTink();
    }

    /**
     * Bootstraps Google Tink (Apache 2.0) for military-grade Authenticated Encryption (AEAD).
     */
    async initTink() {
        try {
            tink.aead.register();
            // In a production environment, this KeysetHandle would be loaded from Google Cloud KMS.
            // For autonomous operation, we generate a highly secure AES-256-GCM keyset.
            const keysetHandle = await tink.cleartextKeysetHandle.generateNew(tink.aead.aeadKeyTemplates.aes256Gcm());
            this.tinkAead = await keysetHandle.getPrimitive(tink.aead.Aead);
            logger.info('🔐 [Sentinel] Google Tink Crypto initialized for payload encryption.');
        } catch (error) {
            logger.error('❌ [Sentinel] Failed to initialize Google Tink Crypto:', error.message);
        }
    }

    /**
     * Reports a security or compliance event to the global audit ledger.
     */
    async reportEvent(type, severity, metadata = {}) {
        let finalMetadata = metadata;
        
        // 🛡️ Sovereign Security Boundary: Encrypt CRITICAL metadata using Google Tink
        if (severity === 'CRITICAL' && this.tinkAead) {
            try {
                const plaintext = Buffer.from(JSON.stringify(metadata));
                const associatedData = Buffer.from('sentinel-audit-log'); // AEAD Authentication Context
                const ciphertext = await this.tinkAead.encrypt(plaintext, associatedData);
                
                finalMetadata = { 
                    _encrypted: true, 
                    algorithm: 'AES-256-GCM (Google Tink)',
                    payload: Buffer.from(ciphertext).toString('base64') 
                };
                logger.info(`🔐 [Sentinel] CRITICAL payload cryptographically sealed via Google Tink.`);
            } catch (encryptError) {
                logger.error(`❌ [Sentinel] Tink encryption failed, dropping payload to prevent data leak.`);
                finalMetadata = { _error: 'Encryption failed. Payload dropped.' };
            }
        }

        const event = {
            timestamp: new Date().toISOString(),
            type, // e.g., 'DLP_REDACTION', 'LICENSE_VIOLATION', 'AUDIT_FAILURE'
            severity, // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
            metadata: finalMetadata,
            platformState: 'MISSION_CRITICAL'
        };

        logger.warn(`🛡️ [Sentinel] SECURITY EVENT DETECTED: [${type}] - Severity: ${severity}`);

        try {
            // Autonomous AI Mitigation Synthesis
            if (severity === 'HIGH' || severity === 'CRITICAL') {
                logger.info(`🛡️ [Sentinel] Engaging Gemini Swarm for autonomous mitigation synthesis...`);
                try {
                    const prompt = `
                        You are the Chief Information Security Officer (CISO) for Alti Code Studio.
                        A ${severity} security event of type ${type} has occurred.
                        
                        METADATA:
                        ${JSON.stringify(metadata, null, 2)}
                        
                        Provide an immediate, actionable mitigation plan in exactly 3 bullet points.
                    `;
                    const model = GoogleGenAiService.getGenerativeModel(GoogleGenAiService.PRIMARY_MODEL);
                    const result = await model.generateContent(prompt);
                    const mitigation = result.response.candidates[0].content.parts[0].text;
                    event.aiMitigationPlan = mitigation.trim();
                    logger.info(`🛡️ [Sentinel] Mitigation plan synthesized.`);

                    // 🚨 Instantly push to Google Security Command Center (Enterprise Global Visibility)
                    await sccService.reportFinding(type, metadata.file || 'Alti-Backend-Mesh', severity);

                } catch (aiError) {
                    logger.error(`🛡️ [Sentinel] AI mitigation synthesis failed:`, aiError.message);
                    event.aiMitigationPlan = 'Mitigation synthesis failed. Immediate manual intervention required.';
                }
            }

            // Persist for historical audit (Long-term Backend Storage)
            await FirestoreSyncService.persistSecurityEvent(event);
            
            // Emit real-time stream event (for the 'Sentinel' feed)
            // This allows the backend to notify any listening secure clients instantly
            global.io?.emit('SENTINEL_ALERT', event);

            return { success: true, eventId: event.timestamp, mitigationPlan: event.aiMitigationPlan };
        } catch (error) {
            logger.error('Sentinel Logging Error:', error);
            return { success: false };
        }
    }
}

export const sentinelService = new SentinelService();

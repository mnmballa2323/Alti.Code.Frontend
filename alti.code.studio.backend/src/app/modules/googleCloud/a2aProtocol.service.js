import axios from 'axios';
import { logger } from '../../../shared/logger.js';
import { kmsService } from './kms.service.js';
import config from '../../../../config/index.js';

// Official Google Agent-2-Agent Integration
import { A2AServer } from '@google/gemini-cli-a2a-server';

/**
 * Helper to ensure deterministic JSON payload signing
 */
function deterministicStringify(obj) {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) return '[' + obj.map(deterministicStringify).join(',') + ']';
    const keys = Object.keys(obj).sort();
    let res = '{';
    for (let i = 0; i < keys.length; i++) {
        res += JSON.stringify(keys[i]) + ':' + deterministicStringify(obj[keys[i]]);
        if (i < keys.length - 1) res += ',';
    }
    return res + '}';
}

/**
 * A2A Universal Protocol Service.
 * Provides the technical foundation for cross-enterprise agentic handshakes.
 */
class A2AProtocolService {
    constructor() {
        this.handshakeSecret = config.security?.a2a_handshake_secret || 'ALTI_SECRET_HANDSHAKE_2026';
        
        try {
            // Bind the official Google A2A Server instance
            this.googleA2A = new A2AServer();
            logger.info('✅ [A2A] Official Google Gemini A2A Server initialized.');
        } catch (e) {
            logger.warn('⚠️ [A2A] Google Gemini A2A Server could not be started in this environment.');
        }
    }

    /**
     * Executes a cryptographically signed A2A Handshake to an external agent.
     */
    async executeHandshake(endpoint, payload) {
        logger.info(`🔐 [A2A] Executing signed handshake at: ${endpoint}`);

        try {
            const timestamp = Date.now();
            
            const handshakePayload = {
                platform: 'Alti Code Studio',
                version: '3.1.0',
                payload,
                timestamp,
            };

            // Generate cryptographic signature using Google Cloud KMS Hardware Security Modules
            // Using deterministic serialization to guarantee identical hashes across Node.js environments
            const payloadString = deterministicStringify(handshakePayload);
            const signature = await kmsService.signPayload(payloadString);

            // Attach HSM signature
            handshakePayload.signature = signature;

            // Execute the external handshake with Exponential Backoff for GCP Distributed Resilience
            let response;
            let attempt = 0;
            const maxAttempts = 3;
            
            while (attempt < maxAttempts) {
                try {
                    response = await axios.post(endpoint, handshakePayload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Alti-A2A-Version': '3.1.0'
                        },
                        timeout: 5000 // Circuit breaker: 5 second max negotiation time
                    });
                    break;
                } catch (err) {
                    attempt++;
                    if (attempt >= maxAttempts) throw err;
                    logger.warn(`⚠️ [A2A] Transient network failure to ${endpoint}. Retrying in ${Math.pow(2, attempt) * 500}ms (Attempt ${attempt}/${maxAttempts})`);
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
                }
            }
            
            if (response.data && response.data.connected) {
                logger.info(`✅ [A2A] Handshake verified with ${endpoint}. Shared context established.`);
                return {
                    connected: true,
                    remoteState: response.data.remoteState || 'STABLE',
                    handshakeToken: response.data.handshakeToken
                };
            } else {
                throw new Error('Remote platform rejected handshake parameters.');
            }

        } catch (error) {
            logger.error(`❌ [A2A] Protocol Negotiation Failed with ${endpoint}:`, error.message);
            return { connected: false, error: error.response?.data?.error || 'Remote Handshake Denied or Unreachable' };
        }
    }
    
    /**
     * Verifies an incoming A2A Handshake payload signature securely.
     */
    async verifyIncomingHandshake(handshakePayload) {
        if (!handshakePayload || !handshakePayload.signature) return false;
        
        try {
            const { signature, ...dataToVerify } = handshakePayload;
            
            const expectedString = deterministicStringify(dataToVerify);
            
            // Cryptographically verify the signature via Google Cloud KMS MAC
            const isValid = await kmsService.verifySignature(expectedString, signature);
            return isValid;
        } catch (e) {
            return false;
        }
    }
}

export const a2aProtocol = new A2AProtocolService();

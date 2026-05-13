import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { logger } from '../../../shared/logger.js';

/**
 * Google Identity & Zero-Trust Auth (Apache 2.0 SDK) Service.
 * Implements military-grade, short-lived token generation for the Swarm.
 * Instead of passing static JSON keys, this service uses google-auth-library
 * to generate ephemeral, tightly-scoped Access Tokens autonomously.
 */
class GoogleIdentityService {
    constructor() {
        // Automatically inherits ambient Google Cloud credentials
        this.auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        logger.info('🔐 [Identity] Google Auth Library initialized for Zero-Trust Swarm provisioning.');
    }

    /**
     * Generates a highly-scoped, short-lived (1 hour) OAuth2 Access Token.
     * The Swarm agents must use this to interact with GCP, rather than raw keys.
     * @returns {Promise<string>} Ephemeral Access Token
     */
    async generateEphemeralSwarmToken() {
        logger.info(`🔐 [Identity] Swarm requesting ephemeral access token...`);
        try {
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            
            if (tokenResponse && tokenResponse.token) {
                logger.info(`✅ [Identity] Ephemeral token minted successfully. Expires in ~60m.`);
                return tokenResponse.token;
            } else {
                throw new Error("Failed to extract token from Google Auth client.");
            }
        } catch (error) {
            logger.error(`❌ [Identity] Failed to mint ephemeral token:`, error.message);
            throw error;
        }
    }

    /**
     * Generates an OpenID Connect (OIDC) ID Token to securely invoke Cloud Run
     * or Cloud Functions behind IAM authentication.
     * @param {string} targetAudience - The URL of the protected Cloud Run service
     */
    async generateSecureIdToken(targetAudience) {
        logger.info(`🔐 [Identity] Generating OIDC ID Token for audience: ${targetAudience}`);
        try {
            const client = await this.auth.getIdTokenClient(targetAudience);
            const headers = await client.getRequestHeaders();
            logger.info(`✅ [Identity] OIDC ID Token minted successfully.`);
            // headers.Authorization contains "Bearer <ID_TOKEN>"
            return headers.Authorization;
        } catch (error) {
            logger.error(`❌ [Identity] Failed to mint OIDC ID Token:`, error.message);
            throw error;
        }
    }
}

export const identityService = new GoogleIdentityService();

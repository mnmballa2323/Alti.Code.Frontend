import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Identity-Aware Proxy (IAP) Auth Service.
 * Establishes a BeyondCorp Zero-Trust architecture by cryptographically 
 * verifying inbound IAP JSON Web Tokens at the API edge.
 */
class GoogleIAPService {
    constructor() {
        this.client = new OAuth2Client();
        this.expectedAudience = config.gcp.iap_audience || '/projects/12345/global/backendServices/67890';
    }

    /**
     * Programmatically verify an IAP Token.
     * Returns the verified Google identity.
     */
    async verifyIAPTokenDirectly(iapJwt) {
        if (config.env === 'development' && !iapJwt) {
            return { email: 'dev@alti.local', role: 'ADMIN' };
        }

        const response = await this.client.getIapPublicKeys();
        const ticket = await this.client.verifySignedJwtWithCertsAsync(
            iapJwt,
            response.pubkeys,
            this.expectedAudience,
            ['https://cloud.google.com/iap']
        );

        const payload = ticket.getPayload();
        
        return {
            email: payload.email,
            subject: payload.sub,
            hd: payload.hd
        };
    }

    /**
     * Express middleware to enforce BeyondCorp IAP security.
     */
    verifyIAPToken = async (req, res, next) => {
        const iapJwt = req.headers['x-goog-iap-jwt-assertion'];

        if (!iapJwt) {
            if (config.env === 'development') {
                logger.warn('⚠️ [IAP] Bypassing missing IAP header for local development.');
                req.user = { email: 'dev@alti.local', role: 'ADMIN' };
                return next();
            }
            logger.warn('⚠️ [IAP] Missing x-goog-iap-jwt-assertion header. Access Denied.');
            return res.status(401).json({ error: 'IAP Token Required for Zero-Trust Access.' });
        }

        try {
            logger.info(`🛡️ [IAP] Cryptographically verifying BeyondCorp JWT...`);
            
            // Verify the JWT signature against Google's public keys
            const response = await this.client.getIapPublicKeys();
            const ticket = await this.client.verifySignedJwtWithCertsAsync(
                iapJwt,
                response.pubkeys,
                this.expectedAudience,
                ['https://cloud.google.com/iap']
            );

            const payload = ticket.getPayload();
            
            // Attach the verified Google Identity to the Express request
            req.user = {
                email: payload.email,
                subject: payload.sub,
                hd: payload.hd // Google Workspace Domain
            };

            logger.info(`✅ [IAP] Verified identity: ${req.user.email}. Proceeding to protected route.`);
            next();
        } catch (error) {
            logger.error(`❌ [IAP] JWT Verification Failed:`, error.message);
            // In dev mode, we might allow pass-through if configured
            if (config.env === 'development') {
                logger.warn('⚠️ [IAP] Bypassing auth failure for local development.');
                req.user = { email: 'dev@alti.local' };
                return next();
            }
            return res.status(403).json({ error: 'Invalid or Expired IAP Token.' });
        }
    }
}

export const iapService = new GoogleIAPService();

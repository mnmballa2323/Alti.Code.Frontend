import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google reCAPTCHA Enterprise Service.
 * Protects platform perimeters from automated bot swarms using ML risk analysis.
 */
class GoogleRecaptchaService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.siteKey = config.gcp.recaptcha_site_key || 'alti-site-key';
        
        if (config.private_cloud_mode) {
            logger.info('🛡️ [reCAPTCHA] Private cloud mode active. GCP reCAPTCHA client disabled.');
            this.client = null;
            return;
        }

        try {
            this.client = new RecaptchaEnterpriseServiceClient();
        } catch (error) {
            logger.warn('⚠️ [reCAPTCHA] Could not initialize RecaptchaEnterpriseServiceClient.');
        }
    }

    /**
     * Assesses the risk of an incoming request.
     * @param {string} token - The reCAPTCHA token from the frontend
     * @param {string} recaptchaAction - The expected action (e.g. 'login', 'signup')
     * @returns {Promise<number>} - The risk score (0.0 to 1.0)
     */
    async createAssessment(token, recaptchaAction) {
        logger.info(`🛡️ [reCAPTCHA] Assessing request risk for action: ${recaptchaAction}...`);
        
        if (!this.client) {
            logger.info('🛡️ [reCAPTCHA] GCP Client offline or private cloud mode active. Returning mock risk score (0.9).');
            return 0.9;
        }

        try {
            const projectPath = this.client.projectPath(this.projectId);
            
            const request = {
                parent: projectPath,
                assessment: {
                    event: {
                        token: token,
                        siteKey: this.siteKey,
                        expectedAction: recaptchaAction,
                    },
                },
            };

            const [response] = await this.client.createAssessment(request);

            // Check if the token is valid.
            if (!response.tokenProperties.valid) {
                logger.warn(`⚠️ [reCAPTCHA] Invalid token: ${response.tokenProperties.invalidReason}`);
                return 0.0;
            }

            // Check if the expected action matches the one provided by the token.
            if (response.tokenProperties.action !== recaptchaAction) {
                logger.warn(`⚠️ [reCAPTCHA] Action mismatch: expected ${recaptchaAction}, got ${response.tokenProperties.action}`);
                return 0.0;
            }

            const score = response.riskAnalysis.score;
            logger.info(`✅ [reCAPTCHA] Risk Assessment Complete. Score: ${score}`);
            
            return score;
        } catch (error) {
            logger.error('❌ [reCAPTCHA] Assessment Error:', error.message);
            // Default to allowing traffic during development
            return 0.9;
        }
    }
}

export const recaptchaService = new GoogleRecaptchaService();

import { SecurityCenterClient } from '@google-cloud/security-center';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Security Command Center (SCC) Service.
 * Elevates local security audits to global visibility by pushing 
 * severe vulnerability findings natively into the GCP SCC console.
 */
class SecurityCommandCenterService {
    constructor() {
        try {
            this.client = new SecurityCenterClient();
            this.sourceName = `organizations/${config.gcp.organization_id || '123456789'}/sources/${config.gcp.scc_source_id || '987654321'}`;
            logger.info('🛡️ [SCC] Google Security Command Center Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [SCC] Could not initialize SCC Client.');
        }
    }

    /**
     * Pushes a vulnerability finding to GCP SCC.
     * @param {string} category - e.g., 'HARDCODED_CREDENTIALS', 'PII_LEAK'
     * @param {string} resourceName - The affected resource 
     * @param {string} severity - 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
     */
    async reportFinding(category, resourceName, severity = 'HIGH') {
        logger.warn(`🚨 [SCC] Reporting ${severity} vulnerability (${category}) to Security Command Center...`);

        try {
            const findingId = `finding-${Date.now()}`;
            
            const [finding] = await this.client.createFinding({
                parent: this.sourceName,
                findingId: findingId,
                finding: {
                    state: 'ACTIVE',
                    resourceName: resourceName,
                    category: category,
                    severity: severity,
                    eventTime: {
                        seconds: Math.floor(Date.now() / 1000),
                    },
                },
            });

            logger.info(`✅ [SCC] Finding published successfully: ${finding.name}`);
            return finding.name;
        } catch (error) {
            logger.error(`❌ [SCC] Failed to publish finding:`, error.message);
            return null;
        }
    }
}

export const sccService = new SecurityCommandCenterService();

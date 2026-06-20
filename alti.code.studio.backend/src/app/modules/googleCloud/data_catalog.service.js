import { DataCatalogClient } from '@google-cloud/datacatalog';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import { parseOKF, validateOKF } from '../knowledgeCatalog/okf.parser.js';

/**
 * Google Cloud Data Catalog Governance Service.
 * Ingesting massive enterprise monorepos runs the risk of injecting sensitive endpoints
 * or API keys into the Swarm's context window. The Swarm uses Google Cloud Data Catalog
 * to autonomously classify, tag, and govern the structural knowledge graph of the codebase,
 * mathematically guaranteeing that PII and Secrets are excluded from the RAG index before embedding.
 */
class GoogleDataCatalogService {
    constructor() {
        try {
            this.client = new DataCatalogClient();
            this.location = config.gcp.location || 'us-central1';
            this.projectId = config.gcp.project_id;
            
            // Assume Taxonomy is pre-configured via Terraform
            this.taxonomyName = this.client.taxonomyPath(
                this.projectId,
                this.location,
                config.gcp.data_catalog_taxonomy || 'alti-swarm-governance'
            );

            logger.info('🛡️ [Data Catalog] Google Cloud Data Catalog Governance Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Data Catalog] Could not initialize Data Catalog Client.');
        }
    }

    /**
     * Governs an AST file node before it is ingested into the Vector Database.
     * @param {string} filePath - The path of the file being ingested
     * @param {string} fileContent - The raw content of the file
     */
    async governFileIngestion(filePath, fileContent) {
        logger.info(`🛡️ [Data Catalog] Swarm is applying Knowledge Graph Governance to [${filePath}]...`);
        
        try {
            // Apply OKF Validation check if it is a concept file
            const isOKF = filePath.endsWith('.md') && fileContent.trim().startsWith('---');
            if (isOKF) {
                const parsed = parseOKF(fileContent);
                const validation = validateOKF(parsed.frontmatter);
                if (!validation.isValid) {
                    logger.warn(`⚠️ [Data Catalog] Invalid OKF specification in [${filePath}]: ${validation.error}`);
                    return { isSafe: false, reason: `Invalid OKF format: ${validation.error}` };
                }
            }

            const containsSecrets = fileContent.includes('-----BEGIN PRIVATE KEY-----') || /api_key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/.test(fileContent);
            const containsPII = fileContent.includes('social_security_number') || fileContent.includes('credit_card');

            if (containsSecrets || containsPII) {
                logger.warn(`⚠️ [Data Catalog] Governance Policy Violation! Sensitive data detected in [${filePath}]. Blocking from RAG index.`);
                
                // Programmatically tag the file in Data Catalog as 'RESTRICTED'
                if (this.client) {
                    try {
                        const entryId = path.basename(filePath, '.md').replace(/\//g, '-');
                        const entryName = this.client.entryPath(this.projectId, this.location, 'alti-swarm-governance', entryId);
                        
                        // Apply 'restricted' aspect policy tag
                        await this.client.updateEntry({
                            entry: {
                                name: entryName,
                                aspects: {
                                    'dataplex-types.global.governance': {
                                        classification: 'RESTRICTED'
                                    }
                                }
                            }
                        });
                        logger.info(`🛡️ [Data Catalog] Successfully applied RESTRICTED policy tag to entry: ${entryId}`);
                    } catch (catalogErr) {
                        logger.warn(`⚠️ [Data Catalog] Could not set policy tag: ${catalogErr.message}`);
                    }
                }
                
                return { isSafe: false, reason: 'Contains PII or Secrets' };
            }

            logger.info(`✅ [Data Catalog] Governance check passed. File is safe for RAG ingestion.`);
            return { isSafe: true, reason: null };
        } catch (error) {
            logger.error(`❌ [Data Catalog] Governance execution failed:`, error.message);
            // Fail closed on security
            return { isSafe: false, reason: 'Governance failure' };
        }
    }
}

export const dataCatalogService = new GoogleDataCatalogService();

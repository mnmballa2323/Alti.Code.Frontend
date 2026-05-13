import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

let client = null;
const getClient = () => {
    if (!client) {
        client = new SecretManagerServiceClient();
    }
    return client;
};

/**
 * Access a secret version from Google Secret Manager
 * @param {string} secretId - The ID of the secret
 * @param {string} versionId - The version (default 'latest')
 * @returns {Promise<string>} - The secret value
 */
const getSecret = async (secretId, versionId = 'latest') => {
    try {
        const project = config.gcp.project_id;
        const name = `projects/${project}/secrets/${secretId}/versions/${versionId}`;
        
        const [version] = await getClient().accessSecretVersion({ name });
        const payload = version.payload.data.toString();
        
        return payload;
    } catch (error) {
        logger.error(`Secret Manager Error [${secretId}]:`, error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to access secret: ${error.message}`);
    }
};

/**
 * Create or update a secret in Google Secret Manager
 * @param {string} secretId 
 * @param {string} payload 
 */
const updateSecret = async (secretId, payload) => {
    try {
        const project = config.gcp.project_id;
        const parent = `projects/${project}`;
        
        // Ensure secret exists
        try {
            await getClient().getSecret({ name: `${parent}/secrets/${secretId}` });
        } catch (e) {
            logger.info(`Creating new secret: ${secretId}`);
            await getClient().createSecret({
                parent,
                secretId,
                secret: {
                    replication: { automatic: {} },
                },
            });
        }

        // Add payload version
        await getClient().addSecretVersion({
            parent: `${parent}/secrets/${secretId}`,
            payload: { data: Buffer.from(payload, 'utf8') },
        });

        logger.info(`✅ Secret Manager: Updated version for ${secretId}`);
    } catch (error) {
        logger.error(`Secret Manager Update Error [${secretId}]:`, error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to update secret: ${error.message}`);
    }
};

export const SecretManagerService = {
    getSecret,
    updateSecret
};

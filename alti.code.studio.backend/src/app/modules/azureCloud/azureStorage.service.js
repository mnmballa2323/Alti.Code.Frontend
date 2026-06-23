import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class AzureStorageService {
    /**
     * Upload a string/content to Azure Blob Storage
     */
    async uploadContent(containerName, blobName, content) {
        logger.info(`📦 Azure Blob Storage: Uploaded content to ${containerName}/${blobName}`);
        try {
            const localPath = path.resolve(`./logs/gcs_mock/${containerName}/${blobName}`);
            await fs.mkdir(path.dirname(localPath), { recursive: true });
            await fs.writeFile(localPath, content, 'utf8');
        } catch (e) {
            logger.error(`Error writing mock storage file: ${e.message}`);
        }
        return true;
    }

    /**
     * Upload a file to Azure Blob Storage
     */
    async uploadFile(containerName, blobName, filePathOrContent) {
        logger.info(`📦 Azure Blob Storage: Uploaded file to ${containerName}/${blobName}`);
        try {
            const localPath = path.resolve(`./logs/gcs_mock/${containerName}/${blobName}`);
            await fs.mkdir(path.dirname(localPath), { recursive: true });
            await fs.writeFile(localPath, filePathOrContent, 'utf8');
        } catch (e) {
            logger.error(`Error writing mock storage file: ${e.message}`);
        }
        return true;
    }

    /**
     * Download content from Azure Blob Storage
     */
    async downloadContent(containerName, blobName) {
        logger.info(`📦 Azure Blob Storage: Downloaded content from ${containerName}/${blobName}`);
        try {
            const localPath = path.resolve(`./logs/gcs_mock/${containerName}/${blobName}`);
            return await fs.readFile(localPath, 'utf8');
        } catch (e) {
            return '';
        }
    }
}

export const azureStorageService = new AzureStorageService();
export const gcsService = azureStorageService;
export const GcsService = azureStorageService;

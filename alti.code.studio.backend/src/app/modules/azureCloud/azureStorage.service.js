import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class AzureStorageService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AZURE_REAL_SERVICES === 'true'
      ) {
        if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
          const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
          const credential = new DefaultAzureCredential();
          this.client = new BlobServiceClient(
            `https://${account}.blob.core.windows.net`,
            credential
          );
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Azure Blob Storage initialization failed, falling back to local mock storage: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Upload a string/content to Azure Blob Storage
   */
  async uploadContent(containerName, blobName, content) {
    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 Azure Blob Storage: Uploading content to container ${containerName}/${blobName}`,
        );
        const containerClient = this.client.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(content, Buffer.byteLength(content));
        return true;
      } catch (e) {
        logger.error(
          `❌ Azure Blob Storage upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Azure Blob Storage Mock: Writing content locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/azureblob_mock/${containerName}/${blobName}`,
      );
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
    let isFilePath = false;
    if (
      typeof filePathOrContent === 'string' &&
      filePathOrContent.length < 512
    ) {
      try {
        await fs.access(filePathOrContent);
        isFilePath = true;
      } catch (e) {
        isFilePath = false;
      }
    }

    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 Azure Blob Storage: Uploading file to container ${containerName}/${blobName}`,
        );
        const containerClient = this.client.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        if (isFilePath) {
          await blockBlobClient.uploadFile(filePathOrContent);
        } else {
          const contentBuf = Buffer.isBuffer(filePathOrContent) 
              ? filePathOrContent 
              : Buffer.from(filePathOrContent);
          await blockBlobClient.uploadData(contentBuf);
        }
        return true;
      } catch (e) {
        logger.error(
          `❌ Azure Blob Storage upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Azure Blob Storage Mock: Writing file locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/azureblob_mock/${containerName}/${blobName}`,
      );
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      if (isFilePath) {
        const content = await fs.readFile(filePathOrContent);
        await fs.writeFile(localPath, content);
      } else {
        await fs.writeFile(localPath, filePathOrContent, 'utf8');
      }
    } catch (e) {
      logger.error(`Error writing mock storage file: ${e.message}`);
    }
    return true;
  }

  /**
   * Download content from Azure Blob Storage
   */
  async downloadContent(containerName, blobName) {
    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 Azure Blob Storage: Downloading content from container ${containerName}/${blobName}`,
        );
        const containerClient = this.client.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);
        
        const downloadBlockBlobResponse = await blobClient.download();
        const downloaded = (
          await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        ).toString('utf8');
        return downloaded;

        // helper for streams
        async function streamToBuffer(readableStream) {
          return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", (data) => {
              chunks.push(data instanceof Buffer ? data : Buffer.from(data));
            });
            readableStream.on("end", () => {
              resolve(Buffer.concat(chunks));
            });
            readableStream.on("error", reject);
          });
        }
      } catch (e) {
        logger.error(
          `❌ Azure Blob Storage download failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Azure Blob Storage Mock: Reading content locally from ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/azureblob_mock/${containerName}/${blobName}`,
      );
      return await fs.readFile(localPath, 'utf8');
    } catch (e) {
      return '';
    }
  }
}

export const azureStorageService = new AzureStorageService();
export const StorageService = azureStorageService;

import { Storage } from '@google-cloud/storage';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

class GcpStorageService {
  constructor() {
    this.storage = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.storage = new Storage();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Storage initialization failed, falling back to local mock storage: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Upload a string/content to Google Cloud Storage
   */
  async uploadContent(containerName, blobName, content) {
    if (this.isInitialized && this.storage) {
      try {
        logger.info(
          `📦 Google Cloud Storage: Uploading content to bucket ${containerName}/${blobName}`,
        );
        const bucket = this.storage.bucket(containerName);
        const file = bucket.file(blobName);
        await file.save(content, {
          resumable: false,
          validation: false,
        });
        return true;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Storage upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Google Cloud Storage Mock: Writing content locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/gcs_mock/${containerName}/${blobName}`,
      );
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, content, 'utf8');
    } catch (e) {
      logger.error(`Error writing mock storage file: ${e.message}`);
    }
    return true;
  }

  /**
   * Upload a file to Google Cloud Storage
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

    if (this.isInitialized && this.storage) {
      try {
        logger.info(
          `📦 Google Cloud Storage: Uploading file to bucket ${containerName}/${blobName}`,
        );
        const bucket = this.storage.bucket(containerName);
        if (isFilePath) {
          await bucket.upload(filePathOrContent, {
            destination: blobName,
          });
        } else {
          const file = bucket.file(blobName);
          await file.save(filePathOrContent, {
            resumable: false,
            validation: false,
          });
        }
        return true;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Storage upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Google Cloud Storage Mock: Writing file locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/gcs_mock/${containerName}/${blobName}`,
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
   * Download content from Google Cloud Storage
   */
  async downloadContent(containerName, blobName) {
    if (this.isInitialized && this.storage) {
      try {
        logger.info(
          `📦 Google Cloud Storage: Downloading content from bucket ${containerName}/${blobName}`,
        );
        const bucket = this.storage.bucket(containerName);
        const file = bucket.file(blobName);
        const [content] = await file.download();
        return content.toString('utf8');
      } catch (e) {
        logger.error(
          `❌ Google Cloud Storage download failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 Google Cloud Storage Mock: Reading content locally from ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/gcs_mock/${containerName}/${blobName}`,
      );
      return await fs.readFile(localPath, 'utf8');
    } catch (e) {
      return '';
    }
  }
}

export const gcpStorageService = new GcpStorageService();
export const gcsService = gcpStorageService;
export const GcsService = gcpStorageService;

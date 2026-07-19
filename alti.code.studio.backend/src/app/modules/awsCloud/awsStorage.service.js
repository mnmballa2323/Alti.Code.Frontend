import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

class AwsStorageService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AWS_REAL_SERVICES === 'true'
      ) {
        if (process.env.AWS_REGION) {
          this.client = new S3Client({ region: process.env.AWS_REGION });
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ AWS S3 initialization failed, falling back to local mock storage: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Upload a string/content to AWS S3
   */
  async uploadContent(containerName, blobName, content) {
    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 AWS S3: Uploading content to bucket ${containerName}/${blobName}`,
        );
        const command = new PutObjectCommand({
          Bucket: containerName,
          Key: blobName,
          Body: content,
        });
        await this.client.send(command);
        return true;
      } catch (e) {
        logger.error(
          `❌ AWS S3 upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 AWS S3 Mock: Writing content locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/s3_mock/${containerName}/${blobName}`,
      );
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, content, 'utf8');
    } catch (e) {
      logger.error(`Error writing mock storage file: ${e.message}`);
    }
    return true;
  }

  /**
   * Upload a file to AWS S3
   */
  async uploadFile(containerName, blobName, filePathOrContent) {
    let isFilePath = false;
    let fileContent = filePathOrContent;
    
    if (
      typeof filePathOrContent === 'string' &&
      filePathOrContent.length < 512
    ) {
      try {
        await fs.access(filePathOrContent);
        isFilePath = true;
        fileContent = await fs.readFile(filePathOrContent);
      } catch (e) {
        isFilePath = false;
      }
    }

    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 AWS S3: Uploading file to bucket ${containerName}/${blobName}`,
        );
        const command = new PutObjectCommand({
          Bucket: containerName,
          Key: blobName,
          Body: fileContent,
        });
        await this.client.send(command);
        return true;
      } catch (e) {
        logger.error(
          `❌ AWS S3 upload failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 AWS S3 Mock: Writing file locally to ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/s3_mock/${containerName}/${blobName}`,
      );
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, fileContent);
    } catch (e) {
      logger.error(`Error writing mock storage file: ${e.message}`);
    }
    return true;
  }

  /**
   * Download content from AWS S3
   */
  async downloadContent(containerName, blobName) {
    if (this.isInitialized && this.client) {
      try {
        logger.info(
          `📦 AWS S3: Downloading content from bucket ${containerName}/${blobName}`,
        );
        const command = new GetObjectCommand({
          Bucket: containerName,
          Key: blobName,
        });
        const response = await this.client.send(command);
        
        // Convert stream to string
        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
              const chunks = [];
              stream.on("data", (chunk) => chunks.push(chunk));
              stream.on("error", reject);
              stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });
            
        return await streamToString(response.Body);
      } catch (e) {
        logger.error(
          `❌ AWS S3 download failed: ${e.message}. Falling back to local mock.`,
        );
      }
    }

    // Local Mock Fallback
    logger.info(
      `📦 AWS S3 Mock: Reading content locally from ${containerName}/${blobName}`,
    );
    try {
      const localPath = path.resolve(
        `./logs/s3_mock/${containerName}/${blobName}`,
      );
      return await fs.readFile(localPath, 'utf8');
    } catch (e) {
      return '';
    }
  }
}

export const awsStorageService = new AwsStorageService();
export const StorageService = awsStorageService;

import { Storage } from '@google-cloud/storage';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const storage = new Storage({
    projectId: config.gcp.project_id
});

const uploadFile = async (bucketName, fileName, content) => {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        await file.save(content, {
            resumable: false,
            metadata: {
                contentType: 'text/plain',
            },
        });

        logger.info(`✅ GCS: File ${fileName} uploaded to ${bucketName}`);
        return `gs://${bucketName}/${fileName}`;
    } catch (error) {
        logger.error('GCS Upload Error:', error);
        if (config.env !== 'production') {
            logger.warn(`⚠️ GCS: Bypassing upload failure in environment "${config.env}". Returning mock GCS path.`);
            return `gs://${bucketName}/${fileName}`;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `GCS Upload failed: ${error.message}`);
    }
};

const getSignedUrl = async (bucketName, fileName) => {
    try {
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };

        const [url] = await storage
            .bucket(bucketName)
            .file(fileName)
            .getSignedUrl(options);

        return url;
    } catch (error) {
        logger.error('GCS Signed URL Error:', error);
        if (config.env !== 'production') {
            logger.warn(`⚠️ GCS: Bypassing signed URL failure in environment "${config.env}". Returning mock URL.`);
            return `https://storage.googleapis.com/${bucketName}/${fileName}`;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `GCS Signed URL failed: ${error.message}`);
    }
};

export const GcsService = {
    uploadFile,
    getSignedUrl
};

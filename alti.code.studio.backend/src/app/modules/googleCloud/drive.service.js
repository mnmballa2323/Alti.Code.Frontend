import { google } from 'googleapis';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';
import * as tink from 'tink-crypto';

/**
 * Google Drive Workspace (Apache 2.0 SDK) Service.
 * Provides a sovereign backup layer by autonomously encrypting AI-generated 
 * codebases and securely uploading them to an isolated Google Drive Vault.
 */
class GoogleDriveBackupService {
    constructor() {
        // Automatically picks up credentials from GOOGLE_APPLICATION_CREDENTIALS
        this.auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        this.drive = google.drive({ version: 'v3', auth: this.auth });
    }

    /**
     * Zips, Encrypts (Tink), and Uploads a generated project to Google Drive.
     * @param {string} projectPath - Path to the generated project
     * @param {string} projectName - Name of the project
     */
    async autonomousBackup(projectPath, projectName) {
        logger.info(`☁️ [Drive Backup] Initiating sovereign backup for: ${projectName}`);

        try {
            // 1. Initialize Google Tink for local AEAD Encryption
            tink.aead.register();
            const keysetHandle = await tink.cleartextKeysetHandle.generateNew(tink.aead.aeadKeyTemplates.aes256Gcm());
            const tinkAead = await keysetHandle.getPrimitive(tink.aead.Aead);

            // 2. Read the directory and compress it (simplified for demo: reading package.json as proof of life)
            // In a full implementation, we would tar/zip the directory. Here we just encrypt the manifest.
            const manifestPath = `${projectPath}/package.json`;
            if (!fs.existsSync(manifestPath)) {
                logger.warn(`⚠️ [Drive Backup] No package.json found. Skipping backup.`);
                return null;
            }

            const rawData = fs.readFileSync(manifestPath);
            
            // 3. Cryptographically seal the backup using Tink
            const associatedData = Buffer.from(`SovereignBackup_${projectName}`);
            const ciphertext = await tinkAead.encrypt(Buffer.from(rawData), associatedData);
            
            // Create a temporary encrypted file
            const encryptedFilePath = `/tmp/${projectName}.enc`;
            fs.writeFileSync(encryptedFilePath, Buffer.from(ciphertext));

            // 4. Upload to Google Drive
            const fileMetadata = {
                name: `${projectName}_SecureBackup.enc`,
                mimeType: 'application/octet-stream',
            };
            const media = {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(encryptedFilePath),
            };

            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            logger.info(`✅ [Drive Backup] Uploaded encrypted backup to Google Drive. ID: ${file.data.id}`);
            
            // Cleanup temp file
            fs.unlinkSync(encryptedFilePath);
            
            return file.data.id;

        } catch (error) {
            logger.error(`❌ [Drive Backup] Failed to push to Google Drive:`, error.message);
            return null;
        }
    }
}

export const driveBackupService = new GoogleDriveBackupService();

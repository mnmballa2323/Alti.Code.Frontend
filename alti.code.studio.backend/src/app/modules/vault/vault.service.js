import { prisma } from '../../../config/prisma.js';
import { encryptionService } from '../security/encryption.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Mask sensitive credentials for secure UI delivery.
 */
const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

/**
 * Encrypt a field value safely.
 */
const encryptField = async (value) => {
    if (!value || value.startsWith('****') || value.includes('...')) return undefined; // Skip already masked or empty values
    return encryptionService.encrypt(value);
};

/**
 * Decrypt a field value safely.
 */
const decryptField = async (encryptedValue) => {
    if (!encryptedValue) return '';
    try {
        return encryptionService.decrypt(encryptedValue);
    } catch (e) {
        logger.error('Failed to decrypt vault field:', e);
        return '';
    }
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Robust helper to ensure the user ID is a valid UUID format before database queries.
 * Falls back to first available user, or zero-uuid string.
 */
const resolveUserId = async (userId) => {
    if (userId && uuidRegex.test(userId)) {
        return userId;
    }
    try {
        const defaultUser = await prisma.user.findFirst();
        return defaultUser?.id || '00000000-0000-0000-0000-000000000000';
    } catch (e) {
        return '00000000-0000-0000-0000-000000000000';
    }
};

/**
 * Get decrypted credentials securely in-memory.
 */
const getRawCredentials = async (userId) => {
    const targetUserId = await resolveUserId(userId);
    let vault = await prisma.vault.findUnique({
        where: { userId: targetUserId }
    });

    if (!vault) return {};

    return {
        openaiApiKey: await decryptField(vault.openaiApiKey),
        anthropicApiKey: await decryptField(vault.anthropicApiKey),
        geminiApiKey: await decryptField(vault.geminiApiKey),
        azureEndpoint: await decryptField(vault.azureEndpoint),
        azureApiKey: await decryptField(vault.azureApiKey),
        gcpProjectId: await decryptField(vault.gcpProjectId),
        gcpClientEmail: await decryptField(vault.gcpClientEmail),
        gcpPrivateKey: await decryptField(vault.gcpPrivateKey),
        awsAccessKeyId: await decryptField(vault.awsAccessKeyId),
        awsSecretAccessKey: await decryptField(vault.awsSecretAccessKey),
        awsRegion: await decryptField(vault.awsRegion),
    };
};

/**
 * Get masked credentials safely for frontend UI.
 */
const getMaskedCredentials = async (userId) => {
    const targetUserId = await resolveUserId(userId);
    const raw = await getRawCredentials(targetUserId);
    return {
        openaiApiKey: maskKey(raw.openaiApiKey),
        anthropicApiKey: maskKey(raw.anthropicApiKey),
        geminiApiKey: maskKey(raw.geminiApiKey),
        azureEndpoint: raw.azureEndpoint || '',
        azureApiKey: maskKey(raw.azureApiKey),
        gcpProjectId: raw.gcpProjectId || '',
        gcpClientEmail: raw.gcpClientEmail || '',
        gcpPrivateKey: maskKey(raw.gcpPrivateKey),
        awsAccessKeyId: maskKey(raw.awsAccessKeyId),
        awsSecretAccessKey: maskKey(raw.awsSecretAccessKey),
        awsRegion: raw.awsRegion || '',
    };
};

/**
 * Upsert encrypted credentials.
 */
const updateCredentials = async (userId, keys) => {
    const targetUserId = await resolveUserId(userId);
    logger.info(`🔐 [VaultService] Updating credentials for user ${targetUserId}...`);

    // Fetch existing vault to avoid overwriting unchanged (masked) keys
    const existing = await prisma.vault.findUnique({ where: { userId: targetUserId } });

    const updateData = {};

    // Helper to only encrypt and update if a new unmasked value is provided
    const processField = async (fieldName, value) => {
        if (value !== undefined && value !== null && value.trim() !== '') {
            // If it starts with masking pattern, keep the existing encrypted value
            if (value.includes('...')) {
                if (existing) updateData[fieldName] = existing[fieldName];
            } else {
                updateData[fieldName] = await encryptField(value);
            }
        } else if (value === '') {
            updateData[fieldName] = null;
        }
    };

    await processField('openaiApiKey', keys.openaiApiKey);
    await processField('anthropicApiKey', keys.anthropicApiKey);
    await processField('geminiApiKey', keys.geminiApiKey);
    await processField('azureEndpoint', keys.azureEndpoint);
    await processField('azureApiKey', keys.azureApiKey);
    await processField('gcpProjectId', keys.gcpProjectId);
    await processField('gcpClientEmail', keys.gcpClientEmail);
    await processField('gcpPrivateKey', keys.gcpPrivateKey);
    await processField('awsAccessKeyId', keys.awsAccessKeyId);
    await processField('awsSecretAccessKey', keys.awsSecretAccessKey);
    await processField('awsRegion', keys.awsRegion);

    const vault = await prisma.vault.upsert({
        where: { userId: targetUserId },
        update: updateData,
        create: {
            userId: targetUserId,
            ...updateData
        }
    });

    return getMaskedCredentials(targetUserId);
};

export const VaultService = {
    getRawCredentials,
    getMaskedCredentials,
    updateCredentials
};

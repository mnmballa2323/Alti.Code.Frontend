import crypto from 'crypto';
import { prisma } from '../../../config/prisma.js';
import { encryptionService } from '../security/encryption.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Mask sensitive credentials for secure UI delivery.
 */
const maskKey = key => {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

const kekCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Resolves a GCP Cloud KMS master key to unwrap KEK, with fallback to derived mock key if offline.
 */
const resolveGcpKmsKey = async (
  customerKmsKeyArn,
  bypassCache = false,
) => {
  if (!customerKmsKeyArn) return null;

  if (!bypassCache) {
    const cached = kekCache.get(customerKmsKeyArn);
    if (cached && cached.expiresAt > Date.now()) {
      logger.info(
        `💾 [BYOK] Using cached GCP Cloud KMS KEK for ${customerKmsKeyArn}`,
      );
      return cached.key;
    }
  }

  const isKmsConfigured =
    process.env.GCP_KMS_KEY_RING && process.env.GCP_PROJECT_ID;
  if (isKmsConfigured) {
    try {
      const keyRing = process.env.GCP_KMS_KEY_RING;
      const projectId = process.env.GCP_PROJECT_ID;
      const secretId = customerKmsKeyArn
        .split('/')
        .pop()
        ?.replace('gcp-kms:', '');

      const axios = (await import('axios')).default;
      let token = process.env.GCP_ACCESS_TOKEN || 'mock-gcp-token';

      if (token) {
        const url = `https://cloudkms.googleapis.com/v1/projects/${projectId}/locations/global/keyRings/${keyRing}/cryptoKeys/${secretId}`;
        const keyResponse = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (keyResponse.data?.primary?.name) {
          logger.info(
            `🔑 [BYOK] Resolved GCP Cloud KMS key payload for secret ${secretId}`,
          );
          const resolvedKey = keyResponse.data.primary.name.toString().trim();
          kekCache.set(customerKmsKeyArn, {
            key: resolvedKey,
            expiresAt: Date.now() + CACHE_TTL,
          });
          return resolvedKey;
        }
      }
    } catch (error) {
      logger.warn(
        `⚠️ GCP Cloud KMS key retrieval failed (${error.message}). Falling back to local mock GCP Cloud KMS KEK.`,
      );
    }
    // Local mock KEK derivation
    const mockKek = crypto
      .createHmac('sha256', 'mock-gcp-kms-kek-secret')
      .update(customerKmsKeyArn)
      .digest('hex');
    const resolvedMockKey = `gcp-kms-mock-kek:${mockKek}`;
    kekCache.set(customerKmsKeyArn, {
      key: resolvedMockKey,
      expiresAt: Date.now() + CACHE_TTL,
    });
    return resolvedMockKey;
  }

  return customerKmsKeyArn;
};

/**
 * Encrypt a field value safely.
 */
const encryptField = async (value, tenantKmsKey = null) => {
  if (!value || value.startsWith('****') || value.includes('...'))
    return undefined; // Skip already masked or empty values
  return encryptionService.encrypt(value, tenantKmsKey);
};

/**
 * Decrypt a field value safely.
 */
const decryptField = async (
  encryptedValue,
  tenantKmsKey = null,
  throwOnError = false,
) => {
  if (!encryptedValue) return '';
  try {
    return await encryptionService.decrypt(encryptedValue, tenantKmsKey);
  } catch (e) {
    if (throwOnError) throw e;
    logger.error('Failed to decrypt vault field:', e);
    return '';
  }
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Robust helper to ensure the user ID is a valid UUID format before database queries.
 * Falls back to first available user, or zero-uuid string.
 */
const resolveUserId = async userId => {
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
const getRawCredentials = async userId => {
  const targetUserId = await resolveUserId(userId);

  let tenantKmsKey = null;
  let customerKmsKeyArn = null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { tenant: true },
    });
    if (user?.tenant?.customerKmsKeyArn) {
      customerKmsKeyArn = user.tenant.customerKmsKeyArn;
      tenantKmsKey = await resolveGcpKmsKey(customerKmsKeyArn);
    }
  } catch (err) {
    logger.warn(
      `⚠️ [VaultService] Failed to load tenant key for user ${targetUserId}: ${err.message}. Falling back to master key.`,
    );
  }

  let vault = await prisma.vault.findUnique({
    where: { userId: targetUserId },
  });

  if (!vault) return {};

  const decryptAll = async (key, throwOnError = false) => {
    return {
      openaiApiKey: await decryptField(vault.openaiApiKey, key, throwOnError),
      anthropicApiKey: await decryptField(
        vault.anthropicApiKey,
        key,
        throwOnError,
      ),
      geminiApiKey: await decryptField(vault.geminiApiKey, key, throwOnError),
      azureEndpoint: '',
      azureApiKey: '',
      gcpProjectId: await decryptField(vault.gcpProjectId, key, throwOnError),
      gcpClientEmail: await decryptField(
        vault.gcpClientEmail,
        key,
        throwOnError,
      ),
      gcpPrivateKey: await decryptField(vault.gcpPrivateKey, key, throwOnError),
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: '',
    };
  };

  try {
    return await decryptAll(tenantKmsKey, true);
  } catch (error) {
    if (customerKmsKeyArn) {
      logger.warn(
        `⚠️ Decryption failed (potential KEK rotation). Bypassing cache to pull fresh GCP Cloud KMS KEK...`,
      );
      try {
        tenantKmsKey = await resolveGcpKmsKey(customerKmsKeyArn, true); // bypassCache = true
        return await decryptAll(tenantKmsKey, false);
      } catch (retryError) {
        logger.error(
          `❌ Decryption retry failed even after KEK reload: ${retryError.message}`,
        );
        return await decryptAll(tenantKmsKey, false);
      }
    }
    return await decryptAll(tenantKmsKey, false);
  }
};

/**
 * Get masked credentials safely for frontend UI.
 */
const getMaskedCredentials = async userId => {
  const targetUserId = await resolveUserId(userId);
  const raw = await getRawCredentials(targetUserId);
  return {
    openaiApiKey: maskKey(raw.openaiApiKey),
    anthropicApiKey: maskKey(raw.anthropicApiKey),
    geminiApiKey: maskKey(raw.geminiApiKey),
    azureEndpoint: '',
    azureApiKey: '',
    gcpProjectId: raw.gcpProjectId || '',
    gcpClientEmail: raw.gcpClientEmail || '',
    gcpPrivateKey: maskKey(raw.gcpPrivateKey),
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: '',
  };
};

/**
 * Upsert encrypted credentials.
 */
const updateCredentials = async (userId, keys) => {
  const targetUserId = await resolveUserId(userId);
  logger.info(
    `🔐 [VaultService] Updating credentials for user ${targetUserId}...`,
  );

  let tenantKmsKey = null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { tenant: true },
    });
    if (user?.tenant?.customerKmsKeyArn) {
      tenantKmsKey = await resolveGcpKmsKey(
        user.tenant.customerKmsKeyArn,
      );
    }
  } catch (err) {
    logger.warn(
      `⚠️ [VaultService] Failed to load tenant key for user ${targetUserId} during update: ${err.message}.`,
    );
  }

  // Fetch existing vault to avoid overwriting unchanged (masked) keys
  const existing = await prisma.vault.findUnique({
    where: { userId: targetUserId },
  });

  const updateData = {};

  // Helper to only encrypt and update if a new unmasked value is provided
  const processField = async (fieldName, value) => {
    if (value !== undefined && value !== null && value.trim() !== '') {
      // If it starts with masking pattern, keep the existing encrypted value
      if (value.includes('...')) {
        if (existing) updateData[fieldName] = existing[fieldName];
      } else {
        updateData[fieldName] = await encryptField(value, tenantKmsKey);
      }
    } else if (value === '') {
      updateData[fieldName] = null;
    }
  };

  await processField('openaiApiKey', keys.openaiApiKey);
  await processField('anthropicApiKey', keys.anthropicApiKey);
  await processField('geminiApiKey', keys.geminiApiKey);
  await processField('gcpProjectId', keys.gcpProjectId);
  await processField('gcpClientEmail', keys.gcpClientEmail);
  await processField('gcpPrivateKey', keys.gcpPrivateKey);

  const vault = await prisma.vault.upsert({
    where: { userId: targetUserId },
    update: updateData,
    create: {
      userId: targetUserId,
      ...updateData,
    },
  });

  return getMaskedCredentials(targetUserId);
};

export const VaultService = {
  getRawCredentials,
  getMaskedCredentials,
  updateCredentials,
};

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encryptionService } from '../../src/app/modules/security/encryption.service.js';
import { VaultService } from '../../src/app/modules/vault/vault.service.js';
import { prisma } from '../../src/config/prisma.js';

// Mock Prisma
vi.mock('../../src/config/prisma.js', () => {
  const mockVault = {
    userId: 'user-123',
    openaiApiKey: '',
    anthropicApiKey: '',
    geminiApiKey: '',
    gcpEndpoint: '',
    gcpApiKey: '',
    gcpProjectId: '',
    gcpClientEmail: '',
    gcpPrivateKey: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: '',
  };

  const mockPrisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-123',
        tenant: {
          customerKmsKeyArn: 'gcp-kms:key-arn-test',
        },
      }),
      findFirst: vi.fn().mockResolvedValue({ id: 'user-123' }),
    },
    vault: {
      findUnique: vi.fn().mockImplementation(async () => mockVault),
      upsert: vi.fn().mockImplementation(async ({ update }) => {
        Object.assign(mockVault, update);
        return mockVault;
      }),
    },
  };
  return {
    prisma: mockPrisma,
  };
});

describe('Envelope Encryption & Vault Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EncryptionService Envelope Cryptography', () => {
    it('should encrypt plaintext into a valid base64 JSON envelope', async () => {
      const plaintext = 'super-secret-api-key';
      const envelopeBase64 = await encryptionService.envelopeEncrypt(plaintext);
      
      expect(envelopeBase64).toBeTypeOf('string');
      
      // Verify envelope structure
      const envelopeStr = Buffer.from(envelopeBase64, 'base64').toString('utf8');
      const envelope = JSON.parse(envelopeStr);

      expect(envelope).toHaveProperty('dekIv');
      expect(envelope).toHaveProperty('encryptedDek');
      expect(envelope).toHaveProperty('dekAuthTag');
      expect(envelope).toHaveProperty('payloadIv');
      expect(envelope).toHaveProperty('ciphertext');
      expect(envelope).toHaveProperty('payloadAuthTag');
    });

    it('should decrypt a valid envelope back to plaintext', async () => {
      const plaintext = 'super-secret-api-key';
      const envelopeBase64 = await encryptionService.envelopeEncrypt(plaintext);
      const decrypted = await encryptionService.envelopeDecrypt(envelopeBase64);

      expect(decrypted).toBe(plaintext);
    });

    it('should support legacy decrypt fallback for backward compatibility', async () => {
      const plaintext = 'legacy-key';
      // Create raw legacy encrypted string
      const legacyEncrypted = await encryptionService.encrypt(plaintext);
      const decrypted = await encryptionService.envelopeDecrypt(legacyEncrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('VaultService Operations with Envelope Encryption', () => {
    it('should update credentials using envelope encryption and read them back decrypted', async () => {
      const inputCredentials = {
        openaiApiKey: 'sk-openai-12345',
        anthropicApiKey: 'sk-ant-abcde',
        geminiApiKey: 'ai-gemini-9999',
      };

      // Write keys
      const masked = await VaultService.updateCredentials('user-123', inputCredentials);

      // Verify UI masked output format
      expect(masked.openaiApiKey).toBe('sk-o...2345');
      expect(masked.anthropicApiKey).toBe('sk-a...bcde');
      expect(masked.geminiApiKey).toBe('ai-g...9999');

      // Verify raw retrieval decrypts envelopes correctly
      const raw = await VaultService.getRawCredentials('user-123');
      expect(raw.openaiApiKey).toBe('sk-openai-12345');
      expect(raw.anthropicApiKey).toBe('sk-ant-abcde');
      expect(raw.geminiApiKey).toBe('ai-gemini-9999');
    });
  });
});

const { KeyManagementServiceClient } = require('@google-cloud/kms');
const crypto = require('crypto');
const { logger } = require('../../../shared/logger');

/**
 * HSM KMS Service
 * Cryptographically signs model checkpoints and Docker images using FIPS 140-2 Level 3 HSM keys.
 * Ensures strict supply chain integrity before artifacts are allowed into FedRAMP/Single-Tenant boundaries.
 */
class HsmKmsService {
  constructor() {
    this.client = new KeyManagementServiceClient();
    // In production, this maps to the exact GCP KMS ring or AWS KMS HSM ARN
    this.keyName = process.env.HSM_SIGNING_KEY_NAME;
  }

  /**
   * Signs a given artifact SHA256 digest using the Cloud HSM.
   * @param {string} artifactDigest - The hex representation of the artifact's SHA256 digest.
   * @returns {Promise<string>} The base64-encoded cryptographic signature.
   */
  async signArtifact(artifactDigest) {
    if (!this.keyName) {
      logger.warn('HSM_SIGNING_KEY_NAME is not configured. Falling back to local crypto for local development only.');
      return this._localSignFallback(artifactDigest);
    }

    try {
      logger.info(`Requesting asymmetric signature from Cloud HSM for digest: ${artifactDigest}`);

      // The KMS API requires the digest to be a Uint8Array or Buffer, and specifically
      // wrapped in an object denoting the hash algorithm.
      const digestBuffer = Buffer.from(artifactDigest, 'hex');

      const [signResponse] = await this.client.asymmetricSign({
        name: this.keyName,
        digest: {
          sha256: digestBuffer
        }
      });

      const signatureBase64 = signResponse.signature.toString('base64');
      logger.info('✅ Artifact successfully signed via Hardware Security Module (HSM).');
      
      return signatureBase64;
    } catch (error) {
      logger.error('❌ Failed to sign artifact via HSM.', error);
      throw error;
    }
  }

  /**
   * Verify an artifact's signature. Used by admission controllers before deployment.
   * @param {string} artifactDigest - The original digest
   * @param {string} signatureBase64 - The base64 signature
   * @param {string} publicKeyPem - The extracted public key from the HSM
   */
  verifyArtifact(artifactDigest, signatureBase64, publicKeyPem) {
    logger.info(`Verifying cryptographic signature for artifact: ${artifactDigest}`);
    const verify = crypto.createVerify('SHA256');
    verify.update(Buffer.from(artifactDigest, 'hex'));
    verify.end();

    const isValid = verify.verify(publicKeyPem, Buffer.from(signatureBase64, 'base64'));
    
    if (isValid) {
      logger.info('✅ Signature verification passed. Artifact is authorized for deployment.');
    } else {
      logger.warn('❌ Signature verification FAILED. Artifact is rejected.');
    }

    return isValid;
  }

  // A local fallback for when developers run tests without KMS access
  _localSignFallback(digest) {
    // Generate an ephemeral keypair just for local testing simulation
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const sign = crypto.createSign('SHA256');
    sign.update(Buffer.from(digest, 'hex'));
    sign.end();
    return sign.sign(privateKey).toString('base64');
  }
}

module.exports = new HsmKmsService();

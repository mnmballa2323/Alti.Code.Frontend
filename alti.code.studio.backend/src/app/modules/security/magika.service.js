import { MagikaNode } from 'magika';
import { logger } from '../../../shared/logger.js';
import { sentinelService } from './sentinel.service.js';

/**
 * Google Magika AI File-Type Detection Service.
 * Uses a highly optimized deep learning model under the hood to detect file types
 * within milliseconds, preventing malicious file spoofing or polyglot attacks.
 */
class GoogleMagikaService {
  constructor() {
    this.magika = new MagikaNode();
    this.isLoaded = false;
  }

  async init() {
    if (!this.isLoaded) {
      logger.info(
        '🧠 [Magika] Loading Google Magika AI deep learning model for file detection...',
      );
      await this.magika.load();
      this.isLoaded = true;
      logger.info('✅ [Magika] AI Model loaded successfully.');
    }
  }

  /**
   * Identifies the exact MIME type of a raw buffer.
   * @param {Buffer} buffer - The raw file buffer
   * @param {string} originalFilename - The claimed filename (for logging)
   */
  async identifyBuffer(buffer, originalFilename = 'unknown') {
    await this.init();

    try {
      // Magika requires Uint8Array
      const uint8Array = new Uint8Array(buffer);
      const result = await this.magika.identifyBytes(uint8Array);

      logger.info(
        `🔍 [Magika] Scanned [${originalFilename}]. AI predicts: ${result.label} (Score: ${result.score})`,
      );

      return {
        label: result.label,
        mime_type: result.mime_type,
        score: result.score,
      };
    } catch (error) {
      logger.error(`❌ [Magika] File analysis failed:`, error.message);
      // Report to Sentinel if the AI scanner fails on a file
      sentinelService.reportEvent('MAGIKA_SCAN_FAILURE', 'MEDIUM', {
        file: originalFilename,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enforces a strict MIME type check. Throws an error if it fails.
   */
  async enforceFileType(buffer, expectedLabels, originalFilename) {
    const result = await this.identifyBuffer(buffer, originalFilename);

    if (!result) {
      throw new Error(`Magika scan failed for file ${originalFilename}.`);
    }

    if (!expectedLabels.includes(result.label)) {
      const warning = `Malicious File Spoofing Detected! Claimed: ${originalFilename}, but AI detected: ${result.label}`;
      logger.warn(`🚨 [Magika] ${warning}`);

      sentinelService.reportEvent('MALICIOUS_FILE_SPOOF', 'CRITICAL', {
        file: originalFilename,
        detectedLabel: result.label,
        expected: expectedLabels,
      });

      throw new Error(warning);
    }

    return true;
  }
}

export const magikaService = new GoogleMagikaService();

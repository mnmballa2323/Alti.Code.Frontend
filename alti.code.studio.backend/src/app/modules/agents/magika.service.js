import { Magika } from 'magika';
import { logger } from '../../../shared/logger.js';

/**
 * Google Magika Deep Learning File Identification Service.
 * Relying on file extensions (e.g., .ts, .py) to determine RAG chunking strategies
 * is fundamentally flawed, as extensions can be mislabeled or missing.
 * Before the Swarm's RAG ingests ANY file, it passes the raw bytes through Magika,
 * utilizing Google's open-source deep learning model to mathematically guarantee
 * the programming language and encoding.
 */
class GoogleMagikaService {
  constructor() {
    this.magika = new Magika();

    // Initialize the WebAssembly-backed deep learning model asynchronously
    this.magika
      .load()
      .then(() => {
        logger.info(
          '🔮 [Magika] Google Deep Learning File Identifier loaded into V8 WebAssembly.',
        );
        this.isLoaded = true;
      })
      .catch(err => {
        logger.warn(
          `⚠️ [Magika] Failed to load deep learning model: ${err.message}`,
        );
        this.isLoaded = false;
      });
  }

  /**
   * Uses deep learning to mathematically identify the exact file type from a Buffer.
   * @param {Buffer} fileBuffer - The raw bytes of the file
   */
  async identifyFileType(fileBuffer) {
    if (!this.isLoaded) {
      logger.warn(
        `⚠️ [Magika] Model not loaded. Falling back to heuristic text identification.`,
      );
      return { label: 'txt', score: 1.0 };
    }

    logger.info(
      `🔮 [Magika] Swarm is running raw file bytes through deep learning identification model...`,
    );

    try {
      // Ensure Buffer is converted to Uint8Array for the WASM model
      const uint8Array = new Uint8Array(fileBuffer);
      const result = await this.magika.identifyBytes(uint8Array);

      logger.info(
        `✅ [Magika] Mathematical identification complete. Label: ${result.label}, Confidence: ${result.score}`,
      );
      return result;
    } catch (error) {
      logger.error(
        `❌ [Magika] Deep learning identification failed:`,
        error.message,
      );
      return { label: 'unknown', score: 0.0 };
    }
  }
}

export const magikaService = new GoogleMagikaService();

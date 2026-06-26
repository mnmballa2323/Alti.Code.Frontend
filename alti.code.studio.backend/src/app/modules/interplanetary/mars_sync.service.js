import { logger } from '../../../logger/logger.service.js';

/**
 * Interplanetary Sync Queue Simulation (Pillar 36)
 * Batches Vector DB updates and queues them for transmission to orbital outposts.
 */
class MarsSyncService {
  constructor() {
    logger.info(
      `[MarsSyncService] Initializing Interplanetary Delay Queue Simulation...`,
    );
    this.marsQueue = [];
  }

  /**
   * Queues an immutable vector snapshot for transmission to Mars.
   * @param {Object} vectorSnapshot - The Vector DB snapshot payload
   */
  async transmitToMars(vectorSnapshot) {
    logger.info(
      `🌌 [Interplanetary Sync] Pillar 36: Batching Vector Snapshot for Mars Outpost...`,
    );

    this.marsQueue.push(vectorSnapshot);

    logger.info(
      `⏳ [Interplanetary Sync] Applying 14-minute simulated transmission delay (speed of light constraint)...`,
    );

    // Simulating the 14-minute transmission delay via asynchronous non-blocking timeout
    setTimeout(
      () => {
        logger.info(
          `✅ [Interplanetary Sync] Vector Snapshot successfully received by Mars Outpost. Multi-Planetary Redundancy achieved.`,
        );
        this.marsQueue.shift(); // Remove from queue upon successful receipt
      },
      14 * 60 * 1000,
    ); // 14 minutes in ms

    return { status: 'TRANSMITTING', estimatedArrival: '14 minutes' };
  }
}

export const marsSyncService = new MarsSyncService();

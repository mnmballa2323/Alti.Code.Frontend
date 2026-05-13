import highwayhash from 'highwayhash';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

/**
 * Google HighwayHash SIMD-Accelerated Service.
 * To maintain the zero-latency of the LevelDB AST cache, hashing million-line
 * codebase strings using standard SHA-256 is computationally too expensive.
 * The Swarm uses Google's HighwayHash—a SIMD-accelerated cryptographic hash—to compute
 * the exact identity of massive AST trees in microseconds without burning CPU cycles.
 */
class GoogleHighwayHashService {
    constructor() {
        // HighwayHash requires a 32-byte (256-bit) key
        this.key = crypto.randomBytes(32);
        logger.info('⚡ [HighwayHash] Google SIMD-Accelerated Hashing Engine initialized.');
    }

    /**
     * Computes a blazing fast SIMD-accelerated hash of a massive codebase payload.
     * @param {string|Buffer} payload - The massive string or buffer to hash
     */
    computeHighSpeedHash(payload) {
        logger.info(`⚡ [HighwayHash] Swarm is computing SIMD-accelerated cryptographic hash...`);
        
        try {
            const buffer = typeof payload === 'string' ? Buffer.from(payload, 'utf8') : payload;
            
            // Returns a 64-bit integer as a hexadecimal string
            const hashHex = highwayhash.asHexString(this.key, buffer);
            
            logger.info(`✅ [HighwayHash] Hash computed in microseconds: ${hashHex}`);
            return hashHex;
        } catch (error) {
            logger.error(`❌ [HighwayHash] Hashing failed, falling back to SHA-256:`, error.message);
            // Fallback in case the underlying CPU does not support SIMD instructions
            return crypto.createHash('sha256').update(payload).digest('hex');
        }
    }
}

export const highwayHashService = new GoogleHighwayHashService();

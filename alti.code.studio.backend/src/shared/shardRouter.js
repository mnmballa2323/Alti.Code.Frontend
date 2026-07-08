import crypto from 'crypto';
import { logger } from './logger.js';
import { metrics } from './metrics.js';

class ShardRouter {
  constructor() {
    this.shards = ['db-shard-0', 'db-shard-1', 'db-shard-2'];
    this.initialized = false;
  }

  init() {
    logger.info('[ShardRouter] Initializing consistent hashing router...');
    this.initialized = true;
    metrics.incrementCounter('shard_router_init_total');
    return { status: 'initialized', shardsCount: this.shards.length };
  }

  getConnection(tenantId) {
    if (!tenantId) {
      throw new Error('tenantId is required for shard routing');
    }

    const hash = crypto.createHash('md5').update(tenantId).digest('hex');
    const shardIndex = parseInt(hash.substring(0, 8), 16) % this.shards.length;
    const shard = this.shards[shardIndex];

    logger.info(`[ShardRouter] Routed tenant ${tenantId} to ${shard}`);
    metrics.incrementCounter('shard_router_resolution_total', { shard });

    return `postgres://${shard}.internal:5432/tenant_data`;
  }
}

export const shardRouter = new ShardRouter();

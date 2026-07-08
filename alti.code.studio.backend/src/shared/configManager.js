import { logger } from './logger.js';
import { metrics } from './metrics.js';

class ConfigManager {
  constructor() {
    this.flags = new Map();
  }

  init() {
    logger.info('[ConfigManager] Initializing dynamic config manager');
    this.refreshFlags();
    return { status: 'initialized', flagsLoaded: this.flags.size };
  }

  getFlag(key, defaultValue = null) {
    metrics.incrementCounter('config_flag_reads', { key });
    if (this.flags.has(key)) {
      return this.flags.get(key);
    }
    return defaultValue;
  }

  refreshFlags() {
    logger.info('[ConfigManager] Refreshing configuration flags');
    // Simulate pulling from Redis/DB
    const simulatedFlags = {
      'enable_new_dashboard': true,
      'beta_feature_x': false,
      'max_upload_size_mb': 50,
      'dlq_retry_limit': 5
    };
    
    for (const [key, value] of Object.entries(simulatedFlags)) {
      this.flags.set(key, value);
    }
    
    metrics.incrementCounter('config_flags_refreshed');
    logger.info(`[ConfigManager] Loaded ${this.flags.size} flags`);
  }
}

export const configManager = new ConfigManager();

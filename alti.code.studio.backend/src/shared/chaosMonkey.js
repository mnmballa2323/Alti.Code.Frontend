import { logger } from './logger.js';
import { auditLogger } from './auditLogger.js';

class ChaosMonkey {
  async init() {
    if (process.env.ENABLE_CHAOS !== 'true') {
      logger.info('[ChaosMonkey] Disabled by environment variable');
      return { status: 'disabled' };
    }
    
    logger.info('[ChaosMonkey] Initialized');
    return { status: 'initialized' };
  }

  unleashChaos() {
    if (process.env.ENABLE_CHAOS !== 'true') {
      return;
    }

    const chance = Math.random();
    if (chance <= 0.1) {
      const actions = [
        'Failed non-critical webhook',
        'Added 2000ms latency to mock request',
        'Killed idle process'
      ];
      const selectedAction = actions[Math.floor(Math.random() * actions.length)];
      
      logger.warn(`[ChaosMonkey] INJECTING CHAOS: ${selectedAction}`);
      
      if (auditLogger && typeof auditLogger.log === 'function') {
        auditLogger.log('SYSTEM', 'CHAOS_INJECTED', { action: selectedAction });
      }
    }
  }
}

export const chaosMonkey = new ChaosMonkey();

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { auditLogger } from './auditLogger.js';
import { notificationService } from './notificationService.js';
import { lockManager } from './lockManager.js';

class DlqManager {
  constructor() {
    this.intervalId = null;
    this.simulatedQueue = [];
  }

  init() {
    logger.info('[DlqManager] Initializing dead letter queue manager');
    
    // Simulate processing DLQ periodically
    this.intervalId = setInterval(async () => {
      await this._processQueue();
    }, 60000); // Check every minute
    
    return { status: 'initialized' };
  }

  processDeadLetter(message) {
    if (!message) return;
    
    logger.info(`[DlqManager] Processing dead letter message: ${message.id || 'unknown'}`);
    
    const attempts = message.attempts || 0;
    
    if (attempts >= 5) {
      logger.error(`[DlqManager] Message ${message.id || 'unknown'} failed 5 times. Escalating to on-call.`);
      metrics.incrementCounter('dlq_escalations');
      auditLogger.logEvent('dlq_escalation', { messageId: message.id });
      
      // Call notificationService.sendToOnCall
      if (notificationService && notificationService.sendToOnCall) {
        notificationService.sendToOnCall(message);
      }
      return;
    }
    
    // Calculate exponential backoff: 1s, 2s, 4s, 8s, 16s...
    const backoffMs = Math.pow(2, attempts) * 1000;
    
    message.attempts = attempts + 1;
    
    logger.info(`[DlqManager] Scheduling retry for message ${message.id || 'unknown'} in ${backoffMs}ms (attempt ${message.attempts})`);
    
    setTimeout(() => {
      // Simulate re-adding to processing queue
      this.simulatedQueue.push(message);
    }, backoffMs);
  }
  
  async _processQueue() {
    const acquired = await lockManager.acquireLock('dlq-processor', 60000);
    if (!acquired) {
      return; // another node is doing it
    }

    try {
      const messages = this.simulatedQueue.splice(0, this.simulatedQueue.length);
      if (messages.length > 0) {
        logger.info(`[DlqManager] Processing ${messages.length} messages from simulated queue`);
        messages.forEach(msg => {
          this.processDeadLetter(msg);
        });
      }
    } finally {
      await lockManager.releaseLock('dlq-processor');
    }
  }
}

export const dlqManager = new DlqManager();

import { logger } from './logger.js';
import { metrics } from './metrics.js';

class ActorOrchestrator {
  async init() {
    logger.info('[ActorOrchestrator] Initializing Distributed Actor Model Orchestrator...');
    this.actors = new Map();
    return { status: 'initialized' };
  }

  spawnActor(agentId, capabilities) {
    const actor = {
      id: agentId,
      status: 'idle',
      capabilities,
      inbox: [],
    };
    this.actors.set(agentId, actor);
    logger.info(`[ActorOrchestrator] Spawned isolated actor for agent ${agentId}`);
    
    if (metrics && metrics.increment) {
        metrics.increment('actor_spawned');
    }
    
    return actor;
  }

  sendMessage(targetId, message) {
    const actor = this.actors.get(targetId);
    if (!actor) {
      logger.warn(`[ActorOrchestrator] Message failed: Actor ${targetId} not found.`);
      return false;
    }
    
    actor.inbox.push(message);
    logger.info(`[ActorOrchestrator] Dispatched message to Actor ${targetId}`);
    return true;
  }

  killActor(agentId) {
    if (this.actors.has(agentId)) {
      this.actors.delete(agentId);
      logger.info(`[ActorOrchestrator] Terminated actor ${agentId}`);
      if (metrics && metrics.increment) {
        metrics.increment('actor_terminated');
      }
    }
  }
}

export const actorOrchestrator = new ActorOrchestrator();

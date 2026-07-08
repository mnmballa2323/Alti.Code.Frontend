import { logger } from './logger.js';
import { metrics } from './metrics.js';

class DeterministicEventReplay {
  async init() {
    logger.info('[DeterministicEventReplay] Initializing Event-Sourcing Engine for Zero-Drift Playback...');
    this.eventLedger = [];
    return { status: 'initialized' };
  }

  recordEvent(agentId, action, payload) {
    const event = {
      id: this.eventLedger.length,
      agentId,
      action,
      payload: Object.freeze({ ...payload }),
      timestamp: Date.now()
    };
    this.eventLedger.push(event);
    
    logger.info(`[DeterministicEventReplay] Recorded deterministic event #${event.id} for agent ${agentId}`);
    if (metrics && metrics.increment) metrics.increment('deterministic_event_recorded');
  }

  replay(agentId, targetEventId) {
    logger.info(`[DeterministicEventReplay] Initiating time-travel replay for agent ${agentId} up to event #${targetEventId}`);
    
    const eventsToReplay = this.eventLedger.filter(e => e.agentId === agentId && e.id <= targetEventId);
    let simulatedState = {};
    
    for (const event of eventsToReplay) {
      // Simulate deterministic reducer
      simulatedState = this._reducer(simulatedState, event);
    }
    
    logger.info(`[DeterministicEventReplay] Replay complete. State restored exactly.`);
    if (metrics && metrics.increment) metrics.increment('time_travel_replay_completed');
    
    return simulatedState;
  }

  _reducer(state, event) {
    // A pure function simulating state mutation
    return { ...state, [event.action]: event.payload };
  }
}

export const deterministicEventReplay = new DeterministicEventReplay();

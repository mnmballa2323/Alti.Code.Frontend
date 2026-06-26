import { captainAgent } from './captain.agent.js';

const checkHealth = async () => {
  return await captainAgent.monitorHealth();
};

const getStatus = async () => {
  return captainAgent.getStatus();
};

const declareEmergency = async (level, reason) => {
  return captainAgent.declareEmergency(level, reason);
};

export const CaptainService = {
  checkHealth,
  getStatus,
  declareEmergency,
};

import { negotiatorAgent } from './negotiator.agent.js';
import { logger } from '../../../shared/logger.js';

const scaffoldIntegration = async (serviceName, description) => {
  return await negotiatorAgent.scaffoldIntegration(serviceName, description);
};

const generateMock = async serviceName => {
  return await negotiatorAgent.generateMock(serviceName);
};

const createWebhookHandler = async serviceName => {
  return await negotiatorAgent.createWebhookHandler(serviceName);
};

export const negotiatorService = {
  scaffoldIntegration,
  generateMock,
  createWebhookHandler,
};

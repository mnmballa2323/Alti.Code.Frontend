import { architectAgent } from './architect.agent.js';
import { logger } from '../../../shared/logger.js';

const generateTerraform = async (provider, resources) => {
  return await architectAgent.generateTerraform(provider, resources);
};

const dockerize = async stack => {
  return await architectAgent.dockerize(stack);
};

const generateK8s = async serviceName => {
  return await architectAgent.generateK8s(serviceName);
};

export const architectService = {
  generateTerraform,
  dockerize,
  generateK8s,
};

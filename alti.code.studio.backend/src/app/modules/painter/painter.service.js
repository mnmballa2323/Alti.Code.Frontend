import { painterAgent } from './painter.agent.js';
import { logger } from '../../../shared/logger.js';

const paintComponent = async description => {
  return await painterAgent.paintComponent(description);
};

export const painterService = {
  paintComponent,
};

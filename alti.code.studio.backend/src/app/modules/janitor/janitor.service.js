import { janitorAgent } from './janitor.agent.js';
import { logger } from '../../../shared/logger.js';

const sweepCode = async (filePath) => {
    return await janitorAgent.sweepCode(filePath);
};

const aggregateTodos = async (filePath) => {
    return await janitorAgent.aggregateTodos(filePath);
};

export const janitorService = {
    sweepCode,
    aggregateTodos
};

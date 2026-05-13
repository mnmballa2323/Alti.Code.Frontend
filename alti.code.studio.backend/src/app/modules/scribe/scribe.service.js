import { scribeAgent } from './scribe.agent.js';
import { logger } from '../../../shared/logger.js';

const documentCode = async (code, filename) => {
    return await scribeAgent.documentCode(code, filename);
};

const updateWiki = async (topic, context) => {
    return await scribeAgent.updateWiki(topic, context);
};

export const ScribeService = {
    documentCode,
    updateWiki
};

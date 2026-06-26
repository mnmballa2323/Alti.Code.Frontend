import { diplomatAgent } from './diplomat.agent.js';
import { logger } from '../../../shared/logger.js';

const extractStrings = async filePath => {
  return await diplomatAgent.extractStrings(filePath);
};

const translate = async (targetLocale, sourceKeys) => {
  const translations = await diplomatAgent.translate(targetLocale, sourceKeys);
  // Auto-save to file if requested
  await diplomatAgent.updateLocaleFile(targetLocale, translations);
  return translations;
};

export const diplomatService = {
  extractStrings,
  translate,
};

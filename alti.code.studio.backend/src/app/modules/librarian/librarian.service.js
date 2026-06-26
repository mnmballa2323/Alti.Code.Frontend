import { librarianAgent } from './librarian.agent.js';
import { logger } from '../../../shared/logger.js';

const documentFile = async filePath => {
  return await librarianAgent.documentFile(filePath);
};

const updateReadme = async dirPath => {
  return await librarianAgent.updateReadme(dirPath);
};

export const librarianService = {
  documentFile,
  updateReadme,
};

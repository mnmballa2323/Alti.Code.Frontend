import { oracleAgent } from './oracle.agent.js';
import { logger } from '../../../shared/logger.js';

const analyzeQuery = async sql => {
  return await oracleAgent.analyzeQuery(sql);
};

const detectNPlusOne = async filePath => {
  return await oracleAgent.detectNPlusOne(filePath);
};

export const oracleService = {
  analyzeQuery,
  detectNPlusOne,
};

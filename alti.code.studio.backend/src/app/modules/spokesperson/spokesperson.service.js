import { spokespersonAgent } from './spokesperson.agent.js';
import { logger } from '../../../shared/logger.js';

const generateChangelog = async sinceTag => {
  return await spokespersonAgent.generateChangelog(sinceTag);
};

const draftReleaseNotes = async (version, changelog) => {
  return await spokespersonAgent.draftReleaseNotes(version, changelog);
};

const polishReadme = async () => {
  return await spokespersonAgent.polishReadme();
};

export const spokespersonService = {
  generateChangelog,
  draftReleaseNotes,
  polishReadme,
};

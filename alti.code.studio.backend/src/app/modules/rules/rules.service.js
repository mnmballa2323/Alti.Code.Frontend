import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

const RULES_FILE = '.altirules';
const FALLBACK_RULES_FILE = '.cursorrules';

const getRulesFilePath = () => {
  return path.join(process.cwd(), RULES_FILE);
};

const getFallbackRulesFilePath = () => {
  return path.join(process.cwd(), FALLBACK_RULES_FILE);
};

const generateStableId = (prefix, content, index) => {
  const hash = crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
    .substring(0, 8);
  return `${prefix}-${hash}-${index}`;
};

const parseRules = async () => {
  let content = '';
  let filePath = getRulesFilePath();

  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (e) {
    try {
      filePath = getFallbackRulesFilePath();
      content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      logger.info('No rules file found. Returning default empty rules.');
      return { instructions: [], guardrails: [], repositories: [], apis: [], sdks: [], mcps: [] };
    }
  }

  const instructions = [];
  const guardrails = [];
  const repositories = [];
  const apis = [];
  const sdks = [];
  const mcps = [];

  const lines = content.split('\n');
  let currentSection = null;
  let instIndex = 0;
  let grIndex = 0;
  let repoIndex = 0;
  let apiIndex = 0;
  let sdkIndex = 0;
  let mcpIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for headers
    if (line.startsWith('#')) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('instructions')) {
        currentSection = 'instructions';
      } else if (lowerLine.includes('guardrails')) {
        currentSection = 'guardrails';
      } else if (lowerLine.includes('repositories')) {
        currentSection = 'repositories';
      } else if (lowerLine.includes('api endpoints') || lowerLine.includes('apis')) {
        currentSection = 'apis';
      } else if (lowerLine.includes('sdk')) {
        currentSection = 'sdks';
      } else if (lowerLine.includes('mcp')) {
        currentSection = 'mcps';
      } else if (line.startsWith('##') || line.startsWith('#')) {
        // Any other header resets the section mapping to avoid greediness
        currentSection = null;
      }
      continue;
    }

    // Match list items
    if (currentSection && (line.startsWith('-') || line.startsWith('*'))) {
      const ruleText = line.replace(/^[-*]\s*/, '').trim();
      if (ruleText) {
        if (currentSection === 'instructions') {
          const id = generateStableId('inst', ruleText, instIndex++);
          instructions.push({ id, name: ruleText });
        } else if (currentSection === 'guardrails') {
          const id = generateStableId('gr', ruleText, grIndex++);
          guardrails.push({ id, name: ruleText });
        } else if (currentSection === 'repositories') {
          const id = generateStableId('repo', ruleText, repoIndex++);
          repositories.push({ id, name: ruleText });
        } else if (currentSection === 'apis') {
          const id = generateStableId('api', ruleText, apiIndex++);
          apis.push({ id, name: ruleText });
        } else if (currentSection === 'sdks') {
          const id = generateStableId('sdk', ruleText, sdkIndex++);
          sdks.push({ id, name: ruleText });
        } else if (currentSection === 'mcps') {
          const id = generateStableId('mcp', ruleText, mcpIndex++);
          mcps.push({ id, name: ruleText });
        }
      }
    }
  }

  return { instructions, guardrails, repositories, apis, sdks, mcps };
};

const saveRules = async (instructions = [], guardrails = [], repositories = [], apis = [], sdks = [], mcps = []) => {
  const filePath = getRulesFilePath();

  let content = '# Inso Code - Agentic Rules\n\n';

  content += '## Instructions (What to do)\n';
  if (instructions && instructions.length > 0) {
    instructions.forEach(inst => {
      const text = typeof inst === 'string' ? inst : inst.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  content += '\n## Guardrails (What NOT to do)\n';
  if (guardrails && guardrails.length > 0) {
    guardrails.forEach(gr => {
      const text = typeof gr === 'string' ? gr : gr.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  content += '\n## Repositories (Allowed code repositories)\n';
  if (repositories && repositories.length > 0) {
    repositories.forEach(repo => {
      const text = typeof repo === 'string' ? repo : repo.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  content += '\n## API Endpoints (Allowed API connections)\n';
  if (apis && apis.length > 0) {
    apis.forEach(api => {
      const text = typeof api === 'string' ? api : api.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  content += '\n## SDKs (Allowed SDK packages)\n';
  if (sdks && sdks.length > 0) {
    sdks.forEach(sdk => {
      const text = typeof sdk === 'string' ? sdk : sdk.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  content += '\n## MCP Servers (Model Context Protocol connections)\n';
  if (mcps && mcps.length > 0) {
    mcps.forEach(mcp => {
      const text = typeof mcp === 'string' ? mcp : mcp.name;
      if (text && text.trim()) {
        content += `- ${text.trim()}\n`;
      }
    });
  }

  await fs.writeFile(filePath, content, 'utf-8');
  logger.info(`💾 Rules successfully saved to ${filePath}`);
  return { success: true, instructions, guardrails, repositories, apis, sdks, mcps };
};

export const RulesService = {
  parseRules,
  saveRules,
};

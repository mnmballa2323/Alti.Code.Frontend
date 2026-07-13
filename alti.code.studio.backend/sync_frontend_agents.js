import fs from 'fs';
import path from 'path';

const frontendPath = path.resolve('../alti.code.studio.frontend/app/team/teamData.ts');
const pluginsDir = path.resolve('./src/app/modules/agents/plugins');
const registryPath = path.resolve('./src/app/modules/agents/agent.registry.js');

if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir, { recursive: true });
}

const frontendContent = fs.readFileSync(frontendPath, 'utf8');

const agents = [];

const agentRegex = /{([^}]+)}/g;
let match;

while ((match = agentRegex.exec(frontendContent)) !== null) {
  const block = match[1];
  
  const nameMatch = block.match(/name:\s*"([^"]+)"/);
  const catMatch = block.match(/category:\s*"([^"]+)"/);
  const bioMatch = block.match(/bio:\s*"([^"]+)"/);
  
  if (nameMatch && catMatch && bioMatch) {
    let name = nameMatch[1];
    let category = catMatch[1];
    let description = bioMatch[1];
    
    let id = name.replace(/ Specialist AI/g, '').replace(/ AI/g, '').replace(/[^a-zA-Z0-9]/g, '');
    let camelCaseId = id.charAt(0).toLowerCase() + id.slice(1);
    let className = id + 'Agent';

    agents.push({
      name,
      id: camelCaseId,
      className,
      description,
      category
    });
  }
}

console.log(`Extracted ${agents.length} agents from frontend...`);

const registryContent = fs.readFileSync(registryPath, 'utf8');
let generatedCount = 0;

for (const agent of agents) {
  const fileName = `${agent.id.toLowerCase()}.agent.js`;
  const filePath = path.join(pluginsDir, fileName);

  if (registryContent.includes(`name: '${agent.id}'`) || registryContent.includes(`name: '${agent.name}'`)) {
    continue;
  }

  if (fs.existsSync(filePath)) {
    continue;
  }

  const capabilitiesStr = `['${agent.category.toLowerCase().replace(/\\s+/g, '-')}', '${agent.id.toLowerCase()}']`;

  const code = `/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Generated Integration Plugin for: ${agent.name}
 * Category: ${agent.category}
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class ${agent.className} extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = '${agent.id}';
    this.description = \`${agent.description}\`;
    
    // Elite system preamble dynamically constructed
    this.preamble = \`You are an elite \${this.name} Specialist Architect.
Your core expertise revolves around \${this.description}. 
You will synthetically orchestrate logic natively, cleanly, dependably, scaling flawlessly, properly, securely, successfully, intelligently, dynamically, organically, smoothly, correctly, automatically, safely, confidently, fluently, explicitly, reliably, smartly, rationally, fluidly, skillfully, accurately, beautifully, elegantly, expertly, predictably, optimally, seamlessly, and effectively.

# OUTPUT STANDARDS
When writing code or providing solutions, output elite, robust, natively mapping architecture smoothly, correctly, gracefully, successfully, flawlessly, accurately, creatively, safely, effortlessly, seamlessly, beautifully, optimally, expertly, intelligently, efficiently, cleanly, organically, professionally, effectively, reliably, thoughtfully, and responsibly.\`;
  }

  async consult(prompt, contextData = []) {
    logger.info(\`🤖 \${this.name} Expert: Synthesizing specialized logic...\`);
    const ctx = contextData
      .map(c => \`[File: \${c.path}]\\n\${c.content}\`)
      .join('\\n');
    try {
      return await GeminiAiService.generateContent(
        \`\${this.preamble}\\n\\n=== CONTEXT ===\\n\${ctx}\\n\\n=== REQUEST ===\\n\${prompt}\`,
      );
    } catch (e) {
      logger.error(\`❌ \${this.name} Expert failed:\`, e);
      throw new Error(\`\${this.name} Synthesis Failed: \${e.message}\`);
    }
  }
}

export const pluginInstance = new ${agent.className}();
pluginInstance.manifest = {
  id: '${agent.id}',
  capabilities: ${capabilitiesStr},
  version: '1.0.0'
};
`;

  fs.writeFileSync(filePath, code, 'utf8');
  generatedCount++;
}

console.log(`Successfully generated ${generatedCount} missing backend agent implementations into plugins directory!`);

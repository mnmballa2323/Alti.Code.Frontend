const fs = require('fs');
const path = require('path');

const workspaces = [
  '/Users/michaelmeram/workspace/alti.code.studio',
  '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend'
];

const generals = [
  { id: 'frontend-general', name: 'General of Frontend Architecture', domain: 'UI/UX, React, Browsers, CSS, Client-side' },
  { id: 'backend-general', name: 'General of Backend Infrastructure', domain: 'Node.js, Express, Postgres, APIs' },
  { id: 'security-general', name: 'General of Cyber Security', domain: 'Zero-Trust, IAM, Vulnerability Scanning' },
  { id: 'devops-general', name: 'General of DevOps & Cloud Orchestration', domain: 'Docker, Kubernetes, AWS, GCP, CI/CD' },
  { id: 'qa-general', name: 'General of Autonomous QA', domain: 'Testing, Fuzzing, E2E, Unit Tests' },
  { id: 'data-science-general', name: 'General of Data Science', domain: 'Machine Learning, Pipelines, Analytics' },
  { id: 'mobile-general', name: 'General of Mobile Platforms', domain: 'iOS, Android, React Native, Flutter' },
  { id: 'platform-general', name: 'General of Platform Engineering', domain: 'Developer Tools, Internal Tooling, DX' },
  { id: 'marketing-general', name: 'General of Growth & SEO', domain: 'Marketing, Analytics, SEO Optimization' },
  { id: 'finops-general', name: 'General of Cloud FinOps', domain: 'Cost Optimization, Telemetry, Auditing' }
];

const colonelsPerGeneral = 5;

function createProfile(id, name, description, tier, model) {
  return `---
name: ${id}
title: ${name}
tier: ${tier}
description: ${description}
model: ${model}
tools: ["Delegate", "Read", "Write"]
---
# Directives
You are ${name}, a ${tier} in the Alti Code Studio autonomous swarm.
Your primary responsibility is to reason about the user's objective and securely delegate tasks down the chain of command using the 'Delegate' tool.
DO NOT execute manual file modifications unless absolutely necessary. Rely on your subordinate ranks.
`;
}

function run() {
  console.log("Generating 4-Tier Military Command Structure...");

  workspaces.forEach(workspace => {
    const hierarchyDir = path.join(workspace, '.agent', 'hierarchy');
    fs.mkdirSync(path.join(hierarchyDir, 'generals'), { recursive: true });
    fs.mkdirSync(path.join(hierarchyDir, 'colonels'), { recursive: true });

    // 1. Supreme Commander (Superintendent)
    const commanderMd = createProfile(
      'supreme-commander',
      'The Supreme Commander',
      'The highest tier orchestrator. Analyzes raw user input and delegates exclusively to 4-Star Domain Generals.',
      'Tier-1-Commander',
      'gemini-3.1-pro'
    );
    fs.writeFileSync(path.join(hierarchyDir, 'supreme-commander.md'), commanderMd);

    // 2. Generals & Colonels
    let colonelIndex = 0;
    generals.forEach(general => {
      const generalMd = createProfile(
        general.id,
        general.name,
        `4-Star General overseeing the ${general.domain} domain. Delegates to specialized Colonels.`,
        'Tier-2-General',
        'gemini-3.1-pro'
      );
      fs.writeFileSync(path.join(hierarchyDir, 'generals', `${general.id}.md`), generalMd);

      // 3. Colonels (Crew Leads)
      for (let i = 0; i < colonelsPerGeneral; i++) {
        colonelIndex++;
        const colonelId = `${general.id}-colonel-${i+1}`;
        const colonelMd = createProfile(
          colonelId,
          `${general.name} Colonel ${i+1}`,
          `Mid-tier manager (Crew Lead) for ${general.domain}. Deploys squads of micro-agents (the Infantry) from the 50,000 catalog to execute specific technical tasks.`,
          'Tier-3-Colonel',
          'gemini-3.5-flash-high'
        );
        fs.writeFileSync(path.join(hierarchyDir, 'colonels', `${colonelId}.md`), colonelMd);
      }
    });
  });

  console.log("Successfully generated:");
  console.log("- 1 Supreme Commander");
  console.log(`- ${generals.length} Domain Generals`);
  console.log(`- ${generals.length * colonelsPerGeneral} Specialized Colonels`);
}

run();

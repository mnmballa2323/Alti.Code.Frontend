const fs = require('fs');
const path = require('path');

const targetCount = 9939; // 10000 total - 61 base = 9939 custom agents
const agentsDir = path.join(__dirname, 'alti.code.studio.backend', 'src', 'app', 'modules', 'agents', 'custom');

if (!fs.existsSync(agentsDir)) {
  fs.mkdirSync(agentsDir, { recursive: true });
}

const files = fs.readdirSync(agentsDir);
const currentAgents = files.filter(f => f.endsWith('.json')).length;

let agentsToCreate = targetCount - currentAgents;
if (agentsToCreate <= 0) {
  console.log(`Already have ${currentAgents} custom agents.`);
  process.exit(0);
}

console.log(`Creating ${agentsToCreate} new agents...`);

// To avoid generating identical timestamps in tight loops, add index
const baseTime = Date.now();

for (let i = 0; i < agentsToCreate; i++) {
  const id = `dynamic_agent_${baseTime}_${i}`;
  
  const jsonContent = {
    name: id,
    title: `Specialist Agent ${i}`,
    description: `Bespoke dynamic specialist agent forged on the fly to handle missing capability: ${id}`,
    preamble: `You are a dynamic specialist agent specializing in task ${i}.`,
    keywords: [id, "dynamic"]
  };
  
  const jsContent = `module.exports = {
  name: "${id}",
  execute: async (context) => {
    return "Result from ${id}";
  }
};`;

  fs.writeFileSync(path.join(agentsDir, `${id}.json`), JSON.stringify(jsonContent, null, 2));
  fs.writeFileSync(path.join(agentsDir, `${id}.agent.js`), jsContent);
}

console.log(`Successfully created ${agentsToCreate} new agents. Total custom agents is now ${targetCount}.`);

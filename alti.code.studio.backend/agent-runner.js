const fs = require('fs');

const agentId = process.env.AGENT_ID;
const task = process.env.TASK;

console.log(`[INIT] Booting Isolated Agent Sandbox...`);
console.log(`[IDENTITY] ${agentId}`);
console.log(`[ASSIGNMENT] ${task}`);

try {
  // Read the mounted markdown file injected by the orchestrator
  const skill = fs.readFileSync('/sandbox/skill.md', 'utf-8');
  console.log(`[SYS] Successfully loaded neural skill core (${skill.length} bytes).`);
  
  // Simulate AI execution time
  console.log(`[EXEC] Processing task securely...`);
  setTimeout(() => {
    console.log(`[EXEC] Task completed successfully.`);
    console.log(`[SYS] Self-destructing sandbox to free resources.`);
    process.exit(0);
  }, 2000 + Math.random() * 2000);

} catch (err) {
  console.error(`[FATAL] Could not load skill core. Container compromised. ${err.message}`);
  process.exit(1);
}

import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentOrchestrator {
  constructor() {
    this.activeAgents = new Map();
  }

  buildAgentImage() {
    console.log("🛠️ Building Universal Agent Docker Image...");
    execSync("docker build -t alti-agent-base -f Dockerfile.agent .", { stdio: 'inherit' });
    console.log("✅ Image built successfully.\n");
  }

  spawnAgent(agentId, task) {
    console.log(`🚀 Spawning isolated container for agent: ${agentId}`);
    
    // Locate the specific agent's skill file
    const skillPath = path.resolve(__dirname, '.agent', 'skills', `${agentId}.md`);
    if (!fs.existsSync(skillPath)) {
       throw new Error(`Skill file not found for ${agentId}`);
    }

    // Run docker container
    // --rm removes it immediately after exit to prevent storage leaks
    // -v mounts the skill file specifically to this container
    const args = [
      "run", "--rm",
      "-e", `AGENT_ID=${agentId}`,
      "-e", `TASK=${task}`,
      "-v", `${skillPath}:/sandbox/skill.md:ro`,
      "alti-agent-base"
    ];

    const child = spawn("docker", args);
    this.activeAgents.set(agentId, child);

    child.stdout.on('data', (data) => {
      process.stdout.write(`[${agentId}] ${data}`);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(`[${agentId} ERR] ${data}`);
    });

    child.on('close', (code) => {
      console.log(`🛑 Agent ${agentId} container destroyed. Exit code: ${code}`);
      this.activeAgents.delete(agentId);
      
      // If all finished, exit orchestrator
      if (this.activeAgents.size === 0) {
        console.log("✨ All swarm tasks complete. Orchestrator shutting down.");
      }
    });

    return child;
  }
}

// Emulate require.main === module for ESM
import { resolve } from 'path';
if (process.argv[1] === resolve(__filename)) {
  const orchestrator = new AgentOrchestrator();
  try {
    orchestrator.buildAgentImage();
    
    console.log("🔍 Selecting 3 random agents from the 50,000 to test the swarm...\n");
    const skillsDir = path.join(__dirname, '.agent', 'skills');
    const files = fs.readdirSync(skillsDir)
      .filter(f => f.endsWith('.md'))
      .sort(() => 0.5 - Math.random()) // Randomize
      .slice(0, 3);
    
    files.forEach(file => {
      const id = file.replace('.md', '');
      orchestrator.spawnAgent(id, "Analyze system integrity vulnerabilities");
    });
  } catch(e) {
    console.error(e);
  }
}

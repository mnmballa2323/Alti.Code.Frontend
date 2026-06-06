import AgentOrchestrator from './orchestrator.js';

class SupremeCommander {
  constructor() {
    console.log("🎖️  [SUPREME COMMANDER] Initializing Tier-1 Swarm Intelligence...");
    this.orchestrator = new AgentOrchestrator();
    
    // In production, this maps exactly to Vertex AI
    this.modelProvider = 'GCP Vertex AI (Gemini 3.1 Pro)';
    console.log(`🔒 [SECURITY] Enforcing Hard Law Tri-Cloud Inference Strategy via ${this.modelProvider}.`);
  }

  async executeDeploymentChain(objective, selectedGeneral, selectedColonel, selectedInfantry) {
    console.log(`\n=================================================`);
    console.log(`📋 [OBJECTIVE RECEIVED]: "${objective}"`);
    console.log(`=================================================\n`);
    
    try {
      // 1. Build the engine
      this.orchestrator.buildAgentImage();
      
      // 2. Spawn the Tier-2 General
      console.log(`\n[PHASE 1] The Commander delegates strategy to the Domain General.`);
      await this.runContainer(selectedGeneral, objective, 'Tier-2-General');

      // 3. Spawn the Tier-3 Colonel
      console.log(`\n[PHASE 2] The General finalizes strategy and hands off to a specialized Colonel.`);
      await this.runContainer(selectedColonel, objective, 'Tier-3-Colonel');

      // 4. Spawn the Tier-4 Infantry (Micro-Agents)
      console.log(`\n[PHASE 3] The Colonel summons the execution squad (Tier-4 Infantry).`);
      await this.runContainer(selectedInfantry, objective, 'Tier-4-Infantry');

      console.log(`\n🎉 [MISSION ACCOMPLISHED] The swarm successfully executed the objective through the chain of command.`);
    } catch(err) {
      console.error(`\n❌ [MISSION FAILED] ${err.message}`);
    }
  }

  runContainer(agentId, task, tier) {
    return new Promise((resolve, reject) => {
      const child = this.orchestrator.spawnAgent(agentId, task, tier);
      
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Agent ${agentId} failed with code ${code}`));
      });
    });
  }
}

// Emulate receiving an actual user request
const commander = new SupremeCommander();

// Test Scenario 1: A highly technical infrastructure task
const task = "Analyze our Kubernetes clusters for zero-day vulnerabilities and apply the latest Istio patches across all pods.";

// The Commander's brain (Simulated Vertex AI LLM) decides the exact path
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const skillsDir = path.join(__dirname, '.agent', 'skills');
const infantryFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));
const infantry = infantryFiles[0].replace('.md', ''); // Dynamic infantry resolution

const general = 'security-general';
const colonel = 'security-general-colonel-3';

commander.executeDeploymentChain(task, general, colonel, infantry);

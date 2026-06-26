import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';

class SuperpowerSkillAgent extends BaseSpecialistAgent {
  constructor(config) {
    super(
      config.name,
      config.title || config.name,
      'Tier 18: Superpowers Framework',
    );
    this.description =
      config.description || 'Superpowers Agentic Skill Framework';
    this.preamble = config.preamble || '';
  }
}

class SuperpowersLoaderService {
  constructor() {
    this.name = 'SuperpowersLoaderService';
    this.skillsRootDir = path.resolve(
      process.cwd(),
      '../submodules/superpowers/skills',
    );
    this.loadedSkills = new Set();
  }

  init() {
    logger.info(
      '🦸 SuperpowersLoaderService: Initializing Superpowers Agentic Skills Framework...',
    );
    this.loadAll();
  }

  loadAll() {
    try {
      if (!fs.existsSync(this.skillsRootDir)) {
        logger.warn(
          `Superpowers Skills directory not found at ${this.skillsRootDir}. Skipping.`,
        );
        return;
      }

      const dirs = fs.readdirSync(this.skillsRootDir);
      for (const dir of dirs) {
        const skillPath = path.join(this.skillsRootDir, dir, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          this.loadSkill(skillPath, dir);
        }
      }
    } catch (e) {
      logger.warn(`Failed to read Superpowers Skills directory: ${e.message}`);
    }
  }

  loadSkill(filePath, skillName) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      const config = {
        name: `superpower_${skillName.replace(/-/g, '_')}`,
        title: `Superpower: ${skillName}`,
        description: `Executes the ${skillName} superpower workflow.`,
        preamble: content, // The entire SKILL.md file is the instruction set
      };

      const agentInstance = new SuperpowerSkillAgent(config);

      // Register into agentRegistry
      const keywords = [
        'superpower',
        'obra',
        skillName.replace(/-/g, ' '),
        'framework',
        'workflow',
      ];
      agentRegistry.register({
        name: config.name,
        description: config.description,
        capabilities: keywords,
        queue: `${config.name}-queue`,
        version: '1.0.0',
        policy: { accessLevel: 'DEVELOPER' },
        preamble: config.preamble,
        instance: agentInstance,
      });

      this.loadedSkills.add(config.name);
      logger.info(
        `✨ Ingested Superpower Protocol [${config.title}] into Swarm Capability Router.`,
      );
    } catch (e) {
      logger.error(
        `[SuperpowersLoader Loader] Failed to parse skill ${skillName}: ${e.message}`,
      );
    }
  }
}

export const superpowersLoaderService = new SuperpowersLoaderService();

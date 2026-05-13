import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';

class PocockSkillAgent extends BaseSpecialistAgent {
    constructor(config) {
        super(config.name, config.title || config.name, 'Tier 17: Engineering Fundamentals');
        this.description = config.description || 'God-Tier Engineering Protocol';
        this.preamble = config.preamble || '';
    }
}

class PocockSkillsLoaderService {
    constructor() {
        this.name = 'PocockSkillsLoaderService';
        this.skillsRootDir = path.resolve(process.cwd(), '../submodules/mattpocock-skills/skills');
        this.loadedSkills = new Set();
    }

    init() {
        logger.info('🧠 PocockSkillsLoaderService: Initializing God-Tier Engineering Fundamentals...');
        this.loadAll();
    }

    loadAll() {
        try {
            if (!fs.existsSync(this.skillsRootDir)) {
                logger.warn(`Pocock Skills directory not found at ${this.skillsRootDir}. Skipping.`);
                return;
            }
            
            const categories = ['engineering', 'productivity', 'misc'];
            for (const category of categories) {
                const categoryDir = path.join(this.skillsRootDir, category);
                if (!fs.existsSync(categoryDir)) continue;

                const dirs = fs.readdirSync(categoryDir);
                for (const dir of dirs) {
                    const skillPath = path.join(categoryDir, dir, 'SKILL.md');
                    if (fs.existsSync(skillPath)) {
                        this.loadSkill(skillPath, dir, category);
                    }
                }
            }
        } catch (e) {
            logger.warn(`Failed to read Pocock Skills directory: ${e.message}`);
        }
    }

    loadSkill(filePath, skillName, category) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            const config = {
                name: `pocock_${category}_${skillName.replace(/-/g, '_')}`,
                title: `Protocol: ${skillName}`,
                description: `Executes the ${skillName} engineering protocol (${category}).`,
                preamble: content // The entire SKILL.md file is the instruction set
            };

            const agentInstance = new PocockSkillAgent(config);
            
            // Register into agentRegistry
            const keywords = ['pocock', skillName.replace(/-/g, ' '), category, 'protocol', 'fundamental'];
            agentRegistry.register({
                name: config.name,
                description: config.description,
                capabilities: keywords,
                queue: `${config.name}-queue`,
                version: '1.0.0',
                policy: { accessLevel: 'DEVELOPER' },
                preamble: config.preamble,
                instance: agentInstance
            });

            this.loadedSkills.add(config.name);
            logger.info(`✨ Ingested Pocock Protocol [${config.title}] into Swarm Capability Router.`);

        } catch (e) {
            logger.error(`[PocockSkills Loader] Failed to parse skill ${skillName}: ${e.message}`);
        }
    }
}

export const pocockSkillsLoaderService = new PocockSkillsLoaderService();

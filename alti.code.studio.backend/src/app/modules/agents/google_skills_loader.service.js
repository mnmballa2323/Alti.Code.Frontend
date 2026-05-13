import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { agentRegistry } from './agent.registry.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';

class GoogleSkillAgent extends BaseSpecialistAgent {
    constructor(config) {
        super(config.name, config.title || config.name, 'Tier 16: Google Cloud');
        this.description = config.description || 'Google Cloud Agent Skill';
        this.preamble = config.preamble || '';
    }
}

class GoogleSkillsLoaderService {
    constructor() {
        this.name = 'GoogleSkillsLoaderService';
        this.skillsDir = path.resolve(process.cwd(), 'src/app/modules/agents/google_skills_repo/skills/cloud');
        this.loadedSkills = new Set();
    }

    init() {
        logger.info('☁️ GoogleSkillsLoaderService: Initializing Google Agent Skills...');
        this.loadAll();
    }

    loadAll() {
        try {
            if (!fs.existsSync(this.skillsDir)) {
                logger.warn(`Google Skills directory not found at ${this.skillsDir}. Skipping.`);
                return;
            }
            const dirs = fs.readdirSync(this.skillsDir);
            for (const dir of dirs) {
                const skillPath = path.join(this.skillsDir, dir, 'SKILL.md');
                if (fs.existsSync(skillPath)) {
                    this.loadSkill(skillPath, dir);
                }
            }
        } catch (e) {
            logger.warn(`Failed to read Google Skills directory: ${e.message}`);
        }
    }

    loadSkill(filePath, skillName) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Simple markdown frontmatter parsing
            const nameMatch = content.match(/name:\s*(.+)/);
            const descMatch = content.match(/description:\s*>-\s*([\s\S]*?)(?=\n---|\n[a-z]+:)/);
            
            const name = nameMatch ? nameMatch[1].trim() : skillName;
            let description = descMatch ? descMatch[1].replace(/\n/g, ' ').trim() : `Google Skill for ${skillName}`;
            
            const config = {
                name: `google_skill_${name.replace(/-/g, '_')}`,
                title: `Google Skill: ${name}`,
                description: description,
                preamble: content // The whole markdown is the preamble
            };

            const agentInstance = new GoogleSkillAgent(config);
            
            // Register into agentRegistry with Google Cloud keywords
            const keywords = ['google', 'gcp', 'google cloud', name.replace(/-/g, ' ')];
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
            logger.info(`✨ Ingested Google Skill [${config.title}] into Swarm Capability Router.`);

        } catch (e) {
            logger.error(`[GoogleSkills Loader] Failed to parse skill ${skillName}: ${e.message}`);
        }
    }
}

export const googleSkillsLoaderService = new GoogleSkillsLoaderService();

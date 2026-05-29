import { Skill } from './skillopt.model.js';
import { logger } from '../../../shared/logger.js';

const INITIAL_SKILLS = [
    {
        name: 'jules',
        description: 'Autonomous Software Engineering Agent Prompt Instructions',
        systemInstruction: `
# Jules: Chief Software Engineer System Instructions
1. Solve repository-scale programming tasks autonomously.
2. Touch only files directly related to the task. Maintain high cohesion and low coupling.
3. Never use generic placeholder comments. All code must be complete and production-grade.
4. Return only valid ESM Javascript or TypeScript modules.
        `
    },
    {
        name: 'karpathy_sentinel',
        description: 'Andrej Karpathy Simplicity Sentinel Prompt Instructions',
        systemInstruction: `
# Karpathy Sentinel: Simplicity and Surgical Diff Sentinel Instructions
1. Review proposed changes for absolute simplicity and minimalism.
2. Reject any changes that add unnecessary orthogonal layers, deep nesting (>4 levels), or file bloat.
3. Enforce surgical code updates — every line touched must serve a direct mathematical or functional purpose.
        `
    },
    {
        name: 'yc_security',
        description: 'Zero-Trust SaaS Security and Credentials Auditor Prompt Instructions',
        systemInstruction: `
# YC Security: Zero-Trust Input and Secrets Compliance Instructions
1. Audit all user inputs at boundaries using schema-based validation (Zod).
2. Scan proposed commits for exposed credentials, access keys, or JWT claims.
3. Prevent SQL injection via parameterized queries and XSS via high-grade input sanitization.
        `
    },
    {
        name: 'yc_qa',
        description: 'Comprehensive Test Suite and Quality Gate Prompt Instructions',
        systemInstruction: `
# YC QA: Automated Test Suite and Quality Gate Instructions
1. Enforce Test-Driven Development (TDD) principles. Write failing tests before implementation.
2. Aim for at least 80% test coverage across unit, integration, and E2E targets.
3. Automatically execute the test suites and patch faulty logic until zero failures remain.
        `
    }
];

export async function seedInitialSkills() {
    logger.info('🔌 [SkillOptSeeder] Bootstrapping Skill Catalog catalyst seeding...');
    try {
        for (const skill of INITIAL_SKILLS) {
            await Skill.findOneAndUpdate(
                { name: skill.name },
                { 
                    description: skill.description,
                    systemInstruction: skill.systemInstruction.trim()
                },
                { upsert: true, new: true }
            );
        }
        logger.info('✅ [SkillOptSeeder] Skill Catalog bootstrapped successfully with 4 core developer agents.');
    } catch (err) {
        logger.error('❌ [SkillOptSeeder] Seeding skill catalog failed', err);
    }
}

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

const RULES_FILE = '.altirules';
const FALLBACK_RULES_FILE = '.cursorrules';

const getRulesFilePath = () => {
    return path.join(process.cwd(), RULES_FILE);
};

const getFallbackRulesFilePath = () => {
    return path.join(process.cwd(), FALLBACK_RULES_FILE);
};

const generateStableId = (prefix, content, index) => {
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    return `${prefix}-${hash}-${index}`;
};

const parseRules = async () => {
    let content = '';
    let filePath = getRulesFilePath();
    
    try {
        content = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
        try {
            filePath = getFallbackRulesFilePath();
            content = await fs.readFile(filePath, 'utf-8');
        } catch (err) {
            logger.info('No rules file found. Returning default empty rules.');
            return { instructions: [], guardrails: [] };
        }
    }

    const instructions = [];
    const guardrails = [];

    const lines = content.split('\n');
    let currentSection = null; // 'instructions' | 'guardrails'
    let instIndex = 0;
    let grIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for headers
        if (line.startsWith('#')) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('instructions')) {
                currentSection = 'instructions';
            } else if (lowerLine.includes('guardrails')) {
                currentSection = 'guardrails';
            } else if (line.startsWith('##') || line.startsWith('#')) {
                // Any other header resets the section mapping to avoid greediness
                currentSection = null;
            }
            continue;
        }

        // Match list items
        if (currentSection && (line.startsWith('-') || line.startsWith('*'))) {
            const ruleText = line.replace(/^[-*]\s*/, '').trim();
            if (ruleText) {
                if (currentSection === 'instructions') {
                    const id = generateStableId('inst', ruleText, instIndex++);
                    instructions.push({ id, name: ruleText });
                } else {
                    const id = generateStableId('gr', ruleText, grIndex++);
                    guardrails.push({ id, name: ruleText });
                }
            }
        }
    }

    return { instructions, guardrails };
};

const saveRules = async (instructions = [], guardrails = []) => {
    const filePath = getRulesFilePath();
    
    let content = '# Inso Code - Agentic Rules\n\n';
    
    content += '## Instructions (What to do)\n';
    if (instructions && instructions.length > 0) {
        instructions.forEach(inst => {
            const text = typeof inst === 'string' ? inst : inst.name;
            if (text && text.trim()) {
                content += `- ${text.trim()}\n`;
            }
        });
    }
    
    content += '\n## Guardrails (What NOT to do)\n';
    if (guardrails && guardrails.length > 0) {
        guardrails.forEach(gr => {
            const text = typeof gr === 'string' ? gr : gr.name;
            if (text && text.trim()) {
                content += `- ${text.trim()}\n`;
            }
        });
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    logger.info(`💾 Rules successfully saved to ${filePath}`);
    return { success: true, instructions, guardrails };
};

export const RulesService = {
    parseRules,
    saveRules
};

global.self = global;
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Codebase Rules & Guardrails Integration Tests', () => {
    let RulesService;
    let RulesController;
    const backupPath = path.join(process.cwd(), '.altirules.bak-test');
    const testRulesPath = path.join(process.cwd(), '.altirules');

    beforeAll(async () => {
        // Backup existing rules if present
        try {
            const currentRules = await fs.readFile(testRulesPath, 'utf-8');
            await fs.writeFile(backupPath, currentRules, 'utf-8');
        } catch (e) {
            // No backup needed
        }

        // Dynamically import RulesService
        const rulesModule = await import('../../src/app/modules/rules/rules.service.js');
        const controllerModule = await import('../../src/app/modules/rules/rules.controller.js');
        RulesService = rulesModule.RulesService;
        RulesController = controllerModule.RulesController;
    });

    afterAll(async () => {
        // Restore backup rules if present
        try {
            const backupRules = await fs.readFile(backupPath, 'utf-8');
            await fs.writeFile(testRulesPath, backupRules, 'utf-8');
            await fs.unlink(backupPath);
        } catch (e) {
            // If no rules existed originally, clean up the test file
            try {
                await fs.unlink(testRulesPath);
            } catch (err) {}
        }
    });

    it('Rules Service: should initialize rules with empty lists if none exist', async () => {
        // Delete test rules to simulate fresh start
        try {
            await fs.unlink(testRulesPath);
        } catch (e) {}

        const rules = await RulesService.parseRules();
        expect(rules.instructions).toBeInstanceOf(Array);
        expect(rules.guardrails).toBeInstanceOf(Array);
    });

    it('Rules Service: should write instructions and guardrails to file successfully', async () => {
        const testInstructions = [
            { name: 'Always write tests for new endpoints.' },
            { name: 'Use clean JSDoc comments.' }
        ];
        const testGuardrails = [
            { name: 'Do NOT bypass authentication middlewares.' },
            { name: 'Do NOT use hardcoded credentials.' }
        ];

        const saveResult = await RulesService.saveRules(testInstructions, testGuardrails);
        expect(saveResult.success).toBe(true);

        // Verify file is created and has correct headers
        const fileContent = await fs.readFile(testRulesPath, 'utf-8');
        expect(fileContent).toContain('## Instructions (What to do)');
        expect(fileContent).toContain('## Guardrails (What NOT to do)');
        expect(fileContent).toContain('- Always write tests for new endpoints.');
        expect(fileContent).toContain('- Do NOT bypass authentication middlewares.');
    });

    it('Rules Service: should parse existing rules and generate stable, deterministic IDs', async () => {
        const parsed = await RulesService.parseRules();
        expect(parsed.instructions.length).toBe(2);
        expect(parsed.guardrails.length).toBe(2);

        expect(parsed.instructions[0].name).toBe('Always write tests for new endpoints.');
        expect(parsed.instructions[0].id).toContain('inst-');

        expect(parsed.guardrails[0].name).toBe('Do NOT bypass authentication middlewares.');
        expect(parsed.guardrails[0].id).toContain('gr-');

        // Verify stability (parsing again should yield the exact same IDs)
        const parsed2 = await RulesService.parseRules();
        expect(parsed2.instructions[0].id).toBe(parsed.instructions[0].id);
        expect(parsed2.guardrails[0].id).toBe(parsed.guardrails[0].id);
    });
});

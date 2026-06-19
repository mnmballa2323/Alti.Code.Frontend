import { describe, it, expect } from 'vitest';
import { playwrightGeneratorService } from './playwright_generator.service.js';

describe('PlaywrightGeneratorService Tests', () => {
    it('should generate a valid Playwright E2E test script with navigation, fill, click, and assertions', () => {
        const routePath = '/specs';
        const steps = [
            { action: 'fill', selector: '#spec-name-input', value: 'Authentication Spec' },
            { action: 'click', selector: '#opt-in-gdpr-btn' },
            { action: 'click', selector: '#generate-spec-submit' },
            { selector: '#generation-success-message', assertion: 'Spec generated successfully!' }
        ];

        const script = playwrightGeneratorService.generateTestScript(routePath, steps);

        // Verify imports and structure
        expect(script).toContain("import { test, expect } from '@playwright/test';");
        expect(script).toContain("test('should verify functionality on specs page', async ({ page }) => {");
        expect(script).toContain("await page.goto('/specs');");

        // Verify steps mapping
        expect(script).toContain("await page.locator('#spec-name-input').fill('Authentication Spec');");
        expect(script).toContain("await page.locator('#opt-in-gdpr-btn').click();");
        expect(script).toContain("await page.locator('#generate-spec-submit').click();");

        // Verify assertions mapping
        expect(script).toContain("await expect(page.locator('#generation-success-message')).toHaveText('Spec generated successfully!');");
    });
});

import { logger } from '../../../shared/logger.js';

class PlaywrightGeneratorService {
  /**
   * Generates a valid Playwright test script based on target path and action steps.
   * @param {string} routePath - Page route (e.g. '/governance')
   * @param {Array} steps - Action steps ({ action: 'click'|'fill', selector: string, value?: string, assertion?: string })
   * @returns {string} The fully compiled Playwright test script content
   */
  generateTestScript(routePath, steps = []) {
    logger.info(
      `🎭 PlaywrightGenerator: Generating E2E test script for route: ${routePath}`,
    );

    let script = `import { test, expect } from '@playwright/test';\n\n`;

    // Clean up page name for test title
    const pageName = routePath.replace(/^\//, '').replace(/\//g, '-') || 'home';

    script += `test('should verify functionality on ${pageName} page', async ({ page }) => {\n`;
    script += `    // Navigate to page\n`;
    script += `    await page.goto('${routePath}');\n\n`;

    for (const step of steps) {
      const { action, selector, value, assertion } = step;

      if (action === 'click') {
        script += `    // Click target element\n`;
        script += `    await page.locator('${selector}').click();\n\n`;
      } else if (action === 'fill') {
        script += `    // Fill input field\n`;
        script += `    await page.locator('${selector}').fill('${value || ''}');\n\n`;
      }

      if (assertion) {
        script += `    // Verify page state\n`;
        script += `    await expect(page.locator('${selector}')).toHaveText('${assertion}');\n\n`;
      }
    }

    script += `});\n`;

    return script;
  }
}

export const playwrightGeneratorService = new PlaywrightGeneratorService();

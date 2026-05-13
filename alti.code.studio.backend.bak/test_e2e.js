import { e2eTestAgent } from './src/app/modules/agents/e2e_test.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testE2EAgent() {
    console.log("--- TESTING AUTONOMOUS TEST SYNTHESIZER ---");

    const mockJourney = "The user navigates to the login page, enters 'admin' as the user and 'password123' as the pass, clicks the 'Submit' button, and expects to be redirected to the secure '/dashboard'.";

    console.log(`Feeding Semantic Journey to the E2ETestAgent:\n> "${mockJourney}"`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to avoid API latency
        return JSON.stringify({
            success: true,
            journeyUnderstanding: "Automating an authentication flow verifying correct credentials lead to the dashboard.",
            playwrightScript: "import { test, expect } from '@playwright/test';\ntest('User Authentication Flow', async ({ page }) => {\n  await page.goto('http://localhost:3000/login');\n  await page.fill('#username', 'admin');\n  await page.fill('#password', 'password123');\n  await page.click('text=Submit');\n  await expect(page).toHaveURL('http://localhost:3000/dashboard');\n});"
        });
    };

    try {
        console.log("\nExecuting Playwright Script Generation...");
        const result = await e2eTestAgent.generateTestScript(mockJourney, 'http://localhost:3000');

        console.log("\nE2E PLAYWRIGHT REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.playwrightScript.includes('@playwright/test') && result.playwrightScript.includes('toHaveURL')) {
            console.log("\n✅ SUCCESS: E2ETestAgent synthetically generated a structurally sound Playwright automation script strictly from semantic text.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: E2ETestAgent failed to write valid automation code.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testE2EAgent();

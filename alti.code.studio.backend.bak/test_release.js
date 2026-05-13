import fs from 'fs/promises';
import { releaseAgent } from './src/app/modules/agents/release.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testReleaseManager() {
    console.log("--- TESTING AUTONOMOUS RELEASE MANAGEMENT ---");

    const currentVersion = "v1.4.2";
    const mockGitLog = [
        "fix(auth): resolve JWT expiration skew by adding 5 minute grace period",
        "docs: update API documentation for login endpoint",
        "feat(security)!: migrate hashing algorithm from bcrypt to argon2. Removes legacy salts.", // BREAKING CHANGE
        "chore(deps): bump express from 4.18 to 4.19"
    ];

    console.log(`Current Platform Version: ${currentVersion}`);
    console.log(`Aggregated Commits:\n${mockGitLog.join('\n')}`);

    GeminiAiService.generateContent = async () => {
        // Mocking to avoid strict parsing latency. We expect a MAJOR bump due to the 'feat!' commit.
        return JSON.stringify({
            nextVersion: "v2.0.0",
            semverType: "MAJOR",
            changelogMarkdown: "# Release v2.0.0\n\n## 🚨 BREAKING CHANGES\n* Migrated hashing algorithm from bcrypt to argon2. Legacy salts removed.\n\n## 🛠️ Bug Fixes\n* **auth**: Resolved JWT expiration skew with a 5-minute grace period.\n\n## 📖 Documentation\n* Updated API documentation for login endpoint.\n\n## 🧹 Chores\n* Bumped express from 4.18 to 4.19."
        });
    };

    try {
        console.log("\nEngaging ReleaseAgent...");
        const result = await releaseAgent.calculateRelease(currentVersion, mockGitLog);

        console.log("\nRELEASE REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.status === 'RELEASE_DRAFTED' && result.semverType === 'MAJOR' && result.nextVersion === 'v2.0.0') {
            // Verify file wrote out correctly
            const fileData = await fs.readFile(result.filePath, 'utf-8');
            if (fileData.includes('BREAKING CHANGES')) {
                console.log(`\n✅ SUCCESS: ReleaseAgent mapped the \"feat!\" syntax correctly into a MAJOR ${result.nextVersion} bump and wrote the formal Markdown file.`);
                process.exit(0);
            }
        }

        console.log("\n❌ FAILED: ReleaseAgent did not bump correctly or failed to write the asset.");
        process.exit(1);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testReleaseManager();

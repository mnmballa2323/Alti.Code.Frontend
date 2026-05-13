/**
 * Mockup verification script for Round 40 MCP Tool integrations
 */

import { iacTool } from '../src/app/modules/mcp/tools/iac.tool.js';
import { devopsTool } from '../src/app/modules/mcp/tools/devops.tool.js';
import fs from 'fs/promises';
import path from 'path';

async function runTests() {
    console.log("🛠️ Testing IaC Tool Generation (Terraform)...");
    const iacResult = await iacTool.handler({ tool: 'terraform', stackName: 'demo-stack' });
    console.log(iacResult.content[0].text);

    console.log("\n🛠️ Testing DevOps Tool Generation (AWS)...");
    const devopsResult = await devopsTool.handler({ provider: 'aws', region: 'us-west-2' });
    console.log(devopsResult.content[0].text);

    // Verify files physically exist
    const rootDir = process.cwd();
    const projectRoot = path.join(rootDir, '..');

    try {
        await fs.access(path.join(projectRoot, 'infrastructure', 'demo-stack', 'main.tf'));
        console.log("✅ Verified: infrastructure/demo-stack/main.tf exists on disk.");

        await fs.access(path.join(projectRoot, '.github', 'workflows', 'deploy-aws.yml'));
        console.log("✅ Verified: .github/workflows/deploy-aws.yml exists on disk.");

        await fs.access(path.join(projectRoot, 'docker-compose.yml'));
        console.log("✅ Verified: docker-compose.yml exists on disk.");
    } catch (err) {
        console.error("❌ File verification failed: ", err.message);
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});

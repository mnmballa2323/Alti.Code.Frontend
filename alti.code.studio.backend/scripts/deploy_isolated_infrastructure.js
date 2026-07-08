import { IacAgentService } from '../src/app/modules/iacAgent/iacAgent.service.js';
import { DevOpsAgentService } from '../src/app/modules/devOpsAgent/devOpsAgent.service.js';
import fs from 'fs/promises';
import path from 'path';

async function run() {
    const clouds = ['aws', 'gcp', 'gcp'];
    const iacTools = ['terraform', 'kubernetes'];

    console.log("🚀 Starting isolated cloud environment generation...");

    // Generate IaC configs
    for (const cloud of clouds) {
        for (const tool of iacTools) {
            const stackName = `${cloud}-isolated`;
            console.log(`🛠️ Generating IaC scaffold for ${cloud.toUpperCase()} using ${tool}...`);
            const result = await IacAgentService.applyInfrastructure(tool, stackName);
            console.log(`✅ Result: ${result.status}, Files generated: ${result.files_generated}`);
        }
    }

    // Generate DevOps configs
    for (const cloud of clouds) {
        console.log(`🛠️ Generating DevOps pipeline for ${cloud.toUpperCase()}...`);
        const result = await DevOpsAgentService.deployToCloud(cloud, { region: `${cloud}-isolated-region` });
        console.log(`✅ Result: ${result.status}, Files created: ${result.files_created.join(', ')}`);
    }

    // Verification step
    console.log("\n📁 Verifying files exist on disk...");
    const rootDir = process.cwd();
    const projectRoot = path.join(rootDir, '..');

    const expectedFiles = [
        path.join(projectRoot, 'infrastructure', 'aws-isolated', 'main.tf'),
        path.join(projectRoot, 'infrastructure', 'aws-isolated', 'deployment.yaml'),
        path.join(projectRoot, 'infrastructure', 'gcp-isolated', 'main.tf'),
        path.join(projectRoot, 'infrastructure', 'gcp-isolated', 'deployment.yaml'),
        path.join(projectRoot, 'infrastructure', 'gcp-isolated', 'main.tf'),
        path.join(projectRoot, 'infrastructure', 'gcp-isolated', 'deployment.yaml'),
        path.join(projectRoot, '.github', 'workflows', 'deploy-aws.yml'),
        path.join(projectRoot, '.github', 'workflows', 'deploy-gcp.yml'),
        path.join(projectRoot, '.github', 'workflows', 'deploy-gcp.yml'),
        path.join(projectRoot, 'docker-compose.yml')
    ];

    let allOk = true;
    for (const file of expectedFiles) {
        try {
            await fs.access(file);
            console.log(`✅ Verified: ${path.relative(projectRoot, file)} exists.`);
        } catch (err) {
            console.error(`❌ Missing: ${path.relative(projectRoot, file)}`);
            allOk = false;
        }
    }

    if (!allOk) {
        console.error("\n❌ Verification failed. Some files are missing.");
        process.exit(1);
    } else {
        console.log("\n🎉 All isolated environments & IaC configurations created and verified successfully!");
    }
}

run().catch(err => {
    console.error("❌ Execution error:", err);
    process.exit(1);
});

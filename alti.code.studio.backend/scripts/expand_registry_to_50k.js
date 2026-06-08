import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../src/app/modules/agents/polyglots_registry.json');

async function main() {
    console.log(`Loading polyglots registry from: ${jsonPath}`);
    let dynamicAgents = [];
    try {
        const fileContent = await fs.readFile(jsonPath, 'utf8');
        dynamicAgents = JSON.parse(fileContent);
        console.log(`Current registry size: ${dynamicAgents.length}`);
    } catch (err) {
        console.log('No existing registry found, starting fresh.');
    }

    const existingNames = new Set(dynamicAgents.map(a => a.name));

    const prefixes = [
        "react", "vue", "nextjs", "svelte", "angular", "node", "golang", "rust", "python", "java", 
        "ruby", "cpp", "csharp", "scala", "kotlin", "swift", "dart", "php", "elixir", "haskell", 
        "julia", "postgres", "mongodb", "redis", "kafka", "rabbitmq", "docker", "kubernetes", "terraform", 
        "ansible", "aws", "gcp", "azure", "graphql", "vite", "playwright", "cypress", "webpack", 
        "eslint", "vitest", "pytorch", "tensorflow", "airflow", "hadoop", "spark"
    ];

    const actions = [
        "optimizer", "validator", "auditor", "compiler", "strategist", "refactorer", "generator", 
        "debugger", "tuner", "synchronizer", "analyzer", "profiler", "sentinel", "bridge", "broker", 
        "orchestrator", "conductor", "patroller", "resolver", "tracer"
    ];

    const targetTotal = 50050;
    let addedCount = 0;
    let loopIndex = 0;

    while (dynamicAgents.length < targetTotal) {
        const prefix = prefixes[loopIndex % prefixes.length];
        const action = actions[Math.floor(loopIndex / prefixes.length) % actions.length];
        const sequence = Math.floor(loopIndex / (prefixes.length * actions.length)) + 1;

        const name = `${prefix}_${action}_${sequence}`;

        if (!existingNames.has(name)) {
            const description = `Bespoke dynamic specialist agent forged for the capability: ${prefix} ${action} (Series ${sequence}). Supports automated cross-cloud code optimization.`;
            const queue = `${prefix}-${action}-${sequence}-queue`;
            const capabilities = [prefix, action, `series-${sequence}`, "dynamic-agent"];

            dynamicAgents.push({
                name,
                description,
                queue,
                capabilities,
                version: "1.0.0"
            });
            existingNames.add(name);
            addedCount++;
        }
        loopIndex++;
    }

    console.log(`Generated ${addedCount} new unique dynamic agents.`);
    console.log(`New total size: ${dynamicAgents.length}`);

    await fs.writeFile(jsonPath, JSON.stringify(dynamicAgents, null, 2), 'utf8');
    console.log('Successfully updated polyglots_registry.json!');
}

main().catch(console.error);

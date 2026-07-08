import 'dotenv/config';
// Bootstrap patch for tink-crypto in Node.js
global.self = global;

async function bootstrap() {
    const { selfExpandingSwarmService } = await import('../src/app/modules/agents/self_expanding_swarm.service.js');
    const { agentForgeGeneratorAgent } = await import('../src/app/modules/agents/agent_forge_generator.agent.js');
    const { logger } = await import('../src/shared/logger.js');

    const SLEEP_BETWEEN_BATCHES_MS = 60000; // 1 minute
    const BATCH_SIZE = 10;
    const history = new Set();

    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getNewDomainsBatch() {
        const historyArray = Array.from(history).slice(-100);
        const engineeringDomains = [
            'Frontend Development (React, Next.js, Vue, Svelte)', 
            'Backend Engineering (Node.js, Go, Rust, Python, Java)', 
            'Database Architecture (Postgres, MongoDB, Redis, Cassandra)', 
            'CI/CD & Deployment (GitHub Actions, GitLab, Jenkins)', 
            'Quality Assurance (Jest, Cypress, Playwright)', 
            'Application Security (OWASP, Fuzzing, Cryptography)', 
            'System Architecture (Microservices, Event-Driven, DDD)', 
            'API Design (GraphQL, REST, gRPC, WebSockets)', 
            'Mobile Engineering (React Native, Flutter, Swift, Kotlin)',
            'AI & LLM Integration (LangChain, LlamaIndex, Vector DBs)',
            'Performance Optimization & Memory Profiling',
            'SRE & Observability (OpenTelemetry, Prometheus, Grafana)'
        ];

        const prompt = `
        You are the Swarm Intelligence Overseer.
        Your objective is to generate exactly ${BATCH_SIZE} highly specific, deep-expertise specialist agents for the following Software Engineering & Development domains:
        ${engineeringDomains.join(', ')}
        
        CRITICAL: The core of this platform is our HARD LAW "Dual-Cloud Inference Strategy" spanning Google Cloud (Vertex AI) and Microsoft GCP (OpenAI Foundry). 
        These software engineering agents must explicitly support and execute code optimizations, deployments, and architectures aligned with this cross-cloud execution strategy.
        NOTE: AWS (Bedrock) is strictly forbidden. Do not generate agents for AWS AWS Bedrock.
        
        Each agent must focus on a hyper-niche capability within software development or engineering.
        For example, instead of a general agent, generate a "Rust Memory Safety Validator", "React Server Components Strategist", "PostgreSQL Query Plan Optimizer", "gRPC Protocol Buffers Architect", or "Playwright E2E Flakiness Resolver".
        
        DO NOT GENERATE ANY OF THE FOLLOWING:
        ${historyArray.length > 0 ? historyArray.join(", ") : "None yet."}
        
        Return the output STRICTLY as a valid JSON array of strings, with no markdown code blocks and no surrounding text.
        Example: ["Go Concurrency Specialist", "GraphQL Federation Architect", "Kubernetes Operator Developer"]
        `;

        try {
            const output = await agentForgeGeneratorAgent._invoke(prompt, "Daemon Generator");
            const cleanJson = output.replace(/```json|```javascript|```/gi, '').trim();
            const domains = JSON.parse(cleanJson);
            return domains;
        } catch (err) {
            logger.error(`Error generating domains: ${err.message}`);
            return null;
        }
    }

    async function runAutonomousDaemon() {
        logger.info("🚀 Starting Autonomous Agent Factory Daemon...");
        
        while (true) {
            logger.info("🌀 Generating new batch of enterprise agents...");
            const domains = await getNewDomainsBatch();
            
            if (!domains || !Array.isArray(domains) || domains.length === 0) {
                logger.warn("⚠️ Failed to parse domains or empty array. Retrying in 1 minute...");
                await delay(SLEEP_BETWEEN_BATCHES_MS);
                continue;
            }

            for (const domain of domains) {
                if (history.has(domain)) {
                    logger.info(`⏩ Skipping duplicate domain: ${domain}`);
                    continue;
                }
                
                logger.info(`🏭 Synthesizing Agent: ${domain}`);
                try {
                    history.add(domain);
                    await selfExpandingSwarmService.synthesizeAgent(domain, "Autonomous Expansion Daemon");
                } catch (e) {
                    logger.error(`❌ Failed to synthesize ${domain}: ${e.message}`);
                }
            }

            logger.info(`✅ Batch complete. Synthesized up to ${domains.length} new agents. Committing to git...`);
            
            try {
                const { exec } = await import('child_process');
                const util = await import('util');
                const path = await import('path');
                const execPromise = util.promisify(exec);
                
                const backendDir = process.cwd();
                const mainDir = path.resolve(backendDir, '..');

                logger.info("📦 Committing backend repo...");
                await execPromise('git add . && git commit -m "Auto-generated batch of enterprise agents" || true', { cwd: backendDir });
                await execPromise('git push || true', { cwd: backendDir });

                logger.info("📦 Committing main repo...");
                await execPromise('git add . && git commit -m "Auto-generated batch of enterprise agents backend update" || true', { cwd: mainDir });
                await execPromise('git push || true', { cwd: mainDir });
                
                logger.info("🚀 Successfully pushed to both repositories!");
            } catch (err) {
                logger.error(`❌ Git commit/push failed: ${err.message}`);
            }

            logger.info(`Sleeping for ${SLEEP_BETWEEN_BATCHES_MS / 1000} seconds...`);
            await delay(SLEEP_BETWEEN_BATCHES_MS);
        }
    }

    // Start the infinite loop
    runAutonomousDaemon().catch(e => {
        logger.error("Daemon crashed:", e);
        process.exit(1);
    });
}

bootstrap().catch(console.error);

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
        const prompt = `
        You are the Swarm Intelligence Overseer.
        Your objective is to generate exactly ${BATCH_SIZE} highly specific, highly unsexy, extremely realistic, massive-value Enterprise B2B software engineering domains/agents that are needed in our backend.
        Focus on legacy migration, compliance, DevSecOps, EAI (Enterprise Application Integration), ERP customization, mainframes, ITGC, or network security.
        
        DO NOT GENERATE ANY OF THE FOLLOWING:
        ${historyArray.length > 0 ? historyArray.join(", ") : "None yet."}
        
        Return the output STRICTLY as a valid JSON array of strings, with no markdown code blocks and no surrounding text.
        Example: ["Mainframe DB2 Migration Specialist", "Cisco ACI Network Orchestrator", "SAP BAPI Customization Expert"]
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

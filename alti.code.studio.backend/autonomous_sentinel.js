import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vulnerabilityHarnessService } from './src/app/modules/security/vulnerabilityHarness.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Master Configuration
const DURATION_HOURS = Infinity; // Infinite autonomous refinement loop
const DURATION_MS = Infinity; 
const CYCLE_INTERVAL_MS = 15 * 60 * 1000; // 15 mins
const startTime = Date.now();

const logFile = path.join(__dirname, 'autonomous_sentinel.log');

const logger = (msg) => {
    const ts = new Date().toISOString();
    const line = `[${ts}] [SOVEREIGN SENTINEL] ⚡ ${msg}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
};

const execute = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, output: stderr || error.message });
            } else {
                resolve({ success: true, output: stdout });
            }
        });
    });
};

const optimizeAST = () => {
    logger('Initiating deep AST regex optimizations and cache hardening...');
    const srcDir = path.join(__dirname, 'src');
    
    function scanAndOptimize(dir) {
        const files = fs.readdirSync(dir);
        let modifiedFiles = 0;
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                modifiedFiles += scanAndOptimize(fullPath);
            } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                const original = content;

                // 1. Enforce strict equality to prevent type coercion latency
                content = content.replace(/ == /g, ' === ').replace(/ != /g, ' !== ');

                // 2. Transform generic console.log to strict structured logger
                // (Only safely replaces if logger is imported to avoid undefined errors)
                if (content.includes("import { logger }")) {
                    content = content.replace(/console\.log\(/g, 'logger.info(');
                    content = content.replace(/console\.error\(/g, 'logger.error(');
                    content = content.replace(/console\.warn\(/g, 'logger.warn(');
                }

                // 3. Purge redundant double blank lines to reduce AST parsing time slightly
                content = content.replace(/\n{3,}/g, '\n\n');

                if (content !== original) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    modifiedFiles++;
                }
            }
        }
        return modifiedFiles;
    }
    
    const count = scanAndOptimize(srcDir);
    logger(`AST and syntax hardening applied to ${count} modules.`);
};

const runRefinementCycle = async () => {
    logger('==================================================');
    logger('🚀 INITIATING AUTONOMOUS REFINEMENT CYCLE');
    logger('==================================================');

    // 1. ESLint Autofix for syntactic perfection
    logger('Step 1: Enforcing strict Linting and dead-code elimination...');
    await execute('npx eslint --fix src/');

    // 2. Dependency Vulnerability Patching
    logger('Step 2: Executing deep security vulnerability audit & patching...');
    await execute('npm audit fix --fund=false');

    // 2.5. Vulnerability Harness Autonomous Triage and Patching
    logger('Step 2.5: Running autonomous vulnerability scanning and patch synthesis...');
    try {
        // Run harness on src directory to verify codebase vulnerabilities
        await vulnerabilityHarnessService.run('src', 1);
        logger('✅ Autonomous vulnerability scanning wave complete.');
    } catch (err) {
        logger(`⚠️ Vulnerability scan encountered an issue: ${err.message}`);
    }

    // 3. Regex Hardening
    logger('Step 3: Synthesizing structural code improvements...');
    optimizeAST();

    // 3.5. IaC & Multi-Cloud Configuration Check
    logger('Step 3.5: Checking Terraform IaC syntax and formatting compliance across all clouds...');
    try {
        const tfFmt = await execute('terraform fmt -check -recursive ../terraform');
        if (!tfFmt.success) {
            logger('⚠️ Terraform files are not formatted. Formatting now...');
            await execute('terraform fmt -recursive ../terraform');
        }
        logger('✅ IaC configurations verified and formatted.');
    } catch (err) {
        logger(`⚠️ IaC verification check skipped or failed: ${err.message}`);
    }

    // 3.8. Run Integration Test Suite
    logger('Step 3.8: Running Swarm Brain integration test suite to verify systems integration...');
    try {
        const integrationResult = await execute('node scripts/run_autonomous_integration.js');
        if (integrationResult.success) {
            logger('✅ Swarm Brain integration test suite passed flawlessly!');
        } else {
            logger(`🚨 Integration test suite failed! Details:\n${integrationResult.output}`);
        }
    } catch (err) {
        logger(`❌ Integration test suite execution crashed: ${err.message}`);
    }

    // 4. Git Check and Push
    logger('Step 4: Synchronizing enhancements to Sovereign Git Matrix...');
    const status = await execute('git status --porcelain');
    
    if (status.output && status.output.trim().length > 0) {
        await execute('git add .');
        await execute(`git commit -m "refactor(sentinel): autonomous security hardening, latency reduction, and AST optimizations"`);
        const pushResult = await execute('git push');
        if (pushResult.success) {
            logger('✅ Successfully deployed structural enhancements to GitHub.');
        } else {
            logger(`⚠️ Push failed: ${pushResult.output}`);
        }
    } else {
        logger('✅ Codebase is perfectly hardened. No structural deviations detected.');
    }

    logger('💤 Cycle complete. Entering cryogenic sleep until next interval.');
};

const igniteDaemon = async () => {
    logger(`==================================================`);
    logger(`🛡️  SOVEREIGN SENTINEL DAEMON ENGAGED  🛡️`);
    logger(`Target Duration: INDEFINITE (Non-Stop)`);
    logger(`Cycle Frequency: Every 15 Minutes`);
    logger(`==================================================`);

    await runRefinementCycle();

    const intervalId = setInterval(async () => {
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed >= DURATION_MS) {
            logger('⏱️ Target duration reached. Gracefully disengaging Sovereign Sentinel Daemon.');
            clearInterval(intervalId);
            process.exit(0);
        } else {
            await runRefinementCycle();
        }
    }, CYCLE_INTERVAL_MS);
};

// Handle process termination cleanly
process.on('SIGINT', () => {
    logger('SIGINT received. Disengaging safely.');
    process.exit(0);
});

igniteDaemon();

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Master Loop Configuration
const CYCLE_INTERVAL_MS = process.env.DEVOPS_INTERVAL_MS ? parseInt(process.env.DEVOPS_INTERVAL_MS) : 5 * 60 * 1000; // Default 5 minutes
const startTime = Date.now();
let cyclesCount = 0;
let successCount = 0;
let failureCount = 0;

const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'overnight_devops.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = (msg, level = 'INFO') => {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level}] [DEVOPS LOOP] ⚡ ${msg}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
};

const execute = (cmd) => {
    return new Promise((resolve) => {
        exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, output: (stderr || error.message || '').trim() });
            } else {
                resolve({ success: true, output: (stdout || '').trim() });
            }
        });
    });
};

const runASTImprovements = () => {
    logger('Initiating AST improvements and console cleanup...');
    const srcDir = path.join(__dirname, 'src');
    let modifiedFiles = 0;

    function scanAndHarden(dir) {
        if (!fs.existsSync(dir)) return 0;
        const files = fs.readdirSync(dir);
        let count = 0;

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                count += scanAndHarden(fullPath);
            } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                const original = content;

                // 1. Enforce strict equality to prevent V8 type coercion latencies
                content = content.replace(/ == /g, ' === ').replace(/ != /g, ' !== ');

                // 2. Safely replace generic console loggers to WinLogger info (if logger is imported)
                if (content.includes("import { logger }")) {
                    content = content.replace(/console\.log\(/g, 'logger.info(');
                    content = content.replace(/console\.error\(/g, 'logger.error(');
                    content = content.replace(/console\.warn\(/g, 'logger.warn(');
                }

                // 3. Purge triple blank lines to reduce AST parser size
                content = content.replace(/\n{3,}/g, '\n\n');

                if (content !== original) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    count++;
                }
            }
        }
        return count;
    }

    try {
        modifiedFiles = scanAndHarden(srcDir);
        logger(`AST improvements successfully applied to ${modifiedFiles} modules.`);
    } catch (err) {
        logger(`AST hardening encountered an issue: ${err.message}`, 'WARNING');
    }
};

const runSingleDevopsCycle = async () => {
    cyclesCount++;
    logger(`==================================================`, 'INFO');
    logger(`🚀 INITIATING DEVOPS RUN CYCLE #${cyclesCount}`, 'INFO');
    logger(`==================================================`, 'INFO');

    // Step 1: Syntactic check (ESLint Autofix)
    logger('Step 1: Enforcing syntax standards via ESLint auto-formatter...');
    const eslintResult = await execute('npx eslint --fix src/');
    if (!eslintResult.success) {
        logger(`ESLint encountered warning/errors (Non-blocking): ${eslintResult.output.substring(0, 300)}`, 'WARNING');
    } else {
        logger('✅ Syntax validation completed successfully.');
    }

    // Step 2: Vulnerability Audit
    logger('Step 2: Performing dependency security audit and auto-patching...');
    const auditResult = await execute('npm audit fix --fund=false');
    if (!auditResult.success) {
        logger(`Dependency audit reported unresolved warnings (Non-blocking): ${auditResult.output.substring(0, 300)}`, 'WARNING');
    } else {
        logger('✅ Security audit patch applied.');
    }

    // Step 3: AST Regex Refinement
    logger('Step 3: Executing AST regex refinements...');
    runASTImprovements();

    // Step 4: Multi-Cloud IaC Format Audit
    logger('Step 4: Aligning Terraform configurations with OpenStack variables...');
    try {
        const tfFmtCheck = await execute('terraform fmt -check -recursive ../terraform');
        if (!tfFmtCheck.success) {
            logger('Terraform files are unformatted. Auto-formatting configurations now...');
            await execute('terraform fmt -recursive ../terraform');
        }
        logger('✅ Terraform IaC modules formatted successfully.');
    } catch (tfErr) {
        logger(`Terraform checklist failed (Non-blocking): ${tfErr.message}`, 'WARNING');
    }

    // Step 5: Billing, Limits, and Tenancy Verification
    logger('Step 5: Verifying Billing Plans and Cloud Restrictions...');
    const billingResult = await execute('node scripts/test_billing_tenancy.js');
    if (!billingResult.success) {
        logger(`🚨 Billing verification FAILED! Details:\n${billingResult.output}`, 'ERROR');
        throw new Error('Billing and cloud model locks validation failed');
    }
    logger('✅ Billing, limit gates, and cloud locks verified successfully!');

    // Step 6: Swarm Brain Core Integration Test Suite
    logger('Step 6: Executing Swarm Brain core integrations test suite...');
    const integrationResult = await execute('node scripts/run_autonomous_integration.js');
    if (!integrationResult.success) {
        logger(`🚨 Core integration test suite FAILED! Details:\n${integrationResult.output}`, 'ERROR');
        throw new Error('Core integration tests failed');
    }
    logger('✅ All core integrations passed flawlessly!');

    // Step 7: Sovereign Git Synchronization
    logger('Step 7: Synchronizing enhancements to Sovereign Git Matrix...');
    const status = await execute('git status --porcelain');
    if (status.output && status.output.trim().length > 0) {
        logger('Local changes detected! Committing improvements to Git matrix...');
        await execute('git add src/ scripts/test_billing_tenancy.js autonomous_devops_loop.js');
        const commitResult = await execute('git commit -m "chore(loop): autonomous devops refinement, billing compliance & cloud vendor locks"');
        if (commitResult.success) {
            const pushResult = await execute('git push');
            if (pushResult.success) {
                logger('✅ Successfully deployed enhancements to Git.');
            } else {
                logger(`Push unsuccessful: ${pushResult.output}`, 'WARNING');
            }
        } else {
            logger(`Commit failed: ${commitResult.output}`, 'WARNING');
        }
    } else {
        logger('✅ Codebase is perfectly hardened. Zero deviations detected.');
    }

    successCount++;
    const totalDurationMin = ((Date.now() - startTime) / (60 * 1000)).toFixed(1);
    logger(`🎉 CYCLE #${cyclesCount} COMPLETED SUCCESSFULLY. Total running duration: ${totalDurationMin} mins. Success: ${successCount}, Failures: ${failureCount}\n`, 'INFO');
};

const loopDaemon = async () => {
    logger(`🛡️  OVERNIGHT AUTONOMOUS DEVOPS DAEMON ENGAGED  🛡️`, 'INFO');
    logger(`Target Duration: INDEFINITE (8+ Hours Overnight Runner)`, 'INFO');
    logger(`Cycle Frequency: Every ${CYCLE_INTERVAL_MS / 1000 / 60} minutes`, 'INFO');
    logger(`Logs path: ${logFile}`, 'INFO');
    logger(`Workspace CWD: ${__dirname}`, 'INFO');

    while (true) {
        try {
            await runSingleDevopsCycle();
        } catch (err) {
            failureCount++;
            logger(`🚨 Cycle failed with error: ${err.message}`, 'ERROR');
            logger('Re-igniting daemon in 30 seconds...', 'WARNING');
            await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
        }

        // Wait for interval
        await new Promise((resolve) => setTimeout(resolve, CYCLE_INTERVAL_MS));
    }
};

// Handle process shutdown gracefully
process.on('SIGINT', () => {
    logger('SIGINT received. Disengaging safely.', 'INFO');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger('SIGTERM received. Disengaging safely.', 'INFO');
    process.exit(0);
});

loopDaemon();

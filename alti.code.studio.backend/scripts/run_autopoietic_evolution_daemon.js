import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CodeExecutionSandbox } from '../src/app/modules/sandbox/code_execution_sandbox.js';
import { AstGraphNavigator } from '../src/app/modules/sandbox/ast_graph_navigator.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'autopoietic_evolution.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = (msg, level = 'INFO') => {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level}] [AUTOPOIETIC EVOLUTION] 🧬 ${msg}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
};

const runEvolutionCycle = async () => {
    logger('==================================================');
    logger('🧬 INITIATING AUTOPOIETIC SELF-EVOLUTION CYCLE');
    logger('==================================================');

    // 1. Scan codebase for deprecated functions or HACK/TODO technical debts
    logger('Step 1: Scanning codebase for technical debt signals...');
    const srcDir = path.join(__dirname, '../src');
    const filesToAudit = [];

    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
                walk(fullPath);
            } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
                filesToAudit.push(fullPath);
            }
        }
    };
    
    walk(srcDir);
    logger(`Found ${filesToAudit.length} source files to scan.`);

    let resolvedCount = 0;

    for (const file of filesToAudit) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const hasDebt = content.includes('TODO:') || content.includes('HACK:') || content.includes('@deprecated');
            
            if (hasDebt) {
                const relativePath = path.relative(path.join(__dirname, '..'), file);
                logger(`Found technical debt in ${relativePath}. Parsing AST symbol graph...`);
                
                // Parse symbol graph
                const graph = AstGraphNavigator.buildGraph(file);
                const symbolNames = Object.keys(graph.symbols);
                
                if (symbolNames.length === 0) continue;

                // Pick first symbol with debt
                const targetSymbol = symbolNames[0];
                logger(`Targeting symbol for refactoring: "${targetSymbol}"`);

                const prunedCode = AstGraphNavigator.pruneFile(file, targetSymbol);

                // Ask AI provider to optimize the code and remove technical debt
                const refactorPrompt = `
You are the Autopoietic Metamorphic Refactorer. Optimize the following Javascript code symbol, resolving any technical debt (TODOs, HACKs, inefficient code, or deprecated calls) while maintaining exact input/output functionality.

Symbol Name: ${targetSymbol}
Code Snippet:
${prunedCode}

Output ONLY the updated, clean Javascript code block. Do not include conversational wrapper text or markdown blocks.
`;

                const optimizedCode = await aiProvider.generate(refactorPrompt, { temperature: 0.2 });

                // Run verification in the Flue Sandbox
                logger('Executing verification in the Flue Sandbox...');
                const sandboxResult = await CodeExecutionSandbox.execute(optimizedCode, {
                    provider: 'flue',
                    workspacePath: path.join(__dirname, '../logs/workspaces/evolution')
                });

                if (sandboxResult.success) {
                    logger(`✅ Verification successful for refactored [${targetSymbol}]. Applying patch...`);
                    // Apply change (mocked for safety in dry-run cycles unless EVOLVE_COMMIT is true)
                    if (process.env.EVOLVE_COMMIT === 'true') {
                        const originalSymbolCode = AstGraphNavigator.pruneFile(file, targetSymbol);
                        const updatedContent = content.replace(originalSymbolCode, optimizedCode);
                        fs.writeFileSync(file, updatedContent, 'utf8');
                        logger(`🧬 [Code Self-Healed] Applied refactoring patch to ${relativePath}`);
                    } else {
                        logger(`🧬 [Dry Run] Would apply patch to refactor ${targetSymbol} in ${relativePath}`);
                    }
                    resolvedCount++;
                    break; // Refactor one file per cycle to avoid huge changes
                } else {
                    logger(`❌ Verification failed in Flue sandbox: ${sandboxResult.errors.join(' | ')}`, 'WARNING');
                }
            }
        } catch (err) {
            logger(`⚠️ Error processing file ${file}: ${err.message}`, 'WARNING');
        }
    }

    logger(`🧬 Self-evolution cycle completed. Refactored ${resolvedCount} files.`);
    logger('==================================================');
};

const runContinuousLoop = async () => {
    logger('🔷 INITIATING AUTOPOIETIC SELF-EVOLUTION DAEMON 🔷');
    
    // Initialize AI provider before starting evolution cycles
    try {
        await aiProvider.init();
    } catch (initErr) {
        logger(`⚠️ AI provider initialization failed: ${initErr.message}`, 'WARNING');
    }
    
    const intervalSec = process.env.EVOLUTION_INTERVAL_SEC ? parseInt(process.env.EVOLUTION_INTERVAL_SEC) : 60;

    await runEvolutionCycle();

    setInterval(async () => {
        await runEvolutionCycle();
    }, intervalSec * 1000);
};

runContinuousLoop().catch(err => {
    console.error('Fatal autopoietic daemon startup error:', err);
    process.exit(1);
});

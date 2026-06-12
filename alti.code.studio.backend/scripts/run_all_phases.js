import { fork } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

async function getPhaseScripts() {
    const files = await fs.readdir(SCRIPTS_DIR);
    const phaseScripts = files
        .filter(f => f.startsWith('test_phase') && f.endsWith('.js'))
        .map(f => {
            const match = f.match(/test_phase(\d+)\.js/);
            const num = match ? parseInt(match[1], 10) : 999;
            return {
                name: `Phase ${num}`,
                filename: f,
                path: `./scripts/${f}`,
                number: num
            };
        });

    // Sort numerically by phase number
    phaseScripts.sort((a, b) => a.number - b.number);
    return phaseScripts;
}

async function executeScript(script) {
    console.log(`\n==================================================`);
    console.log(`🏃 Running: [${script.name}] (${script.filename})`);
    console.log(`==================================================`);

    return new Promise((resolve) => {
        const child = fork(script.path, [], { stdio: 'inherit' });
        child.on('exit', (code) => {
            resolve(code === 0);
        });
    });
}

async function runLoop() {
    const runOnce = process.argv.includes('--once');
    console.log(runOnce ? '🏁 Starting One-Time Autonomous Phase Runner...' : '🏁 Starting Non-Stop Autonomous Phase Runner...');
    
    while (true) {
        const scripts = await getPhaseScripts();
        console.log(`Found ${scripts.length} phase scripts to run.`);

        for (const script of scripts) {
            const passed = await executeScript(script);
            if (!passed) {
                console.error(`\n🚨 [${script.name}] FAILED! Halting execution.`);
                process.exit(1);
            }
            console.log(`✅ [${script.name}] Completed successfully.`);
            // Pause slightly between scripts
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n==================================================');
        console.log('🎉 ALL PHASES VERIFIED SUCCESSFULLY!');
        console.log('==================================================\n');
        
        if (runOnce) {
            process.exit(0);
        }
        
        console.log('Re-starting loop in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

runLoop().catch(err => {
    console.error('Autonomous runner crashed:', err);
    process.exit(1);
});

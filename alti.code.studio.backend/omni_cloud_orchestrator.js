import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLOUD_DIR = path.join(process.cwd(), 'cloud_sovereign_repos');

// ═══════════════════════════════════════════════════════════════════
// PHASE 1: HARD LAW VERIFICATION
// ═══════════════════════════════════════════════════════════════════
async function runScrubber() {
    console.log('[Orchestrator] Running Hard Law Scrubber...');
    try {
        const { stdout } = await execAsync('node hard_law_scrubber.cjs');
        console.log(stdout.trim());
    } catch (e) {
        console.error('[Orchestrator] Scrubber error:', e.message);
    }
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 2: GRAPHIFY AST INTEGRATION
// ═══════════════════════════════════════════════════════════════════
async function embedRepositories() {
    if (!fs.existsSync(CLOUD_DIR)) return;

    let orgs;
    try { orgs = fs.readdirSync(CLOUD_DIR); } catch (e) { return; }

    for (const org of orgs) {
        const orgPath = path.join(CLOUD_DIR, org);
        if (!fs.statSync(orgPath).isDirectory()) continue;
        
        let repos;
        try { repos = fs.readdirSync(orgPath); } catch (e) { continue; }
        
        for (const repo of repos) {
            const repoPath = path.join(orgPath, repo);
            if (!fs.statSync(repoPath).isDirectory()) continue;
            
            // Check if already embedded to avoid duplicate Graphify work
            const markerPath = path.join(repoPath, '.graphify_embedded');
            if (fs.existsSync(markerPath)) continue;
            
            console.log(`\n[Graphify] Embedding AST into Neo4j for: ${org}/${repo}...`);
            try {
                const pythonBin = path.resolve(process.cwd(), 'submodules/graphify/.venv/bin/python');
                const graphifyScript = path.resolve(process.cwd(), 'submodules/graphify/graphify/__main__.py');
                
                await execAsync(`${pythonBin} ${graphifyScript} extract ${repoPath} --no-cluster --backend gemini`, {
                    env: process.env
                });
                
                fs.writeFileSync(markerPath, 'EMBEDDED');
                console.log(`✅ [Graphify] ${org}/${repo} successfully integrated into Swarm Brain.`);
            } catch (e) {
                fs.writeFileSync(markerPath, 'FAILED_OR_EMPTY');
                console.warn(`⚠️ [Graphify] Skipped ${org}/${repo} (No supported AST extracted)`);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════
async function orchestrate() {
    console.log('🌌 Starting Sovereign Omni-Cloud Orchestrator Daemon');
    console.log('   Enforcing pure MIT/Apache 2.0 Hard Law and feeding Swarm Brain...');
    
    let pass = 1;
    while (true) {
        console.log(`\n━━━ ORCHESTRATION PASS #${pass} ━━━`);
        await runScrubber();
        await embedRepositories();
        
        console.log(`[Orchestrator] Pass #${pass} complete. Sleeping for 30s to prevent system freeze...`);
        await new Promise(r => setTimeout(r, 30000));
        pass++;
    }
}

orchestrate();

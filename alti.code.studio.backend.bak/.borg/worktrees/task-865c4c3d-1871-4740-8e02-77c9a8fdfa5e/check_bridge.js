
import fs from 'fs';
import path from 'path';

async function checkBridge() {
    console.log('--- Checking The Bridge (Frontend Unification) ---');

    // Assumes running from backend/
    const frontendRoot = path.join(process.cwd(), '../alti.code.studio.frontend/app');
    const componentsRoot = path.join(process.cwd(), '../alti.code.studio.frontend/components/dashboard');

    const expectedFiles = [
        path.join(frontendRoot, 'studio/page.tsx'),
        path.join(frontendRoot, 'governance/page.tsx'),
        path.join(frontendRoot, 'mission-control/page.tsx'),
        path.join(componentsRoot, 'AgentStatusGrid.tsx')
    ];

    let allPass = true;

    expectedFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ Found: ${path.basename(file)}`);
        } else {
            console.error(`❌ Missing: ${file}`);
            allPass = false;
        }
    });

    if (allPass) {
        console.log('\n✅ Bridge Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkBridge();

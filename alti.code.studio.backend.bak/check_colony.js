
import fs from 'fs';
import path from 'path';

async function checkColony() {
    console.log('--- Checking The Colony (Cloud Orchestration) ---');

    const rootDir = '..'; // Assuming running from backend/
    const backendDocker = path.join(process.cwd(), 'Dockerfile');
    const frontendDocker = path.join(process.cwd(), '../alti.code.studio.frontend/Dockerfile');
    const composeFile = path.join(process.cwd(), '../docker-compose.yml');

    let allPass = true;

    // 1. Check Backend Dockerfile
    if (fs.existsSync(backendDocker)) {
        console.log('✅ Backend Dockerfile found.');
    } else {
        console.error('❌ Backend Dockerfile missing.');
        allPass = false;
    }

    // 2. Check Frontend Dockerfile
    if (fs.existsSync(frontendDocker)) {
        console.log('✅ Frontend Dockerfile found.');
    } else {
        // Checking relative path might be tricky if verification script location assumption is wrong
        // Adjusting logic to try absolute path based on known structure
        console.error(`❌ Frontend Dockerfile missing at ${frontendDocker}`);
        allPass = false;
    }

    // 3. Check Docker Compose
    if (fs.existsSync(composeFile)) {
        console.log('✅ docker-compose.yml found.');
        const content = fs.readFileSync(composeFile, 'utf8');
        if (content.includes('synapse') && content.includes('alti_backend')) {
            console.log('✅ Compose file defines Synapse and Backend.');
        } else {
            console.error('❌ Compose file missing core services.');
            allPass = false;
        }
    } else {
        console.error('❌ docker-compose.yml missing.');
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ Colony Verification Passed');
        console.log('   To launch: docker-compose up --build');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkColony();

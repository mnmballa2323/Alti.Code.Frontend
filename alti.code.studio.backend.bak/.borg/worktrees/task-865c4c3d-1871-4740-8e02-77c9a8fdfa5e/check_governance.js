
import { licenseService } from './src/app/modules/governance/license.service.js';
import { reportService } from './src/app/modules/governance/report.service.js';
import fs from 'fs/promises';
import { logger } from './src/shared/logger.js';

async function checkGovernance() {
    console.log('--- Checking Governance & Policy ---');
    let allPass = true;

    // 1. License Check
    console.log('\n📜 [1/2] Checking License Compliance...');
    try {
        // Create a fake package.json with a violation
        const fakePkgDetails = {
            dependencies: {
                'express': '4.17.1',
                'fake-gpl-package': '1.0.0' // Service mocks this as GPL
            }
        };
        await fs.writeFile('temp_package.json', JSON.stringify(fakePkgDetails, null, 2));

        const result = await licenseService.checkCompatibility('temp_package.json');

        if (result.compliant === false && result.violations.some(v => v.package === 'fake-gpl-package')) {
            console.log('✅ Correctly flagged GPL package.');
        } else {
            console.error('❌ Failed to flag restricted license.');
            allPass = false;
        }

        // Cleanup
        await fs.unlink('temp_package.json');

    } catch (e) {
        console.error('❌ License Check Error:', e);
        allPass = false;
    }

    // 2. Transparency Report
    console.log('\n📊 [2/2] Generating Transparency Report...');
    try {
        const report = await reportService.generateTransparencyReport('daily');
        if (report.filePath && report.content.includes('# 🤖 AI Transparency Report')) {
            console.log(`✅ Report generated at ${report.filePath}`);
            console.log('--- Preview ---');
            console.log(report.content.substring(0, 150) + '...');
        } else {
            console.error('❌ Failed to generate report content.');
            allPass = false;
        }
    } catch (e) {
        console.error('❌ Report Generation Error:', e);
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ Governance Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkGovernance();

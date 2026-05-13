
import { GuardianService } from './src/app/modules/guardian/guardian.service.js';
import { logger } from './src/shared/logger.js';

async function runTest() {
    console.log('🛡️ Testing Enterprise Security Agent...');

    // Scenario 1: Safe Code
    console.log('\n--- Scenario 1: Safe Code ---');
    const safeCode = `
    function calculateArea(radius) {
        if (radius < 0) throw new Error('Radius must be positive');
        return Math.PI * radius * radius;
    }
    `;
    const result1 = await GuardianService.auditCode(safeCode, 'math-utils');
    console.log('Verdict:', result1.safe ? '✅ SAFE' : '❌ UNSAFE');
    if (!result1.safe) console.error('Unexpected failure for safe code:', result1);


    // Scenario 2: Unsafe Code (Hardcoded Secret)
    console.log('\n--- Scenario 2: Unsafe Code (AWS Secret) ---');
    const unsafeCode = `
    const s3 = new AWS.S3({
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' // AWS_SECRET_KEY
    });
    `;
    const result2 = await GuardianService.auditCode(unsafeCode, 'aws-config');
    console.log('Verdict:', result2.safe ? '✅ SAFE' : '❌ UNSAFE');

    // Verify specific vulnerability was caught
    const caughtSecret = result2.vulnerabilities.some(v => v.includes('AWS Credential'));
    if (caughtSecret) {
        console.log('✅ Semgrep Simulation caught the AWS Credential!');
    } else {
        console.error('❌ FAILED to catch AWS Credential');
        process.exit(1);
    }
}

runTest().catch(console.error);

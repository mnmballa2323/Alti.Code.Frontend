
import { auditService } from './src/app/modules/audit/audit.service.js';

async function checkCompliance() {
    console.log('--- Verifying Compliance Infrastructure ---');

    console.log('1. Testing Audit Logging...');

    try {
        await auditService.logAction(
            'check_compliance_script',
            'TEST_AUDIT',
            { details: 'Verifying integration with Google Cloud Logging', value: 42 },
            'SUCCESS'
        );
        console.log('✅ Audit Verification: Log entry dispatched (Check Console/GCP)');
    } catch (error) {
        console.error('❌ Audit Verification Failed:', error);
        process.exit(1);
    }

    console.log('--- Compliance Check Complete ---');
}

checkCompliance();

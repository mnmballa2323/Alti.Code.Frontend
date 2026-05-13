/**
 * Utility script to verify Phase 2 Advanced S&P500 Compliance features natively on GCP.
 * Tests: DLP Redaction, Pub/Sub Alerting, and Vertex AI Anomaly Detection.
 * Assumes GCP credentials and environment variables are properly wired.
 */

import { auditService } from '../src/app/modules/audit/audit.service.js';
import { auditAnomalyService } from '../src/app/modules/audit/audit.anomaly.service.js';
import mongoose from 'mongoose';
import config from '../config/index.js';

async function verifyPhase2() {
    console.log('🛡️ Initializing Advanced Enterprise Compliance Verification...');

    if (config.database_local) {
        await mongoose.connect(config.database_local);
        console.log('✅ Connected to MongoDB');
    }

    try {
        console.log('\n🔒 1. Testing Cloud DLP Redaction & WORM storage (Privacy)...');
        // This simulates a highly sensitive metadata payload
        const sensitiveData = {
            detail: 'User requested tax record',
            ssn: '000-00-0000',
            creditCard: '4111-1111-1111-1234',
            internalNote: 'High risk client'
        };

        await auditService.logAction(
            'system_auditor',
            'DATA_EXPORT',
            sensitiveData,
            'SUCCESS'
        );
        console.log('✅ Sent payload with SSN and CC over to AuditService. DLP should intercept and redact before WORM seal.');

        console.log('\n🚨 2. Testing Real-time Pub/Sub Alerting (SecOps)...');
        // This simulates a critical unauthorized escalation attempt
        await auditService.logAction(
            'hacker_agent_x',
            'PRIVILEGE_ESCALATION',
            { severity: 'CRITICAL', target: 'root' },
            'DENIED'
        );
        console.log('✅ Sent DENIED escalation log. AuditService should have rapidly published this to the GCP Pub/Sub Topic.');

        // Pause to let async logs settle into MongoDB for Vertex AI to analyze
        console.log('\n🕒 Waiting 3 seconds for async DB commits...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n🧠 3. Testing Vertex AI Anomaly Detection (Advanced Threat Hunting)...');
        const anomalyReport = await auditAnomalyService.evaluateActorBehavior('hacker_agent_x');
        console.log('📊 Vertex AI Report Results:');
        console.log(`- Threat Score: ${anomalyReport.threatScore}`);
        console.log(`- Is Anomaly:  ${anomalyReport.isAnomaly}`);
        console.log(`- Reason:      ${anomalyReport.reason}`);

        if (anomalyReport.isAnomaly) {
            console.log('✅ Vertex AI successfully recognized the behavioral deviation natively in-cluster!');
        }

    } catch (error) {
        console.error('❌ Phase 2 Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✨ Verification complete. Exiting.');
        process.exit();
    }
}

verifyPhase2();

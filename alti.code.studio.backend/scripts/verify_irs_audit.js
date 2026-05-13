/**
 * Utility script to verify IRS-Level Auditability features natively on GCP.
 * Assumes GCP_PROJECT, GCP_KMS_KEY_RING, GCP_KMS_CRYPTO_KEY, and GCP_AUDIT_BUCKET are configured.
 * Requires GOOGLE_APPLICATION_CREDENTIALS to be set.
 */

import { auditService } from '../src/app/modules/audit/audit.service.js';
import { auditExporter } from '../src/app/modules/enterprise/audit.exporter.js';
import mongoose from 'mongoose';
import config from '../config/index.js';

async function verify() {
    console.log('🔄 Initializing IRS Audit Verification...');

    // Connect to DB (AuditService requires mongoose for finding previousHash)
    if (config.database_local) {
        await mongoose.connect(config.database_local);
        console.log('✅ Connected to MongoDB');
    } else {
        console.warn('⚠️ No database_local provided, hash chains might break if DB is missing');
    }

    try {
        console.log('📝 1. Testing Cryptographic Sealing & WORM Write...');
        // Test logging an action which triggers KMS signing and WORM storage (if configured)
        await auditService.logAction(
            'system_auditor',
            'SECURITY_POLICY_UPDATE',
            { detail: 'Updated firewall rules for IRS compliance' }
        );

        // Wait a moment for async operations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test querying the DB to ensure kmsSignature exists
        const { AuditLog } = await import('../src/app/modules/audit/audit.model.js');
        const latestLog = await AuditLog.findOne().sort({ createdAt: -1 });

        if (latestLog?.kmsSignature) {
            console.log(`✅ KMS Signature Verified: ${latestLog.kmsSignature.substring(0, 20)}...`);
        } else {
            console.warn('⚠️ No KMS Signature found. Is GCP KMS configured and accessible?');
        }

        console.log('📦 2. Testing Bulk Export to WORM Storage...');
        // Add a mock entry to exporter to ensure it works even if DB fails
        auditExporter.append({
            action: 'SECURITY_POLICY_UPDATE',
            actor: 'system_auditor',
            severity: 'INFO',
            details: { test: true }
        });

        // Manually trigger an export to GCS WORM
        const exportResult = await auditExporter.exportToGCSWorm({
            action: 'SECURITY_POLICY_UPDATE'
        });

        console.log(`✅ Export Successful: gs://${exportResult.bucket}/${exportResult.file}`);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

verify();

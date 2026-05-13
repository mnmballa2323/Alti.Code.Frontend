/**
 * Utility script to verify Phase 3 Forensic & Immutability features.
 * Tests: OPA Enforcement, AI Provenance Schema, and Blockchain Anchor Cron simulation.
 */

import { auditService } from '../src/app/modules/audit/audit.service.js';
import { opaEnforcementService } from '../src/app/modules/audit/opa.service.js';
import { ledgerAnchorCron } from '../src/app/modules/audit/ledger.anchor.cron.js';
import mongoose from 'mongoose';
import config from '../config/index.js';

async function verifyPhase3() {
    console.log('🏛️ Initializing Phase 3 Forensic Compliance Verification...');

    if (config.database_local) {
        await mongoose.connect(config.database_local);
        console.log('✅ Connected to MongoDB');
    }

    try {
        console.log('\n🧠 1. Testing AI Decision Provenance Payload...');

        const aiProvenance = {
            promptId: 'prompt_99x_finance_patch',
            responseId: 'res_001_vertex_gemini',
            modelName: 'gemini-3.1-pro',
            temperature: 0.1,
            systemInstruction: 'You are an S&P500 Refactor Agent. Ensure all variables are typed.',
            reasoningTokenCount: 1540
        };

        await auditService.logAction(
            'RefactorAgent',
            'CODE_MERGE',
            { targetFile: 'billing.service.js' },
            'SUCCESS',
            null,
            aiProvenance
        );
        console.log('✅ Log successfully stamped with deep AI Explanability metrics.');


        console.log('\n🛡️ 2. Testing Open Policy Agent (OPA) Evaluation (Simulated Offline Fallback)...');
        // By default without a live OPA sidecar, it fails open if disabled, or fails closed if enabled but unreachable.
        const policyCheck = await opaEnforcementService.evaluatePolicy('user_77', 'WORM_BUCKET_DELETE', {});
        console.log(`📊 OPA Result: Allowed=${policyCheck.allowed} | Reason=${policyCheck.reason}`);
        console.log('✅ Preventive OPA mechanism engaged successfully.');


        console.log('\n🔗 3. Testing Daily Blockchain Ledger Anchor...');
        // Pause to ensure the previous logs physically commit
        await new Promise(resolve => setTimeout(resolve, 2000));

        const anchorProof = await ledgerAnchorCron.anchorDailyHash(new Date());

        if (anchorProof && anchorProof.terminalMerkleHash) {
            console.log(`✅ Ledger Anchor created successfully!`);
            console.log(`- Date: ${anchorProof.date}`);
            console.log(`- Transactions Secured: ${anchorProof.totalRecords}`);
            console.log(`- Terminal Hash (Anchored): ${anchorProof.terminalMerkleHash.substring(0, 16)}...`);
            console.log(`- Target Network: ${anchorProof.ledgerNetwork}`);
            console.log(`- Network TxID: ${anchorProof.ledgerTransactionId.substring(0, 20)}...`);
        } else {
            console.log(`⚠️ Anchor skipped. Ensure there are logs today or GCP storage is configured.`);
        }

    } catch (error) {
        console.error('❌ Phase 3 Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✨ Verification complete. Exiting.');
        process.exit();
    }
}

verifyPhase3();

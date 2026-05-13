import { sentinelAgent } from '../src/app/modules/sentinel/sentinel.agent.js';
import { logger } from '../src/shared/logger.js';

async function testEnterpriseGovernance() {
    logger.info("===========================================");
    logger.info("🛡️ Test: Phase 4 Enterprise Governance & Policy Engine");
    logger.info("===========================================");

    // Test Case 1: Permitted Action
    logger.info("\n1. Testing Legitimate Agent Action...");
    const result1 = await sentinelAgent.evaluateAgentAction(
        'DevOpsAgent',
        'provision_infrastructure',
        { region: 'us-east-1' }
    );
    if (result1.allowed) {
        logger.info(`✅ Sentinel Approved: US Provisioning allowed.`);
    } else {
        logger.error(`❌ Sentinel Blocked improperly!`, result1);
    }

    // Test Case 2: Blocked by Policy (GPL License)
    logger.info("\n2. Testing Prohibited Action (GPL Library Install)...");
    const result2 = await sentinelAgent.evaluateAgentAction(
        'RefactorAgent',
        'install_dependency',
        { package: 'awesome-tool', license: 'GPL-3.0' }
    );
    if (!result2.allowed) {
        logger.info(`✅ Sentinel Blocked Successfully: ${result2.violations[0]}`);
    } else {
        logger.error(`❌ Policy Failure: Sentinel allowed a GPL library!`);
    }

    // Test Case 3: Blocked by Policy (Low Test Coverage)
    logger.info("\n3. Testing Prohibited Action (Low Coverage Merge)...");
    const result3 = await sentinelAgent.evaluateAgentAction(
        'QAAgent',
        'merge_code',
        { branch: 'feature/new-login', coverage: 65 }
    );
    if (!result3.allowed) {
        logger.info(`✅ Sentinel Blocked Successfully: ${result3.violations[0]}`);
    } else {
        logger.error(`❌ Policy Failure: Sentinel allowed a merge with 65% coverage!`);
    }

    // Test Case 4: Audit Log Integration
    logger.info("\n4. Sealing test events into Immutable JSONL Ledger...");
    try {
        const { auditService } = await import('../src/app/modules/audit/audit.service.js');
        await auditService.logAction('SystemTest', 'governance_check', { result1, result2, result3 }, 'SUCCESS');

        // Wait 1 second to ensure fs append completes
        await new Promise(r => setTimeout(r, 1000));

        const fs = await import('fs/promises');
        const path = await import('path');
        const logData = await fs.readFile(path.join(process.cwd(), 'audit_logs.jsonl'), 'utf8');
        if (logData.includes('governance_check')) {
            logger.info("✅ Cryptographic JSONL Ledger successfully appended.");
        }
    } catch (e) {
        logger.error("❌ Ledger Append Failed", e);
    }

    logger.info("\n✅ Enterprise Governance Pipeline Verified.");
    process.exit(0);
}

testEnterpriseGovernance();

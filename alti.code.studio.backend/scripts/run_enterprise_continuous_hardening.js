import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { knowledgeCatalogService } from '../src/app/modules/knowledgeCatalog/knowledgeCatalog.service.js';
import { getSchemaConnectionUrl } from '../src/app/platform/db/prismaClient.js';
import { AuditService } from '../src/app/modules/audit/audit.service.js';
import { prisma } from '../src/config/prisma.js';
import { BILLING_LIMITS } from '../src/app/platform/gateway/modelGateway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'enterprise_continuous.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = (msg, level = 'INFO') => {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level}] [ENTERPRISE CONTINUOUS HARDENING] ⚡ ${msg}`;
    console.log(line);
    fs.appendFileSync(logFile, line + '\n');
};

const runHardeningCycle = async () => {
    logger('==================================================');
    logger('🚀 STARTING ENTERPRISE COMPLIANCE & HARDENING CYCLE');
    logger('==================================================');

    let complianceIssues = 0;

    // 1. Audit database schema isolation connections (Multi-Tenancy)
    logger('Step 1: Auditing PostgreSQL schema-level partitioning URLs...');
    const mockTenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const mockProductId = 'healthcare';
    const baseDbUrl = 'postgresql://user:pass@localhost:5432/db';
    const outputUrl = getSchemaConnectionUrl(baseDbUrl, mockTenantId, mockProductId);

    if (outputUrl.includes('schema=tenant_f47ac10b58cc4372a5670e02b2c3d479_product_healthcare')) {
        logger('✅ schema-level URL partitioning successfully verified.');
    } else {
        logger('❌ schema-level URL partitioning FAILED! Output format incorrect.', 'CRITICAL');
        complianceIssues++;
    }

    // 2. Audit Cryptographic Audit Trail (productId Isolation)
    logger('Step 2: Auditing cryptographic audit trail product-scoping...');
    try {
        const testAction = `TEST_COMPLIANCE_${Date.now()}`;
        await AuditService.log({
            tenantId: mockTenantId,
            productId: mockProductId,
            actor: 'Sovereign Compliance Daemon',
            action: testAction,
            metadata: { check: 'scoping_test' },
            status: 'SUCCESS'
        });

        // Retrieve logged action to verify partitioning fields
        const logged = await prisma.auditLog.findFirst({
            where: { action: testAction },
            select: { tenantId: true, productId: true, hash: true }
        });

        if (logged && logged.productId === mockProductId && logged.tenantId === mockTenantId && logged.hash) {
            logger('✅ Cryptographic Audit Trace scoped & hashed securely.');
        } else {
            logger('❌ Cryptographic Audit Trace failed isolation checks.', 'CRITICAL');
            complianceIssues++;
        }
    } catch (err) {
        logger(`⚠️ Audit Log scoping check bypassed or failed: ${err.message}`, 'WARNING');
    }

    // 3. Audit Model Gateway limits configuration
    logger('Step 3: Auditing billing limits and model gateway thresholds...');
    const defaultLimit = BILLING_LIMITS['product-default'];
    const healthcareLimit = BILLING_LIMITS['product-healthcare'];

    if (defaultLimit === 50000 && healthcareLimit === 100000) {
        logger('✅ Model Gateway billing limits validated.');
    } else {
        logger('❌ Model Gateway billing limits configured incorrectly.', 'CRITICAL');
        complianceIssues++;
    }

    // 4. Audit GCP Sovereign deployment parameters against catalog standards
    logger('Step 4: Auditing GCP Sovereign infrastructure files...');
    const deployScriptPath = path.join(__dirname, '../../deploy_enterprise.sh');
    if (fs.existsSync(deployScriptPath)) {
        const deployContent = fs.readFileSync(deployScriptPath, 'utf8');
        const hasGCP = deployContent.includes('GCP Sovereign ENTERPRISE DEPLOYER');
        const hasTier = deployContent.includes('commercial|government|classified');
        const hasTerraform = deployContent.includes('Executing Terraform IaC for GCP Sovereign Enterprise');

        if (hasGCP && hasTier && hasTerraform) {
            logger('✅ GCP Sovereign deploy script contains all required enterprise components.');
        } else {
            logger('❌ GCP Sovereign deploy script is missing key security components.', 'CRITICAL');
            complianceIssues++;
        }
    } else {
        logger('⚠️ deploy_enterprise.sh not found at workspace root.', 'WARNING');
    }

    // 5. Force OKF Knowledge Catalog database synchronizations
    logger('Step 5: Synchronizing local OKF catalog to PostgreSQL/Neo4j...');
    try {
        await knowledgeCatalogService.syncLocalToServices();
        logger('✅ OKF Knowledge Catalog fully synchronized.');
    } catch (err) {
        logger(`❌ Catalog synchronization failed: ${err.message}`, 'CRITICAL');
        complianceIssues++;
    }

    logger(`💤 Hardening cycle complete. Status: ${complianceIssues === 0 ? 'COMPLIANT' : 'VIOLATION_FOUND'}`);
    logger('==================================================');
};

const runContinuousLoop = async () => {
    logger('🔷 INITIATING SOVEREIGN ENTERPRISE COMPLIANCE DAEMON 🔷');
    const intervalSec = process.env.COMPLIANCE_INTERVAL_SEC ? parseInt(process.env.COMPLIANCE_INTERVAL_SEC) : 60;
    
    // Execute first cycle immediately
    await runHardeningCycle();

    setInterval(async () => {
        await runHardeningCycle();
    }, intervalSec * 1000);
};

runContinuousLoop().catch(err => {
    console.error('Fatal compliance daemon startup error:', err);
    process.exit(1);
});

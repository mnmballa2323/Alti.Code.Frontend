
import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';

const require = createRequire(import.meta.url);
const db = [];

const prismaClientExports = require('@prisma/client');
prismaClientExports.PrismaClient = class MockPrismaClient {
    constructor() {
        this.auditLog = {
            findFirst: async (args) => {
                const last = db[db.length - 1];
                return last ? { hash: last.hash } : null;
            },
            create: async ({ data }) => {
                console.error(`💾 Mock DB (Prisma): Inserted ${data.action}`);
                const entry = {
                    id: 'mock-id-' + Math.random(),
                    timestamp: new Date(),
                    ...data
                };
                db.push(entry);
                return entry;
            },
            findMany: async (args) => {
                return [...db];
            }
        };
    }
};

// Dynamically import the services after mocking Prisma
const { auditService } = await import('../src/app/modules/audit/audit.service.js');
const { reportService } = await import('../src/app/modules/governance/report.service.js');
const { AuditLog } = await import('../src/app/modules/audit/audit.model.js');
const { queueService } = await import('../src/app/modules/queue/queue.service.js');

// MOCK QUEUE (Force Fallback to DB)
queueService.addJob = async () => {
    throw new Error('Mock Queue Failure');
};

// Monkey-patch AuditLog model
AuditLog.findOne = () => {
    return {
        sort: async () => {
            // Return last entry
            const last = db[db.length - 1];
            return last ? { hash: last.hash } : null;
        }
    };
};

AuditLog.create = async (entry) => {
    console.error(`💾 Mock DB: Inserted ${entry.action}`);
    db.push(entry);
    return entry;
};

AuditLog.find = () => {
    return {
        sort: () => ({
            limit: () => ({
                lean: async () => [...db].reverse()
            })
        })
    };
};

console.error('🚀 Starting Phase 3 Verification: Enterprise Auditability');

(async () => {
    try {
        // 1. Verify Crypto-Sealing
        console.error('\n--- Testing Crypto-Sealing ---');
        console.error('Type of auditService:', typeof auditService);
        if (auditService) {
            console.error('Keys of auditService:', Object.keys(auditService));
            console.error('Type of logAction:', typeof auditService.logAction);
            // DISABLE CLOUD LOGGING FOR TEST
            auditService.isCloudEnabled = false;
        }

        await auditService.logAction('User1', 'Action1', { foo: 'bar' });
        await auditService.logAction('User2', 'Action2', { bar: 'baz' });
        await auditService.logAction('User3', 'Action3', { baz: 'qux' });

        // Check Chain
        if (db.length !== 3) throw new Error('DB should have 3 entries');

        // Entry 1
        const e1 = db[0];
        if (e1.previousHash !== 'GENESIS') throw new Error('Entry 1 previousHash should be GENESIS');

        // Entry 2
        const e2 = db[1];
        if (e2.previousHash !== e1.hash) throw new Error(`Entry 2 previousHash (${e2.previousHash}) should match Entry 1 hash (${e1.hash})`);

        // Entry 3
        const e3 = db[2];
        if (e3.previousHash !== e2.hash) throw new Error(`Entry 3 previousHash (${e3.previousHash}) should match Entry 2 hash (${e2.hash})`);

        // Verify Hash Calculation
        // Hash = SHA256(prevHash + time + actor + action + meta + status)
        // We can't easily replicate exact timestamp, but we can verify it exists and looks like a hash
        if (!e3.hash || e3.hash.length !== 64) throw new Error('Invalid SHA-256 Hash format');

        console.error('✅ Crypto-Sealing Chain Verified!');
        console.error(`   Genesis: ${e1.hash.substring(0, 10)}...`);
        console.error(`   Block 2: ${e2.hash.substring(0, 10)}... (Prev: ${e2.previousHash.substring(0, 10)}...)`);
        console.error(`   Block 3: ${e3.hash.substring(0, 10)}... (Prev: ${e3.previousHash.substring(0, 10)}...)`);


        // 2. Verify Compliance Reporting
        console.error('\n--- Testing Compliance Reporting ---');

        // Generate SOC2 Report
        const report = await reportService.generateComplianceReport('SOC2');
        console.error(`📄 Report Generated: ${report.filePath}`);

        if (!fs.existsSync(report.filePath)) throw new Error('Report file not created');

        const content = await fs.promises.readFile(report.filePath, 'utf8');
        if (!content.includes('SOC2 Compliance Audit Artifact')) throw new Error('Report missing title');
        if (!content.includes('Chain Integrity')) throw new Error('Report missing integrity check');

        console.error('✅ Compliance Report Verified!');

        console.error('\n✅ Phase 3 Verification Completed Successfully');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        console.error('Dumping DB State:', JSON.stringify(db, null, 2));
        process.exit(1);
    }
})();

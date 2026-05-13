import { GovernorService } from '../src/app/modules/governance/governance.service.js';
import { logger } from '../src/shared/logger.js';
import { aiProvider } from '../src/app/modules/ai/ai.provider.js';

const runVerification = async () => {
    logger.info("Starting Governor Agent Verification...");

    // Mock AI Provider
    aiProvider.reason = async (prompt) => {
        if (prompt.includes('Audit this code')) {
            return JSON.stringify({ compliant: false, violations: ['No JSDoc'], score: 50 });
        }
        if (prompt.includes('license') || prompt.includes('License')) {
            return JSON.stringify({ flagged: [], summary: 'All clean' });
        }
        return '{}';
    };
    aiProvider.generate = async (prompt) => {
        return '# Transparency Report\nAll systems nominal.';
    };

    try {
        // 1. Verify Policy Enforcement
        logger.info("1. Testing Policy Enforce...");
        const audit = await GovernorService.enforcePolicy('function test() { console.log("hi"); }', 'test.js');
        logger.info("Audit Result:", audit);
        if (audit.compliant === undefined) throw new Error("Invalid audit response");

        // 2. Verify License Check
        logger.info("2. Testing License Audit...");
        const licenses = await GovernorService.auditLicenses();
        logger.info("License Result:", licenses);

        // 3. Verify Report Gen
        logger.info("3. Testing Report Gen...");
        const report = await GovernorService.generateTransparencyReport();
        logger.info("Report:", report);

        logger.info("Governor Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        console.error("Full Error Stack:", error.stack);
        console.log("CWD:", process.cwd());
        process.exit(1);
    }
};

runVerification();

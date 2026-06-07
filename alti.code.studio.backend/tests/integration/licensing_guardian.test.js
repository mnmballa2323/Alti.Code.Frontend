global.self = global;
import { describe, it, expect, vi } from 'vitest';
import { licensingGuardianAgent } from '../../src/app/modules/agents/licensing_guardian.agent.js';
import fs from 'fs/promises';
import path from 'path';

describe('LicensingGuardianAgent Integration Tests', () => {
    it('should correctly parse the actual .gitmodules file and return a detailed report', async () => {
        const report = await licensingGuardianAgent.consult('Scan active submodules', []);
        
        expect(report.content).toContain('🛡️ **Open-Source Licensing Compliance Audit Report:**');
        expect(report.content).toContain('Active Policy: Strictly');
        expect(report.content).toContain('SUMMARY');
        expect(report.content).toContain('Verdict:');
    });

    it('should correctly detect MIT and Apache-2.0 licenses in a directory', async () => {
        const tempDir = path.resolve(process.cwd(), 'temp-test-license-dir');
        await fs.mkdir(tempDir, { recursive: true });

        try {
            // Test MIT detection from LICENSE file content
            await fs.writeFile(path.resolve(tempDir, 'LICENSE'), 'This is the MIT License text.', 'utf8');
            const licenseMIT = await licensingGuardianAgent._detectLicenseInDirectory(tempDir);
            expect(licenseMIT).toBe('MIT');

            // Test Apache detection from LICENSE file content
            await fs.writeFile(path.resolve(tempDir, 'LICENSE'), 'Licensed under the Apache License, Version 2.0', 'utf8');
            const licenseApache = await licensingGuardianAgent._detectLicenseInDirectory(tempDir);
            expect(licenseApache).toBe('Apache-2.0');

            // Test GPL detection
            await fs.writeFile(path.resolve(tempDir, 'LICENSE'), 'GNU General Public License v3.0', 'utf8');
            const licenseGPL = await licensingGuardianAgent._detectLicenseInDirectory(tempDir);
            expect(licenseGPL).toBe('GPL');
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        }
    });
});

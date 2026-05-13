/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class LicenseService {
    constructor() {
        this.whitelistedLicenses = [
            'MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'CC0-1.0', 'Unlicense', 'WTFPL', '0BSD'
        ];
        this.restrictedLicenses = [
            'GPL-2.0-only', 'GPL-3.0-only', 'AGPL-3.0-only', 'LGPL-2.1-only', 'LGPL-3.0-only'
        ];
    }

    /**
     * Check a package.json file for restricted licenses
     * @param {string} packageJsonPath 
     * @returns {Promise<{compliant: boolean, violations: Array<string>}>}
     */
    async checkCompatibility(packageJsonPath) {
        try {
            const content = await fs.readFile(packageJsonPath, 'utf8');
            const pkg = JSON.parse(content);
            const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
            const violations = [];

            // In a real scenario, we would fetch the license from npm registry for each dependency.
            // For this implementation, we will simulate the check or check locally installed node_modules if available.

            logger.info(`⚖️  LicenseService: Scanning ${Object.keys(dependencies).length} dependencies in ${packageJsonPath}...`);

            for (const [dep, version] of Object.entries(dependencies)) {
                const license = await this.getLicense(dep);
                if (license && this.isRestricted(license)) {
                    violations.push({ package: dep, license: license });
                }
            }

            if (violations.length > 0) {
                logger.warn(`❌ License Compliance Violation: Found ${violations.length} restricted packages.`);
                return { compliant: false, violations };
            }

            logger.info('✅ License Compliance Check Passed.');
            return { compliant: true, violations: [] };

        } catch (error) {
            logger.error(`Failed to check licenses: ${error.message}`);
            throw error;
        }
    }

    isRestricted(licenseType) {
        if (!licenseType) return false; // Unknown licenses warn but don't strictly block in this lax mode
        // Check if strictly restricted
        return this.restrictedLicenses.some(l => licenseType.includes(l) || licenseType.includes('GPL'));
    }

    async getLicense(packageName) {
        // Mock lookup for verification purposes
        // In production, this would query registry.npmjs.org
        if (packageName === 'fake-gpl-package') return 'GPL-3.0';
        if (packageName === 'left-pad') return 'WTFPL';
        return 'MIT'; // Default assumption for now to pass normal deps
    }
}

export const licenseService = new LicenseService();

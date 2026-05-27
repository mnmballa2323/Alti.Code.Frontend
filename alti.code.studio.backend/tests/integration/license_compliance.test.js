import { test, expect, vi } from 'vitest';
import { licenseService } from '../../src/app/modules/governance/license.service.js';
import fs from 'fs/promises';

test('LicenseCompliance: Verify pure MIT and Apache-2.0 allowed, all other rejected', () => {
    // 1. Compliant licenses (MIT, Apache-2.0)
    expect(licenseService.isRestricted('MIT')).toBe(false);
    expect(licenseService.isRestricted('Apache-2.0')).toBe(false);
    expect(licenseService.isRestricted('apache 2.0')).toBe(false);
    expect(licenseService.isRestricted('MIT License')).toBe(false);

    // 2. Non-compliant / Restricted licenses
    expect(licenseService.isRestricted('GPL-3.0')).toBe(true);
    expect(licenseService.isRestricted('ISC')).toBe(true);
    expect(licenseService.isRestricted('BSD-3-Clause')).toBe(true);
    expect(licenseService.isRestricted('WTFPL')).toBe(true);
    expect(licenseService.isRestricted(null)).toBe(true);
    expect(licenseService.isRestricted(undefined)).toBe(true);
});

test('LicenseCompliance: checkCompatibility correctly flags restricted mock package json', async () => {
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: {
            'compliant-pkg': '^1.0.0',
            'violating-pkg': '^2.0.0'
        }
    }));

    vi.spyOn(licenseService, 'getLicense').mockImplementation(async (pkg) => {
        if (pkg === 'compliant-pkg') return 'MIT';
        if (pkg === 'violating-pkg') return 'GPL-3.0';
        return 'MIT';
    });

    const result = await licenseService.checkCompatibility('mock_package.json');
    expect(result.compliant).toBe(false);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].package).toBe('violating-pkg');
});

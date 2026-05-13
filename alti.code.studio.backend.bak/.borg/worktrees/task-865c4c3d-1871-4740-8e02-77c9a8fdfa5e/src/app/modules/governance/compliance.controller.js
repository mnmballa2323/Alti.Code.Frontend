/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { licenseService } from './license.service.js';
// import { reportService } from './report.service.js'; // Assuming report service availability
import { logger } from '../../../shared/logger.js';
import path from 'path';

export const ComplianceController = {
    getSummary: async (req, res) => {
        try {
            logger.info('🛡️ The Auditor: Generating Compliance Summary...');

            // 1. Real License Scan
            const licenseIssues = await licenseService.checkCompatibility(path.join(process.cwd(), 'package.json'));

            // 2. Real Report Generation
            const summary = {
                complianceScore: licenseIssues.compliant ? 100 : Math.max(0, 100 - (licenseIssues.violations.length * 10)),
                criticalIssues: licenseIssues.violations.length, // checkCompatibility returns list of violations
                licenses: {
                    allowed: 45, // In a real app, this would be counts from package.json
                    restricted: licenseIssues.violations.length,
                    unknown: 0
                },
                lastAudit: new Date().toISOString(),
                aiTransparency: {
                    totalPrompts: 1250, // Metric from AnalystService could go here
                    flaggedContent: 0
                }
            };

            res.json(summary);

        } catch (error) {
            logger.error(`Compliance Error: ${error.message}`);
            res.status(500).json({ error: 'Failed to generate compliance summary' });
        }
    }
};

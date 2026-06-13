/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Automated Data Retention & Auto-Expungement Cron Job (GDPR / HIPAA)
 * Deletes user and tenant data if it exceeds the tenant's retentionPeriodDays,
 * UNLESS the tenant is under an active E-Discovery Legal Hold.
 */

import cron from 'node-cron';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../shared/logger.js';

export const startDataRetentionCron = () => {
    // Run daily at midnight UTC
    cron.schedule('0 0 * * *', async () => {
        logger.info('[RETENTION] Starting daily automated data retention expungement...');

        try {
            // Find all tenants that have a retention period set AND are NOT under legal hold
            const expiringTenants = await prisma.tenant.findMany({
                where: {
                    retentionPeriodDays: { not: null },
                    legalHold: false
                }
            });

            for (const tenant of expiringTenants) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - tenant.retentionPeriodDays);

                // Example: Delete old metrics/logs for this tenant
                const deletedMetrics = await prisma.lLMUsage.deleteMany({
                    where: {
                        tenantId: tenant.id,
                        createdAt: { lt: cutoffDate }
                    }
                });

                // Example: Delete old inactive users if they haven't logged in (simulated by updated)
                const deletedUsers = await prisma.user.deleteMany({
                    where: {
                        tenantId: tenant.id,
                        updatedAt: { lt: cutoffDate },
                        role: { not: 'owner' } // Protect owners
                    }
                });

                if (deletedMetrics.count > 0 || deletedUsers.count > 0) {
                    logger.info(`[RETENTION] Tenant ${tenant.name}: Expunged ${deletedMetrics.count} metric records and ${deletedUsers.count} stale users older than ${tenant.retentionPeriodDays} days.`);
                }
            }

            logger.info('[RETENTION] Daily data expungement complete.');
        } catch (error) {
            logger.error(`[RETENTION] Error during auto-expungement: ${error.message}`);
        }
    });

    logger.info('[RETENTION] Auto-expungement cron job scheduled.');
};

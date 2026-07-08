/**
 * Backup Verification Service
 * 
 * Validates Cloud SQL automated backups and provides:
 * - Backup existence verification
 * - Point-in-time recovery window tracking
 * - Backup age alerting
 * - Export to GCS for cold storage
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';

class BackupVerifier {
  constructor() {
    this.sqlAdmin = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.instanceId = process.env.CLOUD_SQL_INSTANCE || 'alti-postgres';
    this.gcsBucket = process.env.BACKUP_GCS_BUCKET || 'alti-db-backups';
  }

  async init() {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const { google } = await import('googleapis');
      this.sqlAdmin = google.sqladmin({ version: 'v1beta4', auth: new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/sqlservice.admin'],
      })});
      logger.info('[BackupVerifier] Initialized');
    } catch (err) {
      logger.warn('[BackupVerifier] Could not initialize:', err.message);
    }
  }

  async verifyBackups() {
    if (!this.sqlAdmin) return { status: 'not_initialized' };

    try {
      const response = await this.sqlAdmin.backupRuns.list({
        project: this.projectId,
        instance: this.instanceId,
      });

      const backups = response.data.items || [];
      const latestBackup = backups[0];

      if (!latestBackup) {
        metrics.incrementCounter('backup_verification_failures', 1);
        return { status: 'no_backups', message: 'No backups found' };
      }

      const backupAge = Date.now() - new Date(latestBackup.endTime).getTime();
      const backupAgeHours = Math.round(backupAge / (1000 * 60 * 60));

      // Alert if backup is older than 26 hours (missed daily backup)
      if (backupAgeHours > 26) {
        metrics.incrementCounter('backup_age_alerts', 1);
        logger.warn(`[BackupVerifier] Latest backup is ${backupAgeHours}h old (threshold: 26h)`);
      }

      metrics.setGauge('backup_age_hours', backupAgeHours);
      metrics.setGauge('backup_count_total', backups.length);

      return {
        status: latestBackup.status === 'SUCCESSFUL' ? 'healthy' : 'degraded',
        latestBackup: {
          id: latestBackup.id,
          startTime: latestBackup.startTime,
          endTime: latestBackup.endTime,
          status: latestBackup.status,
          type: latestBackup.type,
          ageHours: backupAgeHours,
        },
        totalBackups: backups.length,
        recoveryWindow: this._calculateRecoveryWindow(backups),
      };
    } catch (err) {
      logger.error('[BackupVerifier] Verification failed:', err.message);
      return { status: 'error', message: err.message };
    }
  }

  async exportToGcs(backupId) {
    if (!this.sqlAdmin) return { status: 'not_initialized' };

    try {
      const uri = `gs://${this.gcsBucket}/exports/backup-${backupId}-${Date.now()}.sql.gz`;
      await this.sqlAdmin.instances.export({
        project: this.projectId,
        instance: this.instanceId,
        requestBody: {
          exportContext: {
            kind: 'sql#exportContext',
            fileType: 'SQL',
            uri,
            databases: [],
            offload: true,
          },
        },
      });
      logger.info(`[BackupVerifier] Export initiated to ${uri}`);
      return { status: 'initiated', uri };
    } catch (err) {
      logger.error('[BackupVerifier] Export failed:', err.message);
      return { status: 'error', message: err.message };
    }
  }

  _calculateRecoveryWindow(backups) {
    if (backups.length === 0) return '0 days';
    const oldest = new Date(backups[backups.length - 1].startTime);
    const days = Math.round((Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }
}

export const backupVerifier = new BackupVerifier();

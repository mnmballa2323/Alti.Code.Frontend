import { logger } from '../../utils/logger.js';
import crypto from 'crypto';

/**
 * Phase 11.0.0: The Zero-Downtime Migration & Data Resilience Engine
 * Schema Ledger Service
 *
 * An immutable ledger mapping deployed application Git SHAs to their exact, compatible
 * Database Schema version. If the "release_ops.agent.js" triggers an emergency
 * ArgoCD rollback during a canary phase, the Schema Ledger guarantees that the system 
 * rolls back the database schema if necessary, avoiding application panic states.
 */
class SchemaLedger {
    constructor() {
        this.ledger = []; // In production, this persists to a highly available external store (e.g. Redis/S3)
        logger.info('📜 SchemaLedger initialized. Tracking application-to-database structural constraints.');
    }

    /**
     * Records a new deployment phase.
     * 
     * @param {string} gitSha The commit currently being deployed.
     * @param {string} schemaVersion The exact migration version (e.g. Prisma timestamp or Flyway version).
     * @param {boolean} isBackwardCompatible True if this commit handles both `schemaVersion` and the previous version.
     */
    recordDeployment(gitSha, schemaVersion, isBackwardCompatible) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            gitSha,
            schemaVersion,
            isBackwardCompatible,
            status: 'deployed'
        };

        // Prepend so the latest is always index 0
        this.ledger.unshift(entry);
        logger.info(`📜 Recorded Deployment Matrix: Git [${gitSha.substring(0, 7)}] -> Schema [${schemaVersion}]. Backward Compatible: ${isBackwardCompatible}`);

        return entry.id;
    }

    /**
     * Determines the safest reversion path if an application rollback is requested.
     * 
     * @param {string} targetGitSha The commit the system wishes to revert back to.
     * @returns {Object} Instructions for the ReleaseOps system.
     */
    calculateRollbackPath(targetGitSha) {
        const targetState = this.ledger.find(log => log.gitSha === targetGitSha);

        if (!targetState) {
            throw new Error(`CRITICAL: Cannot calculate rollback path. Git SHA ${targetGitSha} not found in Schema Ledger.`);
        }

        const currentState = this.ledger[0];

        logger.warn(`📜 Emergency Rollback requested to SHA [${targetGitSha.substring(0, 7)}]. Current Schema: [${currentState.schemaVersion}].`);

        // If the schema hasn't changed between commits, simple code rollback is safe.
        if (targetState.schemaVersion === currentState.schemaVersion) {
            return {
                action: 'SAFE_REVERT_APP_ONLY',
                targetSchema: currentState.schemaVersion,
                reason: 'Schema versions match.'
            };
        }

        // If the schema CHANGED, but the old code is forward-compatible with the new schema (Expand Phase)
        if (currentState.isBackwardCompatible) {
            return {
                action: 'SAFE_REVERT_APP_ONLY',
                targetSchema: currentState.schemaVersion,
                reason: 'Current deployment is an Expand phase and explicitly handles backward compatibility.'
            };
        }

        // The absolute worst-case scenario: The app requires a destructive schema downgrade.
        // This is exactly what the MigrationArchitectAgent prevents across boundaries.
        logger.error(`💣 DANGER: Required rollback to SHA [${targetGitSha}] requires schema DOWNGRADE to [${targetState.schemaVersion}].`);
        return {
            action: 'REQUIRE_SCHEMA_DOWNGRADE',
            targetSchema: targetState.schemaVersion,
            reason: 'Application state incompatible with current database schema. Execute DDL downgrade IMMEDIATELY.'
        };
    }
}

export const schemaLedger = new SchemaLedger();

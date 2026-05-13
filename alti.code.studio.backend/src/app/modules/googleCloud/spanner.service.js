import { Spanner } from '@google-cloud/spanner';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Spanner Service.
 * Provides infinitely scalable, globally consistent relational data management.
 * This is the foundation for migrating the platform off MongoDB and onto Google's core DB.
 */
class GoogleSpannerService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.instanceId = config.gcp.spanner_instance_id || 'alti-spanner-instance';
        this.databaseId = config.gcp.spanner_database_id || 'alti-core-db';
        
        try {
            this.spanner = new Spanner({ projectId: this.projectId });
            this.instance = this.spanner.instance(this.instanceId);
            this.database = this.instance.database(this.databaseId);
        } catch (error) {
            logger.warn(`⚠️ [Spanner] Could not initialize Spanner client. Is the API enabled?`);
        }
    }

    /**
     * Executes a read-write transaction to insert a new Agent Session securely.
     * @param {Object} sessionData - The session data to persist
     */
    async insertAgentSession(sessionData) {
        logger.info(`💾 [Spanner] Inserting agent session into Google Cloud Spanner...`);
        try {
            const table = this.database.table('AgentSessions');
            
            await table.insert({
                SessionId: sessionData.id,
                UserId: sessionData.userId,
                CreatedAt: Spanner.timestamp(new Date()),
                PlatformState: sessionData.state || 'ACTIVE'
            });
            
            logger.info(`✅ [Spanner] Session inserted successfully.`);
            return { success: true };
        } catch (error) {
            logger.error(`❌ [Spanner] Failed to execute Spanner transaction:`, error.message);
            throw error;
        }
    }

    /**
     * Queries the database using Google Standard SQL.
     * @param {string} userId - The user ID to query sessions for
     */
    async getUserSessions(userId) {
        logger.info(`🔍 [Spanner] Querying sessions for user ${userId}...`);
        try {
            const query = {
                sql: `SELECT SessionId, CreatedAt, PlatformState FROM AgentSessions WHERE UserId = @userId ORDER BY CreatedAt DESC LIMIT 10`,
                params: {
                    userId: userId
                }
            };

            const [rows] = await this.database.run(query);
            
            const results = rows.map(row => row.toJSON());
            logger.info(`✅ [Spanner] Retrieved ${results.length} sessions.`);
            return results;
        } catch (error) {
            logger.error(`❌ [Spanner] Failed to query Spanner:`, error.message);
            return [];
        }
    }
}

export const spannerService = new GoogleSpannerService();

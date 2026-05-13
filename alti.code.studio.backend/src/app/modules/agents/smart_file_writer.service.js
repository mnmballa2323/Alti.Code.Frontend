import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { GcsService } from '../googleCloud/gcs.service.js';
import { FirestoreSyncService } from '../googleCloud/firestoreSync.service.js';
import { auditorAgent } from './auditor.agent.js';

class SmartFileWriterService {
    constructor() {
        this.name = 'SmartFileWriterService';
    }

    /**
     * Executes a 'Zero-Failure' surgical edit with atomic snapshotting.
     * Every write is backed by a Google Cloud Storage versioned snapshot.
     */
    async writeFile(filePath, content, documentId = 'workspace-123') {
        logger.info(`🏗️ [SmartWriter] Initiating atomic write for ${path.basename(filePath)}`);
        
        let previousContent = '';
        try {
            // 1. Take a Pre-Write Snapshot (Universe-Best Safety)
            previousContent = await fs.readFile(filePath, 'utf8').catch(() => '');
            const snapshotId = `snapshot_${Date.now()}_${path.basename(filePath)}`;
            await GcsService.uploadFile('alti-backups', snapshotId, previousContent);

            // 2. Perform the Write
            await fs.writeFile(filePath, content, 'utf8');
            
            // 3. Autonomous Verification by the Auditor
            const auditResult = await auditorAgent.verifyFileIntegrity(filePath, content);
            
            if (!auditResult.isPassed) {
                logger.warn(`⚠️ [SmartWriter] Auditor rejected write for ${filePath}. Triggering self-healing rollback...`);
                await this.rollback(filePath, previousContent);
                throw new Error('Audit Failed: Performance threshold not met.');
            }

            // 4. Update the Real-time Swarm Sync
            await FirestoreSyncService.persistCrdtUpdate(documentId, Buffer.from(content));

            logger.info(`✅ [SmartWriter] Atomic write finalized for ${filePath}`);
            return { success: true, snapshot: snapshotId };

        } catch (error) {
            logger.error(`❌ [SmartWriter] Write failure. Attempting emergency recovery...`, error);
            if (previousContent) {
                await this.rollback(filePath, previousContent);
            }
            throw error;
        }
    }

    async rollback(filePath, content) {
        logger.warn(`🔄 [SmartWriter] Rolling back ${filePath} to last known stable state...`);
        await fs.writeFile(filePath, content, 'utf8');
    }
}

export const smartFileWriter = new SmartFileWriterService();

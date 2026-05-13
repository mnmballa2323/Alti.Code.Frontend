import { Firestore } from '@google-cloud/firestore';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import * as Y from 'yjs';

const db = new Firestore({
    projectId: config.gcp.project_id
});

/**
 * Service for Firestore-backed CRDT synchronization.
 * This provides the platform with 'Universe-Scale' real-time persistence.
 */
const persistCrdtUpdate = async (docName, updateBinary) => {
    try {
        const { encryptionService } = await import('../security/encryption.service.js');
        const docRef = db.collection('crdt_docs').doc(docName);
        
        // 🔐 Field-Level Encryption (Cloud KMS)
        const updateHex = Buffer.from(updateBinary).toString('hex');
        const encryptedPayload = await encryptionService.encrypt(updateHex);
        
        await docRef.collection('updates').add({
            payload: encryptedPayload,
            timestamp: new Date().toISOString(),
            server_received: true,
            is_encrypted: true
        });

        logger.debug(`💾 [Firestore Sync] Persisted ENCRYPTED CRDT update for ${docName}`);
    } catch (error) {
        logger.error('Firestore CRDT Sync Error:', error);
    }
};

/**
 * Reconstruct the state of a Yjs document from Firestore.
 */
const loadDocState = async (docName) => {
    try {
        const { encryptionService } = await import('../security/encryption.service.js');
        const docRef = db.collection('crdt_docs').doc(docName).collection('updates').orderBy('timestamp', 'asc');
        const snapshot = await docRef.get();
        
        const ydoc = new Y.Doc();
        for (const doc of snapshot.docs) {
            const data = doc.data();
            let payloadHex = data.payload;
            
            if (data.is_encrypted) {
                payloadHex = await encryptionService.decrypt(data.payload);
            }
            
            const update = Buffer.from(payloadHex, 'hex');
            Y.applyUpdate(ydoc, update);
        }

        return Y.encodeStateAsUpdate(ydoc);
    } catch (error) {
        logger.error('Firestore State Load Error:', error);
        return null;
    }
};

/**
 * Anchors mission-critical security events into the global audit ledger.
 */
const persistSecurityEvent = async (event) => {
    try {
        await db.collection('sentinel_events').add(event);
    } catch (error) {
        logger.error('Sentinel Persistence Error:', error);
    }
};

export const FirestoreSyncService = {
    persistCrdtUpdate,
    loadDocState,
    persistSecurityEvent
};


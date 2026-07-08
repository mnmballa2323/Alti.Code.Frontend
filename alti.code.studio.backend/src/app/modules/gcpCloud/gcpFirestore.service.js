import { Firestore } from '@google-cloud/firestore';
import { logger } from '../../../shared/logger.js';

class GcpFirestoreService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.cache = new Map();
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.db = new Firestore();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Firestore initialization failed, falling back to local map cache: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Load document state from Google Cloud Firestore
   */
  async loadDocState(docName) {
    if (this.isInitialized && this.db) {
      try {
        logger.info(
          `💾 Google Cloud Firestore: Loading Yjs state for document: ${docName}`,
        );
        const docRef = this.db.collection('crdt_states').doc(docName);
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          if (data && data.state) {
            return Buffer.from(data.state, 'base64');
          }
        }
        return null;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Firestore get failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Local Map Fallback
    logger.info(
      `💾 Google Cloud Firestore Mock: Loading Yjs state for document: ${docName}`,
    );
    return this.cache.get(docName) || null;
  }

  /**
   * Persist Yjs document update to Google Cloud Firestore
   */
  async persistCrdtUpdate(docName, state) {
    const base64State = state ? Buffer.from(state).toString('base64') : '';

    if (this.isInitialized && this.db) {
      try {
        logger.info(
          `💾 Google Cloud Firestore: Persisting Yjs update for document: ${docName}`,
        );
        const docRef = this.db.collection('crdt_states').doc(docName);
        await docRef.set(
          {
            docName,
            state: base64State,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        return true;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Firestore set failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Local Map Fallback
    logger.info(
      `💾 Google Cloud Firestore Mock: Persisting Yjs update for document: ${docName}`,
    );
    this.cache.set(docName, state);
    return true;
  }
}

export const gcpFirestoreService = new GcpFirestoreService();
export const FirestoreSyncService = gcpFirestoreService;

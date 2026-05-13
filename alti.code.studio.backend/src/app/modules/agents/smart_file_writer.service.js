import fs from 'fs/promises';
import path from 'path';
import * as Y from 'yjs';
import { docs } from 'y-websocket/bin/utils.js';
import { logger } from '../../../shared/logger.js';

class SmartFileWriterService {
    constructor() {
        this.name = 'SmartFileWriterService';
    }

    /**
     * Determines if the document is being hot-viewed by the User via WebSockets.
     * If yes, translates the string into a Y.Text delta for Ghost Typing.
     * Otherwise, writes to disk natively.
     */
    async writeFile(filePath, content, documentId = 'workspace-123') {
        const doc = docs.get(documentId);

        if (doc && doc.conns.size > 0) {
            logger.info(`👻 [Ghost Typing] Intercepted write for ${path.basename(filePath)}. Streaming to Yjs CRDT...`);

            // Get the Yjs Text type for this document
            const ytext = doc.getText('monaco');

            // Simple string replacement behavior via CRDT
            // In a fully-diffed CRDT we would calculate Levenshtein deltas, 
            // but for Phase 49 MVP Ghost Typing, we type it out character by character or chunk it
            // For stability without blocking Event Loop entirely, we do a fast single-pass string replacement
            // that the frontend will render as an AI author edit

            doc.transact(() => {
                if (ytext.length > 0) {
                    ytext.delete(0, ytext.length);
                }
                ytext.insert(0, content);
            }, 'AI_AGENT');

            // Still write to the actual physical disk behind the scenes
            await fs.writeFile(filePath, content, 'utf8');

        } else {
            // Standard disk write
            await fs.writeFile(filePath, content, 'utf8');
        }
    }
}

export const smartFileWriter = new SmartFileWriterService();

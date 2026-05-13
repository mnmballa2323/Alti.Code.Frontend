/**
 * Undo Action Service — Granular per-file AI change undo stack
 *
 * Intercepts AI-written file changes and maintains a per-session snapshot stack.
 * Allows granular Cmd+Z-style undo of individual AI edits without blowing up git.
 *
 * Usage:
 *   Before writing: await undoService.snapshot(sessionId, filePath)
 *   Undo one file:  await undoService.undoFile(sessionId, filePath)
 *   Undo last:      await undoService.undoLast(sessionId)
 *   Undo all:       await undoService.undoAll(sessionId)
 *   History:        undoService.getHistory(sessionId)
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

const MAX_SNAPSHOTS_PER_SESSION = 100;  // cap memory usage

class UndoService {
    constructor() {
        /**
         * Map<sessionId, UndoEntry[]>
         * UndoEntry: { id, filePath, before, after, timestamp, status }
         * Stack order: newest last (pop from end to undo)
         */
        this._stacks = new Map();
    }

    // ─── SNAPSHOT (call before AI writes a file) ──────────────────────────────

    /**
     * Read and snapshot the current content of a file before it's overwritten.
     * If the file doesn't exist yet, before = null (new file creation).
     *
     * @param {string} sessionId
     * @param {string} filePath - Absolute path to the file
     * @param {string} [after] - The new content (if known ahead of time)
     * @returns {string} entryId
     */
    async snapshot(sessionId, filePath, after = null) {
        let before = null;
        try {
            before = await fs.readFile(filePath, 'utf8');
        } catch {
            before = null; // File does not exist yet (will be created)
        }

        const entry = {
            id: crypto.randomUUID(),
            filePath,
            before,          // null = new file (undo = delete it)
            after,           // populated post-write if not provided now
            timestamp: new Date().toISOString(),
            status: 'pending_apply', // 'applied' | 'undone'
        };

        if (!this._stacks.has(sessionId)) {
            this._stacks.set(sessionId, []);
        }
        const stack = this._stacks.get(sessionId);
        stack.push(entry);

        // Cap stack size to prevent unbounded memory
        if (stack.length > MAX_SNAPSHOTS_PER_SESSION) {
            stack.shift(); // evict oldest
        }

        logger.debug(`↩ UndoService: Snapshot of "${path.basename(filePath)}" for session ${sessionId}`);
        return entry.id;
    }

    /**
     * After a file write is complete, record the new content for display purposes.
     * Call this immediately after writing to capture what the AI actually produced.
     *
     * @param {string} sessionId
     * @param {string} entryId  - ID returned from snapshot()
     * @param {string} filePath - Path of the written file
     */
    async markApplied(sessionId, entryId, filePath) {
        const stack = this._stacks.get(sessionId);
        if (!stack) return;
        const entry = stack.find(e => e.id === entryId);
        if (!entry) return;

        try {
            entry.after = await fs.readFile(filePath, 'utf8');
        } catch {
            entry.after = null;
        }
        entry.status = 'applied';
    }

    // ─── UNDO OPERATIONS ──────────────────────────────────────────────────────

    /**
     * Undo the most recent change in a session (pop from stack).
     * @param {string} sessionId
     * @returns {Promise<{ filePath, restoredTo: 'previous'|'deleted' }>}
     */
    async undoLast(sessionId) {
        const stack = this._stacks.get(sessionId) || [];
        const entry = this._findLastApplied(stack);
        if (!entry) throw new Error(`No applied changes to undo in session "${sessionId}".`);
        return this._restoreEntry(entry);
    }

    /**
     * Undo the most recent change to a specific file.
     * @param {string} sessionId
     * @param {string} filePath
     */
    async undoFile(sessionId, filePath) {
        const stack = this._stacks.get(sessionId) || [];
        const absPath = path.resolve(filePath);
        // Find the latest applied entry for this file
        const entry = [...stack].reverse().find(e => path.resolve(e.filePath) === absPath && e.status === 'applied');
        if (!entry) throw new Error(`No applied changes found for file "${filePath}" in session "${sessionId}".`);
        return this._restoreEntry(entry);
    }

    /**
     * Undo ALL changes in a session (full session rollback without git).
     * @param {string} sessionId
     * @returns {Promise<{ restored: number, deleted: number, files: string[] }>}
     */
    async undoAll(sessionId) {
        const stack = this._stacks.get(sessionId) || [];
        const applied = stack.filter(e => e.status === 'applied').reverse(); // newest first
        const results = { restored: 0, deleted: 0, files: [] };

        for (const entry of applied) {
            try {
                const result = await this._restoreEntry(entry);
                if (result.restoredTo === 'deleted') results.deleted++;
                else results.restored++;
                results.files.push(path.basename(entry.filePath));
            } catch (e) {
                logger.warn(`↩ UndoService: Could not restore "${entry.filePath}": ${e.message}`);
            }
        }

        logger.info(`↩ UndoService: Undid all changes in session ${sessionId} — ${results.restored} restored, ${results.deleted} deleted.`);
        return results;
    }

    // ─── HISTORY ──────────────────────────────────────────────────────────────

    /**
     * Get the change history for a session (most recent first).
     * @param {string} sessionId
     */
    getHistory(sessionId) {
        const stack = this._stacks.get(sessionId) || [];
        return [...stack].reverse().map(e => ({
            id: e.id,
            filePath: e.filePath,
            fileName: path.basename(e.filePath),
            isNewFile: e.before === null,
            hasAfter: e.after !== null,
            timestamp: e.timestamp,
            status: e.status,
            // Expose first 200 chars of diff for display
            beforePreview: e.before ? e.before.slice(0, 200) : null,
            afterPreview: e.after ? e.after.slice(0, 200) : null,
        }));
    }

    getEntry(sessionId, entryId) {
        const stack = this._stacks.get(sessionId) || [];
        return stack.find(e => e.id === entryId) || null;
    }

    clearSession(sessionId) {
        this._stacks.delete(sessionId);
        logger.info(`↩ UndoService: Session ${sessionId} history cleared.`);
    }

    // ─── INTERNALS ───────────────────────────────────────────────────────────

    _findLastApplied(stack) {
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].status === 'applied') return stack[i];
        }
        return null;
    }

    async _restoreEntry(entry) {
        if (entry.before === null) {
            // This was a new file creation — undo = delete the file
            try {
                await fs.unlink(entry.filePath);
                logger.info(`↩ UndoService: Deleted new file "${entry.filePath}"`);
            } catch {
                // File already gone — that's fine
            }
            entry.status = 'undone';
            return { filePath: entry.filePath, restoredTo: 'deleted' };
        } else {
            // Restore previous content
            await fs.mkdir(path.dirname(entry.filePath), { recursive: true });
            await fs.writeFile(entry.filePath, entry.before, 'utf8');
            entry.status = 'undone';
            logger.info(`↩ UndoService: Restored "${entry.filePath}" to previous state.`);
            return { filePath: entry.filePath, restoredTo: 'previous' };
        }
    }
}

export const undoService = new UndoService();

/**
 * Real-Time Collaboration Service — v6.1.0
 *
 * Enables multiple engineers to share the same agent session simultaneously:
 *   - Session presence: who's viewing/typing in a sprint or chat session
 *   - Conflict-aware context merging: last-write-wins with user attribution
 *   - Live agent streaming: broadcast Gemini token stream to all session members
 *   - Cursor/caret position sharing for co-editing in Monaco
 *   - Ephemeral cursor TTL (auto-removed after 10s inactivity)
 *
 * Transport: Socket.IO rooms (one room per sessionId)
 * Storage: In-memory Map (Redis adapter can be plugged in for multi-instance)
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';
import EventEmitter from 'events';

export const collabBus = new EventEmitter();

/** In-memory session registry */
const sessions = new Map();
/** In-memory user presence: sessionId → Map<userId, presenceRecord> */
const presence = new Map();
/** Cursor positions: sessionId → Map<userId, {line, col, fileName}> */
const cursors = new Map();

const CURSOR_TTL_MS = 10_000; // 10s inactivity → cursor removed

export class CollaborationService {
    constructor() {
        this.name = 'CollaborationService';
        this._io = null; // set via setSocketServer()
        logger.info('🤝 CollaborationService v6.1.0: Real-Time Collaboration initialized.');
    }

    /** Attach Socket.IO server instance for broadcasting */
    setSocketServer(io) {
        this._io = io;
        this._registerSocketHandlers(io);
        logger.info('🤝 Collab: Socket.IO server attached.');
    }

    // ─────────────────────────────────────────────────────────────────
    // Session Management
    // ─────────────────────────────────────────────────────────────────

    /**
     * Create or retrieve a collaborative session.
     * @param {string} sessionId - Existing sprint/chat session ID to attach to
     * @param {string} ownerId   - User who initiated the session
     * @returns {{sessionId, collabToken, members}}
     */
    createCollabSession(sessionId, ownerId) {
        if (sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            logger.info(`🤝 Collab: Rejoining existing session ${sessionId}`);
            return { sessionId, collabToken: session.collabToken, members: [...session.members] };
        }

        const collabToken = crypto.randomBytes(16).toString('hex');
        const session = {
            sessionId,
            ownerId,
            collabToken,
            members: new Set([ownerId]),
            context: [],         // shared context buffer (recent messages)
            createdAt: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        presence.set(sessionId, new Map());
        cursors.set(sessionId, new Map());

        logger.info(`🤝 Collab: Session created — ${sessionId} (owner: ${ownerId})`);
        collabBus.emit('session:created', { sessionId, ownerId });

        return { sessionId, collabToken, members: [ownerId] };
    }

    /**
     * Join an existing session with a collabToken.
     * @param {string} sessionId
     * @param {string} userId
     * @param {string} collabToken
     * @returns {{success, sessionId, members, context}}
     */
    joinSession(sessionId, userId, collabToken) {
        const session = sessions.get(sessionId);
        if (!session) return { success: false, reason: 'session_not_found' };
        if (session.collabToken !== collabToken) return { success: false, reason: 'invalid_token' };

        session.members.add(userId);
        this._updatePresence(sessionId, userId, { status: 'active', joinedAt: new Date().toISOString() });

        this._broadcast(sessionId, 'collab:user_joined', { userId, members: [...session.members] });
        logger.info(`🤝 Collab: ${userId} joined session ${sessionId} (${session.members.size} members)`);

        return {
            success: true,
            sessionId,
            members: [...session.members],
            context: session.context.slice(-20), // last 20 messages for new joiners
        };
    }

    /**
     * Leave a session.
     * @param {string} sessionId
     * @param {string} userId
     */
    leaveSession(sessionId, userId) {
        const session = sessions.get(sessionId);
        if (!session) return;

        session.members.delete(userId);
        this._removePresence(sessionId, userId);
        this._removeCursor(sessionId, userId);

        this._broadcast(sessionId, 'collab:user_left', { userId, members: [...session.members] });
        logger.info(`🤝 Collab: ${userId} left session ${sessionId}`);

        // Clean up empty sessions after 5 minutes
        if (session.members.size === 0) {
            setTimeout(() => {
                if (sessions.get(sessionId)?.members.size === 0) {
                    sessions.delete(sessionId);
                    presence.delete(sessionId);
                    cursors.delete(sessionId);
                    logger.info(`🤝 Collab: Session ${sessionId} cleaned up (no members).`);
                }
            }, 5 * 60 * 1000);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Presence
    // ─────────────────────────────────────────────────────────────────

    /**
     * Update a user's presence in a session.
     * @param {string} sessionId
     * @param {string} userId
     * @param {{status, displayName, avatarUrl}} presence
     */
    updatePresence(sessionId, userId, presenceData) {
        const session = sessions.get(sessionId);
        if (!session || !session.members.has(userId)) return { success: false, reason: 'not_in_session' };

        this._updatePresence(sessionId, userId, presenceData);
        this._broadcast(sessionId, 'collab:presence_update', { userId, presence: presenceData });
        return { success: true };
    }

    /**
     * Get all active presence records for a session.
     * @param {string} sessionId
     * @returns {object[]}
     */
    getPresence(sessionId) {
        const presenceMap = presence.get(sessionId);
        if (!presenceMap) return [];
        return [...presenceMap.entries()].map(([userId, data]) => ({ userId, ...data }));
    }

    // ─────────────────────────────────────────────────────────────────
    // Cursor / Caret Sharing (Monaco co-editing)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Update a user's cursor position (for co-editing Monaco).
     * @param {string} sessionId
     * @param {string} userId
     * @param {{line: number, col: number, fileName: string}} cursor
     */
    updateCursor(sessionId, userId, cursor) {
        const sessionCursors = cursors.get(sessionId);
        if (!sessionCursors) return;

        // Clear old TTL timer
        const existing = sessionCursors.get(userId);
        if (existing?._timer) clearTimeout(existing._timer);

        // Set cursor with auto-remove TTL
        const timer = setTimeout(() => {
            sessionCursors.delete(userId);
            this._broadcast(sessionId, 'collab:cursor_removed', { userId });
        }, CURSOR_TTL_MS);

        sessionCursors.set(userId, { ...cursor, _timer: timer, updatedAt: Date.now() });
        this._broadcast(sessionId, 'collab:cursor_update', { userId, cursor });
    }

    /**
     * Get all cursors for a session (for Monaco decoration rendering).
     */
    getCursors(sessionId) {
        const sessionCursors = cursors.get(sessionId);
        if (!sessionCursors) return [];
        return [...sessionCursors.entries()].map(([userId, data]) => {
            const { _timer, ...rest } = data;
            return { userId, ...rest };
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Context Merging — shared message/context buffer
    // ─────────────────────────────────────────────────────────────────

    /**
     * Append a context item to the shared session buffer.
     * Last-write-wins with user attribution. Used by agent streaming.
     *
     * @param {string} sessionId
     * @param {string} userId
     * @param {{role, content, agentName?}} item
     */
    appendContext(sessionId, userId, item) {
        const session = sessions.get(sessionId);
        if (!session) return;

        const contextItem = {
            id: crypto.randomUUID().slice(0, 8),
            userId,
            timestamp: new Date().toISOString(),
            ...item,
        };

        session.context.push(contextItem);
        // Keep last 100 items
        if (session.context.length > 100) session.context.shift();

        this._broadcast(sessionId, 'collab:context_update', contextItem);
        return contextItem;
    }

    /**
     * Stream an agent response token-by-token to all session members.
     * Call this from the orchestrator/capability router stream handlers.
     *
     * @param {string} sessionId
     * @param {string} agentName
     * @param {string} token      - Single streamed token
     * @param {boolean} done      - True on final token
     */
    broadcastAgentToken(sessionId, agentName, token, done = false) {
        this._broadcast(sessionId, done ? 'collab:agent:done' : 'collab:agent:token', {
            agentName, token, done, timestamp: Date.now()
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Session Info
    // ─────────────────────────────────────────────────────────────────

    getSession(sessionId) {
        const session = sessions.get(sessionId);
        if (!session) return null;
        return {
            sessionId: session.sessionId,
            ownerId: session.ownerId,
            members: [...session.members],
            contextLength: session.context.length,
            createdAt: session.createdAt,
        };
    }

    listSessions() {
        return [...sessions.values()].map(s => ({
            sessionId: s.sessionId,
            memberCount: s.members.size,
            contextLength: s.context.length,
            createdAt: s.createdAt,
        }));
    }

    // ─────────────────────────────────────────────────────────────────
    // Socket.IO Handler Registration
    // ─────────────────────────────────────────────────────────────────

    _registerSocketHandlers(io) {
        io.on('connection', (socket) => {
            logger.info(`🤝 Collab: Socket connected — ${socket.id}`);

            // Client joins a collab room
            socket.on('collab:join', ({ sessionId, userId, collabToken }) => {
                const result = this.joinSession(sessionId, userId, collabToken);
                if (result.success) {
                    socket.join(`collab:${sessionId}`);
                    socket.emit('collab:joined', result);
                } else {
                    socket.emit('collab:error', { reason: result.reason });
                }
            });

            // Client leaves a collab room
            socket.on('collab:leave', ({ sessionId, userId }) => {
                this.leaveSession(sessionId, userId);
                socket.leave(`collab:${sessionId}`);
            });

            // Presence heartbeat
            socket.on('collab:presence', ({ sessionId, userId, ...data }) => {
                this.updatePresence(sessionId, userId, data);
            });

            // Cursor position update
            socket.on('collab:cursor', ({ sessionId, userId, cursor }) => {
                this.updateCursor(sessionId, userId, cursor);
            });

            // Client sends a message/action to the shared context
            socket.on('collab:message', ({ sessionId, userId, message }) => {
                const item = this.appendContext(sessionId, userId, { role: 'user', content: message });
                if (!item) socket.emit('collab:error', { reason: 'session_not_found' });
            });

            socket.on('disconnect', () => {
                logger.info(`🤝 Collab: Socket disconnected — ${socket.id}`);
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────────────────────────

    _broadcast(sessionId, event, data) {
        if (this._io) {
            this._io.to(`collab:${sessionId}`).emit(event, data);
        }
        collabBus.emit(event, { sessionId, ...data });
    }

    _updatePresence(sessionId, userId, data) {
        const presenceMap = presence.get(sessionId);
        if (!presenceMap) return;
        presenceMap.set(userId, { ...presenceMap.get(userId), ...data, lastSeen: Date.now() });
    }

    _removePresence(sessionId, userId) {
        presence.get(sessionId)?.delete(userId);
    }

    _removeCursor(sessionId, userId) {
        const map = cursors.get(sessionId);
        if (!map) return;
        const cursor = map.get(userId);
        if (cursor?._timer) clearTimeout(cursor._timer);
        map.delete(userId);
        this._broadcast(sessionId, 'collab:cursor_removed', { userId });
    }
}

export const collaborationService = new CollaborationService();

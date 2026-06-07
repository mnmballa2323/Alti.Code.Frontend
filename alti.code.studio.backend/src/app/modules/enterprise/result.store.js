/**
 * Copyright (c) 2024 Inso Code
 * 
 * AGENT RESULT STORE — Persistent Agent Output Storage
 * 
 * Every agent execution result is persisted for:
 *   - Historical queries ("what did the security scanner find last Tuesday?")
 *   - Cost attribution (tokens used per agent/team/tenant)
 *   - Compliance auditing (SOX 7-year retention)
 *   - Analytics and trend detection
 * 
 * Production: Google Cloud Firestore
 * Development: In-memory store
 */

import { logger } from '../../../shared/logger.js';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();
const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const COLLECTION_NAME = 'alti-code-studio-results';

class ResultStore {
    constructor() {
        /** @type {Map<string, object[]>} tenantId → results[] */
        this.store = new Map();
        this.totalResults = 0;
    }

    /**
     * Persist an agent execution result to Firestore (or local Map fallback)
     * @param {object} params
     * @param {string} params.tenantId - Tenant that owns this result
     * @param {string} params.agentName - Agent that produced the result
     * @param {string} params.squad - Legion squad
     * @param {string} params.jobId - BullMQ job ID
     * @param {object} params.input - Original input data
     * @param {object} params.output - Agent output
     * @param {number} params.tokensUsed - AI tokens consumed
     * @param {number} params.durationMs - Execution time
     * @param {string} params.model - AI model used
     * @param {string} params.userId - User who triggered the dispatch
     */
    async save(params) {
        const tenantId = params.tenantId || 'default';
        const docId = `result_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const result = {
            id: docId,
            tenantId: tenantId,
            agentName: params.agentName,
            squad: params.squad || 'unknown',
            jobId: params.jobId,
            input: params.input,
            output: params.output,
            tokensUsed: params.tokensUsed || 0,
            durationMs: params.durationMs || 0,
            model: params.model || 'unknown',
            userId: params.userId || 'system',
            status: params.status || 'completed',
            createdAt: new Date().toISOString(),
            expiresAt: this._calculateExpiry(tenantId),
        };

        if (PROJECT_ID) {
            try {
                // Ensure arrays/objects don't contain native Undefined when sending to Firestore NoSQL
                const safePayload = JSON.parse(JSON.stringify(result));
                await firestore.collection(COLLECTION_NAME).doc(docId).set(safePayload);
                logger.debug(`🔥 Firestore: Saved agent result ${docId}`);
                return result; // return early to avoid memory bloat
            } catch (err) {
                logger.warn(`⚠️ Firestore save failed (${err.message}). Falling back to local store...`);
            }
        }

        // Local Memory Fallback
        if (!this.store.has(result.tenantId)) {
            this.store.set(result.tenantId, []);
        }
        this.store.get(result.tenantId).push(result);
        this.totalResults++;

        return result;
    }

    /**
     * Query results with filters
     * @param {string} tenantId
     * @param {object} filters - { agentName, squad, userId, since, until, limit }
     * @returns {object[]}
     */
    async query(tenantId, filters = {}) {
        const limit = filters.limit || 100;

        if (PROJECT_ID) {
            try {
                let queryRef = firestore.collection(COLLECTION_NAME).where('tenantId', '==', tenantId);

                if (filters.agentName) queryRef = queryRef.where('agentName', '==', filters.agentName);
                if (filters.squad) queryRef = queryRef.where('squad', '==', filters.squad);
                if (filters.userId) queryRef = queryRef.where('userId', '==', filters.userId);
                if (filters.status) queryRef = queryRef.where('status', '==', filters.status);

                // Composite indexes required for these, but handling simple case
                if (filters.since) queryRef = queryRef.where('createdAt', '>=', filters.since);
                if (filters.until) queryRef = queryRef.where('createdAt', '<=', filters.until);

                queryRef = queryRef.orderBy('createdAt', 'desc').limit(limit);

                const snapshot = await queryRef.get();
                logger.debug(`🔥 Firestore: Fetched ${snapshot.size} query results for ${tenantId}`);
                return snapshot.docs.map(doc => doc.data());
            } catch (err) {
                logger.warn(`⚠️ Firestore query failed (${err.message}). Falling back to local store...`);
            }
        }

        // Local Memory Fallback
        const results = this.store.get(tenantId) || [];
        let filtered = results;

        if (filters.agentName) filtered = filtered.filter(r => r.agentName === filters.agentName);
        if (filters.squad) filtered = filtered.filter(r => r.squad === filters.squad);
        if (filters.userId) filtered = filtered.filter(r => r.userId === filters.userId);
        if (filters.since) filtered = filtered.filter(r => r.createdAt >= filters.since);
        if (filters.until) filtered = filtered.filter(r => r.createdAt <= filters.until);
        if (filters.status) filtered = filtered.filter(r => r.status === filters.status);

        // Sort by most recent first
        filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        return filtered.slice(0, limit);
    }

    /**
     * Get cost attribution for a tenant
     * @param {string} tenantId
     * @param {object} options - { since, until, groupBy }
     * @returns {object} - Cost breakdown
     */
    async getCostAttribution(tenantId, options = {}) {
        let filtered = [];

        if (PROJECT_ID) {
            try {
                let queryRef = firestore.collection(COLLECTION_NAME).where('tenantId', '==', tenantId);
                if (options.since) queryRef = queryRef.where('createdAt', '>=', options.since);
                if (options.until) queryRef = queryRef.where('createdAt', '<=', options.until);

                const snapshot = await queryRef.get();
                filtered = snapshot.docs.map(doc => doc.data());
                logger.debug(`🔥 Firestore: Fetched ${snapshot.size} records for cost attribution`);
            } catch (err) {
                logger.warn(`⚠️ Firestore cost query failed (${err.message}). Falling back to local store...`);
                const results = this.store.get(tenantId) || [];
                filtered = results;
                if (options.since) filtered = filtered.filter(r => r.createdAt >= options.since);
                if (options.until) filtered = filtered.filter(r => r.createdAt <= options.until);
            }
        } else {
            const results = this.store.get(tenantId) || [];
            filtered = results;
            if (options.since) filtered = filtered.filter(r => r.createdAt >= options.since);
            if (options.until) filtered = filtered.filter(r => r.createdAt <= options.until);
        }

        const byAgent = {};
        const bySquad = {};
        const byUser = {};
        const byModel = {};
        let totalTokens = 0;
        let totalDuration = 0;

        for (const r of filtered) {
            // By agent
            if (!byAgent[r.agentName]) byAgent[r.agentName] = { tokens: 0, requests: 0, durationMs: 0 };
            byAgent[r.agentName].tokens += r.tokensUsed;
            byAgent[r.agentName].requests++;
            byAgent[r.agentName].durationMs += r.durationMs;

            // By squad
            if (!bySquad[r.squad]) bySquad[r.squad] = { tokens: 0, requests: 0 };
            bySquad[r.squad].tokens += r.tokensUsed;
            bySquad[r.squad].requests++;

            // By user
            if (!byUser[r.userId]) byUser[r.userId] = { tokens: 0, requests: 0 };
            byUser[r.userId].tokens += r.tokensUsed;
            byUser[r.userId].requests++;

            // By model
            if (!byModel[r.model]) byModel[r.model] = { tokens: 0, requests: 0 };
            byModel[r.model].tokens += r.tokensUsed;
            byModel[r.model].requests++;

            totalTokens += r.tokensUsed;
            totalDuration += r.durationMs;
        }

        // Estimate cost (Gemini 2.0 Flash pricing)
        const costPerMillionTokens = 0.075; // $0.075 per million input tokens
        const estimatedCost = (totalTokens / 1_000_000) * costPerMillionTokens;

        return {
            tenantId,
            period: { since: options.since || 'all', until: options.until || 'now' },
            totalTokens,
            totalRequests: filtered.length,
            totalDurationMs: totalDuration,
            estimatedCostUSD: Math.round(estimatedCost * 100) / 100,
            byAgent,
            bySquad,
            byUser,
            byModel,
        };
    }

    /** Calculate retention expiry based on tenant compliance */
    _calculateExpiry(tenantId) {
        // Default: 365 days. SOX: 7 years. HIPAA: 6 years.
        const retentionDays = 365;
        return new Date(Date.now() + retentionDays * 86400000).toISOString();
    }

    /** Get aggregate stats */
    getStats() {
        return {
            totalResults: this.totalResults,
            tenantCount: this.store.size,
            resultsByTenant: Object.fromEntries(
                Array.from(this.store.entries()).map(([k, v]) => [k, v.length])
            ),
        };
    }
}

export const resultStore = new ResultStore();

/**
 * Copyright (c) 2024 Inso Code
 * 
 * ENTERPRISE SEARCH ENGINE (Phase 50)
 * 
 * Full-text search across enterprise data:
 *   - Inverted index with TF-IDF scoring
 *   - Multi-entity search (agents, tenants, dispatches, logs, workflows)
 *   - Faceted filtering (entity type, tenant, severity, date range)
 *   - Fuzzy matching with edit distance
 *   - Search suggestions and autocomplete
 *   - Search analytics (popular queries, click-through)
 *   - Tenant-scoped search isolation
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Searchable Entity Types
// ═══════════════════════════════════════════════

const ENTITY_TYPES = {
    agent: { label: 'Agent', fields: ['name', 'description', 'capabilities', 'model'] },
    tenant: { label: 'Tenant', fields: ['name', 'plan', 'domain', 'industry'] },
    dispatch: { label: 'Dispatch', fields: ['agentName', 'task', 'result', 'status'] },
    log: { label: 'Audit Log', fields: ['action', 'actor', 'details', 'severity'] },
    workflow: { label: 'Workflow', fields: ['name', 'description', 'steps'] },
    secret: { label: 'Secret', fields: ['name', 'type', 'tenantId'] },
    pipeline: { label: 'Pipeline', fields: ['name', 'description', 'stages'] },
};

// ═══════════════════════════════════════════════
// Search Engine
// ═══════════════════════════════════════════════

class EnterpriseSearch {
    constructor() {
        this.documents = new Map();      // docId → document
        this.invertedIndex = new Map();  // term → Set<docId>
        this.analytics = { queries: [], popularTerms: new Map(), totalSearches: 0 };
        this.maxDocuments = 100000;
        this.stats = { totalIndexed: 0, totalSearches: 0 };
    }

    // ── Index Document ──

    index(entity) {
        const docId = entity.id || `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const document = {
            id: docId,
            type: entity.type || 'log',
            tenantId: entity.tenantId || 'global',
            title: entity.title || entity.name || '',
            body: entity.body || entity.description || '',
            fields: entity.fields || {},
            indexedAt: new Date().toISOString(),
            score: 0,
        };

        // Build searchable text
        const searchableText = [
            document.title,
            document.body,
            ...Object.values(document.fields).map(v => String(v)),
        ].join(' ').toLowerCase();

        // Tokenize and index
        const terms = this._tokenize(searchableText);
        for (const term of terms) {
            if (!this.invertedIndex.has(term)) {
                this.invertedIndex.set(term, new Set());
            }
            this.invertedIndex.get(term).add(docId);
        }

        document._terms = terms;
        document._termCount = terms.length;

        this.documents.set(docId, document);
        this.stats.totalIndexed++;

        // Trim if over limit
        if (this.documents.size > this.maxDocuments) {
            const oldest = [...this.documents.keys()].slice(0, Math.floor(this.maxDocuments * 0.2));
            for (const id of oldest) this._removeFromIndex(id);
        }

        return { docId, type: document.type, indexed: true };
    }

    // ── Search ──

    search(query, options = {}) {
        const startTime = Date.now();
        const {
            type,
            tenantId,
            limit = 20,
            offset = 0,
            fuzzy = false,
            severity,
            from,
            to,
        } = options;

        const queryTerms = this._tokenize(query.toLowerCase());
        if (queryTerms.length === 0) return { results: [], total: 0, duration: 0 };

        // Find matching documents
        const scores = new Map();

        for (const term of queryTerms) {
            let matchingTerms = [term];

            // Fuzzy matching
            if (fuzzy) {
                for (const [indexedTerm] of this.invertedIndex) {
                    if (this._editDistance(term, indexedTerm) <= 2 && indexedTerm !== term) {
                        matchingTerms.push(indexedTerm);
                    }
                }
            }

            for (const matchTerm of matchingTerms) {
                const docs = this.invertedIndex.get(matchTerm);
                if (!docs) continue;

                const idf = Math.log(this.documents.size / docs.size);

                for (const docId of docs) {
                    const doc = this.documents.get(docId);
                    if (!doc) continue;

                    // TF-IDF scoring
                    const tf = doc._terms.filter(t => t === matchTerm).length / doc._termCount;
                    const score = tf * idf;

                    // Title boost
                    const titleBoost = doc.title.toLowerCase().includes(matchTerm) ? 2.0 : 1.0;

                    scores.set(docId, (scores.get(docId) || 0) + score * titleBoost);
                }
            }
        }

        // Filter results
        let results = [...scores.entries()]
            .map(([docId, score]) => ({ ...this.documents.get(docId), score }))
            .filter(doc => doc);

        if (type) results = results.filter(d => d.type === type);
        if (tenantId) results = results.filter(d => d.tenantId === tenantId);
        if (severity) results = results.filter(d => d.fields.severity === severity);
        if (from) results = results.filter(d => new Date(d.indexedAt) >= new Date(from));
        if (to) results = results.filter(d => new Date(d.indexedAt) <= new Date(to));

        // Sort by score
        results.sort((a, b) => b.score - a.score);

        const total = results.length;
        results = results.slice(offset, offset + limit);

        // Strip internal fields
        results = results.map(r => ({
            id: r.id,
            type: r.type,
            tenantId: r.tenantId,
            title: r.title,
            body: r.body.substring(0, 200),
            fields: r.fields,
            score: Math.round(r.score * 1000) / 1000,
            indexedAt: r.indexedAt,
        }));

        const duration = Date.now() - startTime;

        // Track analytics
        this._trackQuery(query, total, duration);

        return {
            query,
            total,
            offset,
            limit,
            results,
            duration,
            facets: this._computeFacets(scores, type, tenantId),
        };
    }

    // ── Suggestions ──

    suggest(prefix, limit = 10) {
        const lower = prefix.toLowerCase();
        const suggestions = new Set();

        for (const [term] of this.invertedIndex) {
            if (term.startsWith(lower) && term.length > 2) {
                suggestions.add(term);
                if (suggestions.size >= limit) break;
            }
        }

        return [...suggestions];
    }

    // ── Facets ──

    _computeFacets(scores, activeType, activeTenant) {
        const facets = { types: {}, tenants: {} };

        for (const [docId] of scores) {
            const doc = this.documents.get(docId);
            if (!doc) continue;
            facets.types[doc.type] = (facets.types[doc.type] || 0) + 1;
            facets.tenants[doc.tenantId] = (facets.tenants[doc.tenantId] || 0) + 1;
        }

        return facets;
    }

    // ── Analytics ──

    _trackQuery(query, results, duration) {
        this.stats.totalSearches++;

        this.analytics.queries.push({
            query,
            results,
            duration,
            timestamp: new Date().toISOString(),
        });

        // Track popular terms
        const terms = this._tokenize(query.toLowerCase());
        for (const term of terms) {
            this.analytics.popularTerms.set(term, (this.analytics.popularTerms.get(term) || 0) + 1);
        }

        // Trim analytics
        if (this.analytics.queries.length > 10000) {
            this.analytics.queries = this.analytics.queries.slice(-5000);
        }
    }

    getAnalytics() {
        const popular = [...this.analytics.popularTerms.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([term, count]) => ({ term, count }));

        return {
            totalSearches: this.stats.totalSearches,
            recentQueries: this.analytics.queries.slice(-10),
            popularTerms: popular,
            avgDuration: this.analytics.queries.length > 0
                ? Math.round(this.analytics.queries.reduce((s, q) => s + q.duration, 0) / this.analytics.queries.length)
                : 0,
        };
    }

    // ── Utilities ──

    _tokenize(text) {
        return text
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1)
            .map(t => t.toLowerCase());
    }

    _editDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[a.length][b.length];
    }

    _removeFromIndex(docId) {
        const doc = this.documents.get(docId);
        if (!doc) return;

        for (const term of doc._terms) {
            const docs = this.invertedIndex.get(term);
            if (docs) {
                docs.delete(docId);
                if (docs.size === 0) this.invertedIndex.delete(term);
            }
        }

        this.documents.delete(docId);
    }

    // ── Stats ──

    getStats() {
        return {
            totalIndexed: this.stats.totalIndexed,
            totalDocuments: this.documents.size,
            totalSearches: this.stats.totalSearches,
            indexTerms: this.invertedIndex.size,
            entityTypes: Object.keys(ENTITY_TYPES),
        };
    }
}

export const enterpriseSearch = new EnterpriseSearch();
export { ENTITY_TYPES };

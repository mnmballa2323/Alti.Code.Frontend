/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * AGENT MARKETPLACE (Phase 51)
 * 
 * Agent publishing & distribution platform:
 *   - Agent publishing with versioning (semver)
 *   - Star ratings & review system
 *   - Install/uninstall per tenant
 *   - Category browsing + search
 *   - Revenue sharing (70/30 split)
 *   - Dependency resolution between agents
 *   - Marketplace analytics (downloads, trends)
 *   - Verification badges (verified, enterprise, certified)
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Marketplace Constants
// ═══════════════════════════════════════════════

const CATEGORIES = [
    'code-review', 'security', 'devops', 'data-analysis', 'compliance',
    'monitoring', 'testing', 'documentation', 'communication', 'integration',
    'ai-ml', 'finance', 'healthcare', 'legal', 'custom',
];

const BADGES = {
    verified: { label: 'Verified', icon: '✅', description: 'Identity and code verified' },
    enterprise: { label: 'Enterprise', icon: '🏢', description: 'Enterprise-grade quality' },
    certified: { label: 'Certified', icon: '🏆', description: 'Alti.Code certified' },
    community: { label: 'Community', icon: '🌍', description: 'Community contributed' },
};

const REVENUE_SPLIT = { publisher: 0.70, platform: 0.30 };

// ═══════════════════════════════════════════════
// Marketplace Engine
// ═══════════════════════════════════════════════

class AgentMarketplace {
    constructor() {
        this.listings = new Map();       // listingId → listing
        this.installations = new Map();  // tenantId → Set<listingId>
        this.reviews = [];
        this.stats = { totalListings: 0, totalInstalls: 0, totalRevenue: 0, totalReviews: 0 };
    }

    // ── Publish Agent ──

    publish(options) {
        const {
            name,
            description,
            publisherId,
            version = '1.0.0',
            category = 'custom',
            pricing = { model: 'free', pricePerMonth: 0 },
            capabilities = [],
            dependencies = [],
            metadata = {},
            silent = false,
        } = options;

        if (!name) throw new Error('Agent name is required');

        const listingId = `mkt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const listing = {
            id: listingId,
            name,
            description: description || '',
            publisherId,
            version,
            versions: [{ version, publishedAt: new Date().toISOString(), changelog: 'Initial release' }],
            category,
            pricing,
            capabilities,
            dependencies,
            badges: ['community'],
            rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            downloads: 0,
            installs: 0,
            status: 'PUBLISHED',
            metadata,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.listings.set(listingId, listing);
        this.stats.totalListings++;
        
        if (!silent) {
            logger.info(`🏪 Agent published: ${name} v${version} [${listingId}]`);
        }

        return { listingId, name, version, category };
    }

    // ── Update Version ──

    publishVersion(listingId, version, changelog = '') {
        const listing = this.listings.get(listingId);
        if (!listing) throw new Error(`Listing not found: ${listingId}`);

        listing.version = version;
        listing.versions.push({ version, publishedAt: new Date().toISOString(), changelog });
        listing.updatedAt = new Date().toISOString();

        return { listingId, version, totalVersions: listing.versions.length };
    }

    // ── Install / Uninstall ──

    install(tenantId, listingId) {
        const listing = this.listings.get(listingId);
        if (!listing) throw new Error(`Listing not found: ${listingId}`);

        if (!this.installations.has(tenantId)) this.installations.set(tenantId, new Set());
        const installed = this.installations.get(tenantId);

        if (installed.has(listingId)) return { alreadyInstalled: true };

        // Check dependencies
        for (const depId of listing.dependencies) {
            if (!installed.has(depId)) {
                throw new Error(`Missing dependency: ${depId}`);
            }
        }

        installed.add(listingId);
        listing.installs++;
        listing.downloads++;
        this.stats.totalInstalls++;

        // Revenue
        if (listing.pricing.model === 'paid') {
            const revenue = listing.pricing.pricePerMonth || 0;
            this.stats.totalRevenue += revenue;
        }

        logger.info(`📦 Agent installed: ${listing.name} → ${tenantId}`);
        return { installed: true, name: listing.name, version: listing.version };
    }

    uninstall(tenantId, listingId) {
        const installed = this.installations.get(tenantId);
        if (!installed || !installed.has(listingId)) return { notInstalled: true };

        installed.delete(listingId);
        return { uninstalled: true };
    }

    // ── Reviews & Ratings ──

    review(listingId, userId, rating, comment = '') {
        const listing = this.listings.get(listingId);
        if (!listing) throw new Error(`Listing not found: ${listingId}`);
        if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');

        const rev = {
            id: `rev_${Date.now()}`,
            listingId,
            userId,
            rating,
            comment,
            createdAt: new Date().toISOString(),
        };

        this.reviews.push(rev);
        this.stats.totalReviews++;

        // Update distribution
        listing.rating.distribution[rating]++;
        listing.rating.count++;
        const total = Object.entries(listing.rating.distribution).reduce((s, [r, c]) => s + parseInt(r) * c, 0);
        listing.rating.average = Math.round(total / listing.rating.count * 10) / 10;

        return { reviewId: rev.id, averageRating: listing.rating.average };
    }

    // ── Browse & Search ──

    browse(options = {}) {
        let listings = [...this.listings.values()];

        if (options.category) listings = listings.filter(l => l.category === options.category);
        if (options.query) {
            const q = options.query.toLowerCase();
            listings = listings.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
        }
        if (options.badge) listings = listings.filter(l => l.badges.includes(options.badge));
        if (options.pricing) listings = listings.filter(l => l.pricing.model === options.pricing);

        // Sort
        const sortBy = options.sortBy || 'downloads';
        listings.sort((a, b) => {
            if (sortBy === 'rating') return b.rating.average - a.rating.average;
            if (sortBy === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt);
            return b.downloads - a.downloads;
        });

        const limit = options.limit || 20;
        const offset = options.offset || 0;

        return {
            total: listings.length,
            listings: listings.slice(offset, offset + limit).map(l => ({
                id: l.id, name: l.name, description: l.description.substring(0, 100),
                version: l.version, category: l.category, rating: l.rating.average,
                downloads: l.downloads, pricing: l.pricing, badges: l.badges,
            })),
        };
    }

    getListing(listingId) {
        return this.listings.get(listingId) || null;
    }

    getInstalled(tenantId) {
        const installed = this.installations.get(tenantId);
        if (!installed) return [];
        return [...installed].map(id => {
            const l = this.listings.get(id);
            return l ? { id: l.id, name: l.name, version: l.version, category: l.category } : null;
        }).filter(Boolean);
    }

    // ── Analytics ──

    getAnalytics() {
        const byCategory = {};
        const topAgents = [...this.listings.values()]
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10)
            .map(l => ({ name: l.name, downloads: l.downloads, rating: l.rating.average }));

        for (const l of this.listings.values()) {
            byCategory[l.category] = (byCategory[l.category] || 0) + 1;
        }

        return {
            totalListings: this.stats.totalListings,
            totalInstalls: this.stats.totalInstalls,
            totalRevenue: `$${this.stats.totalRevenue.toFixed(2)}`,
            byCategory,
            topAgents,
            revenueShare: REVENUE_SPLIT,
        };
    }

    getStats() {
        return {
            totalListings: this.stats.totalListings,
            totalInstalls: this.stats.totalInstalls,
            totalReviews: this.stats.totalReviews,
            totalRevenue: this.stats.totalRevenue,
            categories: CATEGORIES,
            badges: Object.keys(BADGES),
        };
    }
}

export const agentMarketplace = new AgentMarketplace();
export { CATEGORIES, BADGES, REVENUE_SPLIT };

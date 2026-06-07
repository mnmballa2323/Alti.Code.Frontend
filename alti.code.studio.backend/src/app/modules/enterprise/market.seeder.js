/**
 * Copyright (c) 2024 Inso Code
 * 
 * MARKETPLACE SEEDER
 * Auto-publishes the 200 native agents into the Agent Hub.
 */

import { logger } from '../../../shared/logger.js';
import { agentMarketplace } from './agent.marketplace.js';
import { capabilityRouter, CAPABILITY_TABLE } from '../agents/capability.router.js';

class MarketSeeder {

    /**
     * Seeds the Agent Hub by deriving metadata from the capability router's map
     */
    async seed() {
        if (agentMarketplace.stats.totalListings > 0) {
            logger.info('🏪 Agent Hub is already seeded. Skipping.');
            return;
        }

        logger.info('🏪 Seeding Agent Hub with native agents...');
        let seeded = 0;

        // Iterate over existing capabilities to construct catalog
        for (const entry of CAPABILITY_TABLE) {
            try {
                if (!entry.agent) continue;
                const capability = entry.keywords[0] || 'general';
                const agentName = entry.agent.name || entry.agent.constructor.name || 'UnknownAgent';
                // Approximate category based on capability keywords
                const category = this._inferCategory(capability, agentName);

                agentMarketplace.publish({
                    name: agentName,
                    description: `Native Inso Code agent optimized for ${capability} workflows.`,
                    publisherId: 'inso_core',
                    version: '1.0.0',
                    category,
                    pricing: { model: 'free', pricePerMonth: 0 },
                    capabilities: entry.keywords,
                    badges: ['verified', 'enterprise', 'certified'],
                    metadata: {
                        isNative: true,
                        tier: entry.tier || 1
                    },
                    silent: true
                });

                seeded++;
            } catch (err) {
                logger.warn(`Failed to seed ${entry.agent?.name}: ${err.message}`);
            }
        }

        logger.info(`✅ Seeded ${seeded} native agents into the Agent Hub.`);
    }

    _inferCategory(cap, agent) {
        const str = `${cap} ${agent}`.toLowerCase();

        if (str.includes('secur') || str.includes('auth') || str.includes('cve')) return 'security';
        if (str.includes('test') || str.includes('qa') || str.includes('assert')) return 'testing';
        if (str.includes('deploy') || str.includes('cloud') || str.includes('infra') || str.includes('aws') || str.includes('azure')) return 'devops';
        if (str.includes('data') || str.includes('sql') || str.includes('etl') || str.includes('snowflake')) return 'data-analysis';
        if (str.includes('compliant') || str.includes('audit') || str.includes('legal') || str.includes('gdpr')) return 'compliance';
        if (str.includes('monitor') || str.includes('log') || str.includes('datadog') || str.includes('splunk')) return 'monitoring';
        if (str.includes('doc') || str.includes('wiki') || str.includes('readme')) return 'documentation';
        if (str.includes('chat') || str.includes('slack') || str.includes('mail') || str.includes('twilio')) return 'communication';
        if (str.includes('ai') || str.includes('ml') || str.includes('model') || str.includes('tensor')) return 'ai-ml';
        if (str.includes('pay') || str.includes('finance') || str.includes('stripe')) return 'finance';
        if (str.includes('health') || str.includes('epic') || str.includes('cerner') || str.includes('fhir')) return 'healthcare';

        return 'custom';
    }
}

export const marketSeeder = new MarketSeeder();

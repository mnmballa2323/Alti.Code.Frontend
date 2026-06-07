/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

/**
 * Phase 25: The Omniscient FinOps (Autonomous Multi-Cloud Cost Arbitrage)
 * Agent responsible for real-time cloud cost modeling, multi-cloud arbitrage, 
 * and carbon-aware workload routing.
 */
class FinopsAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            id: 'agent_finops_001',
            name: 'FinOpsAgent',
            description: 'Analyzes multi-cloud costs, optimizes infrastructure spend, and routes workloads based on grid carbon intensity.',
            tier: 25,
            version: '6.8.0',
            capabilities: [
                'Analyze AWS Cost Explorer and GCP Billing data',
                'Arbitrate spot instances and compute costs across providers',
                'Simulate infrastructure cost optimization via Terraform changes',
                'Route workloads based on real-time grid carbon intensity (Green Software)'
            ]
        });

        // Simulated Live Pricing Data (In production, replace with live AWS/GCP/Azure API polling)
        this.basePrices = {
            aws: { computePerHour: 0.0416, storagePerGb: 0.023 },
            gcp: { computePerHour: 0.0385, storagePerGb: 0.020 },
            azure: { computePerHour: 0.0420, storagePerGb: 0.021 }
        };

        // Simulated Carbon Intensity data (gCO2eq/kWh) - Normally fetched from WattTime / Electricity Maps
        this.carbonData = {
            'us-east-1': 450, // Dirtier grid
            'us-west-2': 210, // Hydro
            'eu-north-1': 45, // Wind/Solar
            'ap-southeast-1': 520 // Coal heavy
        };
    }

    /**
     * Compare workload cost across providers based on vCPU and GB requirements.
     * @param {number} vCPUs 
     * @param {number} gbStorage 
     * @param {number} hours 
     */
    async simulateArbitrage(vCPUs, gbStorage, hours) {
        logger.info(`💸 FinOpsAgent: Simulating arbitrage for ${vCPUs} vCPUs, ${gbStorage}GB over ${hours}h`);

        try {
            const result = {};
            let cheapestProvider = null;
            let lowestCost = Infinity;

            for (const [provider, rates] of Object.entries(this.basePrices)) {
                // Simplified linear formula
                const computeCost = (vCPUs * rates.computePerHour) * hours;
                const storageCost = (gbStorage * rates.storagePerGb) * (hours / 730); // monthly amortized
                const total = computeCost + storageCost;

                result[provider] = {
                    totalCost: total.toFixed(4),
                    computeShare: computeCost.toFixed(4)
                };

                if (total < lowestCost) {
                    lowestCost = total;
                    cheapestProvider = provider;
                }
            }

            return {
                status: 'success',
                target: `Migrate to ${cheapestProvider.toUpperCase()}`,
                savings: ((result.aws.totalCost - lowestCost) / result.aws.totalCost * 100).toFixed(1) + '% vs AWS standard',
                details: result
            };

        } catch (error) {
            this._recordFailure();
            logger.error(`FinOps arbitrage failed: ${error.message}`);
            return { status: 'failed', error: error.message };
        }
    }

    /**
     * Evaluate the carbon footprint of deploying to a specific region.
     * @param {string} regions Array of standard cloud regions 
     */
    async getCarbonIntensity(regions = ['us-east-1', 'us-west-2', 'eu-north-1', 'ap-southeast-1']) {
        logger.info(`🌱 FinOpsAgent: Fetching carbon intensity for ${regions.join(', ')}`);

        const insights = regions.map(region => {
            const gCo2 = this.carbonData[region] || 350; // default average
            const classification = gCo2 < 100 ? 'Low (Renewable)' : (gCo2 > 400 ? 'High (Fossil)' : 'Moderate');

            return {
                region,
                gCO2eq_per_kWh: gCo2,
                classification
            };
        });

        const cleanest = insights.sort((a, b) => a.gCO2eq_per_kWh - b.gCO2eq_per_kWh)[0];

        return {
            status: 'success',
            carbonGrid: insights,
            recommendation: `Route non-latency sensitive batch jobs to ${cleanest.region} to save carbon.`
        };
    }

    /**
     * Interface handler for the capability router
     */
    async _invoke(query, options = {}) {
        return this.execute('arbitrage', { query, ...options });
    }

    async execute(action, context) {
        if (!context) throw new Error("Context is required for FinOps operations");

        logger.info(`💸 FinOps execution started for action: ${action}`);

        if (action === 'arbitrage') {
            // Attempt to extract numbers or default to standard D1 size
            const matchVcpu = context.query?.match(/(\d+)\s*(?:vcpu|cpu|core)/i);
            const vCPUs = matchVcpu ? parseInt(matchVcpu[1]) : 4;

            const matchGb = context.query?.match(/(\d+)\s*(?:gb|gigabyte)/i);
            const gbStorage = matchGb ? parseInt(matchGb[1]) : 100;

            const arbitrageData = await this.simulateArbitrage(vCPUs, gbStorage, 730); // 1 month
            const carbonData = await this.getCarbonIntensity();

            // Use Gemini to synthesize the final FinOps architectural decision
            const prompt = `You are the Inso Code FinOps Agent.
            Analyze this cost and carbon data to produce a DevOps migration recommendation.
            
            Context Query: "${context.query}"
            
            Cost Arbitrage Data:
            ${JSON.stringify(arbitrageData.details, null, 2)}
            Cheapest Provider: ${arbitrageData.target}
            
            Grid Carbon Data:
            ${JSON.stringify(carbonData.carbonGrid, null, 2)}
            Recommendation: ${carbonData.recommendation}
            
            Provide a clear, authoritative recommendation.
            Output your recommendation as a clean markdown block.`;

            const aiResponse = await GeminiAiService.generateContent(prompt);

            this._recordSuccess(720); // ms simulated
            return {
                status: 'success',
                rawArbitrage: arbitrageData,
                rawCarbon: carbonData,
                recommendation: aiResponse
            };

        }

        throw new Error(`Unsupported action: ${action}`);
    }
}

export const finopsAgent = new FinopsAgent();

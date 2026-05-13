/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import crypto from 'crypto';
import EventEmitter from 'events';
import { logger } from '../../../shared/logger.js';
import { GitAgentService } from '../gitAgent/gitAgent.service.js';
import { architectAgent } from '../agents/architect.agent.js';
import { deploymentAgent } from '../agents/deployment.agent.js';
import { designerAgent } from '../agents/designer.agent.js';

export const genesisBus = new EventEmitter();

class GenesisService {
    /**
     * Launch the Genesis Engine starting from an overarching project prompt.
     * @param {string} prompt - The natural language request (e.g. "Create a real estate portal")
     * @param {string} repoName - Specific Github repository name
     */
    async igniteCreation(prompt, repoName, isPrivate = true) {
        const genesisId = `gen-${crypto.randomUUID().slice(0, 8)}`;
        logger.info(`✨ Genesis Engine [${genesisId}]: Ignition. Target: ${repoName}`);

        try {
            // STEP 1: Repository Initialization
            this._emit(genesisId, 'PHASE_START', 'Repository Initialization');
            const initResult = await GitAgentService.initializeRepository(repoName, prompt, isPrivate);
            logger.info(`✨ Genesis Engine [${genesisId}]: Github Repo created & cloned at ${initResult.shadowSpace}`);
            this._emit(genesisId, 'PHASE_COMPLETE', 'Repository Initialization', initResult);

            // STEP 1.5: Figma Visual Cortex Extraction (Phase 23)
            let figmaData = null;
            const figmaUrlMatch = prompt.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
            if (figmaUrlMatch) {
                const fileId = figmaUrlMatch[1];
                this._emit(genesisId, 'PHASE_START', 'Visual Cortex Extraction (Figma)');
                figmaData = await designerAgent.analyzeFigmaNode(fileId);
                logger.info(`✨ Genesis Engine [${genesisId}]: Figma Design Tokens & Component Extracted.`);
                this._emit(genesisId, 'PHASE_COMPLETE', 'Visual Cortex Extraction', { feature: 'Design System & UI Scaffold' });
            }

            // STEP 2: Architecture Synthesis
            this._emit(genesisId, 'PHASE_START', 'Architectural Synthesis');
            // If Figma data exists, enrich the prompt so the Architect knows about the pre-extracted tokens
            const enrichedPrompt = figmaData
                ? `${prompt}\n\n[Figma Data Context]: Base primary color is ${figmaData.tokens?.colors?.primary}. Component scaffolding provided by DesignerAgent.`
                : prompt;
            const designDoc = await architectAgent.designSystem(enrichedPrompt);

            // Inject Figma extracted components directly into the Architect's initial files array
            if (figmaData && figmaData.component) {
                designDoc.files = designDoc.files || [];
                designDoc.files.push({
                    path: 'src/components/FigmaInjectedLayout.tsx',
                    instruction: 'Write the extracted Figma layout component exactly as provided.',
                    precompiledCode: figmaData.component
                });
            }

            logger.info(`✨ Genesis Engine [${genesisId}]: Architecture Synthesized (${designDoc.feature})`);
            this._emit(genesisId, 'PHASE_COMPLETE', 'Architectural Synthesis', { feature: designDoc.feature });

            // STEP 3: Phased Deconstruction & Injection
            this._emit(genesisId, 'PHASE_START', 'Sprint Deconstruction');
            const epicPlan = await architectAgent.planPhases(designDoc);
            logger.info(`✨ Genesis Engine [${genesisId}]: Scheduled ${epicPlan.phases?.length || 0} autonomous sprints.`);
            this._emit(genesisId, 'PHASE_COMPLETE', 'Sprint Deconstruction', { totalPhases: epicPlan.phases?.length });

            // STEP 4: Cloud Deployment & IaC
            this._emit(genesisId, 'PHASE_START', 'Cloud Genesis');
            await deploymentAgent.generateTerraform(repoName, 'aws');
            const deployResult = await deploymentAgent.deployToVercelZeroTouch(repoName, 'nextjs');
            logger.info(`✨ Genesis Engine [${genesisId}]: Production URL -> ${deployResult.url}`);
            this._emit(genesisId, 'PHASE_COMPLETE', 'Cloud Genesis', deployResult);

            logger.info(`🌟 Genesis Engine [${genesisId}]: Total Autonomy Achieved. The Swarm is now executing the backlog.`);

            return {
                status: 'success',
                genesisId,
                repoUrl: initResult.githubUrl,
                productionUrl: deployResult.url,
                phasesScheduled: epicPlan.phases?.length || 0,
                design: designDoc
            };

        } catch (error) {
            logger.error(`💥 Genesis Engine [${genesisId}] Catastrophic Failure:`, error);
            this._emit(genesisId, 'GENESIS_FAILED', error.message);
            throw error;
        }
    }

    _emit(id, status, message, data = {}) {
        genesisBus.emit('genesis:progress', { genesisId: id, status, message, ...data, timestamp: Date.now() });
    }
}

export const genesisService = new GenesisService();

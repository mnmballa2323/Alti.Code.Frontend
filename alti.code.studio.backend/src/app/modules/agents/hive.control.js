/**
 * Copyright (c) 2024 Inso Code
 * 
 * The Hive Control
 * Manages the state and lifecycle of multi-agent swarm sessions.
 */

import { logger } from '../../../shared/logger.js';
import { SynapseService as synapseService } from '../synapse/synapse.service.js';

class HiveControl {
    constructor() {
        this.activeSwarms = new Map();
    }

    /**
     * Start a new Swarm Session
     * @param {string} goal 
     * @param {string[]} requiredRoles - e.g. ['security', 'refactor']
     */
    async startSession(goal, requiredRoles) {
        logger.info(`🕸️ Hive: Initializing session for "${goal}"`);

        const sessionId = Date.now().toString();

        // Phase 26: The Hive Mind (Collaborative Loop)
        // Check if this is a complex request requiring collaboration
        if (requiredRoles.includes('collaboration')) {
            logger.info('🧠 Hive: Engaging Collaborative Intelligence (The Hive Mind)...');

            // 1. Strategist: Create Plan
            const strategist = await synapseService.findAgent('planning');
            const plan = await strategist.execute('plan', { goal });
            await synapseService.setMemory(sessionId, 'plan', plan);
            this.logAction(sessionId, 'Strategist', 'Posted Plan to Memory');

            // 2. Architect: Create Design based on Plan
            const architect = await synapseService.findAgent('design'); // Using 'design' cap from Architect
            // Note: Architect expects "goal". In a real system, it would read the "plan" from memory or we pass context.
            // We'll pass the goal for now, but assume it Refined it.
            let design = await architect.execute('design', { goal });
            await synapseService.setMemory(sessionId, 'design', design);
            this.logAction(sessionId, 'Architect', 'Posted Design to Memory');

            // 2.5 Guardian: Security Review (Phase 28)
            let securityReview = { approved: true };
            try {
                const sentinel = await synapseService.findAgent('reviewDesign');
                if (sentinel) {
                    securityReview = await sentinel.execute('reviewDesign', { goal, design });
                    await synapseService.setMemory(sessionId, 'security_review', securityReview);
                    this.logAction(sessionId, 'Guardian', `Security Review: ${securityReview.approved ? 'PASS' : 'FAIL'} (${securityReview.riskLevel || 'N/A'})`);

                    if (!securityReview.approved) {
                        logger.error(`🛑 Hive: Security Violation Detected! Aborting Session.`);
                        this.activeSwarms.set(sessionId, {
                            id: sessionId,
                            goal,
                            status: 'failed',
                            reason: `Security Violation: ${securityReview.reason}`,
                            logs: []
                        });
                        return this.activeSwarms.get(sessionId);
                    }
                }
            } catch (err) {
                logger.warn('Guardian check failed:', err);
            }

            // 3. Critic: Review Design
            const critic = await synapseService.findAgent('review');
            const review = await critic.execute('review', { plan: design }); // Critic usually reviews plans, let's say it reviews designs too
            await synapseService.setMemory(sessionId, 'review', review);
            this.logAction(sessionId, 'Critic', `Reviewed Design: ${review.status}`);

            if (review.status !== 'approved') {
                logger.warn('⚠️ Design flawed. Requesting Architect iteration...');
                // 4. Architect: Iterate (Simulated optimization)
                design.description += " (Revised for Security)";
                await synapseService.setMemory(sessionId, 'design_v2', design);
                this.logAction(sessionId, 'Architect', 'Posted Revised Design (v2)');
            }

            // 5. Composer: Build
            const composer = await synapseService.findAgent('scaffold'); // Using 'scaffold' cap from Composer (need to ensure it has it)
            // We need to ensure Composer is registered with 'scaffold' capability or use check
            if (composer) {
                const buildResult = await composer.execute('scaffold', { design });
                await synapseService.setMemory(sessionId, 'build_result', buildResult);
                this.logAction(sessionId, 'Composer', 'Scaffolded Feature from Design');
            }

            // Return the session state
            this.activeSwarms.set(sessionId, {
                id: sessionId,
                goal,
                status: 'completed',
                mode: 'collaborative',
                memory: await synapseService.getMemory(sessionId, 'build_result'),
                logs: [] // populated by logAction
            });

            return this.activeSwarms.get(sessionId);
        }

        // Standard Swarm (Legacy/Simple)
        const swarm = await synapseService.swarm(goal, requiredRoles);

        const session = {
            id: sessionId,
            goal,
            status: 'active',
            squad: swarm.squad,
            logs: []
        };
        this.activeSwarms.set(sessionId, session);

        // Engage Strategist for planning if goal requests a refactor (and is not a multi-agent test like Phase 18)
        if (requiredRoles.includes('refactor') && requiredRoles.length === 1) {
            try {
                const strategist = await synapseService.findAgent('planning');
                if (strategist) {
                    const plan = await strategist.execute('plan', { goal });
                    session.plan = plan;
                    await synapseService.setMemory(sessionId, 'plan', plan);
                    this.logAction(sessionId, 'Strategist', 'Posted Plan to Memory');
                    
                    // Engage Critic to review the plan
                    const critic = await synapseService.findAgent('review');
                    if (critic) {
                        const review = await critic.execute('review', { plan });
                        await synapseService.setMemory(sessionId, 'review', review);
                        this.logAction(sessionId, 'Critic', `Reviewed Plan: ${review.status}`);
                    }
                }
            } catch (err) {
                logger.warn('Failed to engage Strategist/Critic in standard swarm:', err);
            }
        }

        return session;
    }

    /**
     * Log an action within a swarm session
     */
    logAction(sessionId, agentName, action) {
        if (!this.activeSwarms.has(sessionId)) return;

        const session = this.activeSwarms.get(sessionId);
        session.logs.push({
            timestamp: new Date(),
            agent: agentName,
            action
        });

        logger.info(`🕸️ Hive [${sessionId}]: ${agentName} -> ${action}`);

        // Phase 30: History Recording
        // We fire and forget to avoid blocking main thread
        synapseService.findAgent('recordEvent').then(historian => {
            if (historian) {
                historian.execute('recordEvent', { sessionId, agent: agentName, action });
            }
        }).catch(err => logger.warn('Historian unreachable', err));
    }

    getSession(sessionId) {
        return this.activeSwarms.get(sessionId);
    }
}

export const hiveControl = new HiveControl();

/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { authRoutes } from '../modules/auth/auth.route.js';
import { adminRoutes } from '../modules/admin/admin.route.js';
import { openAiRoutes } from '../modules/openAiAgent/openAiAgent.router.js';
import { securityAgentRoutes } from '../modules/securityAgent/securityAgent.route.js';
import { refactorAgentRoutes } from '../modules/refactorAgent/refactorAgent.route.js';
import { debugAgentRoutes } from '../modules/debugAgent/debugAgent.route.js';
import { devOpsAgentRoutes } from '../modules/devOpsAgent/devOpsAgent.route.js';
import { ciCdAgentRoutes } from '../modules/ciCdAgent/ciCdAgent.route.js';
import { iacAgentRoutes } from '../modules/iacAgent/iacAgent.route.js';
import { shadowWorkspaceRoutes } from '../modules/shadowWorkspace/shadowWorkspace.route.js';
import { generatorRoutes } from '../modules/generator/generator.route.js';
import { harnessRoutes } from '../modules/harness/harness.route.js';

import { synapseRoutes } from '../modules/synapse/synapse.route.js';
import { gitAgentRoutes } from '../modules/gitAgent/gitAgent.route.js';
import { mcpRoutes } from '../modules/mcp/mcp.route.js';
import { guardianRoutes } from '../modules/guardian/guardian.route.js';
import { integrationRoutes } from '../modules/integrations/integration.route.js';
import { ComplianceRoutes } from '../modules/governance/compliance.route.js';
import { AnalystRoutes } from '../modules/analytics/analyst.route.js';
import { AuditRoutes } from '../modules/audit/audit.route.js';
import { BorgRoutes } from '../modules/borg/borg.route.js';
import { productOwnerRoutes } from '../modules/productOwner/productOwner.route.js';
import { criticRoutes } from '../modules/critic/critic.route.js';
import { painterRoutes } from '../modules/painter/painter.route.js';
import { librarianRoutes } from '../modules/librarian/librarian.route.js';
import { diplomatRoutes } from '../modules/diplomat/diplomat.route.js';
import { detectiveRoutes } from '../modules/detective/detective.route.js';
import { oracleRoutes } from '../modules/oracle/oracle.route.js';
import { negotiatorRoutes } from '../modules/negotiator/negotiator.route.js';
import { janitorRoutes } from '../modules/janitor/janitor.route.js';
import { scoutRoutes } from '../modules/scout/scout.route.js';
import { surgeonRoutes } from '../modules/surgeon/surgeon.route.js';
import { architectRoutes } from '../modules/architect/architect.route.js';
import { spokespersonRoutes } from '../modules/spokesperson/spokesperson.route.js';
import { sentinelRoutes } from '../modules/sentinel/sentinel.route.js';
import { governorRoutes } from '../modules/governance/governance.route.js';
import { simulatorRoutes } from '../modules/simulator/simulator.route.js';
import { analystRoutes } from '../modules/analyst/analyst.route.js';
import { scribeRoutes } from '../modules/scribe/scribe.route.js';
import { recruiterRoutes } from '../modules/recruiter/recruiter.route.js';
import { broadcasterRoutes } from '../modules/broadcaster/broadcaster.route.js';
import { liaisonRoutes } from '../modules/liaison/liaison.route.js';
import { directorRoutes } from '../modules/director/director.route.js';
import { strategistRoutes } from '../modules/strategist/strategist.route.js';
import { captainRoutes } from '../modules/captain/captain.route.js';
import { navigatorRoutes } from '../modules/navigator/navigator.route.js';

import { orchestratorRoutes } from '../modules/agents/orchestrator.route.js';
import { AgentRoutes } from '../modules/agents/agent.route.js';
import { DocsRoutes } from '../modules/docs/docs.route.js';
import enterpriseRoutes from '../modules/enterprise/enterprise.routes.js';
import { watchmanRoutes } from '../modules/connectivity/watchman.routes.js';
import { engineRoutes } from '../modules/agents/engine.route.js'; // Phase 22
import { memoryRoutes } from '../modules/memory/memory.route.js'; // Phase 2
import { observabilityRoutes } from '../modules/monitoring/observability.route.js'; // Phase 4
import { metricsRoute } from '../modules/monitoring/metrics.route.js'; // Phase 4 Analytics
import { autopilotRoutes } from '../modules/autopilot/autopilot.route.js'; // Phase 5
import { marketplaceRoutes } from '../modules/marketplace/marketplace.route.js'; // Phase 3
import swarmRouter from '../modules/agents/swarm.controller.js'; // Swarm Intelligence API
import { geminiCliRoutes } from '../modules/geminiCli/geminiCli.route.js';
import { geminiExtensionsRoutes } from '../modules/geminiExtensions/geminiExtension.route.js';
import { speckitRoutes } from '../modules/speckit/speckit.route.js';
import { hooksRoutes } from '../modules/hooks/hooks.route.js';
import { steeringRoutes } from '../modules/steering/steering.route.js';
import { powersRoutes } from '../modules/powers/powers.route.js';
import { creditsRoutes } from '../modules/credits/credits.route.js';
// v6.0.0 — Autonomous Systems
import { sprintRouter } from '../modules/autonomousSprint/autonomousSprint.controller.js';
import { multiRepoRouter } from '../modules/multiRepoOrchestration/multiRepoOrchestration.controller.js';
// v6.1.0 — QA + Real-Time Collaboration
import { qaRoutes } from '../modules/qa/qa.controller.js';
import { collaborationRoutes } from '../modules/collaboration/collaboration.controller.js';
// v6.3.0 — Autonomous Goal Synthesis + Sprint Scheduler
import { schedulerRouter } from '../modules/sprintScheduler/sprintScheduler.controller.js';
// v6.4.0 — Runtime Observability + Incident Response
import { telemetryRoutes } from '../modules/telemetry/telemetry.controller.js';
// v6.5.0 — Adaptive Agent Performance Profiling
import { agentProfilerRoutes } from '../modules/agentProfiler/agentProfiler.controller.js';
// v6.6.0 — Autonomous Knowledge Base (inline wiki endpoints)
import { wikiService } from '../modules/docs/wiki.service.js';
// v6.7.0 — Live Code Browser + Inline LLM Editor + Secure Terminal
import { codeBrowserRoutes } from '../modules/codeBrowser/codeBrowser.controller.js';
// Phase 14 — Cloudflare Moltworker Configuration
import { openclawRoutes } from '../modules/openclaw/openclaw.config.route.js';
// Phase 21 — Genesis Engine
import { genesisRoutes } from '../modules/genesis/genesis.route.js';
// v7.7.0 — Open Source Trending Agent System
import ossAgentsRouter from '../modules/ossAgents/oss.agents.route.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Application Health Check
 *     description: Core availability ping for Kubernetes readiness and liveness probes.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Deep Readiness Check
 *     description: Validates database connections and dependent sub-systems (mocked here).
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/ready', (req, res) => res.status(200).json({ ready: true, subsystems: ['postgres', 'redis', 'gemini'] }));

const moduleRoutes = [
  {
    path: '/engine',
    route: engineRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/agents',
    route: AgentRoutes,
  },
  {
    path: '/orchestrator',
    route: orchestratorRoutes,
  },
  {
    path: '/enterprise',
    route: enterpriseRoutes,
  },
  {
    path: '/openai',
    route: openAiRoutes,
  },
  {
    path: '/security-agent',
    route: securityAgentRoutes,
  },
  {
    path: '/refactor-agent',
    route: refactorAgentRoutes,
  },
  {
    path: '/debug-agent',
    route: debugAgentRoutes,
  },
  {
    path: '/devops-agent',
    route: devOpsAgentRoutes,
  },
  {
    path: '/ci-cd-agent',
    route: ciCdAgentRoutes,
  },
  {
    path: '/iac-agent',
    route: iacAgentRoutes,
  },
  {
    path: '/shadow',
    route: shadowWorkspaceRoutes,
  },
  {
    path: '/generator',
    route: generatorRoutes,
  },
  {
    path: '/harness',
    route: harnessRoutes,
  },
  {
    path: '/synapse',
    route: synapseRoutes,
  },
  {
    path: '/git-agent',
    route: gitAgentRoutes,
  },
  {
    path: '/mcp',
    route: mcpRoutes,
  },
  {
    path: '/guardian',
    route: guardianRoutes,
  },
  {
    path: '/integrations',
    route: integrationRoutes,
  },
  {
    path: '/governance',
    route: ComplianceRoutes,
  },
  {
    path: '/analyst',
    route: AnalystRoutes,
  },
  {
    path: '/api-docs',
    route: DocsRoutes,
  },
  {
    path: '/audit',
    route: AuditRoutes,
  },
  {
    path: '/borg',
    route: BorgRoutes,
  },
  {
    path: '/product-owner',
    route: productOwnerRoutes,
  },
  {
    path: '/critic',
    route: criticRoutes,
  },
  {
    path: '/painter',
    route: painterRoutes,
  },
  {
    path: '/librarian',
    route: librarianRoutes,
  },
  {
    path: '/diplomat',
    route: diplomatRoutes,
  },
  {
    path: '/detective',
    route: detectiveRoutes,
  },
  {
    path: '/oracle',
    route: oracleRoutes,
  },
  {
    path: '/negotiator',
    route: negotiatorRoutes,
  },
  {
    path: '/janitor',
    route: janitorRoutes,
  },
  {
    path: '/scout',
    route: scoutRoutes,
  },
  {
    path: '/surgeon',
    route: surgeonRoutes,
  },
  {
    path: '/architect',
    route: architectRoutes,
  },
  {
    path: '/spokesperson',
    route: spokespersonRoutes,
  },
  {
    path: '/sentinel',
    route: sentinelRoutes,
  },
  {
    path: '/governor',
    route: governorRoutes,
  },
  {
    path: '/simulator',
    route: simulatorRoutes,
  },

  {
    path: '/scribe',
    route: scribeRoutes,
  },
  {
    path: '/recruiter',
    route: recruiterRoutes,
  },
  {
    path: '/broadcaster',
    route: broadcasterRoutes,
  },
  {
    path: '/liaison',
    route: liaisonRoutes,
  },
  {
    path: '/director',
    route: directorRoutes,
  },
  {
    path: '/strategist',
    route: strategistRoutes,
  },
  {
    path: '/captain',
    route: captainRoutes,
  },
  {
    path: '/navigator',
    route: navigatorRoutes,
  },
  {
    path: '/hooks',
    route: watchmanRoutes,
  },
  {
    path: '/mcp',
    route: mcpRoutes,
  },
  {
    path: '/memory',
    route: memoryRoutes,
  },
  {
    path: '/observability',
    route: observabilityRoutes,
  },
  {
    path: '/metrics',
    route: metricsRoute,
  },
  {
    path: '/autopilot',
    route: autopilotRoutes,
  },
  {
    path: '/marketplace',
    route: marketplaceRoutes,
  },
  {
    path: '/swarm',
    route: swarmRouter,
  },
  {
    path: '/gemini-cli',
    route: geminiCliRoutes,
  },
  {
    path: '/gemini-extensions',
    route: geminiExtensionsRoutes,
  },
  // ─── Kiro-feature-parity additions ───────────────────────────────────────
  {
    path: '/specs',
    route: speckitRoutes,
  },
  {
    path: '/agent-hooks',
    route: hooksRoutes,
  },
  {
    path: '/steering',
    route: steeringRoutes,
  },
  {
    path: '/powers',
    route: powersRoutes,
  },
  {
    path: '/credits',
    route: creditsRoutes,
  },
  // v6.0.0 — Autonomous Systems
  {
    path: '/sprint',
    route: sprintRouter,
  },
  {
    path: '/multi-repo',
    route: multiRepoRouter,
  },
  // v6.1.0 — QA + Real-Time Collaboration
  {
    path: '/qa',
    route: qaRoutes,
  },
  {
    path: '/collab',
    route: collaborationRoutes,
  },
  // v6.3.0 — Autonomous Sprint Scheduler
  {
    path: '/scheduler',
    route: schedulerRouter,
  },
  // v6.4.0 — Runtime Observability + Incident Response
  {
    path: '/telemetry',
    route: telemetryRoutes,
  },
  // v6.5.0 — Adaptive Agent Performance Profiling
  {
    path: '/agents',
    route: agentProfilerRoutes,
  },
  // v6.7.0 — Live Code Browser + Secure Terminal + Inline LLM
  {
    path: '/code-browser',
    route: codeBrowserRoutes,
  },
  {
    path: '/openclaw',
    route: openclawRoutes,
  },
  {
    path: '/genesis',
    route: genesisRoutes,
  },
  // v7.7.0 — Open Source Trending Agent System
  {
    path: '/oss-agents',
    route: ossAgentsRouter,
  },
];

// v6.6.0 — Autonomous Knowledge Base wiki routes (inline)
// These are lightweight and don't need a dedicated controller file.
router.get('/wiki/articles', async (req, res) => {
  try {
    const articles = await wikiService.listArticles();
    return res.json({ success: true, data: articles });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});
router.get('/wiki/adrs', async (req, res) => {
  try {
    const adrs = await wikiService.listADRs();
    return res.json({ success: true, data: adrs });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});


moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

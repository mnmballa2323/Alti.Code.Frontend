import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));
router.get('/ready', (req, res) => res.status(200).json({ ready: true, subsystems: ['postgres', 'redis', 'gemini'] }));

const modulesPath = path.join(__dirname, '../modules');

// Hardcoded fallback for critically essential routes that MUST exist
import { authRoutes } from '../modules/auth/auth.route.js';
import { mcpRoutes } from '../modules/mcp/mcp.route.js';
import { aiRoutes } from '../modules/ai/ai.route.js';
import { iapService } from '../modules/googleCloud/iap.service.js';
import { ResearchRoutes } from '../modules/research/research.route.js';
import { enterpriseWAF } from '../modules/security/enterprise_waf.middleware.js';
import { rbacService } from '../modules/security/rbac.middleware.js';
import { SandyaaRoutes } from '../modules/sandyaa/sandyaa.route.js';
import { tenantDbRouter } from '../middlewares/tenantDb.js';
import { scimRoutes } from '@inso/platform';

// 🛡️ Global Enterprise WAF (Rate Limiting & Payload Inspection)
router.use(enterpriseWAF.rateLimiter);
router.use(enterpriseWAF.payloadInspector);

// Public Routes
router.use('/auth', authRoutes);
router.use('/scim', scimRoutes);

// 🛡️ Global Zero-Trust Boundary (IAP verification for all subsequent routes)
// Note: In development, verifyIAPToken bypasses automatically if no token is present.
router.use(iapService.verifyIAPToken);

// 🔌 Dynamic Database Context Router per Tenant
router.use(tenantDbRouter);

// 🔐 Enterprise FinOps & RBAC Policy
router.use(rbacService.enforceModelTierPolicy());

router.use('/mcp', mcpRoutes);
router.use('/ai', aiRoutes);
router.use('/research', ResearchRoutes);
router.use('/sandyaa', SandyaaRoutes);

try {
  const modulesDir = fs.readdirSync(modulesPath);
  for (const moduleDir of modulesDir) {
    const moduleFullPath = path.join(modulesPath, moduleDir);
    if (fs.statSync(moduleFullPath).isDirectory()) {
      const files = fs.readdirSync(moduleFullPath);
      for (const file of files) {
        if (file.endsWith('.route.js') || file.endsWith('.routes.js')) {
          // Skip the ones we explicitly imported above
          if (file === 'auth.route.js' || file === 'mcp.route.js' || file === 'ai.route.js' || file === 'sandyaa.route.js') continue;

          try {
            const routeModule = await import(`../modules/${moduleDir}/${file}`);
            const routerKey = Object.keys(routeModule).find(key => key.toLowerCase().includes('route'));
            
            if (routerKey && routeModule[routerKey]) {
              let basePath = `/${moduleDir}`;
              
              // Custom path overrides matching frontend configurations
              if (file === 'cloud_marketplace.route.js') basePath = '/marketplace/cloud';
              if (file === 'gitAgent.route.js') basePath = '/git-agent';
              if (file === 'dyad.route.js') basePath = '/dyad/claude';
              if (file === 'gemini.route.js') basePath = '/gemini';
              if (file === 'codeEditor.route.js') basePath = '/code-editor';
              if (file === 'shadowWorkspace.route.js') basePath = '/shadow';
              if (file === 'securityAgent.route.js') basePath = '/security-agent';
              if (file === 'refactorAgent.route.js') basePath = '/refactor-agent';
              if (file === 'debugAgent.route.js') basePath = '/debug-agent';
              if (file === 'compliance.route.js') basePath = '/governance';
              if (file === 'observability.route.js') basePath = '/observability';
              if (file === 'metrics.route.js') basePath = '/metrics';
              if (file === 'agent.route.js') basePath = '/agents';
              if (file === 'omni_polyglot.route.js') basePath = '/agents/polyglot';
              if (file === 'openclaw.config.route.js') basePath = '/openclaw';
              if (file === 'geminiCli.route.js') basePath = '/gemini-cli';
              if (file === 'cliAnything.route.js') basePath = '/cli-anything';
              if (file === 'geminiExtension.route.js') basePath = '/gemini-extensions';
              if (file === 'geminiOpenMemo.route.js') basePath = '/gemini-open-memory';
              if (file === 'googleGenAi.route.js') basePath = '/google-gen-ai';
              if (file === 'googleSearch.route.js') basePath = '/google-search';
              if (file === 'googleAdkAgent.route.js') basePath = '/google-adk';
              if (file === 'borg.route.js') basePath = '/borg';
              if (file === 'oss.agents.route.js') basePath = '/oss-agents';
              if (file === 'openHandsAgent.route.js') basePath = '/oss-swarm/openhands';
              if (file === 'browserUseAgent.route.js') basePath = '/oss-swarm/browser-use';
              if (file === 'fazmAgent.route.js') basePath = '/oss-swarm/fazm';
              if (file === 'crewAiAgent.route.js') basePath = '/oss-swarm/crew-ai';
              if (file === 'langGraphAgent.route.js') basePath = '/oss-swarm/langgraph';
              if (file === 'dspyAgent.route.js') basePath = '/oss-swarm/dspy';
              if (file === 'engine.route.js') basePath = '/engine';
              if (file === 'integration.route.js') basePath = '/integrations';
              if (file === 'cloudRun.route.js') basePath = '/cloud-run';
              if (file === 'tts.route.js') basePath = '/tts';
              if (file === 'asset.route.js') basePath = '/assets';
              if (file === 'translation.route.js') basePath = '/translate';
              if (file === 'tpu.route.js') basePath = '/tpu';
              if (file === 'confidentialVm.route.js') basePath = '/confidential-vms';
              if (file === 'batch.route.js') basePath = '/batch';
              if (file === 'tasks.route.js') basePath = '/tasks';
              if (file === 'spanner.route.js') basePath = '/spanner';
              if (file === 'bigquery.route.js') basePath = '/bigquery';
              if (file === 'pubsub.route.js') basePath = '/pubsub';
              if (file === 'dataflow.route.js') basePath = '/dataflow';
              if (file === 'build.route.js') basePath = '/build';
              if (file === 'workflow.route.js') basePath = '/workflows';
              if (file === 'codeAssist.route.js') basePath = '/code-assist';
              if (file === 'discovery.route.js') basePath = '/discovery';
              if (file === 'chron.route.js') basePath = '/scheduler';
              if (file === 'serviceMesh.route.js') basePath = '/service-mesh';
              if (file === 'gateway.route.js') basePath = '/gateway';

              if (file === 'a2a.route.js') basePath = '/a2a';
              if (file === 'mlops.route.js') basePath = '/mlops';
              if (file === 'workspace.route.js') basePath = '/workspace';
              if (file === 'security.route.js') basePath = '/security';
              if (file === 'governance.route.js') basePath = '/governance';
              if (file === 'ear.route.js') basePath = '/ear';
              if (file === 'scaling.route.js') basePath = '/scaling';
              if (file === 'alloydb.route.js') basePath = '/alloydb';
              if (file === 'spannerGraph.route.js') basePath = '/spanner-graph';
              if (file === 'dataproc.route.js') basePath = '/dataproc';
              if (file === 'tensorboard.route.js') basePath = '/tensorboard';
              if (file === 'firebase.route.js') basePath = '/firebase';
              if (file === 'geocoding.route.js') basePath = '/geocoding';
              if (file === 'sentiment.route.js') basePath = '/sentiment';
              if (file === 'kms.route.js') basePath = '/kms';
              if (file === 'iap.route.js') basePath = '/iap';
              if (file === 'recaptcha.route.js') basePath = '/recaptcha';
              if (file === 'dlp.route.js') basePath = '/dlp';
              if (file === 'vision.route.js') basePath = '/vision';
              if (file === 'videoEye.route.js') basePath = '/videoEye';
              if (file === 'documentAi.route.js') basePath = '/document-ai';
              if (file === 'vectorSearch.route.js') basePath = '/vector-search';
              if (file === 'gcs.route.js') basePath = '/gcs';
              if (file === 'logging.route.js') basePath = '/logging';
              if (file === 'firestoreSync.route.js') basePath = '/firestore';
              if (file === 'cloudRouter.route.js') basePath = '/cloud-router';
              if (file === 'ragCache.route.js') basePath = '/rag-cache';
              if (file === 'ragEvaluator.route.js') basePath = '/rag-evaluator';
              if (file === 'uDeployment.route.js') basePath = '/u-deployment';
              if (file === 'dataCatalog.route.js') basePath = '/data-catalog';
              if (file === 'featureStore.route.js') basePath = '/feature-store';
              if (file === 'eval.route.js') basePath = '/eval';
              if (file === 'scc.route.js') basePath = '/scc';
              if (file === 'secretManager.route.js') basePath = '/secret-manager';
              if (file === 'speech.route.js') basePath = '/speech';
              if (file === 'voice.route.js') basePath = '/voice';
              if (file === 'workspaceAdmin.route.js') basePath = '/workspace-admin';
              if (file === 'cloudWorkstations.route.js') basePath = '/workstations';
              if (file === 'smartRouter.route.js') basePath = '/smart-router';
              if (file === 'agentmemory.route.js') basePath = '/agent-memory';
              if (file === 'fileSearch.route.js') basePath = '/file-search';
              if (file === 'qa.route.js') basePath = '/qa';
              
              router.use(basePath, routeModule[routerKey]);
              console.log(`[Router] Successfully mounted ${basePath}`);
            }
          } catch (err) {
            console.warn(`[Router] Skipping broken route ${file}: ${err.message}`);
          }
        }
      }
    }
  }
} catch (err) {
  console.error('[Router] Error scanning modules:', err);
}

export default router;

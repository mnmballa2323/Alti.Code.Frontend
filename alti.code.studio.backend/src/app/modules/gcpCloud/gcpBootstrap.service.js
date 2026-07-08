/**
 * GCP Cloud Platform Bootstrap Service
 *
 * Initializes all 24 GCP Cloud services on server startup.
 * Provides health checking and graceful shutdown for the full GCP service mesh.
 *
 * This is the single entry point that server.js calls to bring up the GCP layer.
 */
import { logger } from '../../../shared/logger.js';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT || 'not-configured';
const GCP_REGION = process.env.GCP_REGION || 'us-central1';
const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || 'cloud';

// Service registry — populated lazily on init
const serviceRegistry = {};
let initComplete = false;

/**
 * Lazy-load a GCP service module. Never crashes the server.
 * @param {string} name - Short name for the service
 * @param {string} modulePath - Import path relative to this file
 * @param {string} exportName - Named export to pull from the module
 */
async function loadService(name, modulePath, exportName) {
  try {
    const mod = await import(modulePath);
    const service = mod[exportName] || mod.default;
    if (service) {
      serviceRegistry[name] = { service, status: 'ok' };
    } else {
      serviceRegistry[name] = { service: null, status: 'export-missing' };
    }
  } catch (e) {
    serviceRegistry[name] = { service: null, status: 'load-failed', error: e.message };
    logger.warn(`⚠️ GCP Bootstrap: Failed to load ${name}: ${e.message}`);
  }
}

/**
 * Initialize all GCP Cloud Platform services.
 * Called once from server.js during startup.
 */
export async function initializeGcpServices() {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  ☁️  GCP Cloud Platform: Initializing Service Mesh');
  logger.info(`  📍 Project: ${GCP_PROJECT_ID}`);
  logger.info(`  🌍 Region:  ${GCP_REGION}`);
  logger.info(`  🚀 Mode:    ${DEPLOYMENT_MODE}`);
  logger.info('═══════════════════════════════════════════════════════');

  // ── Core Infrastructure ──
  await Promise.allSettled([
    loadService('storage', './gcpStorage.service.js', 'storageService'),
    loadService('firestore', './gcpFirestore.service.js', 'firestoreService'),
    loadService('pubsub', './gcpPubSub.service.js', 'pubSubService'),
    loadService('cache', './gcpCache.service.js', 'gcpCacheService'),
    loadService('secretManager', './gcpSecretManager.service.js', 'gcpSecretManagerService'),
  ]);

  // ── Data & Analytics ──
  await Promise.allSettled([
    loadService('spannerGraph', './gcpSpannerGraph.service.js', 'gcpSpannerGraphService'),
    loadService('logging', './gcpLogging.service.js', 'gcpLoggingService'),
    loadService('dataflow', './gcpDataflow.service.js', 'gcpDataflowService'),
    loadService('search', './gcpSearch.service.js', 'discoveryEngineService'),
  ]);

  // ── AI / ML ──
  await Promise.allSettled([
    loadService('speech', './gcpSpeech.service.js', 'speechService'),
    loadService('textToSpeech', './gcpTextToSpeech.service.js', 'gcpTextToSpeechService'),
    loadService('translate', './gcpTranslate.service.js', 'gcpTranslateService'),
    loadService('naturalLanguage', './gcpNaturalLanguage.service.js', 'gcpNaturalLanguageService'),
    loadService('a2a', './gcpA2a.service.js', 'gcpA2aService'),
  ]);

  // ── Security ──
  await Promise.allSettled([
    loadService('dlp', './gcpDlp.service.js', 'dlpScrubberService'),
    loadService('sentinel', './gcpSentinel.service.js', 'gcpSentinelService'),
    loadService('webRisk', './gcpWebRisk.service.js', 'gcpWebRiskService'),
  ]);

  // ── Compute & Orchestration ──
  await Promise.allSettled([
    loadService('batch', './gcpBatch.service.js', 'gcpBatchService'),
    loadService('workflow', './gcpWorkflow.service.js', 'gcpWorkflowService'),
    loadService('cloudTasks', './gcpCloudTasks.service.js', 'gcpCloudTasksService'),
    loadService('cloudScheduler', './gcpCloudScheduler.service.js', 'gcpCloudSchedulerService'),
    loadService('cloudDeploy', './gcpCloudDeploy.service.js', 'gcpCloudDeployService'),
  ]);

  // ── Networking & Service Mesh ──
  await Promise.allSettled([
    loadService('networkIntelligence', './gcpNetworkIntelligence.service.js', 'gcpNetworkIntelligenceService'),
    loadService('serviceDirectory', './gcpServiceDirectory.service.js', 'gcpServiceDirectoryService'),
  ]);

  // ── Governance & Compliance ──
  await Promise.allSettled([
    loadService('assetInventory', './gcpAssetInventory.service.js', 'gcpAssetInventoryService'),
    loadService('containerAnalysis', './gcpContainerAnalysis.service.js', 'gcpContainerAnalysisService'),
    loadService('binaryAuth', './gcpBinaryAuth.service.js', 'gcpBinaryAuthService'),
    loadService('accessApproval', './gcpAccessApproval.service.js', 'gcpAccessApprovalService'),
  ]);

  // ── Platform Administration ──
  await Promise.allSettled([
    loadService('alloyDB', './gcpAlloyDB.service.js', 'gcpAlloyDBService'),
    loadService('cloudRun', './gcpCloudRun.service.js', 'gcpCloudRunService'),
    loadService('identityPlatform', './gcpIdentityPlatform.service.js', 'gcpIdentityPlatformService'),
    loadService('cloudFunctions', './gcpCloudFunctions.service.js', 'gcpCloudFunctionsService'),
    loadService('apiGateway', './gcpApiGateway.service.js', 'gcpApiGatewayService'),
  ]);

  // ── Infrastructure Security ──
  await Promise.allSettled([
    loadService('cloudArmor', './gcpCloudArmor.service.js', 'gcpCloudArmorService'),
    loadService('certificateManager', './gcpCertificateManager.service.js', 'gcpCertificateManagerService'),
    loadService('memorystoreCluster', './gcpMemorystoreCluster.service.js', 'gcpMemorystoreClusterService'),
  ]);

  // ── Media Processing ──
  await loadService('mediaTranscoder', './gcpMediaTranscoder.service.js', 'gcpMediaTranscoderService');

  // ── Orchestrator (BigQuery, KMS, SCC, Vision, etc.) ──
  await loadService('orchestrator', './gcpServices.service.js', 'gcpServicesService');

  // Report
  const total = Object.keys(serviceRegistry).length;
  const healthy = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;
  const failed = Object.entries(serviceRegistry)
    .filter(([, v]) => v.status !== 'ok')
    .map(([name, v]) => `${name} (${v.status})`);

  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`  ✅ GCP Cloud Platform: ${healthy}/${total} services initialized`);
  if (failed.length > 0) {
    logger.warn(`  ⚠️  Failed services: ${failed.join(', ')}`);
  }
  logger.info('═══════════════════════════════════════════════════════');

  initComplete = true;
  return serviceRegistry;
}

/**
 * Deep health check for all GCP services.
 * Called by the /ready endpoint.
 */
export async function gcpHealthCheck() {
  const services = {};
  for (const [name, entry] of Object.entries(serviceRegistry)) {
    services[name] = entry.status;
  }

  const total = Object.keys(serviceRegistry).length;
  const healthyCount = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;

  return {
    gcp: {
      status: healthyCount === total ? 'healthy' : healthyCount > 0 ? 'degraded' : 'unhealthy',
      project: GCP_PROJECT_ID,
      region: GCP_REGION,
      deploymentMode: DEPLOYMENT_MODE,
      totalServices: total,
      healthyServices: healthyCount,
      initialized: initComplete,
      services,
    },
  };
}

/**
 * Get a specific service instance from the registry.
 * @param {string} name - Service name (e.g., 'storage', 'pubsub')
 * @returns {object|null} The service instance or null
 */
export function getService(name) {
  return serviceRegistry[name]?.service || null;
}

/**
 * Graceful shutdown — close connections and flush buffers.
 */
export async function shutdownGcpServices() {
  logger.info('🛑 GCP Cloud Platform: Initiating graceful shutdown...');

  const shutdownTasks = [];

  // Flush logging buffers
  const loggingService = serviceRegistry.logging?.service;
  if (loggingService?.flush) {
    shutdownTasks.push(
      loggingService.flush().catch((e) => logger.warn(`Logging flush failed: ${e.message}`)),
    );
  }

  // Close Pub/Sub connections
  const pubsub = serviceRegistry.pubsub?.service;
  if (pubsub?.close) {
    shutdownTasks.push(
      pubsub.close().catch((e) => logger.warn(`Pub/Sub close failed: ${e.message}`)),
    );
  }

  // Close Spanner sessions
  const spanner = serviceRegistry.spannerGraph?.service;
  if (spanner?.close) {
    shutdownTasks.push(
      spanner.close().catch((e) => logger.warn(`Spanner close failed: ${e.message}`)),
    );
  }

  await Promise.allSettled(shutdownTasks);
  logger.info('✅ GCP Cloud Platform: Shutdown complete.');
}

/**
 * Get the full service registry for introspection.
 */
export function getServiceRegistry() {
  return serviceRegistry;
}

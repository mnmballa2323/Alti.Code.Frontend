import { logger } from '../../../shared/logger.js';

const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || 'cloud';

// Service registry
const serviceRegistry = {};
let initComplete = false;

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
    logger.warn(`⚠️ Azure Bootstrap: Failed to load ${name}: ${e.message}`);
  }
}

export async function initializeAzureServices() {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  ☁️  Azure Cloud Platform: Initializing Service Mesh');
  logger.info(`  🚀 Mode:    ${DEPLOYMENT_MODE}`);
  logger.info('═══════════════════════════════════════════════════════');

  // Load concrete implementations
  await Promise.allSettled([
    loadService('secretManager', './azureSecretManager.service.js', 'azureSecretManagerService'),
    loadService('storage', './azureStorage.service.js', 'azureStorageService'),
    loadService('pubsub', './azurePubSub.service.js', 'azurePubSubService')
  ]);

  const total = Object.keys(serviceRegistry).length;
  const healthy = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;
  
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`  ✅ Azure Cloud Platform: ${healthy}/${total} services initialized`);
  logger.info('═══════════════════════════════════════════════════════');

  initComplete = true;
  return serviceRegistry;
}

export async function azureHealthCheck() {
  const services = {};
  for (const [name, entry] of Object.entries(serviceRegistry)) {
    services[name] = entry.status;
  }

  const total = Object.keys(serviceRegistry).length;
  const healthyCount = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;

  return {
    azure: {
      status: healthyCount === total && total > 0 ? 'healthy' : 'degraded',
      deploymentMode: DEPLOYMENT_MODE,
      totalServices: total,
      healthyServices: healthyCount,
      initialized: initComplete,
      services,
    },
  };
}

export function getService(name) {
  return serviceRegistry[name]?.service || null;
}

export async function shutdownAzureServices() {
  logger.info('🛑 Azure Cloud Platform: Initiating graceful shutdown...');
  // Add graceful shutdown logic for Azure connections here later
  logger.info('✅ Azure Cloud Platform: Shutdown complete.');
}

export function getServiceRegistry() {
  return serviceRegistry;
}

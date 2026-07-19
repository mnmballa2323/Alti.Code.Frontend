import { logger } from '../../../shared/logger.js';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
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
    logger.warn(`⚠️ AWS Bootstrap: Failed to load ${name}: ${e.message}`);
  }
}

export async function initializeAwsServices() {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  ☁️  AWS Cloud Platform: Initializing Service Mesh');
  logger.info(`  🌍 Region:  ${AWS_REGION}`);
  logger.info(`  🚀 Mode:    ${DEPLOYMENT_MODE}`);
  logger.info('═══════════════════════════════════════════════════════');

  // Load concrete implementations
  await Promise.allSettled([
    loadService('secretManager', './awsSecretManager.service.js', 'awsSecretManagerService'),
    loadService('storage', './awsStorage.service.js', 'awsStorageService'),
    loadService('pubsub', './awsPubSub.service.js', 'awsPubSubService')
  ]);

  const total = Object.keys(serviceRegistry).length;
  const healthy = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;
  
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`  ✅ AWS Cloud Platform: ${healthy}/${total} services initialized`);
  logger.info('═══════════════════════════════════════════════════════');

  initComplete = true;
  return serviceRegistry;
}

export async function awsHealthCheck() {
  const services = {};
  for (const [name, entry] of Object.entries(serviceRegistry)) {
    services[name] = entry.status;
  }

  const total = Object.keys(serviceRegistry).length;
  const healthyCount = Object.values(serviceRegistry).filter((s) => s.status === 'ok').length;

  return {
    aws: {
      status: healthyCount === total && total > 0 ? 'healthy' : 'degraded',
      region: AWS_REGION,
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

export async function shutdownAwsServices() {
  logger.info('🛑 AWS Cloud Platform: Initiating graceful shutdown...');
  // Add graceful shutdown logic for AWS connections here later
  logger.info('✅ AWS Cloud Platform: Shutdown complete.');
}

export function getServiceRegistry() {
  return serviceRegistry;
}

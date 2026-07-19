import { spawn } from 'child_process';
import path from 'path';
import { logger } from './logger.js';

export const orchestrator = {
  /**
   * Provision a new tenant environment
   * @param {Object} options
   * @param {string} options.tenantId
   * @param {string} options.cloudProvider - 'aws', 'azure', or 'gcp'
   * @param {string} options.deploymentTier - 'multi-tenant', 'single-tenant', 'government'
   */
  async provisionEnvironment(options) {
    const { tenantId, cloudProvider, deploymentTier } = options;
    logger.info(`Orchestrator starting provision for ${tenantId} in ${cloudProvider} (${deploymentTier})`);

    // Map the internal tier naming to the terraform script's expected arguments
    let mappedTier;
    if (deploymentTier === 'multi-tenant') mappedTier = 'cloud';
    else if (deploymentTier === 'single-tenant') mappedTier = 'dedicated';
    else if (deploymentTier === 'government') mappedTier = 'government';
    else mappedTier = 'cloud'; // fallback

    // The Universal PaaS is now fully decoupled into its own Sovereign Infrastructure repository.
    // The Orchestrator reaches across the disk (or fetches from the GitOps pipeline) to execute it.
    const scriptPath = path.resolve(process.cwd(), '../../inso.terraform.iac', 'deploy_enterprise.sh');

    logger.info(`Executing script: ${scriptPath} --cloud ${cloudProvider} --customer ${tenantId} --deployment-option ${mappedTier}`);

    // Since this orchestrator is serving Alti Code Studio directly via the API right now,
    // we define the Alti Code Studio specific PaaS arguments here.
    // In the future, this can extract payload arguments for any of the 9 Inso Technologies products.
    const args = [
      scriptPath,
      '--cloud', cloudProvider,
      '--customer', tenantId,
      '--deployment-option', mappedTier,
      '--app-name', 'alti-code-studio',
      '--domain', 'alticode.studio',
      '--db-name', 'pentagidb',
      '--db-user', 'inso_admin',
      '--migration-command', 'cd alti.code.studio.backend && npx prisma db push --accept-data-loss',
      '--auto-approve'
    ];

    // Execute the terraform wrapper script
    const child = spawn('bash', args, {
      cwd: path.resolve(process.cwd(), '../../inso.terraform.iac'), // run from the decoupled IaC repo
      env: process.env // pass through credentials
    });

    child.stdout.on('data', (data) => {
      logger.info(`[${tenantId} Provisioning] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      logger.error(`[${tenantId} Provisioning ERR] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logger.info(`Provisioning for ${tenantId} completed successfully.`);
        // Here you would typically trigger an event or update the DB status to ACTIVE
      } else {
        logger.error(`Provisioning for ${tenantId} failed with exit code ${code}.`);
        // Update DB status to FAILED
      }
    });

    // We return immediately to not block the request thread while Terraform runs asynchronously
    return {
      status: 'provisioning_started',
      tenantId,
      cloudProvider,
      deploymentTier
    };
  }
};

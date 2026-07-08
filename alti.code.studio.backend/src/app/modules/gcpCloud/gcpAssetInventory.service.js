import { logger } from '../../../shared/logger.js';

class GcpAssetInventoryService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const { AssetServiceClient } = await import('@google-cloud/asset');
        this.client = new AssetServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Asset Inventory: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Asset Inventory init failed: ${e.message}`);
    }
  }

  /**
   * List assets under a given parent resource, optionally filtered by asset types.
   * @param {string} parent - Parent resource (e.g. "projects/my-project")
   * @param {string[]} [assetTypes=[]] - Asset type filters (e.g. ["compute.googleapis.com/Instance"])
   * @returns {Promise<object[]>} Array of asset resources
   */
  async listAssets(parent, assetTypes = []) {
    if (this.isInitialized && this.client) {
      try {
        const request = {
          parent,
          assetTypes,
          contentType: 'RESOURCE',
        };

        const [assets] = await this.client.listAssets(request);

        logger.info(`📦 Asset Inventory: Listed ${assets.length} assets under ${parent}`);
        return assets;
      } catch (e) {
        logger.error(`❌ Asset Inventory listAssets failed: ${e.message}`);
      }
    }

    logger.info(`📦 Asset Inventory Mock: listAssets(${parent})`);
    return [];
  }

  /**
   * Search all resources across projects matching a query string.
   * @param {string} query - Search query (e.g. "name:my-instance")
   * @returns {Promise<object[]>} Array of matching resources
   */
  async searchAllResources(query) {
    if (this.isInitialized && this.client) {
      try {
        const scope = `projects/${process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT}`;
        const request = {
          scope,
          query,
        };

        const [resources] = await this.client.searchAllResources(request);

        logger.info(`🔍 Asset Inventory: Found ${resources.length} resources for query "${query}"`);
        return resources;
      } catch (e) {
        logger.error(`❌ Asset Inventory searchAllResources failed: ${e.message}`);
      }
    }

    logger.info(`🔍 Asset Inventory Mock: searchAllResources("${query}")`);
    return [];
  }

  /**
   * Get the history of changes for a specific asset.
   * @param {string} assetName - Full resource name of the asset
   * @returns {Promise<object[]>} Array of historical asset snapshots
   */
  async getAssetHistory(assetName) {
    if (this.isInitialized && this.client) {
      try {
        const parent = `projects/${process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT}`;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const request = {
          parent,
          assetNames: [assetName],
          contentType: 'RESOURCE',
          readTimeWindow: {
            startTime: { seconds: Math.floor(weekAgo.getTime() / 1000) },
            endTime: { seconds: Math.floor(now.getTime() / 1000) },
          },
        };

        const [response] = await this.client.batchGetAssetsHistory(request);
        const history = response.assets || [];

        logger.info(`📜 Asset Inventory: ${history.length} history entries for ${assetName}`);
        return history;
      } catch (e) {
        logger.error(`❌ Asset Inventory getAssetHistory failed: ${e.message}`);
      }
    }

    logger.info(`📜 Asset Inventory Mock: getAssetHistory(${assetName})`);
    return [];
  }
}

export const gcpAssetInventoryService = new GcpAssetInventoryService();

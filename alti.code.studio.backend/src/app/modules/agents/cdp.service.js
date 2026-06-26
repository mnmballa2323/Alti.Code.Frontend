import CDP from 'chrome-remote-interface';
import { logger } from '../../../shared/logger.js';

/**
 * Chrome DevTools Protocol (CDP) Service.
 * Replaces high-level Puppeteer abstractions with direct V8 WebSocket connections,
 * enabling ultra-low latency browser injection and manipulation for the Agent Swarm.
 */
class ChromeDevToolsService {
  constructor() {
    this.client = null;
  }

  /**
   * Connects directly to the Chrome V8 engine via WebSockets.
   */
  async connect() {
    if (!this.client) {
      try {
        // Connects to a running headless Chrome instance on the default debugging port
        this.client = await CDP();
        logger.info(
          '🔌 [CDP] Connected to Chrome V8 Engine via DevTools Protocol.',
        );

        const { Network, Page } = this.client;
        await Network.enable();
        await Page.enable();
      } catch (error) {
        logger.error('❌ [CDP] Failed to connect to Chrome:', error.message);
        throw error;
      }
    }
    return this.client;
  }

  /**
   * Autonomously navigates and injects JavaScript directly into the V8 runtime.
   * @param {string} url
   * @param {string} script
   */
  async navigateAndInject(url, script) {
    try {
      const client = await this.connect();
      const { Page, Runtime } = client;

      logger.info(`🌐 [CDP] Navigating to ${url}...`);
      await Page.navigate({ url });
      await Page.loadEventFired();

      logger.info(`💉 [CDP] Injecting JavaScript into V8 Engine...`);
      const result = await Runtime.evaluate({
        expression: script,
        returnByValue: true,
      });

      logger.info(
        `✅ [CDP] Injection result: ${JSON.stringify(result.result.value)}`,
      );
      return result.result.value;
    } catch (error) {
      logger.error(`❌ [CDP] Injection failed:`, error.message);
      throw error;
    }
  }

  /**
   * Gracefully disconnects from the V8 WebSocket.
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info('🛑 [CDP] Disconnected from Chrome V8 Engine.');
    }
  }
}

export const cdpService = new ChromeDevToolsService();

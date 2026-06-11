/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { AppStoreServerAPIClient, SignedDataVerifier, Environment } from '@apple/app-store-server-library';
import config from '../../../config/index.js';
import { logger } from '../../shared/logger.js';

class AppleStoreService {
  constructor() {
    this.client = null;
    this.verifier = null;
    this.initialized = false;

    this.initialize();
  }

  /**
   * Initializes the Apple App Store Client and Verifier
   */
  initialize() {
    const { keyId, issuerId, bundleId, encodedKey, environment } = config.apple;

    if (!keyId || !issuerId || !encodedKey) {
      logger.warn('⚠️ [AppleStoreService] Configuration missing (keyId, issuerId, or encodedKey). App Store client running in mock-only mode.');
      return;
    }

    try {
      const appleEnv = environment === 'production' ? Environment.PRODUCTION : Environment.SANDBOX;

      // Instantiate API Client
      this.client = new AppStoreServerAPIClient(
        encodedKey,
        keyId,
        issuerId,
        bundleId,
        appleEnv
      );

      // Create Verifier (Uses Apple Root Certificates - load online checks by default)
      // Note: appleRootCAs is normally loaded via certificates, let's initialize it dynamically.
      const appleRootCAs = []; // Can be loaded from filesystem or default platform trusted root CA certs
      this.verifier = new SignedDataVerifier(
        appleRootCAs,
        true, // Enable online checks
        appleEnv,
        bundleId
      );

      this.initialized = true;
      logger.info(`✅ [AppleStoreService] App Store Server API Client successfully initialized in [${environment}] mode.`);
    } catch (error) {
      logger.error('❌ [AppleStoreService] Failed to initialize App Store client:', error.message);
    }
  }

  /**
   * Verifies and decodes a JWS-signed transaction string from Apple.
   * @param {string} signedTransaction 
   * @returns {Promise<Object>} Decoded transaction data
   */
  async verifyTransaction(signedTransaction) {
    if (!this.initialized || !this.verifier) {
      logger.warn('[AppleStoreService] Verifier not initialized. Simulating verification.');
      return { transactionId: 'mock-tx-123', productId: 'premium_sub_annual', purchaseDate: new Date().toISOString() };
    }

    try {
      const decodedTx = await this.verifier.verifyAndDecodeTransaction(signedTransaction);
      logger.info(`[AppleStoreService] Verified transaction: ${decodedTx.transactionId} for product: ${decodedTx.productId}`);
      return decodedTx;
    } catch (error) {
      logger.error('[AppleStoreService] Transaction verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Verifies and decodes App Store server-to-server notifications.
   * @param {string} signedPayload 
   * @returns {Promise<Object>} Decoded notification payload
   */
  async verifyNotification(signedPayload) {
    if (!this.initialized || !this.verifier) {
      logger.warn('[AppleStoreService] Verifier not initialized. Simulating notification decoding.');
      return { notificationType: 'SUBSCRIBED', subtype: 'INITIAL_BUY', data: {} };
    }

    try {
      const decodedNotification = await this.verifier.verifyAndDecodeNotification(signedPayload);
      logger.info(`[AppleStoreService] Decoded App Store notification: ${decodedNotification.notificationType}`);
      return decodedNotification;
    } catch (error) {
      logger.error('[AppleStoreService] Notification verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Fetches transaction history for a transaction ID.
   * @param {string} transactionId 
   * @returns {Promise<Object>} History response
   */
  async getTransactionHistory(transactionId) {
    if (!this.initialized || !this.client) {
      return { revision: 'mock-revision', hasMore: false, transactions: [] };
    }

    try {
      const response = await this.client.getTransactionHistory(transactionId);
      return response;
    } catch (error) {
      logger.error(`[AppleStoreService] Failed to fetch transaction history for ${transactionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Gets the active subscription status for a subscription transaction.
   * @param {string} transactionId 
   * @returns {Promise<Object>} Subscription status response
   */
  async getSubscriptionStatus(transactionId) {
    if (!this.initialized || !this.client) {
      return { status: [{ status: 1, lastTransactions: [] }] };
    }

    try {
      const response = await this.client.getAllSubscriptionStatuses(transactionId);
      return response;
    } catch (error) {
      logger.error(`[AppleStoreService] Failed to get subscription status for ${transactionId}:`, error.message);
      throw error;
    }
  }
}

export const appleStoreService = new AppleStoreService();

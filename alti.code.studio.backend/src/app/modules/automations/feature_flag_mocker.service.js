import { logger } from '../../../shared/logger.js';

class FeatureFlagMockerService {
    constructor() {
        this.overrides = new Map();
    }

    /**
     * Overrides a feature flag value during a test execution scope.
     * @param {string} flagKey - The feature flag key
     * @param {boolean|string|number} value - The override value
     */
    setOverride(flagKey, value) {
        this.overrides.set(flagKey, value);
        logger.info(`🚩 FeatureFlagMocker: Set override for flag [${flagKey}] to: ${value}`);
    }

    /**
     * Resolves the active value of a feature flag. Checks overrides first.
     * @param {string} flagKey - Feature flag key
     * @param {boolean|string|number} defaultValue - Fallback value
     * @returns {boolean|string|number} Active flag value
     */
    getFlagValue(flagKey, defaultValue = false) {
        if (this.overrides.has(flagKey)) {
            const val = this.overrides.get(flagKey);
            logger.debug(`🚩 FeatureFlagMocker: Resolved override value for [${flagKey}]: ${val}`);
            return val;
        }
        return defaultValue;
    }

    /**
     * Clears override for a specific feature flag.
     * @param {string} flagKey 
     */
    removeOverride(flagKey) {
        this.overrides.delete(flagKey);
        logger.info(`🚩 FeatureFlagMocker: Cleared override for flag [${flagKey}]`);
    }

    /**
     * Clears all registered overrides.
     */
    clearAllOverrides() {
        this.overrides.clear();
        logger.info('🚩 FeatureFlagMocker: Cleared all overrides.');
    }
}

export const featureFlagMockerService = new FeatureFlagMockerService();

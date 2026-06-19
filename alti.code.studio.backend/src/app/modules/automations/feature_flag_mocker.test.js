import { describe, it, expect, beforeEach } from 'vitest';
import { featureFlagMockerService } from './feature_flag_mocker.service.js';

describe('FeatureFlagMockerService Tests', () => {
    beforeEach(() => {
        featureFlagMockerService.clearAllOverrides();
    });

    it('should return default values when no overrides are registered', () => {
        const val = featureFlagMockerService.getFlagValue('new-billing-flow', false);
        expect(val).toBe(false);

        const valString = featureFlagMockerService.getFlagValue('variant-name', 'control');
        expect(valString).toBe('control');
    });

    it('should set, retrieve, and remove feature flag overrides successfully', () => {
        // Set overrides
        featureFlagMockerService.setOverride('new-billing-flow', true);
        featureFlagMockerService.setOverride('variant-name', 'experiment-a');

        // Check values
        expect(featureFlagMockerService.getFlagValue('new-billing-flow')).toBe(true);
        expect(featureFlagMockerService.getFlagValue('variant-name')).toBe('experiment-a');

        // Remove single override
        featureFlagMockerService.removeOverride('new-billing-flow');
        expect(featureFlagMockerService.getFlagValue('new-billing-flow', false)).toBe(false);
        expect(featureFlagMockerService.getFlagValue('variant-name')).toBe('experiment-a');
    });

    it('should clear all overrides cleanly', () => {
        featureFlagMockerService.setOverride('flagA', true);
        featureFlagMockerService.setOverride('flagB', true);

        expect(featureFlagMockerService.getFlagValue('flagA')).toBe(true);
        expect(featureFlagMockerService.getFlagValue('flagB')).toBe(true);

        featureFlagMockerService.clearAllOverrides();
        expect(featureFlagMockerService.getFlagValue('flagA', false)).toBe(false);
        expect(featureFlagMockerService.getFlagValue('flagB', false)).toBe(false);
    });
});

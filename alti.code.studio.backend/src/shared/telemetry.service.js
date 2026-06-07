/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import * as resourcesPkg from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { logger } from './logger.js';

// Robustly find Resource
let Resource;
if (resourcesPkg.Resource) {
    Resource = resourcesPkg.Resource;
} else if (resourcesPkg.default && resourcesPkg.default.Resource) {
    Resource = resourcesPkg.default.Resource;
} else {
    // If we can't find Resource class, we might be in a version where we use a factory or it's named differently
    logger.info('OTel Resources Pkg Keys:', Object.keys(resourcesPkg));
    if (resourcesPkg.default) logger.info('OTel Resources Default Keys:', Object.keys(resourcesPkg.default));

    // Fallback: Use a mock or try to use defaultResource() if available to get a Resource instance
    // For now, let's try to grab it from default if it exists, otherwise throw/warn
    logger.warn('⚠️ Could not find Resource constructor in @opentelemetry/resources. Using empty resource.');
    // Mock simple resource to allow startup
    Resource = class MockResource { constructor(attrs) { this.attributes = attrs; } merge() { return this; } };
}

// Define service resource attributes
let resource;
try {
    resource = new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'alti-code-studio-backend',
        [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
    });
} catch (e) {
    logger.error('Failed to create Resource:', e);
    resource = undefined; // SDK might handle undefined resource
}

// Configure the SDK
const sdk = new NodeSDK({
    resource,
    traceExporter: new ConsoleSpanExporter(), // For dev/debug visibility
    instrumentations: [getNodeAutoInstrumentations()],
});

export const telemetryService = {
    start: () => {
        try {
            sdk.start();
            logger.info('📡 OpenTelemetry SDK started');
        } catch (error) {
            logger.error('❌ Error initializing OpenTelemetry SDK', error);
        }
    },
    shutdown: async () => {
        try {
            await sdk.shutdown();
            logger.info('🛑 OpenTelemetry SDK shut down');
        } catch (error) {
            logger.error('❌ Error shutting down OpenTelemetry SDK', error);
        }
    }
};

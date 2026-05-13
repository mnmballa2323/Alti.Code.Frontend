/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import CircuitBreaker from 'opossum';
import { logger } from './logger.js';

const options = {
    timeout: 60000,               // Trigger failure if function takes > 60 seconds (AI models are slow)
    errorThresholdPercentage: 50, // Trip when >= 50% of requests fail
    resetTimeout: 10000,          // After 10 seconds, transition to half-open
    volumeThreshold: 5,           // Min request count before trip logic applies (prevents single-failure trips in dev)
};

export const createCircuitBreaker = (asyncFunction, name = 'Service') => {
    const breaker = new CircuitBreaker(asyncFunction, options);

    // Fallback THROWS — callers expect the wrapped function's return type (e.g. a string).
    // Returning { error, fallback: true } causes silent type mismatches when callers do .replace() etc.
    breaker.fallback(() => {
        const msg = `Service ${name} is currently unavailable. Please try again later.`;
        logger.warn(`⚠️ Circuit Breaker fallback triggered for ${name}.`);
        throw new Error(msg);
    });

    breaker.on('open', () => logger.warn(`🔥 Circuit Breaker OPEN: ${name}`));
    breaker.on('halfOpen', () => logger.info(`⏳ Circuit Breaker HALF-OPEN: ${name}`));
    breaker.on('close', () => logger.info(`✅ Circuit Breaker CLOSED: ${name}`));
    breaker.on('fallback', () => logger.warn(`↩️  Circuit Breaker FALLBACK: ${name}`));

    return breaker;
};


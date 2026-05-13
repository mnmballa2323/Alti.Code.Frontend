/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import CircuitBreaker from 'opossum';
import { logger } from './logger.js';

const options = {
    timeout: 5000, // If function takes longer than 5 seconds, trigger failure
    errorThresholdPercentage: 50, // When 50% of requests fail, trip the breaker
    resetTimeout: 10000 // After 10 seconds, try again (half-open)
};

export const createCircuitBreaker = (asyncFunction, name = 'Service') => {
    const breaker = new CircuitBreaker(asyncFunction, options);

    breaker.fallback(() => {
        logger.warn(`⚠️ Circuit Breaker Open for ${name}. Returning fallback response.`);
        return { error: `Service ${name} is currently unavailable. Please try again later.`, fallback: true };
    });

    breaker.on('open', () => logger.warn(`🔥 Circuit Breaker OPEN: ${name}`));
    breaker.on('halfOpen', () => logger.info(`⏳ Circuit Breaker HALF-OPEN: ${name}`));
    breaker.on('close', () => logger.info(`✅ Circuit Breaker CLOSED: ${name}`));

    return breaker;
};

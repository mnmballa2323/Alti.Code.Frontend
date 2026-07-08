/**
 * Request Metrics Middleware
 * 
 * Automatically tracks API request count and duration for every request.
 */

import { metrics } from '../../shared/metrics.js';
import { structuredLogger } from '../../shared/structuredLogger.js';

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Attach structured logger to request
  req.log = structuredLogger.forRequest(req);

  // Track response
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    metrics.trackApiRequest(req.method, req.originalUrl || req.url, res.statusCode, duration);
    
    // Log slow requests
    if (duration > 5000) {
      req.log.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`, {
        duration,
        statusCode: res.statusCode,
      });
    }

    originalEnd.apply(this, args);
  };

  next();
};

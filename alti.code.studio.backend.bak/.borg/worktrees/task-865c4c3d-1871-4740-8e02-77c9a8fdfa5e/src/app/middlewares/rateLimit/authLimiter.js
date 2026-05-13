/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { RateLimitService } from '../../modules/security/rateLimit.service.js';

const createRateLimiter = (timeInMinutes = 5, maxRequests = 5) => {
  return RateLimitService.middleware(maxRequests, timeInMinutes * 60);
};

export default createRateLimiter;
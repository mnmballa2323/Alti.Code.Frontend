# Pull Request: rate-limiter

## Objective
Implemented a scalable, redis-backed user rate limiting middleware to prevent DDOS.

## Technical Implementation
Added robust token bucket rate limiting via Redis caches.
Modified `rateLimiter.js` to intercept core routes in `api.js`.

## AI Confidence Score
98%

## Verification Steps
1. Spin up local redis container.
2. Hit the /login endpoint 100 times.
3. Assert 429 Too Many Requests response.
import { cache } from '../lib/redis.js';

export const rateLimiter = (options) => {
  return async (req, res, next) => {
    // Identify client by IP (or user ID if available in request auth)
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const authReq = req;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const identifier = auth?.userId || ip;

    // Use a Redis key unique to this rate limiter and client
    const key = `ratelimit:${identifier}:${req.path}`;

    try {
      const currentRequests = await cache.incr(key);

      if (currentRequests > options.maxRequests) {
        return res.status(429).json({
          error: options.message,
          limit: options.maxRequests,
          resetInSeconds: options.windowSeconds,
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      // Fail open to avoid blocking genuine users if caching fails completely
      next();
    }
  };
};

/**
 * High-performance In-Memory Rate Limiting Engine
 * Protects endpoints against brute-force, scraping, and DOS attacks.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Checks and increments rate limit for a specific identifier
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitMap.set(identifier, newRecord);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit helpers for specific API endpoints
 */
export const RateLimiters = {
  // Login: 5 attempts per 15 minutes per IP
  login: (ip: string) => checkRateLimit(`login_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 }),

  // Search: 30 requests per minute
  search: (ip: string) => checkRateLimit(`search_${ip}`, { limit: 30, windowMs: 60 * 1000 }),

  // Comments: 5 submissions per minute
  comments: (ip: string) => checkRateLimit(`comments_${ip}`, { limit: 5, windowMs: 60 * 1000 }),

  // Newsletter: 3 signups per 10 minutes
  newsletter: (ip: string) => checkRateLimit(`newsletter_${ip}`, { limit: 3, windowMs: 10 * 60 * 1000 }),

  // Uploads: 20 uploads per minute per user/IP
  uploads: (userId: string) => checkRateLimit(`uploads_${userId}`, { limit: 20, windowMs: 60 * 1000 }),

  // General API: 120 requests per minute
  generalApi: (ip: string) => checkRateLimit(`api_${ip}`, { limit: 120, windowMs: 60 * 1000 }),
};

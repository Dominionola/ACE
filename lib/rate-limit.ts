/**
 * Simple In-Memory Rate Limiter
 * 
 * ⚠️ NOTE: This works for single-instance deployments.
 * For production with multiple instances, use Upstash or Redis.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number; // milliseconds
}

export function checkRateLimit(
    key: string,
    config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10/hour default
): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean expired entries
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (!current) {
        // First request
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (current.count >= config.maxRequests) {
        // Rate limited
        return {
            success: false,
            remaining: 0,
            resetIn: current.resetTime - now,
        };
    }

    // Increment
    current.count++;
    return {
        success: true,
        remaining: config.maxRequests - current.count,
        resetIn: current.resetTime - now,
    };
}

// Pre-configured limiters for common use cases
export const AI_RATE_LIMIT = { maxRequests: 20, windowMs: 60 * 60 * 1000 }; // 20/hour
export const AUTH_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 }; // 5 per 15 mins

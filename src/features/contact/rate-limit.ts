export interface RateLimiterConfig {
  burstLimit: number;
  burstWindowMs: number;
  hourlyLimit: number;
  hourlyWindowMs: number;
  now: () => number;
}

export interface RateLimiter {
  tryConsume(key: string): boolean;
  reset(): void;
}

interface Bucket {
  burstTimestamps: number[];
  hourlyTimestamps: number[];
}

/**
 * Process-local in-memory rate limiter.
 *
 * Limitation: this reduces abuse per running instance only. It is not a
 * distributed or durable limiter — on serverless/multi-instance
 * deployments each instance keeps its own state, so effective limits are
 * approximate and reset when an instance restarts.
 */
export function createInMemoryRateLimiter(
  config: RateLimiterConfig,
): RateLimiter {
  const buckets = new Map<string, Bucket>();

  function getBucket(key: string): Bucket {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { burstTimestamps: [], hourlyTimestamps: [] };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  function trimWithin(
    timestamps: number[],
    windowMs: number,
    now: number,
  ): number[] {
    return timestamps.filter((timestamp) => now - timestamp < windowMs);
  }

  return {
    tryConsume(key: string): boolean {
      const now = config.now();
      const bucket = getBucket(key);

      bucket.burstTimestamps = trimWithin(
        bucket.burstTimestamps,
        config.burstWindowMs,
        now,
      );
      bucket.hourlyTimestamps = trimWithin(
        bucket.hourlyTimestamps,
        config.hourlyWindowMs,
        now,
      );

      if (bucket.burstTimestamps.length >= config.burstLimit) {
        return false;
      }
      if (bucket.hourlyTimestamps.length >= config.hourlyLimit) {
        return false;
      }

      bucket.burstTimestamps.push(now);
      bucket.hourlyTimestamps.push(now);
      return true;
    },

    reset(): void {
      buckets.clear();
    },
  };
}

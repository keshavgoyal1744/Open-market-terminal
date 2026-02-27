export class FixedWindowRateLimiter {
  constructor() {
    this.buckets = new Map();
  }

  check(key, options = {}) {
    const windowMs = options.windowMs ?? 60_000;
    const max = options.max ?? 10;
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      const next = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, next);
      return { allowed: true, remaining: max - 1, resetAt: next.resetAt };
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);
    return {
      allowed: bucket.count <= max,
      remaining: Math.max(max - bucket.count, 0),
      resetAt: bucket.resetAt,
    };
  }
}

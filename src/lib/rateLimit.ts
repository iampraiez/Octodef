export const runtime = "nodejs";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

interface RateLimitOptions {
  interval: number; // in milliseconds
  limit: number;
}

export function rateLimit(ip: string, options: RateLimitOptions = { interval: 60 * 1000, limit: 5 }): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > options.interval) {
    record.count = 1;
    record.lastReset = now;
    return true;
  }

  if (record.count >= options.limit) {
    return false;
  }

  record.count++;
  return true;
}

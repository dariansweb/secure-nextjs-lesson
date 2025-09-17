// Simple in-memory rate limiter for middleware
const attempts = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(
  ip: string,
  maxAttempts = 10,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const key = ip;
  const record = attempts.get(key);

  if (!record || now > record.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

export function clearRateLimit(ip: string): void {
  attempts.delete(ip);
}

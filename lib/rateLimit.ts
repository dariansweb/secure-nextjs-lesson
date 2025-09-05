// lib/rateLimit.ts
import type { Ratelimit as RatelimitType } from "@upstash/ratelimit";

let loginRateLimit: { limit: (key: string) => Promise<{ success: boolean }> };

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
  // Lazy import to avoid throwing at module load if envs are missing
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });

  loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5/min per IP
    prefix: "rl:login",
  }) as unknown as RatelimitType; // type chill-pill
} else {
  // No-op limiter for local dev without Upstash envs
  loginRateLimit = {
    limit: async () => ({ success: true }),
  };
}

export { loginRateLimit };

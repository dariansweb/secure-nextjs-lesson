// lib/userVersion.ts
// Goal: use Upstash Redis when valid envs exist; otherwise no-op (or memory fallback in dev).

type Store = {
  get: (k: string) => Promise<number | string | null>;
  set: (k: string, v: string | number) => Promise<unknown>;
  incr: (k: string) => Promise<number>;
  exists?: (k: string) => Promise<number>;
};

// --- helpers ---
function isValidHttpsUrl(u?: string | null) {
  if (!u) return false;
  try {
    const url = new URL(u);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// If either missing or URL not https, we’ll disable Upstash in dev
const USE_UPSTASH = isValidHttpsUrl(UPSTASH_URL) && !!UPSTASH_TOKEN;

// Memory fallback (dev-only convenience). Note: Edge/middleware won’t share this memory.

// Extend globalThis to include __uvStore
declare global {
  var __uvStore: Map<string, number> | undefined;
}

class MemoryStore implements Store {
  // Persist across reloads in dev by hanging it on globalThis
  private m: Map<string, number>;
  constructor() {
    globalThis.__uvStore = globalThis.__uvStore ?? new Map<string, number>();
    this.m = globalThis.__uvStore;
  }
  async get(k: string) {
    return this.m.get(k) ?? null;
  }
  async set(k: string, v: number | string) {
    this.m.set(k, Number(v));
    return;
  }
  async incr(k: string) {
    const n = (this.m.get(k) ?? 0) + 1;
    this.m.set(k, n);
    return n;
  }
  async exists(k: string) {
    return this.m.has(k) ? 1 : 0;
  }
}

let store: Store | null = null;
const hasStore = USE_UPSTASH;

if (USE_UPSTASH) {
  // Lazy import so local dev without valid envs doesn’t crash
  const { Redis } = await import("@upstash/redis");
  store = new Redis({
    url: UPSTASH_URL!,
    token: UPSTASH_TOKEN!,
  }) as unknown as Store;
} else {
  // Comment out the next line if you want a strict no-op instead of memory fallback.
  store = new MemoryStore();
  // If you want STRICT no-op, set `store = null;` and leave `hasStore = false;`
  // hasStore = false; // uncomment to disable entirely
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[userVersion] Upstash disabled in dev (missing/invalid https URL). Using memory fallback."
    );
  }
}

const key = (userId: string) => `uv:${userId}`;

export async function getUserVersion(userId: string): Promise<number> {
  if (!store) return 1; // no-op path
  const v = await store.get(key(userId));
  if (v == null) {
    await store.set(key(userId), 1);
    return 1;
  }
  return typeof v === "number" ? v : parseInt(String(v), 10) || 1;
}

export async function bumpUserVersion(userId: string): Promise<number> {
  if (!store) return 1; // no-op path
  if (typeof store.incr === "function") {
    return await store.incr(key(userId));
  }
  // Minimal fallback if incr is missing
  const cur = await getUserVersion(userId);
  const next = cur + 1;
  await store.set(key(userId), next);
  return next;
}

export { hasStore };

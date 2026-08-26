// Simple in-memory TTL cache for API responses
const cache = new Map<string, { data: unknown; expiresAt: number }>();

// Stats for debugging
let hitCount = 0;
let missCount = 0;

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    missCount++;
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    missCount++;
    return null;
  }
  hitCount++;
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs: number = 30_000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function getCacheStats() {
  return { hitCount, missCount, size: cache.size };
}

// Auto-cleanup every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}, 60_000);

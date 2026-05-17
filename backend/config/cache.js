// In-memory simple TTL Cache for Cost & API Efficiency (Section 6 Compliance)
class TTLCache {
  constructor(defaultTTLSeconds = 60) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = null) {
    const ttl = (ttlSeconds !== null ? ttlSeconds : this.defaultTTL / 1000) * 1000;
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const reportsCache = new TTLCache(30); // 30 seconds cache for high-compute dashboard stats

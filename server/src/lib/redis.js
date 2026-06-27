import Redis from 'ioredis';

class InMemoryCache {
  store = new Map();

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key) {
    this.store.delete(key);
  }

  async incr(key) {
    const valStr = await this.get(key);
    let val = valStr ? parseInt(valStr, 10) : 0;
    val += 1;
    // For rate limiting, if it is a new key, let's give it a default TTL of 60s
    await this.set(key, val.toString(), valStr ? undefined : 60);
    return val;
  }
}

let redisClient = null;
let cacheStore;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error. Falling back to in-memory cache:', err.message);
      cacheStore = new InMemoryCache();
    });

    redisClient.on('connect', () => {
      console.log('🔌 Connected to Redis successfully.');
    });

    cacheStore = redisClient;
  } catch (err) {
    console.warn('⚠️ Redis connection failed. Using in-memory cache:', err);
    cacheStore = new InMemoryCache();
  }
} else {
  console.log('ℹ️ No REDIS_URL provided. Using in-memory cache.');
  cacheStore = new InMemoryCache();
}

export const cache = {
  get: async (key) => {
    try {
      return await cacheStore.get(key);
    } catch {
      return null;
    }
  },
  set: async (key, value, ttlSeconds) => {
    try {
      if (ttlSeconds) {
        await cacheStore.set(key, value, 'EX', ttlSeconds);
      } else {
        await cacheStore.set(key, value);
      }
    } catch {
      // In-memory fallback if Redis client fails mid-execution
      if (cacheStore !== redisClient) return;
      console.warn('⚠️ Redis operation failed, falling back to in-memory.');
      cacheStore = new InMemoryCache();
      await cacheStore.set(key, value, ttlSeconds);
    }
  },
  del: async (key) => {
    try {
      await cacheStore.del(key);
    } catch {
      if (cacheStore !== redisClient) return;
      cacheStore = new InMemoryCache();
      await cacheStore.del(key);
    }
  },
  incr: async (key) => {
    try {
      // For ioredis, incr returns the new value
      return await cacheStore.incr(key);
    } catch {
      if (cacheStore !== redisClient) return 1;
      cacheStore = new InMemoryCache();
      return await cacheStore.incr(key);
    }
  }
};

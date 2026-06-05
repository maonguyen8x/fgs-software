import type Redis from "ioredis";
import { logger } from "@/lib/logger";

let client: Redis | null = null;
let initAttempted = false;

async function getClient(): Promise<Redis | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (initAttempted) return client;
  initAttempted = true;

  try {
    const { default: RedisClient } = await import("ioredis");
    client = new RedisClient(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 2000,
      commandTimeout: 1500,
    });
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connect timeout")), 2500)
      ),
    ]);
    return client;
  } catch (error) {
    logger.warn("Redis unavailable, using Next.js cache only", { error: String(error) });
    client = null;
    return null;
  }
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const redis = await getClient();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = await getClient();
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn("Redis set failed", { key, error: String(error) });
  }
}

export async function redisDel(key: string): Promise<void> {
  const redis = await getClient();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    logger.warn("Redis del failed", { key, error: String(error) });
  }
}

export async function redisInvalidatePrefix(prefix: string): Promise<void> {
  const redis = await getClient();
  if (!redis) return;
  try {
    const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = redis.pipeline();
    let batch = 0;
    for await (const keys of stream) {
      if (keys.length) {
        pipeline.del(...(keys as string[]));
        batch++;
      }
    }
    if (batch > 0) await pipeline.exec();
  } catch (error) {
    logger.warn("Redis invalidate failed", { prefix, error: String(error) });
  }
}

export async function withRedisCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await redisGet<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  await redisSet(key, data, ttlSeconds);
  return data;
}

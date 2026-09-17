/**
 * Tiny JSON document store with optimistic versioning.
 *
 * - Deployed: Upstash Redis over REST (Vercel's Redis/KV integration sets
 *   KV_REST_API_URL + KV_REST_API_TOKEN; UPSTASH_REDIS_REST_* also work).
 * - Local dev: a JSON file under .data/ (not usable on read-only serverless disks).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

type Env = Record<string, string | undefined>;

export interface Versioned<T> {
  version: number;
  value: T;
}

export interface Store {
  get<T>(key: string): Promise<Versioned<T> | null>;
  /** Writes only if the stored version still equals `expected` (0 = not stored yet). */
  setIfVersion<T>(key: string, expected: number, value: T): Promise<boolean>;
}

// Compare-and-set in one round trip, so two visitors can't both move at once.
const CAS_SCRIPT = `
local cur = redis.call('GET', KEYS[1])
local v = 0
if cur then v = cjson.decode(cur).version end
if v ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1`;

function redisStore(url: string, token: string): Store {
  const call = async (command: (string | number)[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    const json = (await res.json()) as { result?: unknown; error?: string };
    if (!res.ok || json.error) throw new Error(`redis: ${json.error ?? res.status}`);
    return json.result;
  };
  return {
    async get(key) {
      const raw = (await call(['GET', key])) as string | null;
      return raw ? JSON.parse(raw) : null;
    },
    async setIfVersion(key, expected, value) {
      const doc = JSON.stringify({ version: expected + 1, value });
      return (await call(['EVAL', CAS_SCRIPT, 1, key, expected, doc])) === 1;
    },
  };
}

function fileStore(dir: string): Store {
  let queue = Promise.resolve();
  const file = (key: string) => path.join(dir, `${key.replace(/[^a-z0-9_-]/gi, '_')}.json`);
  const read = async (key: string) => {
    try {
      return JSON.parse(await fs.readFile(file(key), 'utf8'));
    } catch {
      return null;
    }
  };
  return {
    get: read,
    setIfVersion(key, expected, value) {
      // Serialize writes within this process.
      const run = queue.then(async () => {
        const current = await read(key);
        if ((current?.version ?? 0) !== expected) return false;
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file(key), JSON.stringify({ version: expected + 1, value }, null, 2));
        return true;
      });
      queue = run.then(() => undefined, () => undefined);
      return run;
    },
  };
}

export function getStore(env: Env): Store | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return redisStore(url, token);
  if (env.VERCEL) return null; // no writable disk in production
  return fileStore(path.resolve('.data'));
}

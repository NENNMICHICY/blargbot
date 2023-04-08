import type { RedisClientType } from 'redis';
import type { RedisLockProvider } from 'redis-lock';
import createRedisLock from 'redis-lock';

import type { ConditionalProp } from './ConditionalProp.js';
import type { IKVCache } from './IKVCache.js';
import type { ISerializer } from './ISerializer.js';

export class RedisKVCache<Key, Value> implements IKVCache<Key, Value> {
    readonly #redis: RedisClientType;
    readonly #ttlS?: number;
    readonly #toKey: (key: Key) => string;
    readonly #serializer: ISerializer<Value>;
    readonly #lock: RedisLockProvider;
    readonly #keyspace: string;

    public constructor(redis: RedisClientType, options: RedisKVCacheOptions<Key, Value>) {
        this.#redis = redis;
        this.#lock = createRedisLock(redis, options.lockRetryMs);
        this.#ttlS = options.ttlS ?? undefined;
        const toKey = options.keyFactory ?? (v => v.toString());
        const keyspace = this.#keyspace = options.keyspace;
        this.#toKey = v => `${keyspace}:${toKey(v)}`;
        this.#serializer = options.serializer ?? {
            read: value => JSON.parse(value) as Value,
            write: value => JSON.stringify(value)
        };
    }

    public async lock(key: Key): Promise<() => Promise<void>> {
        return await this.#lock(this.#toKey(key));
    }

    public async size(): Promise<number> {
        let size = 0;
        for await (const _ of this.#redis.scanIterator({ MATCH: `${this.#keyspace}:*`, TYPE: 'string' }))
            size++;
        return size;
    }

    public async clear(): Promise<void> {
        const ops = new Set();
        for await (const element of this.#redis.scanIterator({ MATCH: `${this.#keyspace}:*`, TYPE: 'string' })) {
            const p = this.#redis.del(element).catch(() => 0);
            ops.add(p);
            p.finally(ops.delete.bind(ops, p));
        }
        await Promise.all(ops);
    }

    public async get(key: Key): Promise<Value | undefined> {
        const resultStr = await this.#redis.get(this.#toKey(key));
        if (resultStr === null)
            return undefined;
        return await this.#serializer.read(resultStr);
    }

    public async set(key: Key, value: Value): Promise<void> {
        await this.#redis.set(this.#toKey(key), await this.#serializer.write(value), { EX: this.#ttlS });
    }

    public async setAll(values: Iterable<[key: Key, value: Value]>): Promise<void> {
        const setArg = await Promise.all(Array.from(values, async ([key, value]) => [this.#toKey(key), await this.#serializer.write(value)] as [string, string]));
        if (setArg.length > 0)
            await this.#redis.mSet(setArg);
    }

    public async delete(key: Key): Promise<void> {
        await this.#redis.del(this.#toKey(key));
    }

    public async pop(key: Key): Promise<Value | undefined> {
        const resultStr = await this.#redis.getDel(this.#toKey(key));
        if (resultStr === null)
            return undefined;
        return await this.#serializer.read(resultStr);
    }
}

export type RedisKVCacheOptions<Key, Value> = RedisKVCacheOptionsBase<Value>
    & ConditionalProp<'keyFactory', Key, string, string | number | bigint | boolean>

interface RedisKVCacheOptionsBase<Value> {
    readonly keyspace: string;
    readonly ttlS: number | null;
    readonly serializer?: ISerializer<Value>;
    readonly lockRetryMs?: number;
}

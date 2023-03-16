import type { BBTagRuntime, EntityQueryService, FindEntityOptions } from '@bbtag/blargbot';

export type SelectResult<T> =
    | { readonly state: 'NO_OPTIONS' | 'TIMED_OUT' | 'CANCELLED' | 'FAILED'; }
    | { readonly state: 'SUCCESS'; value: T; }

type QueryCache = BBTagRuntime['queryCache'];
type CacheType = {
    [P in keyof QueryCache as QueryCache[P] extends Record<string, unknown> ? P : never]: QueryCache[P] extends Record<string, infer R> ? NonNullable<R> : never;
}

export interface QueryServiceOptions<State, Key extends keyof CacheType, Result> {
    readonly cacheKey: Key;
    readonly alertNotFound?: (query: string, context: BBTagRuntime) => Promise<void>;
    readonly alertCancelled?: (query: string, context: BBTagRuntime) => Promise<void>;
    readonly getById: (id: CacheType[Key], context: BBTagRuntime) => Awaitable<State | undefined>;
    readonly find: (query: string | undefined, context: BBTagRuntime) => Awaitable<State[]>;
    readonly pickBest: (choices: State[], query: string, context: BBTagRuntime) => Promise<SelectResult<State>>;
    readonly getId: (value: State) => CacheType[Key] | undefined;
    readonly getResult: (value: State) => Result;
}

export function createEntityQueryService<State, Result, Key extends keyof CacheType>(options: QueryServiceOptions<State, Key, Result>): EntityQueryService<Result>['querySingle'] {
    const { cacheKey, getById, getId, find, pickBest, alertCancelled, alertNotFound, getResult } = options;

    return async function querySingle(context, query, options) {
        const entity = await querySingleCore(context, query, options);
        return entity !== undefined ? getResult(entity) : undefined;
    };

    function getCache(context: BBTagRuntime): Record<string, CacheType[Key] | undefined> {
        return context.queryCache[cacheKey];
    }

    async function querySingleCore(context: BBTagRuntime, query: string, { noLookup, noErrors }: FindEntityOptions = {}): Promise<State | undefined> {
        noLookup ||= context.scopes.local.quiet === true;
        noErrors ||= context.scopes.local.noLookupErrors === true;

        const cache = getCache(context);
        const cached = cache[query];
        if (cached !== undefined)
            return await getById(cached, context);

        const entities = await find(query, context);
        if (entities.length <= 1 || context.queryCache.count >= 5 || noLookup) {
            if (entities.length > 1)
                return undefined;

            cache[query] = getId(entities[0]);
            return entities[0];
        }

        const result = await pickBest(entities, query, context);
        switch (result.state) {
            case 'FAILED':
            case 'NO_OPTIONS':
                if (!noErrors && alertNotFound !== undefined) {
                    await alertNotFound(query, context);
                    context.queryCache.count++;
                }

                return undefined;
            case 'TIMED_OUT':
            case 'CANCELLED':
                context.queryCache.count = Infinity;
                if (!noErrors)
                    await alertCancelled?.(query, context);

                return undefined;
            case 'SUCCESS':
                cache[query] = getId(result.value);
                return result.value;
        }
    }
}

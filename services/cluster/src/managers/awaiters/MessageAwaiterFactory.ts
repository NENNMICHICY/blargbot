import type { Logger } from '@blargbot/logger';
import type * as Eris from 'eris';

import type { Awaiter } from './Awaiter.js';
import { AwaiterFactoryBase } from './AwaiterFactoryBase.js';

export class MessageAwaiterFactory extends AwaiterFactoryBase<Eris.KnownMessage> {
    public constructor(logger: Logger) {
        super(logger);
    }

    protected getPoolId(message: Eris.KnownMessage): string {
        return message.channel.id;
    }

    public getAwaiter(pools: Iterable<string>, check?: (item: Eris.KnownMessage) => Awaitable<boolean>, timeout?: number): Awaiter<Eris.KnownMessage>;
    public getAwaiter<T extends Eris.Textable & Eris.Channel>(pools: Iterable<T>, check?: (item: Eris.Message<T>) => Awaitable<boolean>, timeout?: number): Awaiter<Eris.Message<T>>;
    public getAwaiter(pools: Iterable<string | Eris.KnownTextableChannel>, check?: (item: Eris.KnownMessage) => Awaitable<boolean>, timeout?: number): Awaiter<Eris.KnownMessage> {
        return super.getAwaiter(getIds(pools), check, timeout);
    }
}

function* getIds(pools: Iterable<string | Eris.KnownTextableChannel>): Iterable<string> {
    for (const pool of pools)
        yield typeof pool === 'string' ? pool : pool.id;
}

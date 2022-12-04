import type { SubtagArgumentArray } from '../arguments/index.js';
import type { BBTagContext } from '../BBTagContext.js';
import type { SubtagCall } from '../language/index.js';
import type { SubtagLogic } from './SubtagLogic.js';
import { SubtagLogicWrapper } from './SubtagLogicWrapper.js';

export class ArrayOrValueSubtagLogicWrapper<T extends { toString(): string; }> extends SubtagLogicWrapper {
    public constructor(public readonly logic: SubtagLogic<Awaitable<T | AsyncIterable<unknown> | Iterable<unknown> | undefined | void>>) {
        super();
    }

    protected async *getResults(context: BBTagContext, args: SubtagArgumentArray, subtag: SubtagCall): AsyncIterable<string | undefined> {
        const values = await this.logic.execute(context, args, subtag);
        if (values === undefined)
            return;

        if (Array.isArray(values))
            return yield JSON.stringify(values);

        if (!this.isIterable(values))
            return yield values.toString();

        const result = [];
        for await (const item of this.toAsyncIterable(values)) {
            yield undefined;
            result.push(item);
        }

        yield JSON.stringify(result);
    }
}

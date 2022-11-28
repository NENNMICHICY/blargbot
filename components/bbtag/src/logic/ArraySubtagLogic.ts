import { SubtagArgumentArray } from '../arguments';
import { BBTagContext } from '../BBTagContext';
import { BBTagRuntimeError } from '../errors';
import { SubtagCall } from '../language';
import { SubtagLogic } from './SubtagLogic';
import { SubtagLogicWrapper } from './SubtagLogicWrapper';

export class ArraySubtagLogic extends SubtagLogicWrapper {
    public constructor(public readonly logic: SubtagLogic<Awaitable<AsyncIterable<unknown> | Iterable<unknown> | undefined>>) {
        super();
    }

    protected async *getResults(context: BBTagContext, args: SubtagArgumentArray, subtag: SubtagCall): AsyncIterable<string | undefined> {
        const values = await this.logic.execute(context, args, subtag);
        if (values === undefined)
            return;

        if (Array.isArray(values))
            return yield JSON.stringify(values);

        const result = [];
        try {
            for await (const item of this.toAsyncIterable(values)) {
                yield undefined;
                result.push(item);
            }
        } catch (err: unknown) {
            if (!(err instanceof BBTagRuntimeError))
                throw err;
            result.push(context.addError(err, subtag));
        }

        yield JSON.stringify(result);
    }
}

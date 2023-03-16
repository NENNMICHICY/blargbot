import type { SubtagArgumentArray } from '../arguments/index.js';
import type { BBTagCall } from '../BBTagCall.js';
import type { BBTagScript } from '../BBTagScript.js';
import type { SubtagLogic } from './SubtagLogic.js';
import { SubtagLogicWrapper } from './SubtagLogicWrapper.js';

export class IgnoreSubtagLogic<T> extends SubtagLogicWrapper {
    public constructor(public readonly logic: SubtagLogic<Awaitable<T>>) {
        super();
    }

    protected async getResults(context: BBTagScript, args: SubtagArgumentArray, subtag: BBTagCall): Promise<string> {
        await this.logic.execute(context, args, subtag);
        return '';
    }
}

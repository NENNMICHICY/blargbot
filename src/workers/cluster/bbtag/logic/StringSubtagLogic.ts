import { SubtagArgumentArray, SubtagCall, SubtagLogic } from '@cluster/types';

import { BBTagContext } from '../BBTagContext';
import { SubtagLogicWrapper } from './SubtagLogicWrapper';

export class StringSubtagLogic extends SubtagLogicWrapper {
    public constructor(public readonly logic: SubtagLogic<Awaitable<string>>) {
        super();
    }

    protected async getResults(context: BBTagContext, args: SubtagArgumentArray, subtag: SubtagCall): Promise<[string]> {
        return [await this.logic.execute(context, args, subtag)];
    }
}

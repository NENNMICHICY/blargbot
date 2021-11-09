import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ParamsArraySubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'paramsarray',
            category: SubtagType.BOT,
            definition: [
                {
                    parameters: [],
                    description: 'Gets the parameters passed to the current function as an array',
                    exampleCode: '{func.test;{paramsarray}}\n{func.test;a;b;c;d}',
                    exampleOut: '["a","b","c","d"]',
                    execute: (ctx) => this.getParamsArray(ctx)
                }
            ]
        });
    }

    public getParamsArray(context: BBTagContext): string {
        const params = context.scopes.local.paramsarray;
        if (params === undefined)
            throw new BBTagRuntimeError('{paramsarray} can only be used inside {function}');
        return JSON.stringify(params);
    }
}

import { compare, parse } from '@blargbot/core/utils/index.js';

import { subtagParameter as p } from '../../execution/parameters/index.js';
import { Subtag } from '../../execution/Subtag.js';
import { BBTagRuntimeError, NotAnArrayError } from '../../errors/index.js';
import { bbtag, SubtagType } from '../../utils/index.js';

export class JsonSortSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonSort',
            category: SubtagType.JSON,
            aliases: ['jSort'],
            definition: [
                {
                    parameters: ['array', 'path', 'descending?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'json[]|nothing',
                    execute: (ctx, [array, path, descending]) => this.jsonSort(ctx, array.value, path.value, descending.value)
                }
            ]
        });
    }

    public async jsonSort(context: BBTagContext, arrStr: string, pathStr: string, descStr: string): Promise<JArray | undefined> {
        const descending = parse.boolean(descStr) ?? descStr !== '';
        const obj = await bbtag.json.resolveObj(context, arrStr);
        if (!Array.isArray(obj.object))
            throw new NotAnArrayError(arrStr);

        const path = bbtag.json.getPathKeys(pathStr);
        const orderMult = descending ? -1 : 1;

        obj.object = obj.object.map(v => ({ value: v, sortKey: bbtag.json.get(v, path) }))
            .map((v, i, a) => {
                if (v.sortKey === undefined)
                    throw new BBTagRuntimeError(`Cannot read property ${pathStr} at index ${i}, ${a.filter(x => x.sortKey === undefined).length} total failures`);
                return { value: v.value, sortKey: parse.string(v.sortKey) };
            })
            .sort((a, b) => orderMult * compare(a.sortKey, b.sortKey))
            .map(x => x.value);

        if (obj.variable === undefined)
            return obj.object;

        await context.variables.set(obj.variable, obj.object);
        return undefined;
    }
}

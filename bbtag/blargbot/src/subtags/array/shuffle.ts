import { randomInt } from 'node:crypto';

import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { NotAnArrayError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import type { BBTagArrayTools } from '../../utils/index.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.shuffle;

@Subtag.id('shuffle')
@Subtag.ctorArgs('arrayTools')
export class ShuffleSubtag extends CompiledSubtag {
    readonly #arrayTools: BBTagArrayTools;

    public constructor(arrayTools: BBTagArrayTools) {
        super({
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: [],
                    description: tag.args.description,
                    exampleCode: tag.args.exampleCode,
                    exampleIn: tag.args.exampleIn,
                    exampleOut: tag.args.exampleOut,
                    returns: 'nothing',
                    execute: (ctx) => this.shuffleInput(ctx)
                },
                {
                    parameters: ['array'],
                    description: tag.array.description,
                    exampleCode: tag.array.exampleCode,
                    exampleOut: tag.array.exampleOut,
                    returns: 'json[]|nothing',
                    execute: (ctx, [array]) => this.shuffle(ctx, array.value)
                }
            ]
        });

        this.#arrayTools = arrayTools;
    }

    public shuffleInput(context: BBTagScript): void {
        this.#shuffle(context.input);
    }

    public async shuffle(context: BBTagScript, array: string): Promise<JArray | undefined> {
        const arr = this.#arrayTools.deserialize(array);
        if (arr === undefined)
            throw new NotAnArrayError(array);

        this.#shuffle(arr.v);
        if (arr.n === undefined)
            return arr.v;

        await context.runtime.variables.set(arr.n, arr.v);
        return undefined;
    }

    #shuffle<T>(array: T[]): void {
        for (let i = 0; i < array.length; i++) {
            const j = randomInt(array.length);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

import { parse } from '@blargbot/core/utils';

import { SubtagArgument } from '../../arguments';
import { CompiledSubtag } from '../../compilation';
import { BBTagRuntimeError, NotANumberError } from '../../errors';
import templates from '../../text';
import { SubtagType } from '../../utils';

const tag = templates.subtags.choose;

export class ChooseSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'choose',
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['choice', '~options+'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'string',
                    execute: (_, [choice, ...options]) => this.choose(choice.value, options)
                }
            ]
        });
    }
    public choose(
        choice: string,
        options: SubtagArgument[]
    ): Promise<string> | string {
        const index = parse.int(choice);

        if (index === undefined)
            throw new NotANumberError(choice);

        if (index < 0)
            throw new BBTagRuntimeError('Choice cannot be negative');

        if (index >= options.length)
            throw new BBTagRuntimeError('Index out of range');

        return options[index].wait();
    }
}

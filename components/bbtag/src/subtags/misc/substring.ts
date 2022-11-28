import { Lazy } from '@blargbot/core/Lazy';
import { parse } from '@blargbot/core/utils';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { NotANumberError } from '../../errors';
import templates from '../../text';
import { SubtagType } from '../../utils';

const tag = templates.subtags.substring;

export class SubstringSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'substring',
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['text', 'start', 'end?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'string',
                    execute: (ctx, [text, start, end]) => this.substring(ctx, text.value, start.value, end.value)
                }
            ]
        });
    }

    public substring(context: BBTagContext, text: string, startStr: string, endStr: string): string {
        const fallback = new Lazy(() => parse.int(context.scopes.local.fallback ?? ''));
        const start = parse.int(startStr) ?? fallback.value;
        if (start === undefined)
            throw new NotANumberError(startStr);

        const end = endStr === '' ? text.length : parse.int(endStr) ?? fallback.value;
        if (end === undefined)
            throw new NotANumberError(endStr);

        return text.substring(start, end);
    }
}

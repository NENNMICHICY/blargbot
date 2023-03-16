import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { NotAnArrayError, NotANumberError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import type { BBTagArrayTools } from '../../utils/index.js';
import { SubtagType } from '../../utils/index.js';
import { Lazy } from '../../utils/Lazy.js';
import type { BBTagValueConverter } from '../../utils/valueConverter.js';

const tag = textTemplates.subtags.slice;

@Subtag.id('slice')
@Subtag.ctorArgs('arrayTools', 'converter')
export class SliceSubtag extends CompiledSubtag {
    readonly #arrayTools: BBTagArrayTools;
    readonly #converter: BBTagValueConverter;

    public constructor(arrayTools: BBTagArrayTools, converter: BBTagValueConverter) {
        super({
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: ['array', 'start', 'end?:999999999999'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'json[]',
                    execute: (ctx, [array, start, end]) => this.slice(ctx, array.value, start.value, end.value)
                }
            ]
        });

        this.#arrayTools = arrayTools;
        this.#converter = converter;
    }

    public async slice(context: BBTagScript, array: string, startStr: string, endStr: string): Promise<JArray> {
        const arr = await this.#arrayTools.deserializeOrGetArray(context.runtime, array);
        const fallback = new Lazy(() => this.#converter.int(context.runtime.scopes.local.fallback ?? ''));

        if (arr === undefined)
            throw new NotAnArrayError(array);

        const start = this.#converter.int(startStr) ?? fallback.value;
        if (start === undefined)
            throw new NotANumberError(startStr);

        const end = this.#converter.int(endStr) ?? fallback.value;
        if (end === undefined)
            throw new NotANumberError(endStr);

        return arr.v.slice(start, end);
    }
}

import { randomInt } from 'node:crypto';

import { Lazy } from '@blargbot/core/Lazy.js';

import type { BBTagContext } from '../../BBTagContext.js';
import type { BBTagValueConverter } from '../../BBTagUtilities.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { NotANumberError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.randomInt;

@Subtag.names('randomInt', 'randInt')
@Subtag.ctorArgs(Subtag.converter())
export class RandomIntSubtag extends CompiledSubtag {
    readonly #converter: BBTagValueConverter;

    public constructor(converter: BBTagValueConverter) {
        super({
            category: SubtagType.MATH,
            definition: [
                {
                    parameters: ['min?:0', 'max'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'number',
                    execute: (ctx, [min, max]) => this.randInt(ctx, min.value, max.value)
                }
            ]
        });

        this.#converter = converter;
    }

    public randInt(
        context: BBTagContext,
        minStr: string,
        maxStr: string
    ): number {
        const fallback = new Lazy(() => this.#converter.int(context.scopes.local.fallback ?? ''));
        const min = this.#converter.int(minStr) ?? fallback.value;
        if (min === undefined)
            throw new NotANumberError(minStr);

        const max = this.#converter.int(maxStr) ?? fallback.value;
        if (max === undefined)
            throw new NotANumberError(maxStr);

        return randomInt(min, max);
    }
}

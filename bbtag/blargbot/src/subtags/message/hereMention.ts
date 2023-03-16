import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';
import type { BBTagValueConverter } from '../../utils/valueConverter.js';

const tag = textTemplates.subtags.hereMention;

@Subtag.id('hereMention', 'here')
@Subtag.ctorArgs('converter')
export class HereMentionSubtag extends CompiledSubtag {
    readonly #converter: BBTagValueConverter;

    public constructor(converter: BBTagValueConverter) {
        super({
            category: SubtagType.MESSAGE,
            definition: [
                {
                    parameters: ['mention?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'string',
                    execute: (ctx, [mention]) => this.hereMention(ctx, mention.value)
                }
            ]
        });

        this.#converter = converter;
    }

    public hereMention(
        context: BBTagScript,
        mention: string
    ): string {
        const enabled = this.#converter.boolean(mention, true);
        context.runtime.outputOptions.allowEveryone = enabled;
        return '@here';
    }
}

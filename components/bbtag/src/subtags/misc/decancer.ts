import { decancer } from '@blargbot/decancer';

import { CompiledSubtag } from '../../compilation/index.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.decancer;

@Subtag.names('decancer')
@Subtag.ctorArgs()
export class DecancerSubtag extends CompiledSubtag {
    public constructor() {
        super({
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['text'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'string',
                    execute: (_, [text]) => this.decancer(text.value)
                }
            ]
        });
    }

    public decancer(text: string): string {
        return decancer(text);
    }
}

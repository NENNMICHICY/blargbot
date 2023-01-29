import { CompiledSubtag } from '../../compilation/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.base64Decode;

@Subtag.names('base64Decode', 'aToB')
@Subtag.ctorArgs()
export class Base64DecodeSubtag extends CompiledSubtag {
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
                    execute: (_, [text]) => this.decode(text.value)
                }
            ]
        });
    }

    public decode(base64: string): string {
        return Buffer.from(base64, 'base64').toString();
    }
}

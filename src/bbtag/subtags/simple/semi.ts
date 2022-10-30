import { CompiledSubtag } from '../../compilation';
import templates from '../../text';
import { SubtagType } from '../../utils';

const tag = templates.subtags.semi;

export class SemiSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'semi',
            category: SubtagType.SIMPLE,
            definition: [
                {
                    parameters: [],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'string',
                    execute: () => this.getSemiColon()
                }
            ]
        });
    }

    public getSemiColon(): ';' {
        return ';';
    }
}

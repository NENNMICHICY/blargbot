import type { BBTagContext } from '../../BBTagContext.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.reason;

@Subtag.names('reason')
@Subtag.ctorArgs()
export class ReasonSubtag extends CompiledSubtag {
    public constructor() {
        super({
            category: SubtagType.BOT,
            definition: [
                {
                    parameters: ['reason?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'nothing',
                    execute: (ctx, [reason]) => this.setReason(ctx, reason.value)
                }
            ]
        });
    }

    public setReason(context: BBTagContext, reason: string): void {
        context.scopes.local.reason = reason;

    }
}

import { guard } from '@blargbot/core/utils/index.js';

import type { BBTagContext } from '../../BBTagContext.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { ChannelNotFoundError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.channelIsThread;

@Subtag.id('channelIsThread', 'isThread')
@Subtag.ctorArgs()
export class ChannelIsThreadSubtag extends CompiledSubtag {
    public constructor() {
        super({
            category: SubtagType.CHANNEL,
            definition: [
                {
                    parameters: [],
                    description: tag.current.description,
                    exampleCode: tag.current.exampleCode,
                    exampleOut: tag.current.exampleOut,
                    returns: 'boolean',
                    execute: (ctx) => this.isThreadChannel(ctx, ctx.channel.id, true)
                },
                {
                    parameters: ['channel', 'quiet?'],
                    description: tag.channel.description,
                    exampleCode: tag.channel.exampleCode,
                    exampleOut: tag.channel.exampleOut,
                    returns: 'boolean',
                    execute: (ctx, [channel, quiet]) => this.isThreadChannel(ctx, channel.value, quiet.value !== '')
                }
            ]
        });
    }

    public async isThreadChannel(
        context: BBTagContext,
        channelStr: string,
        quiet: boolean
    ): Promise<boolean> {
        quiet ||= context.scopes.local.quiet ?? false;
        const channel = await context.queryChannel(channelStr, { noLookup: quiet });
        if (channel === undefined) {
            throw new ChannelNotFoundError(channelStr)
                .withDisplay(quiet ? '' : undefined);
        }
        return guard.isThreadChannel(channel);
    }
}

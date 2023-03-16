import { isThreadChannel } from '@blargbot/discord-util';

import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { ChannelNotFoundError } from '../../errors/index.js';
import type { ChannelService } from '../../services/ChannelService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.channelIsThread;

@Subtag.id('channelIsThread', 'isThread')
@Subtag.ctorArgs('channels')
export class ChannelIsThreadSubtag extends CompiledSubtag {
    readonly #channels: ChannelService;

    public constructor(channels: ChannelService) {
        super({
            category: SubtagType.CHANNEL,
            definition: [
                {
                    parameters: [],
                    description: tag.current.description,
                    exampleCode: tag.current.exampleCode,
                    exampleOut: tag.current.exampleOut,
                    returns: 'boolean',
                    execute: (ctx) => this.isThreadChannel(ctx, ctx.runtime.channel.id, true)
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

        this.#channels = channels;
    }

    public async isThreadChannel(
        context: BBTagScript,
        channelStr: string,
        quiet: boolean
    ): Promise<boolean> {
        quiet ||= context.runtime.scopes.local.quiet ?? false;
        const channel = await this.#channels.querySingle(context.runtime, channelStr, { noLookup: quiet });
        if (channel === undefined) {
            throw new ChannelNotFoundError(channelStr)
                .withDisplay(quiet ? '' : undefined);
        }
        return isThreadChannel(channel);
    }
}

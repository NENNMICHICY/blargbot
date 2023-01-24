import type { BBTagContext } from '../../BBTagContext.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { ChannelNotFoundError, MessageNotFoundError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.messageText;

@Subtag.id('messageText', 'text')
@Subtag.ctorArgs()
export class MessageTextSubtag extends CompiledSubtag {
    public constructor() {
        super({
            category: SubtagType.MESSAGE,
            definition: [
                {
                    parameters: [],
                    description: tag.trigger.description,
                    exampleCode: tag.trigger.exampleCode,
                    exampleOut: tag.trigger.exampleOut,
                    returns: 'string',
                    execute: (ctx) => this.getMessageText(ctx, ctx.channel.id, ctx.message.id, false)
                },
                {
                    parameters: ['messageid'],
                    description: tag.inCurrent.description,
                    exampleCode: tag.inCurrent.exampleCode,
                    exampleOut: tag.inCurrent.exampleOut,
                    returns: 'string',
                    execute: (ctx, [messageId]) => this.getMessageText(ctx, ctx.channel.id, messageId.value, false)
                },
                {
                    parameters: ['channel', 'messageid', 'quiet?'],
                    description: tag.inOther.description,
                    exampleCode: tag.inOther.exampleCode,
                    exampleOut: tag.inOther.exampleOut,
                    returns: 'string',
                    execute: (ctx, [channel, messageId, quiet]) => this.getMessageText(ctx, channel.value, messageId.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getMessageText(
        context: BBTagContext,
        channelStr: string,
        messageStr: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const channel = await context.queryChannel(channelStr, { noLookup: quiet });
        if (channel === undefined) {
            throw new ChannelNotFoundError(channelStr)
                .withDisplay(quiet ? '' : undefined);
        }

        const message = await context.getMessage(channel, messageStr);
        if (message === undefined) {
            throw new MessageNotFoundError(channel.id, messageStr)
                .withDisplay(quiet ? '' : undefined);
        }

        return message.content;

    }
}

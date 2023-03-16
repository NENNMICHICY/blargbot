import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { ChannelNotFoundError, MessageNotFoundError } from '../../errors/index.js';
import type { ChannelService } from '../../services/ChannelService.js';
import type { MessageService } from '../../services/MessageService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.messageType;

@Subtag.id('messageType')
@Subtag.ctorArgs('channels', 'messages')
export class MessageTypeSubtag extends CompiledSubtag {
    readonly #channels: ChannelService;
    readonly #messages: MessageService;

    public constructor(channels: ChannelService, messages: MessageService) {
        super({
            category: SubtagType.MESSAGE,
            description: tag.description,
            definition: [
                {
                    parameters: [],
                    description: tag.trigger.description,
                    exampleCode: tag.trigger.exampleCode,
                    exampleOut: tag.trigger.exampleOut,
                    returns: 'number',
                    execute: (ctx) => this.getCurrentMessageType(ctx)
                },
                {
                    parameters: ['channel?', 'messageID'],
                    description: tag.other.description,
                    exampleCode: tag.other.exampleCode,
                    exampleOut: tag.other.exampleOut,
                    returns: 'number',
                    execute: (ctx, [channel, messageId]) => this.getMessageType(ctx, channel.value, messageId.value)
                }
            ]
        });

        this.#channels = channels;
        this.#messages = messages;
    }

    public async getCurrentMessageType(
        context: BBTagScript
    ): Promise<number> {
        const msg = await this.#messages.get(context.runtime, context.runtime.channel.id, context.runtime.message.id);
        if (msg === undefined)
            throw new MessageNotFoundError(context.runtime.channel.id, context.runtime.message.id);
        return msg.type;
    }

    public async getMessageType(
        context: BBTagScript,
        channelStr: string,
        messageId: string
    ): Promise<number> {
        const channel = await this.#channels.querySingle(context.runtime, channelStr);
        if (channel === undefined)
            throw new ChannelNotFoundError(channelStr);

        const message = await this.#messages.get(context.runtime, channel.id, messageId);
        if (message === undefined)
            throw new MessageNotFoundError(channel.id, messageId);

        return message.type;
    }
}

import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { BBTagRuntimeError, UserNotFoundError } from '../../errors/index.js';
import type { ChannelService } from '../../services/ChannelService.js';
import type { MessageService } from '../../services/MessageService.js';
import type { UserService } from '../../services/UserService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';
import type { BBTagValueConverter } from '../../utils/valueConverter.js';

const tag = textTemplates.subtags.dm;

@Subtag.id('dm')
@Subtag.ctorArgs('converter', 'users', 'channels', 'messages')
export class DMSubtag extends CompiledSubtag {
    readonly #dmCache: DMCache = {};
    readonly #converter: BBTagValueConverter;
    readonly #users: UserService;
    readonly #channels: ChannelService;
    readonly #messages: MessageService;

    public constructor(converter: BBTagValueConverter, users: UserService, channels: ChannelService, messages: MessageService) {
        super({
            category: SubtagType.USER,
            definition: [
                {
                    parameters: ['user', 'message'],
                    description: tag.text.description,
                    exampleCode: tag.text.exampleCode,
                    exampleOut: tag.text.exampleOut
                },
                {
                    parameters: ['user', 'embed'],
                    description: tag.embed.description,
                    exampleCode: tag.embed.exampleCode,
                    exampleOut: tag.embed.exampleOut
                },
                {
                    parameters: ['user', 'content'],
                    returns: 'nothing',
                    execute: (ctx, [user, content]) => this.sendDm(ctx, user.value, content.value, undefined)
                },
                {
                    parameters: ['user', 'message', 'embed'],
                    description: tag.full.description,
                    exampleCode: tag.full.exampleCode,
                    exampleOut: tag.full.exampleOut,
                    returns: 'nothing',
                    execute: (ctx, [user, message, embed]) => this.sendDm(ctx, user.value, message.value, embed.value)
                }
            ]
        });

        this.#converter = converter;
        this.#users = users;
        this.#channels = channels;
        this.#messages = messages;
    }

    public async sendDm(
        context: BBTagScript,
        userStr: string,
        messageStr: string,
        embedStr?: string
    ): Promise<void> {
        const user = await this.#users.querySingle(context.runtime, userStr);
        if (user === undefined)
            throw new UserNotFoundError(userStr);

        const messageAsEmbeds = embedStr === undefined ? this.#converter.embed(messageStr) : undefined;
        const embeds = messageAsEmbeds ?? this.#converter.embed(embedStr, { allowMalformed: true });
        const content = messageAsEmbeds === undefined ? messageStr : undefined;

        let cache = this.#dmCache[user.id];
        const channelId = await this.#channels.getDmChannelId(context.runtime, user.id);
        if (cache === undefined ||
            cache.count > 5 ||
            cache.user !== context.runtime.user.id ||
            cache.guild !== context.runtime.guild.id) {
            // Ew we're gonna send a message first? It was voted...
            // TODO: Maybe change to a footer embed on every DM? I dont think its possible to disable embeds in DMs
            const result = await this.#messages.create(context.runtime, channelId, { content: `The following message was sent from **__${context.runtime.guild.name}__** (${context.runtime.guild.id}), and was sent by **__${context.runtime.user.username}#${context.runtime.user.discriminator}__** (${context.runtime.user.id}):` });
            if (result === undefined || 'error' in result)
                throw new BBTagRuntimeError('Could not send DM');
            cache = this.#dmCache[user.id] = { user: context.runtime.user.id, guild: context.runtime.guild.id, count: 1 };
        }

        const result = await this.#messages.create(context.runtime, channelId, { content, embeds });
        if (result === undefined || 'error' in result)
            throw new BBTagRuntimeError('Could not send DM');
        cache.count++;
    }
}

interface DMCache {
    [index: string]: {
        guild: string;
        count: number;
        user: string;
    } | undefined;
}

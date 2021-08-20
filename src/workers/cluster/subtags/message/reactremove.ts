import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { parse, SubtagType } from '@cluster/utils';
import { DiscordAPIError, EmbedFieldData, MessageEmbedOptions } from 'discord.js';

export class ReactRemoveSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'reactremove',
            category: SubtagType.API,
            aliases: ['removereact'],
            definition: [//! overwritten
                {
                    parameters: ['channelID?', 'messageID'], // [channelID];<messageID>;[user];[reactions...]
                    execute: (ctx, args, subtag) => this.removeReactions(ctx, subtag, args.map(arg => arg.value))
                },
                {
                    parameters: ['channelID', 'messageID', 'user', 'reactions+'], // [channelID];<messageID>;[user];[reactions...]
                    execute: (ctx, args, subtag) => this.removeReactions(ctx, subtag, args.map(arg => arg.value))
                }
            ]
        });
    }

    public async removeReactions(
        context: BBTagContext,
        subtag: SubtagCall,
        args: string[]
    ): Promise<string | void> {
        let channel;
        let message;
        // Check if the first "emote" is actually a valid channel
        channel = await context.queryChannel(args[0], {noLookup: true});
        if (channel === undefined)
            channel = context.channel;
        else
            args.shift();
        const permissions = channel.permissionsFor(context.discord.user);
        if (permissions === null || !permissions.has('MANAGE_MESSAGES'))
            return this.customError('I need to be able to Manage Messages to remove reactions', context, subtag);
        // Check that the current first "emote" is a message id
        try {
            message = await context.util.getMessage(channel, args[0]);
        } catch (e: unknown) {
            // NOOP
        }
        args.shift();
        if (message === undefined)
            return this.noMessageFound(context, subtag);

        if (!(await context.isStaff || context.ownsMessage(message.id)))
            return this.customError('Author must be staff to modify unrelated messages', context, subtag);

        // Loop through the "emotes" and check if each is a user. If it is not, then break
        let user = await context.queryUser(args[0], {noErrors: context.scope.noLookupErrors, noLookup: true});
        if (user === undefined)
            user = context.user;
        else
            args.shift();
        // Find all actual emotes in remaining emotes
        let parsedEmojis = parse.emoji(args.join('|'), true);

        if (parsedEmojis.length === 0 && args.length !== 0)
            return this.customError('Invalid Emojis', context, subtag);

        // Default to all emotes
        if (parsedEmojis.length === 0)
            parsedEmojis = [...message.reactions.cache.keys()];

        const errored = [];
        for (const reaction of parsedEmojis) {
            if (!message.reactions.cache.has(reaction))
                continue;

            try {
                if (await context.limit.check(context, subtag, 'reactremove:requests') === undefined) {
                    await message.reactions.cache.get(reaction)?.users.remove(user);
                }
            } catch (err: unknown) {
                if (err instanceof DiscordAPIError) {
                    switch (err.code) {
                        case 10014:
                            errored.push(reaction);
                            break;
                        case 50013:
                            return this.customError('I need to be able to Manage Messages to remove reactions', context, subtag);
                        default:
                            throw err;
                    }
                }

            }
        }

        if (errored.length > 0)
            return this.customError('Unknown Emoji: ' + errored.join(', '), context, subtag);
    }

    public enrichDocs(embed: MessageEmbedOptions): MessageEmbedOptions {
        const limitField = <EmbedFieldData>embed.fields?.pop();

        embed.fields = [
            {
                name: 'Usage',
                value: '```\n{reactremove;[channelID];<messageID>}```\n`channelID` defaults to the current channel if omitted\n\n' +
                    'Removes all reactions of the executing user from `messageID` in `channelID`.\n\n' +
                    '**Example code:**\n> {reactremove;12345678901234}\n' +
                    '**Example out:**\n> (removed all reactions on 12345678901234)'
            },
            {
                name: '\u200b',
                value: '```\n{reactremove;[channelID];<messageID>;<user>;[reactions]}```\n`channelID` defaults to the current channel if omitted\n' +
                    '`reactions` defaults to all reactions if left blank or omitted\n\n' +
                    'Removes `reactions` `user` reacted on `messageID` in `channelID`.\n' +
                    '**Example code:**\n> {reactremove;12345678901234;111111111111111111;🤔}\n' +
                    '**Example out:**\n> (removed the 🤔 reaction on 12345678901234 from user 111111111111111111)'
            },
            {
                ...limitField
            }
        ];

        return embed;
    }
}

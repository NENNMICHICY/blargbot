import { clamp, discord, guard } from '@blargbot/core/utils/index.js';
import { Emote } from '@blargbot/discord-emote';

import type { BBTagContext } from '../../BBTagContext.js';
import type { BBTagUtilities, BBTagValueConverter } from '../../BBTagUtilities.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { BBTagRuntimeError, NotANumberError, UserNotFoundError } from '../../errors/index.js';
import type { Statement } from '../../language/index.js';
import { parseBBTag } from '../../language/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import type { BBTagArrayTools } from '../../utils/index.js';
import { overrides, SubtagType } from '../../utils/index.js';

const tag = templates.subtags.waitReaction;

const defaultCondition = parseBBTag('true');

@Subtag.id('waitReaction', 'waitReact')
@Subtag.ctorArgs(Subtag.util(), Subtag.arrayTools(), Subtag.converter())
export class WaitReactionSubtag extends CompiledSubtag {
    readonly #util: BBTagUtilities;
    readonly #arrayTools: BBTagArrayTools;
    readonly #converter: BBTagValueConverter;

    public constructor(util: BBTagUtilities, arrayTools: BBTagArrayTools, converter: BBTagValueConverter) {
        super({
            category: SubtagType.MESSAGE,
            description: tag.description({ disabled: overrides.waitreaction }),
            definition: [
                {
                    parameters: ['messages', 'userIDs?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleIn: tag.default.exampleIn,
                    exampleOut: tag.default.exampleOut,
                    returns: 'id[]',
                    execute: (ctx, [messages, userIDs]) => this.awaitReaction(ctx, messages.value, userIDs.value, '', defaultCondition, '60')
                },
                {
                    parameters: ['messages', 'userIDs', 'reactions', '~condition?:true', 'timeout?:60'],
                    description: tag.filtered.description,
                    exampleCode: tag.filtered.exampleCode,
                    exampleIn: tag.filtered.exampleIn,
                    exampleOut: tag.filtered.exampleOut,
                    returns: 'string[]',
                    execute: (ctx, [messages, userIDs, reactions, condition, timeout]) => this.awaitReaction(ctx, messages.value, userIDs.value, reactions.value, condition.code, timeout.value)
                }
            ]
        });

        this.#util = util;
        this.#arrayTools = arrayTools;
        this.#converter = converter;
    }

    public async awaitReaction(
        context: BBTagContext,
        messageStr: string,
        userIDStr: string,
        reactions: string,
        condition: Statement,
        timeoutStr: string
    ): Promise<[channelId: string, messageId: string, userId: string, emoji: string]> {
        const messages = this.#arrayTools.flattenArray([messageStr]).map(i => this.#converter.string(i));
        const users = await context.bulkLookup(userIDStr, i => context.queryUser(i, { noErrors: true, noLookup: true }), UserNotFoundError)
            ?? [context.user];

        // parse reactions
        let parsedReactions: Emote[] | undefined;
        if (reactions !== '') {
            parsedReactions = this.#arrayTools.flattenArray([reactions]).map(i => this.#converter.string(i)).flatMap(i => Emote.findAll(i));
            parsedReactions = [...new Set(parsedReactions)];
            if (parsedReactions.length === 0)
                throw new BBTagRuntimeError('Invalid Emojis');
        } else {
            parsedReactions = undefined;
        }

        const timeout = clamp(this.#converter.float(timeoutStr) ?? NaN, 0, 300);
        if (isNaN(timeout))
            throw new NotANumberError(timeoutStr);

        if (condition.values.length === 0)
            condition = defaultCondition;

        const userSet = new Set(users.map(u => u.id));
        const reactionSet = new Set(parsedReactions?.map(r => r.toString()));
        const checkReaction = reactionSet.size === 0 ? () => true : (emoji: Emote) => reactionSet.has(emoji.toString());
        const result = await this.#util.awaitReaction(messages, async ({ user, reaction, message }) => {
            if (!userSet.has(user.id) || !checkReaction(reaction) || !guard.isGuildMessage(message))
                return false;

            const resultStr = await context.withScope(scope => {
                scope.reaction = reaction.toString();
                scope.reactUser = user.id;
                return context.withChild({ message }, context => context.eval(condition));
            });
            const result = this.#converter.boolean(resultStr.trim());
            if (result === undefined)
                throw new BBTagRuntimeError('Condition must return \'true\' or \'false\'', `Actually returned ${JSON.stringify(resultStr)}`);
            return result;
        }, timeout * 1000);

        if (result === undefined)
            throw new BBTagRuntimeError(`Wait timed out after ${timeout * 1000}`);

        return [result.message.channel.id, result.message.id, result.user.id, discord.emojiString(result.reaction)];
    }
}

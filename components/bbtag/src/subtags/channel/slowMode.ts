import * as Eris from 'eris';

import type { BBTagContext } from '../../BBTagContext.js';
import type { BBTagValueConverter } from '../../BBTagUtilities.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { BBTagRuntimeError } from '../../errors/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.slowMode;

@Subtag.id('slowMode')
@Subtag.ctorArgs(Subtag.converter())
export class SlowModeSubtag extends CompiledSubtag {
    readonly #converter: BBTagValueConverter;

    public constructor(converter: BBTagValueConverter) {
        super({
            category: SubtagType.CHANNEL,
            definition: [
                {
                    parameters: [],
                    description: tag.clearCurrent.description,
                    exampleCode: tag.clearCurrent.exampleCode,
                    exampleOut: tag.clearCurrent.exampleOut,
                    returns: 'nothing',
                    execute: (ctx) => this.setSlowmode(ctx, ctx.channel.id, '0')
                },
                {
                    parameters: ['channel|time'],
                    returns: 'nothing',
                    execute: (ctx, [arg]) => this.setSlowmode(ctx, arg.value, '')
                },
                {
                    parameters: ['channel'],
                    description: tag.clearChannel.description,
                    exampleCode: tag.clearChannel.exampleCode,
                    exampleOut: tag.clearChannel.exampleOut
                },
                {
                    parameters: ['time'],
                    description: tag.setCurrent.description,
                    exampleCode: tag.setCurrent.exampleCode,
                    exampleOut: tag.setCurrent.exampleOut
                },
                {
                    parameters: ['channel', 'time:0'],
                    description: tag.setChannel.description, //TODO thank backwards compatibility
                    exampleCode: tag.setChannel.exampleCode,
                    exampleOut: tag.setChannel.exampleOut,
                    returns: 'nothing',
                    execute: (ctx, [channel, time]) => this.setSlowmode(ctx, channel.value, time.value)
                }
            ]
        });

        this.#converter = converter;
    }

    public async setSlowmode(
        context: BBTagContext,
        channelStr: string,
        timeStr: string
    ): Promise<void> {
        let time = this.#converter.int(timeStr);
        let channel;
        const lookupChannel = await context.queryChannel(channelStr, { noLookup: true });//TODO yikes
        if (lookupChannel !== undefined)
            channel = lookupChannel;
        else {
            channel = context.channel;
            time = this.#converter.int(channelStr);
        }

        if (time === undefined)
            time = 0;

        time = Math.min(time, 21600);

        try {
            await channel.edit({ rateLimitPerUser: time }, context.auditReason());
        } catch (err: unknown) {
            if (!(err instanceof Eris.DiscordRESTError))
                throw err;

            throw new BBTagRuntimeError('Missing required permissions', err.message);
        }
    }
}

import { CommandType, guard } from '@blargbot/cluster/utils/index.js';
import { parse } from '@blargbot/core/utils/index.js';
import moment from 'moment-timezone';

import type { CommandContext } from '../../command/index.js';
import { GlobalCommand } from '../../command/index.js';
import templates from '../../text.js';
import type { CommandResult } from '../../types.js';

const cmd = templates.commands.remind;

export class TimerCommand extends GlobalCommand {
    public constructor() {
        super({
            name: 'remind',
            aliases: ['remindme'],
            category: CommandType.GENERAL,
            flags: [
                { flag: 'c', word: 'channel', description: cmd.flags.channel },
                { flag: 't', word: 'time', description: cmd.flags.time }
            ],
            definitions: [
                {
                    parameters: '{~message+}',
                    description: cmd.default.description,
                    execute: (ctx, [message], { c: channel, t: time }) => this.addTimer(ctx, time?.merge().value, message.asString, channel !== undefined)
                }
            ]
        });
    }

    public async addTimer(context: CommandContext, durationStr: string | undefined, message: string, inChannel: boolean): Promise<CommandResult> {
        if (durationStr === undefined)
            return cmd.default.durationRequired;

        const duration = parse.duration(durationStr);
        if (duration === undefined || duration.asMilliseconds() <= 0)
            return cmd.default.durationZero;

        if (message.length === 0)
            return cmd.default.reminderMissing;

        const channel = inChannel && guard.isGuildCommandContext(context) ? context.channel : await context.author.getDMChannel();
        const source = inChannel && guard.isGuildCommandContext(context) ? context.channel.guild.id : context.author.id;

        await context.cluster.timeouts.insert('remind', {
            source: source,
            user: context.author.id,
            channel: channel.id,
            endtime: moment().add(duration).valueOf(),
            content: message
        });

        return cmd.default.success[context.channel === channel ? 'here' : 'dm']({ duration });
    }

}

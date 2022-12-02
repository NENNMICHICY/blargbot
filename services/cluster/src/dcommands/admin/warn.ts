import { CommandResult, GuildCommandContext } from '@blargbot/cluster/types.js';
import { CommandType, parse } from '@blargbot/cluster/utils/index.js';
import { FlagResult } from '@blargbot/domain/models/index.js';
import { util } from '@blargbot/formatting';
import * as Eris from 'eris';

import { GuildCommand } from '../../command/index.js';
import templates from '../../text.js';

const cmd = templates.commands.warn;

export class WarnCommand extends GuildCommand {
    public constructor() {
        super({
            name: 'warn',
            category: CommandType.ADMIN,
            flags: [
                { flag: 'r', word: 'reason', description: cmd.flags.reason },
                { flag: 'c', word: 'count', description: cmd.flags.count }
            ],
            definitions: [
                {
                    parameters: '{user:member+}',
                    description: cmd.default.description,
                    execute: (ctx, [user], flags) => this.warn(ctx, user.asMember, flags)
                }
            ]
        });
    }

    public async warn(context: GuildCommandContext, member: Eris.Member, flags: FlagResult): Promise<CommandResult> {
        const reason = flags.r?.merge().value;
        const countStr = flags.c?.merge().value ?? '1';
        const count = parse.int(countStr, { strict: true }) ?? NaN;

        const result = await context.cluster.moderation.warns.warn(member, context.author, context.discord.user, count, util.literal(reason));
        if (result.state === 'success')
            return cmd.default.state.success[result.type]({ user: member.user, count, warnings: result.warnings });

        const res = cmd.default.state[result.state];
        return typeof res === 'function'
            ? res({ user: member.user, count, value: countStr, action: cmd.actions[result.type] })
            : res;
    }
}

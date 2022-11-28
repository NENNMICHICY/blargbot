import { CommandContext, GlobalImageCommand } from '../../command/index';
import { guard } from '@blargbot/cluster/utils';
import { parse } from '@blargbot/core/utils/parse';
import Eris from 'eris';

import templates from '../../text';
import { CommandResult } from '../../types';

const cmd = templates.commands.art;

export class ArtCommand extends GlobalImageCommand {
    public constructor() {
        super({
            name: 'art',
            flags: [
                { flag: 'i', word: 'image', description: cmd.flags.image }
            ],
            definitions: [
                {
                    parameters: '{user:user+}',
                    description: cmd.user.description,
                    execute: (ctx, [user]) => this.renderUser(ctx, user.asUser)
                },
                {
                    parameters: '',
                    description: cmd.default.description,
                    execute: (ctx, _, flags) => this.render(
                        ctx,
                        ctx.message.attachments.length > 0
                            ? ctx.message.attachments[0].url
                            : flags.i?.merge().value
                            ?? ctx.author.avatarURL
                    )
                }
            ]
        });
    }

    public async renderUser(context: CommandContext, user: Eris.User): Promise<CommandResult> {
        return await this.render(context, user.avatarURL);
    }

    public async render(context: CommandContext, url: string): Promise<CommandResult> {
        url = parse.url(url);
        if (!guard.isUrl(url))
            return cmd.default.invalidUrl({ url });

        return await this.renderImage(context, 'art', { avatar: url });
    }
}

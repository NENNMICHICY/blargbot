import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { discordUtil, mapping, SubtagType } from '@cluster/utils';
import { EditChannelOptions } from 'eris';

export class ChannelEditSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'channeledit',
            category: SubtagType.API,
            definition: [
                {
                    parameters: ['channel', 'options?:{}'],
                    description: 'Edits a channel with the given information.\n' +
                        '`options` is a JSON object, containing any or all of the following properties:\n' +
                        '- `name`\n' +
                        '- `topic`\n' +
                        '- `nsfw`\n' +
                        '- `parentID`\n' +
                        '- `reason` (displayed in audit log)\n' +
                        '- `rateLimitPerUser`\n' +
                        '- `bitrate` (voice)\n' +
                        '- `userLimit` (voice)\n' +
                        'Returns the channel\'s ID.',
                    exampleCode: '{channeledit;11111111111111111;{j;{"name": "super-cool-channel"}}}',
                    exampleOut: '11111111111111111',
                    execute: (ctx, args, subtag) => this.channelEdit(ctx, [...args.map(arg => arg.value), '{}'], subtag)
                }
            ]
        });
    }

    public async channelEdit(
        context: BBTagContext,
        args: string[],
        subtag: SubtagCall
    ): Promise<string> {
        const channel = await context.getChannel(args[0]);

        if (channel === undefined)
            return this.customError('Channel does not exist', context, subtag);//TODO no channel found error

        const permission = channel.permissionsOf(context.authorizer);

        if (!permission.has('manageChannels'))
            return this.customError('Author cannot edit this channel', context, subtag);

        let options: EditChannelOptions;
        try {
            const mapped = mapOptions(args[1]);
            if (!mapped.valid)
                return this.customError('Invalid JSON', context, subtag);
            options = mapped.value;
        } catch (e: unknown) {
            return this.customError('Invalid JSON', context, subtag);
        }

        try {
            const fullReason = discordUtil.formatAuditReason(
                context.user,
                context.scope.reason ?? ''
            );
            await channel.edit(options, fullReason);
            if (context.guild.channels.get(channel.id) === undefined)
                context.guild.channels.add(channel);
            return channel.id;
        } catch (err: unknown) {
            context.logger.error(err);
            return this.customError('Failed to edit channel: no perms', context, subtag);
        }
    }
}

const mapOptions = mapping.mapJson(
    mapping.mapObject<EditChannelOptions>({
        bitrate: mapping.mapOptionalNumber,
        icon: mapping.mapOptionalString,
        name: mapping.mapOptionalString,
        nsfw: mapping.mapOptionalBoolean,
        ownerID: mapping.mapOptionalString,
        parentID: mapping.mapOptionalString,
        rateLimitPerUser: mapping.mapOptionalNumber,
        topic: mapping.mapOptionalString,
        userLimit: mapping.mapOptionalNumber
    })
);

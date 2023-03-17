import type { Entities } from '@bbtag/blargbot';
import { ChannelIsThreadSubtag } from '@bbtag/blargbot/subtags';
import Discord from '@blargbot/discord-types';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetChannelPropTestCases } from './_getChannelPropTest.js';

runSubtagTests({
    subtag: ChannelIsThreadSubtag,
    argCountBounds: { min: 0, max: 2 },
    cases: [
        ...createGetChannelPropTestCases({
            quiet: '',
            includeNoArgs: true,
            generateCode(...args) {
                return `{${['channelisthread', ...args].join(';')}}`;
            },
            cases: Object.values<{ [P in Entities.Channel['type']]: { type: P; name: string; success: boolean; } }>({
                [Discord.ChannelType.GuildText]: { type: Discord.ChannelType.GuildText, name: 'GUILD_TEXT', success: false },
                [Discord.ChannelType.GuildVoice]: { type: Discord.ChannelType.GuildVoice, name: 'GUILD_VOICE', success: false },
                [Discord.ChannelType.GuildCategory]: { type: Discord.ChannelType.GuildCategory, name: 'GUILD_CATEGORY', success: false },
                [Discord.ChannelType.GuildAnnouncement]: { type: Discord.ChannelType.GuildAnnouncement, name: 'GUILD_NEWS', success: false },
                [Discord.ChannelType.AnnouncementThread]: { type: Discord.ChannelType.AnnouncementThread, name: 'GUILD_NEWS_THREAD', success: true },
                [Discord.ChannelType.PublicThread]: { type: Discord.ChannelType.PublicThread, name: 'GUILD_PUBLIC_THREAD', success: true },
                [Discord.ChannelType.PrivateThread]: { type: Discord.ChannelType.PrivateThread, name: 'GUILD_PRIVATE_THREAD', success: true },
                [Discord.ChannelType.GuildStageVoice]: { type: Discord.ChannelType.GuildStageVoice, name: 'GUILD_STAGE_VOICE', success: false },
                [Discord.ChannelType.GuildForum]: { type: Discord.ChannelType.GuildForum, name: 'GUILD_FORUM', success: false }
            }).map(({ type, name, success }) => ({
                title: `Channel is a ${name} (${type})`,
                expected: success.toString(),
                setup(channel) {
                    channel.type = type;
                }
            }))
        })
    ]
});

import { ChannelIsTextSubtag } from '@blargbot/bbtag/subtags/channel/channelIsText.js';
import Eris from 'eris';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetChannelPropTestCases } from './_getChannelPropTest.js';

runSubtagTests({
    subtag: new ChannelIsTextSubtag(),
    argCountBounds: { min: 0, max: 2 },
    cases: [
        ...createGetChannelPropTestCases({
            quiet: '',
            includeNoArgs: true,
            generateCode(...args) {
                return `{${['channelistext', ...args].join(';')}}`;
            },
            cases: Object.entries({
                ['GUILD_TEXT']: true,
                ['GUILD_VOICE']: true,
                ['GUILD_CATEGORY']: false,
                ['GUILD_NEWS']: true,
                ['GUILD_STORE']: false,
                ['GUILD_NEWS_THREAD']: true,
                ['GUILD_PUBLIC_THREAD']: true,
                ['GUILD_PRIVATE_THREAD']: true,
                ['GUILD_STAGE_VOICE']: false
            }).map(([key, success]) => ({
                title: `Channel is a ${key} (${Eris.Constants.ChannelTypes[key]})`,
                expected: success.toString(),
                setup(channel) {
                    channel.type = Eris.Constants.ChannelTypes[key];
                }
            }))

        })
    ]
});

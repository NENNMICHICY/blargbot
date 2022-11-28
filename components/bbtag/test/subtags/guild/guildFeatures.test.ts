import { GuildFeaturesSubtag } from '@blargbot/bbtag/subtags/guild/guildFeatures';
import { GuildFeature } from 'discord-api-types/v9';
import { Constants } from 'eris';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new GuildFeaturesSubtag(),
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{guildfeatures}',
            expected: JSON.stringify(Constants.GuildFeatures),
            setup(ctx) {
                ctx.guild.features = Constants.GuildFeatures as GuildFeature[];
            }
        },
        {
            code: '{guildfeatures}',
            expected: '[]',
            setup(ctx) {
                ctx.guild.features = [];
            }
        }
    ]
});

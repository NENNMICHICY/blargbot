import { GuildMembersSubtag } from '@blargbot/bbtag/subtags/guild/guildMembers.js';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: new GuildMembersSubtag(),
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{guildmembers}',
            expected: '["384975638795634547536","329467864239864324","378962875436678423","237846384639462874","23746392746789426394"]',
            setup(ctx) {
                ctx.users.owner.id = '384975638795634547536';
                ctx.users.command.id = '329467864239864324';
                ctx.users.authorizer.id = '378962875436678423';
                ctx.users.other.id = '237846384639462874';
                ctx.users.bot.id = '23746392746789426394';
            },
            postSetup(bbctx, ctx) {
                ctx.util.setup(m => m.ensureMemberCache(bbctx.guild)).thenResolve(undefined);
            }
        }
    ]
});

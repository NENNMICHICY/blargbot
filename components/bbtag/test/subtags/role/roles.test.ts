import { RolesSubtag } from '@blargbot/bbtag/subtags/role/roles.js';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetUserPropTestCases } from '../user/_getUserPropTest.js';

runSubtagTests({
    subtag: new RolesSubtag(),
    argCountBounds: { min: 0, max: 2 },
    cases: [
        {
            code: '{roles}',
            expected: '["2938476294246234","394085735375349786","394085735375349785","340987563405745430","394850730479533405","923874043782332894732"]',
            setup(ctx) {
                ctx.roles.top.id = '2938476294246234';
                ctx.roles.authorizer.id = '394085735375349786';
                ctx.roles.command.id = '394085735375349785';
                ctx.roles.other.id = '340987563405745430';
                ctx.roles.bot.id = '394850730479533405';
                ctx.roles.everyone.id = '923874043782332894732';
                ctx.guild.id = '923874043782332894732';
                ctx.channels.command.guild_id = '923874043782332894732';
            }
        },
        ...createGetUserPropTestCases({
            quiet: '',
            includeNoArgs: false,
            generateCode(...args) {
                return `{${['roles', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: '[]',
                    setup(member) {
                        member.roles = [];
                    }
                },
                {
                    expected: '["098765434512212678"]',
                    setup(member) {
                        member.roles = ['098765434512212678'];
                    }
                },
                {
                    expected: '["098765434512212678","1234567890987654"]',
                    setup(member) {
                        member.roles = ['098765434512212678', '1234567890987654'];
                    }
                }
            ]
        })
    ]
});

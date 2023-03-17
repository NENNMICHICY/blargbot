import { UserTimezoneSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetUserPropTestCases } from './_getUserPropTest.js';

runSubtagTests({
    subtag: UserTimezoneSubtag,
    argCountBounds: { min: 0, max: 2 },
    cases: [
        ...createGetUserPropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['usertimezone', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: 'UTC',
                    postSetup(member, bbctx, ctx) {
                        ctx.inject.timezones.setup(m => m.get(bbctx.runtime, member.id)).thenResolve(undefined);
                    }
                },
                {
                    expected: 'abc',
                    postSetup(member, bbctx, ctx) {
                        ctx.inject.timezones.setup(m => m.get(bbctx.runtime, member.id)).thenResolve('abc');
                    }
                },
                {
                    expected: 'Etc/UTC',
                    postSetup(member, bbctx, ctx) {
                        ctx.inject.timezones.setup(m => m.get(bbctx.runtime, member.id)).thenResolve('Etc/UTC');
                    }
                }
            ]
        })
    ]
});

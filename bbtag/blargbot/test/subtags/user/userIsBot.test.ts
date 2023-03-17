import { UserIsBotSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetUserPropTestCases } from './_getUserPropTest.js';

runSubtagTests({
    subtag: UserIsBotSubtag,
    argCountBounds: { min: 0, max: 2 },
    cases: [
        ...createGetUserPropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['userisbot', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: 'true',
                    setup(member) {
                        member.bot = true;
                    }
                },
                {
                    expected: 'false',
                    setup(member) {
                        member.bot = false;
                    }
                },
                {
                    expected: 'false',
                    setup(member) {
                        member.bot = undefined;
                    }
                }
            ]
        })
    ]
});

import { MessageEditTimeSubtag } from '@bbtag/blargbot/subtags';
import moment from 'moment-timezone';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetMessagePropTestCases } from './_getMessagePropTest.js';

runSubtagTests({
    subtag: MessageEditTimeSubtag,
    argCountBounds: { min: 0, max: 3 },
    cases: [
        ...createGetMessagePropTestCases({
            quiet: false,
            includeNoArgs: true,
            getQueryOptions: () => ({ noLookup: true }),
            generateCode(...args) {
                return `{${['messageedittime', ...args].filter(a => a !== undefined).join(';')}}`;
            },
            cases: [
                {
                    title: 'Not edited',
                    expected: () => moment.tz('Etc/UTC').format('x'),
                    setup(_, message) {
                        message.edited_timestamp = null;
                    },
                    retries: 10
                },
                {
                    title: 'Has been edited',
                    expected: '1609459200000',
                    setup(_, message) {
                        message.edited_timestamp = '2021-01-01T00:00:00+0000';
                    }
                }
            ]
        }),
        ...createGetMessagePropTestCases({
            quiet: false,
            includeNoArgs: true,
            getQueryOptions: () => ({ noLookup: true }),
            generateCode(...args) {
                return `{${['messageedittime', ...args, 'DD/MM/YYYY'].filter(a => a !== undefined).join(';')}}`;
            },
            cases: [
                {
                    title: 'Not edited',
                    expected: () => moment.tz('Etc/UTC').format('DD/MM/YYYY'),
                    setup(_, message) {
                        message.edited_timestamp = null;
                    },
                    retries: 10
                },
                {
                    title: 'Has been edited',
                    expected: '01/01/2021',
                    setup(_, message) {
                        message.edited_timestamp = '2021-01-01T00:00:00+0000';
                    }
                }
            ]
        })
    ]
});

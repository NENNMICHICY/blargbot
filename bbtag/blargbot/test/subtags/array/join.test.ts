import { NotAnArrayError } from '@bbtag/blargbot';
import { GetSubtag, JoinSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: JoinSubtag,
    argCountBounds: { min: 2, max: 2 },
    cases: [
        {
            code: '{join;a;b}',
            expected: '`Not an array`',
            errors: [
                { start: 0, end: 10, error: new NotAnArrayError('a') }
            ]
        },
        { code: '{join;[1,2,3];x}', expected: '1x2x3' },
        { code: '{join;[1];x}', expected: '1' },
        { code: '{join;["a","b","c"];_}', expected: 'a_b_c' },
        {
            code: '{join;arr1;~}',
            expected: 'this~is~arr1',
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { ownerId: 0n, scope: 'local:tag:testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
            }
        },
        {
            code: '{join;var1;~}',
            expected: '`Not an array`',
            errors: [
                { start: 0, end: 13, error: new NotAnArrayError('var1') }
            ],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { ownerId: 0n, scope: 'local:tag:testTag' }, name: 'var1' }, 'This is var1');
            }
        },
        {
            code: '{join;{get;arr1};~}',
            expected: 'this~is~arr1',
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { ownerId: 0n, scope: 'local:tag:testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
            }
        }
    ]
});

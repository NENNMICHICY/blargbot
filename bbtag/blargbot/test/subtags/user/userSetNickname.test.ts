import { randomUUID } from 'node:crypto';

import type { Entities } from '@bbtag/blargbot';
import { Subtag, UserNotFoundError } from '@bbtag/blargbot';
import { UserSetNickSubtag } from '@bbtag/blargbot/subtags';
import { argument } from '@blargbot/test-util/mock.js';

import { MarkerError, runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: Subtag.getDescriptor(UserSetNickSubtag),
    argCountBounds: { min: 1, max: 2 },
    cases: [
        {
            code: '{usersetnick;abc}',
            expected: '',
            postSetup(bbctx, ctx) {
                ctx.dependencies.users.setup(m => m.edit(bbctx.runtime, ctx.users.command.id, argument.isDeepEqual({ nick: 'abc' }))).thenResolve(undefined);
            }
        },
        {
            code: '{usersetnick;abc;other user}',
            expected: '',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock<Entities.User>();
                const userId = randomUUID();
                member.setup(m => m.id).thenReturn(userId);
                ctx.dependencies.users.setup(m => m.querySingle(bbctx.runtime, 'other user'))
                    .verifiable(1)
                    .thenResolve(member.instance);
                ctx.dependencies.users.setup(m => m.edit(bbctx.runtime, userId, argument.isDeepEqual({ nick: 'abc' })))
                    .verifiable(1)
                    .thenResolve();
            }
        },
        {
            code: '{usersetnick;abc;blargbot}',
            expected: '',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock<Entities.User>();
                const userId = randomUUID();
                member.setup(m => m.id).thenReturn(userId);
                ctx.dependencies.users.setup(m => m.querySingle(bbctx.runtime, 'blargbot'))
                    .verifiable(1)
                    .thenResolve(member.instance);
                ctx.dependencies.users.setup(m => m.edit(bbctx.runtime, userId, argument.isDeepEqual({ nick: 'abc' })))
                    .verifiable(1)
                    .thenResolve();
            }
        },
        {
            code: '{usersetnick;{eval};unknown user}',
            expected: '`No user found`',
            errors: [
                { start: 13, end: 19, error: new MarkerError('eval', 13) },
                { start: 0, end: 33, error: new UserNotFoundError('unknown user') }
            ],
            postSetup(bbctx, ctx) {
                ctx.dependencies.users.setup(m => m.querySingle(bbctx.runtime, 'unknown user'))
                    .verifiable(1)
                    .thenResolve(undefined);
            }
        }
    ]
});

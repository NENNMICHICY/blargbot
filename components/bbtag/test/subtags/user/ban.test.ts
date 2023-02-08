import type { Entities } from '@bbtag/blargbot';
import { BBTagRuntimeError, NotANumberError, Subtag, UserNotFoundError } from '@bbtag/blargbot';
import { BanSubtag } from '@bbtag/blargbot/subtags';
import { argument } from '@blargbot/test-util/mock.js';
import moment from 'moment-timezone';

import { runSubtagTests } from '../SubtagTestSuite.js';

function isDuration(ms: number): moment.Duration {
    return argument.is(moment.isDuration).and(x =>
        x.asMilliseconds() === ms).value;
}

runSubtagTests({
    subtag: Subtag.getDescriptor(BanSubtag),
    argCountBounds: { min: 1, max: 5 },
    cases: [
        {
            code: '{ban;abc}',
            expected: '`No user found`',
            errors: [
                { start: 0, end: 9, error: new UserNotFoundError('abc') }
            ],
            postSetup(bbctx, ctx) {
                ctx.userService.setup(m => m.querySingle(bbctx, 'abc', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(undefined);
            }
        },
        {
            code: '{ban;other user}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('alreadyBanned');
            }
        },
        {
            code: '{ban;other user}',
            expected: '`Bot has no permissions`',
            errors: [
                { start: 0, end: 16, error: new BBTagRuntimeError('Bot has no permissions') }
            ],
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('memberTooHigh');
            }
        },
        {
            code: '{ban;other user}',
            expected: '`User has no permissions`',
            errors: [
                { start: 0, end: 16, error: new BBTagRuntimeError('User has no permissions') }
            ],
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('moderatorNoPerms');
            }
        },
        {
            code: '{ban;other user}',
            expected: '`User has no permissions`',
            errors: [
                { start: 0, end: 16, error: new BBTagRuntimeError('User has no permissions') }
            ],
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('moderatorTooLow');
            }
        },
        {
            code: '{ban;other user}',
            expected: '`Bot has no permissions`',
            errors: [
                { start: 0, end: 16, error: new BBTagRuntimeError('Bot has no permissions') }
            ],
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('noPerms');
            }
        },
        {
            code: '{ban;other user;5}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 5, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;-1}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, -1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;abc}',
            expected: 'false',
            errors: [
                { start: 0, end: 20, error: new NotANumberError('abc').withDisplay('false') }
            ],
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
            }
        },
        {
            code: '{ban;other user;;My custom reason}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'My custom reason', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;7;My custom reason}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 7, 'My custom reason', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;5 days}',
            expected: '432000000',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(432000000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;7;My custom reason;2 hours}',
            expected: '7200000',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 7, 'My custom reason', isDuration(7200000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;x}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, ctx.users.authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;false}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, ctx.users.authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;true}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, ctx.users.authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;4;My custom reason;2 hours 30s;abc}',
            expected: '7230000',
            postSetup(bbctx, ctx) {
                const user = ctx.createMock<Entities.User>();
                ctx.userService.setup(m => m.querySingle(bbctx, 'other user', argument.isDeepEqual({ noLookup: true }))).verifiable(1).thenResolve(user.instance);
                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, ctx.users.authorizer, 4, 'My custom reason', isDuration(7230000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        }
    ]
});

import { BBTagRuntimeError, NotANumberError, UserNotFoundError } from '@blargbot/bbtag/errors';
import { BanSubtag } from '@blargbot/bbtag/subtags/user/ban';
import { argument } from '@blargbot/test-util/mock';
import { Member, User } from 'eris';
import moment, { Duration } from 'moment-timezone';

import { runSubtagTests } from '../SubtagTestSuite';

function isDuration(ms: number): Duration {
    return argument.is(moment.isDuration).and(x =>
        x.asMilliseconds() === ms).value;
}

runSubtagTests({
    subtag: new BanSubtag(),
    argCountBounds: { min: 1, max: 5 },
    cases: [
        {
            code: '{ban;abc}',
            expected: '`No user found`',
            errors: [
                { start: 0, end: 9, error: new UserNotFoundError('abc') }
            ],
            postSetup(bbctx, ctx) {
                ctx.util.setup(m => m.getUser('abc'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'abc'))
                    .verifiable(1)
                    .thenResolve([]);
            }
        },
        {
            code: '{ban;other user}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

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
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

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
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

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
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

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
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('noPerms');
            }
        },
        {
            code: '{ban;other user;5}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 5, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;-1}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

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
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

            }
        },
        {
            code: '{ban;other user;;My custom reason}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'My custom reason', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;7;My custom reason}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 7, 'My custom reason', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;5 days}',
            expected: '432000000',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 1, 'Tag Ban', isDuration(432000000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;7;My custom reason;2 hours}',
            expected: '7200000',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, bbctx.user, 7, 'My custom reason', isDuration(7200000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;x}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                const authorizer = bbctx.guild.members.get(ctx.users.authorizer.id)?.user;
                if (authorizer === undefined)
                    throw new Error('Authorizer missing');
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;false}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                const authorizer = bbctx.guild.members.get(ctx.users.authorizer.id)?.user;
                if (authorizer === undefined)
                    throw new Error('Authorizer missing');
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;;;;true}',
            expected: 'true',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                const authorizer = bbctx.guild.members.get(ctx.users.authorizer.id)?.user;
                if (authorizer === undefined)
                    throw new Error('Authorizer missing');
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, authorizer, 1, 'Tag Ban', isDuration(Infinity)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        },
        {
            code: '{ban;other user;4;My custom reason;2 hours 30s;abc}',
            expected: '7230000',
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                const authorizer = bbctx.guild.members.get(ctx.users.authorizer.id)?.user;
                if (authorizer === undefined)
                    throw new Error('Authorizer missing');
                ctx.util.setup(m => m.getUser('other user'))
                    .verifiable(1)
                    .thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, 'other user'))
                    .verifiable(1)
                    .thenResolve([member.instance]);

                ctx.util.setup(m => m.ban(bbctx.guild, user.instance, bbctx.user, authorizer, 4, 'My custom reason', isDuration(7230000)))
                    .verifiable(1)
                    .thenResolve('success');
            }
        }
    ]
});

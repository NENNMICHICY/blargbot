import { BBTagUtilities } from '@blargbot/bbtag/BBTagUtilities.js';
import { BBTagRuntimeError, NotANumberError } from '@blargbot/bbtag/errors/index.js';
import { MessageIdSubtag } from '@blargbot/bbtag/subtags/message/messageId.js';
import { WaitMessageSubtag } from '@blargbot/bbtag/subtags/message/waitMessage.js';
import { OperatorSubtag } from '@blargbot/bbtag/subtags/misc/operator.js';
import { argument, Mock } from '@blargbot/test-util/mock.js';
import chai from 'chai';
import * as Eris from 'eris';

import { MarkerError, runSubtagTests, SubtagTestContext } from '../SubtagTestSuite.js';

type AwaitCondition = Exclude<Parameters<BBTagUtilities['awaitMessage']>[1], undefined>;
const anyCondition = argument.is((v): v is AwaitCondition => typeof v === 'function');

runSubtagTests({
    subtag: new WaitMessageSubtag(),
    argCountBounds: { min: 0, max: { count: 4, noEval: [2] } },
    cases: [
        {
            code: '{waitmessage}',
            expected: '`Wait timed out after 60000`',
            errors: [
                { start: 0, end: 13, error: new BBTagRuntimeError('Wait timed out after 60000') }
            ],
            setup(ctx) {
                const rejectedMessage = createRejectedMessage(ctx, '23897464293623984274432');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual([ctx.channels.command.id]), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(undefined, [rejectedMessage.instance]));
            }
        },
        {
            code: '{waitmessage}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id);
                const rejectedMessage = createRejectedMessage(ctx, '23897464293623984274432');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual([ctx.channels.command.id]), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));
            }
        },
        {
            code: '{waitmessage;21938762934928374}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id);
                const rejectedMessage = createRejectedMessage(ctx, '23897464293623984274432');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);
            }
        },
        {
            code: '{waitmessage;["21938762934928374"]}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id);
                const rejectedMessage = createRejectedMessage(ctx, '23897464293623984274432');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);
            }
        },
        {
            code: '{waitmessage;["21938762934928374","987234657348965","39457643897564358"]}',
            expected: '["987234657348965","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', '987234657348965');
                const rejectedMessage = createRejectedMessage(ctx, '23897464293623984274432');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374', '987234657348965', '39457643897564358']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel1 = ctx.createMock(Eris.TextChannel);
                channel1.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel1.instance]);

                const channel2 = ctx.createMock(Eris.TextChannel);
                channel2.setup(m => m.id).thenReturn('987234657348965');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '987234657348965')).thenResolve([channel2.instance]);

                const channel3 = ctx.createMock(Eris.TextChannel);
                channel3.setup(m => m.id).thenReturn('39457643897564358');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '39457643897564358')).thenResolve([channel3.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;["289374634729826479828"]}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;["289374634729826479828","328762389764234374","23894767278934620893"]}',
            expected: '["9834653278429843564","3982746234283749322"]',
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '328762389764234374');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member1 = ctx.createMock(Eris.Member);
                const user1 = ctx.createMock(Eris.User);
                member1.setup(m => m.user).thenReturn(user1.instance);
                user1.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member1.instance]);

                const member2 = ctx.createMock(Eris.Member);
                const user2 = ctx.createMock(Eris.User);
                member2.setup(m => m.user).thenReturn(user2.instance);
                user2.setup(m => m.id).thenReturn('328762389764234374');
                ctx.util.setup(m => m.getUser('328762389764234374')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '328762389764234374')).thenResolve([member2.instance]);

                const member3 = ctx.createMock(Eris.Member);
                const user3 = ctx.createMock(Eris.User);
                member3.setup(m => m.user).thenReturn(user3.instance);
                user3.setup(m => m.id).thenReturn('23894767278934620893');
                ctx.util.setup(m => m.getUser('23894767278934620893')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '23894767278934620893')).thenResolve([member3.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval}{==;{messageid};3982746234283749322}}',
            expected: '["9834653278429843564","3982746234283749322"]',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 53, end: 59, error: new MarkerError('eval', 53) }
            ],
            subtags: [new OperatorSubtag(), new MessageIdSubtag()],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const filterableMessage = createFilterableMessage(ctx, bbctx.guild, '5847658249242834983', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 60000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [filterableMessage.instance, rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval}{==;{messageid};3982746234283749322};10}',
            expected: '["9834653278429843564","3982746234283749322"]',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 53, end: 59, error: new MarkerError('eval', 53) }
            ],
            subtags: [new OperatorSubtag(), new MessageIdSubtag()],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const filterableMessage = createFilterableMessage(ctx, bbctx.guild, '5847658249242834983', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 10000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [filterableMessage.instance, rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval}{==;{messageid};3982746234283749322};-20}',
            expected: '["9834653278429843564","3982746234283749322"]',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 53, end: 59, error: new MarkerError('eval', 53) }
            ],
            subtags: [new OperatorSubtag(), new MessageIdSubtag()],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const filterableMessage = createFilterableMessage(ctx, bbctx.guild, '5847658249242834983', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 0))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [filterableMessage.instance, rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval}{==;{messageid};3982746234283749322};310}',
            expected: '["9834653278429843564","3982746234283749322"]',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 53, end: 59, error: new MarkerError('eval', 53) }
            ],
            subtags: [new OperatorSubtag(), new MessageIdSubtag()],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const filterableMessage = createFilterableMessage(ctx, bbctx.guild, '5847658249242834983', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 300000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [filterableMessage.instance, rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval}false;310}',
            expected: '`Wait timed out after 300000`',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 0, end: 69, error: new BBTagRuntimeError('Wait timed out after 300000') }
            ],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const acceptedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                const filterableMessage = createFilterableMessage(ctx, bbctx.guild, '5847658249242834983', ctx.channels.command.id, '289374634729826479828');
                const rejectedMessage = createRejectedMessage(ctx);
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 300000))
                    .thenCall(createFakeAwaiterFactory(acceptedMessage.instance, [filterableMessage.instance, rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{eval} abc;310}',
            expected: '`Condition must return \'true\' or \'false\'`',
            errors: [
                { start: 53, end: 59, error: new MarkerError('eval', 53) },
                { start: 0, end: 68, error: new BBTagRuntimeError('Condition must return \'true\' or \'false\'', 'Actually returned " abc"') }
            ],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const rejectedMessage = createFilterableMessage(ctx, bbctx.guild, '3982746234283749322', ctx.channels.command.id, '289374634729826479828');
                ctx.util.setup(m => m.awaitMessage(argument.isDeepEqual(['21938762934928374']), anyCondition.value, 300000))
                    .thenCall(createFakeAwaiterFactory(undefined, [rejectedMessage.instance]));

                const channel = ctx.createMock(Eris.TextChannel);
                channel.setup(m => m.id).thenReturn('21938762934928374');
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('289374634729826479828');
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        },
        {
            code: '{waitmessage;21938762934928374;289374634729826479828;{fail};abc}',
            expected: '`Not a number`',
            errors: [
                { start: 0, end: 64, error: new NotANumberError('abc') }
            ],
            setup(ctx) {
                ctx.channels.command.id = '9834653278429843564';
                ctx.message.channel_id = ctx.channels.command.id;
            },
            postSetup(bbctx, ctx) {
                const channel = ctx.createMock(Eris.TextChannel);
                ctx.util.setup(m => m.findChannels(bbctx.guild, '21938762934928374')).thenResolve([channel.instance]);

                const member = ctx.createMock(Eris.Member);
                const user = ctx.createMock(Eris.User);
                member.setup(m => m.user).thenReturn(user.instance);
                ctx.util.setup(m => m.getUser('289374634729826479828')).thenResolve(undefined);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '289374634729826479828')).thenResolve([member.instance]);
            }
        }
    ]
});

function createFakeAwaiterFactory(result: Eris.KnownMessage | undefined, expectedFails: Eris.KnownMessage[] = []): BBTagUtilities['awaitMessage'] {
    return async (_: unknown, condition: AwaitCondition) => {
        for (const value of expectedFails)
            chai.expect(await condition(value)).to.be.false;
        if (result === undefined)
            return undefined;
        if (await condition(result))
            return result;
        return undefined;
    };
}

function createFilterableMessage(
    ctx: SubtagTestContext,
    guild: Eris.Guild,
    messageId: string,
    channelId = ctx.channels.command.id,
    userId = ctx.users.command.id
): Mock<Eris.KnownMessage> {
    const message = ctx.createMock<Eris.KnownMessage>(Eris.Message);
    const channel = ctx.createMock(Eris.TextChannel);
    const author = ctx.createMock(Eris.User);
    message.setup(m => m.channel).thenReturn(channel.instance);
    message.setup(m => m.author).thenReturn(author.instance);
    message.setup(m => m.id, false).thenReturn(messageId);
    channel.setup(m => m.guild).thenReturn(guild);
    channel.setup(m => m.id, false).thenReturn(channelId);
    author.setup(m => m.id).thenReturn(userId);

    return message;
}

function createRejectedMessage(
    ctx: SubtagTestContext,
    userId = ctx.users.command.id
): Mock<Eris.KnownMessage> {
    const message = ctx.createMock<Eris.KnownMessage>(Eris.Message);
    const author = ctx.createMock(Eris.User);
    message.setup(m => m.author).thenReturn(author.instance);
    author.setup(m => m.id).thenReturn(userId);

    return message;
}

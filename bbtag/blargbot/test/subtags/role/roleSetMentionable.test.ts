import { BBTagRuntimeError } from '@bbtag/blargbot';
import { RoleSetMentionableSubtag } from '@bbtag/blargbot/subtags';
import Discord from '@blargbot/discord-types';
import { argument } from '@blargbot/test-util/mock.js';

import { runSubtagTests } from '../SubtagTestSuite.js';
import { createGetRolePropTestCases } from './_getRolePropTest.js';

runSubtagTests({
    subtag: RoleSetMentionableSubtag,
    argCountBounds: { min: 1, max: 3 },
    setupEach(ctx) {
        ctx.roles.authorizer.permissions = Discord.PermissionFlagsBits.ManageRoles.toString();
        ctx.users.authorizer.member.roles.push(ctx.roles.top.id);
    },
    cases: [
        ...createGetRolePropTestCases({
            quiet: false,
            generateCode(role, ...args) {
                return `{${['rolesetmentionable', role, 'true', ...args].join(';')}}`;
            },
            notFound: () => new BBTagRuntimeError('Role not found'),
            getQueryOptions: () => ({ noLookup: false }),
            cases: [
                {
                    expected: '',
                    postSetup(role, bbctx, ctx) {
                        ctx.inject.roles.setup(m => m.edit(bbctx.runtime, role.id, argument.isDeepEqual({ mentionable: true }))).thenResolve(undefined);
                    }
                }
            ]
        }),
        ...createGetRolePropTestCases({
            quiet: false,
            generateCode(role, ...args) {
                return `{${['rolesetmentionable', role, 'false', ...args].join(';')}}`;
            },
            notFound: () => new BBTagRuntimeError('Role not found'),
            getQueryOptions: () => ({ noLookup: false }),
            cases: [
                {
                    expected: '',
                    postSetup(role, bbctx, ctx) {
                        ctx.inject.roles.setup(m => m.edit(bbctx.runtime, role.id, argument.isDeepEqual({ mentionable: false }))).thenResolve(undefined);
                    }
                }
            ]
        }),
        ...createGetRolePropTestCases({
            generateCode(role, ...args) {
                return `{${['rolesetmentionable', role, 'true', ...args].join(';')}}`;
            },
            notFound: () => new BBTagRuntimeError('Role not found'),
            cases: [
                {
                    expected: '',
                    postSetup(role, bbctx, ctx) {
                        ctx.inject.roles.setup(m => m.edit(bbctx.runtime, role.id, argument.isDeepEqual({ mentionable: true }))).thenResolve(undefined);
                    }
                }
            ]
        }),
        ...createGetRolePropTestCases({
            generateCode(role, ...args) {
                return `{${['rolesetmentionable', role, '', ...args].join(';')}}`;
            },
            notFound: () => new BBTagRuntimeError('Role not found'),
            cases: [
                {
                    expected: '',
                    postSetup(role, bbctx, ctx) {
                        ctx.inject.roles.setup(m => m.edit(bbctx.runtime, role.id, argument.isDeepEqual({ mentionable: true }))).thenResolve(undefined);
                    }
                }
            ]
        }),
        ...createGetRolePropTestCases({
            generateCode(role, ...args) {
                return `{${['rolesetmentionable', role, 'false', ...args].join(';')}}`;
            },
            notFound: () => new BBTagRuntimeError('Role not found'),
            cases: [
                {
                    expected: '',
                    postSetup(role, bbctx, ctx) {
                        ctx.inject.roles.setup(m => m.edit(bbctx.runtime, role.id, argument.isDeepEqual({ mentionable: false }))).thenResolve(undefined);
                    }
                }
            ]
        }),
        {
            code: '{rolesetmentionable;3298746326924}',
            expected: '`Author cannot edit roles`',
            errors: [
                { start: 0, end: 34, error: new BBTagRuntimeError('Author cannot edit roles') }
            ],
            setup(ctx) {
                ctx.roles.authorizer.permissions = '0';
            }
        },
        {
            code: '{rolesetmentionable;3298746326924}',
            expected: '`Role above author`',
            errors: [
                { start: 0, end: 34, error: new BBTagRuntimeError('Role above author') }
            ],
            postSetup(bbctx, ctx) {
                ctx.inject.roles.setup(m => m.querySingle(bbctx.runtime, '3298746326924', argument.isDeepEqual({ noLookup: false }))).thenResolve(ctx.roles.top);
            }
        },
        {
            code: '{rolesetmentionable;3298746326924}',
            expected: '`Failed to edit role: no perms`',
            errors: [
                { start: 0, end: 34, error: new BBTagRuntimeError('Failed to edit role: no perms', 'Test REST error') }
            ],
            setup(ctx) {
                ctx.roles.bot.id = '3298746326924';
            },
            postSetup(bbctx, ctx) {
                ctx.inject.roles.setup(m => m.querySingle(bbctx.runtime, '3298746326924', argument.isDeepEqual({ noLookup: false }))).thenResolve(ctx.roles.bot);
                ctx.inject.roles.setup(m => m.edit(bbctx.runtime, ctx.roles.bot.id, argument.isDeepEqual({ mentionable: true }))).thenResolve({ error: 'Test REST error' });
            }
        },
        {
            code: '{rolesetmentionable;3298746326924}',
            expected: '`Failed to edit role: no perms`',
            errors: [
                { start: 0, end: 34, error: new BBTagRuntimeError('Failed to edit role: no perms', 'Some other error message') }
            ],
            setup(ctx) {
                ctx.roles.bot.id = '3298746326924';
            },
            postSetup(bbctx, ctx) {
                ctx.inject.roles.setup(m => m.querySingle(bbctx.runtime, '3298746326924', argument.isDeepEqual({ noLookup: false }))).thenResolve(ctx.roles.bot);
                ctx.inject.roles.setup(m => m.edit(bbctx.runtime, ctx.roles.bot.id, argument.isDeepEqual({ mentionable: true }))).thenResolve({ error: 'Some other error message' });
            }
        }
    ]
});

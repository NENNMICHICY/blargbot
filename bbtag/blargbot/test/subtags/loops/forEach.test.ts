import { BBTagRuntimeError, BBTagRuntimeState, TagVariableType } from '@bbtag/blargbot';
import { ForEachSubtag, GetSubtag, IfSubtag, ReturnSubtag } from '@bbtag/blargbot/subtags';
import chai from 'chai';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: ForEachSubtag,
    argCountBounds: { min: { count: 3, noEval: [2] }, max: { count: 3, noEval: [2] } },
    cases: [
        {
            code: '{foreach;a;b;c{fail}}',
            expected: ''
        },
        {
            code: '{foreach;a;arr1;<{get;a}>}',
            expected: '<this><is><arr1>',
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' }, 'initial');
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx.runtime, 'foreach:loops')).verifiable(3).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                chai.expect((await bbctx.runtime.variables.get('a')).value).to.equal('initial');
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' })).to.equal('initial');
            }
        },
        {
            code: '{foreach;a;{get;arr1};<{get;a}>}',
            expected: '<this><is><arr1>',
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' }, 'initial');
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx.runtime, 'foreach:loops')).verifiable(3).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                chai.expect((await bbctx.runtime.variables.get('a')).value).to.equal('initial');
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' })).to.equal('initial');
            }
        },
        {
            code: '{foreach;a;var1;<{get;a}>}',
            expected: '<t><h><i><s>< ><i><s>< ><v><a><r><1>',
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'var1' }, 'this is var1');
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' }, 'initial');
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx.runtime, 'foreach:loops')).verifiable(12).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                chai.expect((await bbctx.runtime.variables.get('a')).value).to.equal('initial');
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' })).to.equal('initial');
            }
        },
        {
            code: '{foreach;a;var1;<{get;a}>{if;{get;a};==;s;{return}}}',
            expected: '<t><h><i><s>',
            subtags: [GetSubtag, IfSubtag, ReturnSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'var1' }, 'this is var1');
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' }, 'initial');
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx.runtime, 'foreach:loops')).verifiable(4).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                chai.expect((await bbctx.runtime.variables.get('a')).value).to.equal('initial');
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' })).to.equal('initial');
                chai.expect(bbctx.runtime.state).to.equal(BBTagRuntimeState.ABORT);
            }
        },
        {
            code: '{foreach;a;{get;arr1};<{get;a}>}',
            expected: '<this>`Too many loops`',
            errors: [
                { start: 0, end: 32, error: new BBTagRuntimeError('Too many loops') }
            ],
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.entrypoint.name = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' }, 'initial');
            },
            postSetup(bbctx, ctx) {
                let i = 0;
                ctx.limit.setup(m => m.check(bbctx.runtime, 'foreach:loops')).verifiable(2).thenCall(() => {
                    if (i++ >= 1)
                        throw new BBTagRuntimeError('Too many loops');
                    return undefined;
                });
            },
            async assert(bbctx, _, ctx) {
                chai.expect((await bbctx.runtime.variables.get('a')).value).to.equal('initial');
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'a' })).to.equal('initial');
            }
        }
    ]
});

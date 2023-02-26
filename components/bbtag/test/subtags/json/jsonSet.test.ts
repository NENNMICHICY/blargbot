import { BBTagRuntimeError, Subtag } from '@bbtag/blargbot';
import { JsonSetSubtag, JsonSubtag } from '@bbtag/blargbot/subtags';
import { TagVariableType } from '@bbtag/blargbot'
import chai from 'chai';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: Subtag.getDescriptor(JsonSetSubtag),
    argCountBounds: { min: 2, max: 4 },
    cases: [
        {
            code: '{jsonset;{j;{"test": 123, "other": 456}};test}',
            expected: '{"other":456}',
            subtags: [Subtag.getDescriptor(JsonSubtag)]
        },
        {
            code: '{jsonset;{j;{"test": 123, "other": 456}};somethingElse}',
            expected: '{"test":123,"other":456}',
            subtags: [Subtag.getDescriptor(JsonSubtag)]
        },
        {
            code: '{jsonset;null;myProp;123}',
            expected: '',
            async assert(bbctx) {
                chai.expect((await bbctx.variables.get('null')).value).to.deep.equal({ myProp: '123' });
            }
        },
        {
            code: '{jsonset;"abc";myProp;123}',
            expected: '',
            async assert(bbctx) {
                chai.expect((await bbctx.variables.get('"abc"')).value).to.deep.equal({ myProp: '123' });
            }
        },
        {
            code: '{jsonset;true;myProp;123}',
            expected: '',
            async assert(bbctx) {
                chai.expect((await bbctx.variables.get('true')).value).to.deep.equal({ myProp: '123' });
            }
        },
        {
            code: '{jsonset;123;myProp;123}',
            expected: '',
            async assert(bbctx) {
                chai.expect((await bbctx.variables.get('123')).value).to.deep.equal({ myProp: '123' });
            }
        },
        {
            code: '{jsonset;[123,456];somethingElse}',
            expected: '[123,456]'
        },
        {
            code: '{jsonset;[123,456];length}',
            expected: '`Invalid array length`',
            errors: [
                { start: 0, end: 26, error: new BBTagRuntimeError('Invalid array length') }
            ]
        },
        {
            code: '{jsonset;{j;{"test": 123, "other": "{\\"myProp\\":123}"}};other.myProp;10}',
            expected: '`Cannot set property myProp on "{\\"myProp\\":123}"`',
            subtags: [Subtag.getDescriptor(JsonSubtag)],
            errors: [
                { start: 0, end: 72, error: new BBTagRuntimeError('Cannot set property myProp on "{\\"myProp\\":123}"') }
            ]
        },
        {
            code: '{jsonset;{j;{"test": 123, "other": "{\\"myProp\\":123}"}};other.myProp;10;true}',
            expected: '{"test":123,"other":{"myProp":"10"}}',
            subtags: [Subtag.getDescriptor(JsonSubtag)]
        },
        {
            code: '{jsonset;jsonVar;other.myProp;10;true}',
            expected: '',
            setupSaveVariables: false,
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'jsonVar' }, { test: 123, other: JSON.stringify({ myProp: 123 }) });
            },
            async assert(bbctx) {
                chai.expect((await bbctx.variables.get('jsonVar')).value).to.deep.equal({ test: 123, other: { myProp: '10' } });
            }
        }
    ]
});

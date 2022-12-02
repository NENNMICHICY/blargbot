import { SortSubtag } from '@blargbot/bbtag/subtags/array/sort.js';
import { GetSubtag } from '@blargbot/bbtag/subtags/bot/get.js';
import { TagVariableType } from '@blargbot/domain/models/index.js';
import { argument } from '@blargbot/test-util/mock.js';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: new SortSubtag(),
    argCountBounds: { min: 1, max: 2 },
    cases: [
        {
            code: '{sort;[2,3,0,8,7,4,8,9,2,4,3]}',
            expected: '[0,2,2,3,3,4,4,7,8,8,9]'
        },
        {
            code: '{sort;["as","dlah","j","","fliuka","ufhea","uik"]}',
            expected: '["","as","dlah","fliuka","j","ufhea","uik"]'
        },
        {
            code: '{sort;[2,3,0,8,7,4,8,9,2,4,3];false}',
            expected: '[0,2,2,3,3,4,4,7,8,8,9]'
        },
        {
            code: '{sort;["as","dlah","j","","fliuka","ufhea","uik"];false}',
            expected: '["","as","dlah","fliuka","j","ufhea","uik"]'
        },
        {
            code: '{sort;[2,3,0,8,7,4,8,9,2,4,3];true}',
            expected: '[9,8,8,7,4,4,3,3,2,2,0]'
        },
        {
            code: '{sort;["as","dlah","j","","fliuka","ufhea","uik"];true}',
            expected: '["uik","ufhea","j","fliuka","dlah","as",""]'
        },
        {
            code: '{sort;[2,3,0,8,7,4,8,9,2,4,3];not a bool}',
            expected: '[9,8,8,7,4,4,3,3,2,2,0]'
        },
        {
            code: '{sort;["as","dlah","j","","fliuka","ufhea","uik"];not a bool}',
            expected: '["uik","ufhea","j","fliuka","dlah","as",""]'
        },

        {
            code: '{sort;{get;arr1}}',
            expected: '',
            subtags: [new GetSubtag()],
            setupSaveVariables: false,
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
            },
            async assert(bbctx, _, ctx) {
                expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' })).to.deep.equal(['this', 'is', 'arr1']);
                expect((await bbctx.variables.get('arr1')).value).to.deep.equal(['arr1', 'is', 'this']);
            }
        },
        {
            code: '{sort;arr1}',
            expected: '',
            subtags: [new GetSubtag()],
            setupSaveVariables: false,
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
            },
            async assert(bbctx, _, ctx) {
                expect(ctx.tagVariables.get({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' })).to.deep.equal(['this', 'is', 'arr1']);
                expect((await bbctx.variables.get('arr1')).value).to.deep.equal(['arr1', 'is', 'this']);
            }
        },
        {
            code: '{sort;!arr1}',
            expected: '',
            subtags: [new GetSubtag()],
            setupSaveVariables: false,
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables.set({ scope: { type: TagVariableType.LOCAL_TAG, name: 'testTag' }, name: 'arr1' }, ['this', 'is', 'arr1']);
                ctx.tagVariablesTable.setup(m => m.upsert(argument.isDeepEqual({ arr1: ['arr1', 'is', 'this'] }), argument.isDeepEqual({ type: TagVariableType.LOCAL_TAG, name: 'testTag' }))).thenResolve(undefined);
            },
            async assert(bbctx) {
                expect((await bbctx.variables.get('arr1')).value).to.deep.equal(['arr1', 'is', 'this']);
            }
        }
    ]
});

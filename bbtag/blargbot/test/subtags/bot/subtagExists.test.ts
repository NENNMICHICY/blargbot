import { FunctionSubtag, IfSubtag, SubtagExistsSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: SubtagExistsSubtag,
    argCountBounds: { min: 1, max: 1 },
    cases: [
        {
            code: '{subtagexists;subtagexists}',
            expected: 'true'
        },
        {
            code: '{subtagexists;abc}',
            expected: 'false'
        },
        {
            title: '{if} is not loaded',
            code: '{subtagexists;if}',
            expected: 'false'
        },
        {
            title: '{if} is loaded',
            subtags: [IfSubtag],
            code: '{subtagexists;if}',
            expected: 'true'
        },
        {
            subtags: [FunctionSubtag],
            code: '{subtagexists;function}',
            expected: 'true'
        },
        {
            subtags: [FunctionSubtag],
            code: '{subtagexists;func}',
            expected: 'true'
        },
        {
            code: '{subtagexists;func.abc}',
            expected: 'false',
            postSetup(bbctx) {
                bbctx.runtime.defineSnippet('func.abc', {
                    end: { index: 0, line: 0, column: 0 },
                    start: { index: 0, line: 0, column: 0 },
                    source: '',
                    values: []
                });
            }
        }
    ]
});

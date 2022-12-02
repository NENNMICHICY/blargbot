import { BBTagRuntimeError, NotANumberError } from '@blargbot/bbtag/errors/index.js';
import { BaseNumberSubtag } from '@blargbot/bbtag/subtags/math/base.js';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: new BaseNumberSubtag(),
    argCountBounds: { min: 2, max: 3 },
    cases: [
        { code: '{base;10;16}', expected: 'a' },
        { code: '{base;10;8}', expected: '12' },
        { code: '{base;F;16;10}', expected: '15' },
        { code: '{base;F;20;8}', expected: '17' },
        {
            code: '{base;10;1}',
            expected: '`Base must be between 2 and 36`',
            errors: [
                { start: 0, end: 11, error: new BBTagRuntimeError('Base must be between 2 and 36') }
            ]
        },
        {
            code: '{base;10;37}',
            expected: '`Base must be between 2 and 36`',
            errors: [
                { start: 0, end: 12, error: new BBTagRuntimeError('Base must be between 2 and 36') }
            ]
        },
        {
            code: '{base;10;37}',
            expected: '12',
            setup(ctx) {
                ctx.rootScope.fallback = '8';
            }
        },
        {
            code: '{base;10;1;16}',
            expected: '`Base must be between 2 and 36`',
            errors: [
                { start: 0, end: 14, error: new BBTagRuntimeError('Base must be between 2 and 36') }
            ]
        },
        {
            code: '{base;10;37;16}',
            expected: '`Base must be between 2 and 36`',
            errors: [
                { start: 0, end: 15, error: new BBTagRuntimeError('Base must be between 2 and 36') }
            ]
        },
        {
            code: '{base;10;1;16}',
            expected: 'a',
            setup(ctx) {
                ctx.rootScope.fallback = '10';
            }
        },
        {
            code: '{base;10;37;16}',
            expected: 'a',
            setup(ctx) {
                ctx.rootScope.fallback = '10';
            }
        },
        {
            code: '{base;10;abc;16}',
            expected: '`Not a number`',
            errors: [
                { start: 0, end: 16, error: new NotANumberError('abc') }
            ]
        },
        {
            code: '{base;10;16;xyz}',
            expected: '`Not a number`',
            errors: [
                { start: 0, end: 16, error: new NotANumberError('xyz') }
            ]
        },
        {
            code: '{base;10;abc;16}',
            expected: 'a',
            setup(ctx) {
                ctx.rootScope.fallback = '10';
            }
        },
        {
            code: '{base;10;16;abc}',
            expected: '20',
            setup(ctx) {
                ctx.rootScope.fallback = '8';
            }
        },
        {
            code: '{base;ghi;16;10}',
            expected: '`Not a number`',
            errors: [
                { start: 0, end: 16, error: new NotANumberError('ghi') }
            ]
        },
        {
            code: '{base;ghi;16;11}',
            expected: '85',
            setup(ctx) {
                ctx.rootScope.fallback = '93';
            }
        }
    ]
});

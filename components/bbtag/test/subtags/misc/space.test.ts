import { NotANumberError } from '@blargbot/bbtag/errors';
import { SpaceSubtag } from '@blargbot/bbtag/subtags/misc/space';

import { MarkerError, runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new SpaceSubtag(),
    argCountBounds: { min: 0, max: 1 },
    cases: [
        { code: '{space}', expected: ' ' },
        { code: '{space;}', expected: ' ' },
        { code: '{space;0}', expected: '' },
        { code: '{space;-1}', expected: '' },
        { code: '{space;-5}', expected: '' },
        { code: '{space;7}', expected: '       ' },
        {
            code: '{space;{eval}aaa}',
            expected: '`Not a number`',
            errors: [
                { start: 7, end: 13, error: new MarkerError('eval', 7) },
                { start: 0, end: 17, error: new NotANumberError('aaa') }
            ]
        }
    ]
});

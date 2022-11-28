import { BBTagRuntimeError } from '@blargbot/bbtag/errors';
import { UriDecodeSubtag } from '@blargbot/bbtag/subtags/misc/uriDecode';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new UriDecodeSubtag(),
    argCountBounds: { min: 1, max: 1 },
    cases: [
        { code: '{uridecode;JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B}', expected: 'JavaScript_шеллы' },
        { code: '{uridecode;search+query%20%28correct%29}', expected: 'search+query (correct)' },
        {
            code: '{uridecode;%E0%A4%A}',
            expected: '`URI malformed`',
            errors: [
                { start: 0, end: 20, error: new BBTagRuntimeError('URI malformed') }
            ]
        }
    ]
});

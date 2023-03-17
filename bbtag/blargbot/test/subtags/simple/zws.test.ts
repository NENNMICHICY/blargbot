import { ZwsSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: ZwsSubtag,
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{zws}',
            expected: '\u200b'
        }
    ]
});

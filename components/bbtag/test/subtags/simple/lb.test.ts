import { Subtag } from '@bbtag/blargbot';
import { LbSubtag } from '@bbtag/blargbot/subtags';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: Subtag.getDescriptor(LbSubtag),
    argCountBounds: { min: 0, max: 0 },
    cases: [
        { code: '{lb}', expected: '{' }
    ]
});

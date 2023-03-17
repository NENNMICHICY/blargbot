import { RandomUserSubtag } from '@bbtag/blargbot/subtags';
import chai from 'chai';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: RandomUserSubtag,
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{randuser}',
            assert(_, result, ctx) {
                chai.expect(result).to.be.oneOf(Object.values(ctx.users).map(u => u.id));
            },
            postSetup(bbctx, ctx) {
                ctx.inject.users.setup(m => m.getAll(bbctx.runtime)).verifiable(1).thenResolve(Object.values(ctx.users));
            }
        }
    ]
});

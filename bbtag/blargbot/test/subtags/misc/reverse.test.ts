import { TagVariableType } from '@bbtag/blargbot';
import { GetSubtag, ReverseSubtag } from '@bbtag/blargbot/subtags';
import chai from 'chai';

import { runSubtagTests } from '../SubtagTestSuite.js';

runSubtagTests({
    subtag: ReverseSubtag,
    argCountBounds: { min: 1, max: 1 },
    cases: [
        { code: '{reverse;abcdefg}', expected: 'gfedcba' },
        { code: '{reverse;[10,20,30,40,50,60]}', expected: '[60,50,40,30,20,10]' },
        {
            code: '{reverse;_myArray}',
            expected: 'yarrAym_',
            setup(ctx) {
                ctx.tagVariables.set({ scope: { type: TagVariableType.GUILD_TAG, guildId: ctx.guild.id }, name: 'myArray' }, ['abc', 'def', 'ghi']);
            },
            assert(_, __, ctx) {
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.GUILD_TAG, guildId: ctx.guild.id }, name: 'myArray' })).to.deep.equal(['abc', 'def', 'ghi']);
            }
        },
        {
            code: '{reverse;{get;_myArray}}',
            expected: '',
            subtags: [GetSubtag],
            setup(ctx) {
                ctx.tagVariables.set({ scope: { type: TagVariableType.GUILD_TAG, guildId: ctx.guild.id }, name: 'myArray' }, ['abc', 'def', 'ghi']);
            },
            assert(_, __, ctx) {
                chai.expect(ctx.tagVariables.get({ scope: { type: TagVariableType.GUILD_TAG, guildId: ctx.guild.id }, name: 'myArray' })).to.deep.equal(['ghi', 'def', 'abc']);
            }
        }
    ]
});

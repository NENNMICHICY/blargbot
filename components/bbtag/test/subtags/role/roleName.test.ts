import { RoleNameSubtag } from '@blargbot/bbtag/subtags/role/roleName';

import { runSubtagTests } from '../SubtagTestSuite';
import { createGetRolePropTestCases } from './_getRolePropTest';

runSubtagTests({
    subtag: new RoleNameSubtag(),
    argCountBounds: { min: 1, max: 2 },
    cases: [
        ...createGetRolePropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['rolename', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: 'abcdef',
                    setup(role) {
                        role.name = 'abcdef';
                    }
                }
            ]
        })
    ]
});

import { RolePermissionsSubtag } from '@blargbot/bbtag/subtags/role/rolePermissions';

import { runSubtagTests } from '../SubtagTestSuite';
import { createGetRolePropTestCases } from './_getRolePropTest';

runSubtagTests({
    subtag: new RolePermissionsSubtag(),
    argCountBounds: { min: 1, max: 2 },
    cases: [
        ...createGetRolePropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['roleperms', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: '23178324',
                    setup(role) {
                        role.permissions = '23178324';
                    }
                }
            ]
        })
    ]
});

/*
 * @Author: stupid cat
 * @Date: 2017-05-21 00:22:32
 * @Last Modified by: stupid cat
 * @Last Modified time: 2019-09-26 09:27:55
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.APITag('rolesetpos')
        .withArgs(a => [a.require('role'), a.require('position'), a.optional('quiet')])
        .withDesc('Sets the position of `role`. ' +
            'If `quiet` is specified, if `role` can\'t be found it will simply return nothing.')
        .withExample(
            'The admin role is now at position 3. {rolesetpos;admin;3}',
            'The admin role is now at position 3.'
        )
        .whenArgs(0, Builder.errors.notEnoughArguments)
        .whenArgs('1-3', async function (subtag, context, args) {
            let topRole = Builder.util.getRoleEditPosition(context);
            if (topRole == 0)
                return Builder.util.error(subtag, context, 'Author cannot edit roles');

            let quiet = bu.isBoolean(context.scope.quiet) ? context.scope.quiet : !!args[2],
                role = await context.getRole(args[0], {
                    quiet, suppress: context.scope.suppressLookup,
                    label: `${context.isCC ? 'custom command' : 'tag'} \`${context.tagName || 'unknown'}\``
                }),
                pos = bu.parseInt(args[1]);

            if (role != null) {
                if (role.position >= topRole)
                    return Builder.util.error(subtag, context, 'Role above author');
                if (pos >= topRole) {
                    return Builder.util.error(subtag, context, 'Desired position above author');
                }

                try {
                    await role.editPosition(pos);
                    return 'true';
                } catch (err) {
                    if (!quiet)
                        return Builder.util.error(subtag, context, 'Failed to edit role: no perms');
                }
            }
            return Builder.util.error(subtag, context, 'Role not found');
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();

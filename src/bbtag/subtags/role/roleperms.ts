import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { RoleNotFoundError } from '../../errors';
import templates from '../../text';
import { SubtagType } from '../../utils';

const tag = templates.subtags.roleperms;

export class RolePermsSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'roleperms',
            category: SubtagType.ROLE,
            aliases: ['rolepermissions'],
            definition: [
                {
                    parameters: ['role', 'quiet?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'number',
                    execute: (ctx, [userId, quiet]) => this.getRolePerms(ctx, userId.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getRolePerms(
        context: BBTagContext,
        roleId: string,
        quiet: boolean
    ): Promise<bigint> {
        quiet ||= context.scopes.local.quiet ?? false;
        const role = await context.queryRole(roleId, { noLookup: quiet });

        if (role === undefined) {
            throw new RoleNotFoundError(roleId)
                .withDisplay(quiet ? '' : undefined);
        }

        return role.permissions.allow;
    }
}

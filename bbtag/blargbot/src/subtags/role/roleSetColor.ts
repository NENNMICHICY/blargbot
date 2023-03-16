import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { BBTagRuntimeError } from '../../errors/index.js';
import type { RoleService } from '../../services/RoleService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';
import type { BBTagValueConverter } from '../../utils/valueConverter.js';

const tag = textTemplates.subtags.roleSetColor;

@Subtag.id('roleSetColor')
@Subtag.ctorArgs('converter', 'roles')
export class RoleSetColorSubtag extends CompiledSubtag {
    readonly #converter: BBTagValueConverter;
    readonly #roles: RoleService;

    public constructor(converter: BBTagValueConverter, roles: RoleService) {
        super({
            category: SubtagType.ROLE,
            definition: [
                {
                    parameters: ['role'],
                    description: tag.clear.description,
                    exampleCode: tag.clear.exampleCode,
                    exampleOut: tag.clear.exampleOut,
                    returns: 'nothing', //TODO output like true/false
                    execute: (ctx, [role]) => this.setRolecolor(ctx, role.value, '', false)
                },
                {
                    parameters: ['role', 'color', 'quiet?'],
                    description: tag.set.description,
                    exampleCode: tag.set.exampleCode,
                    exampleOut: tag.set.exampleOut,
                    returns: 'nothing', //TODO output like true/false
                    execute: (ctx, [role, color, quiet]) => this.setRolecolor(ctx, role.value, color.value, quiet.value !== '')
                }
            ]
        });

        this.#converter = converter;
        this.#roles = roles;
    }

    public async setRolecolor(
        context: BBTagScript,
        roleStr: string,
        colorStr: string,
        quiet: boolean
    ): Promise<void> {
        const topRole = context.runtime.roleEditPosition(context.runtime.authorizer);
        if (topRole <= 0)
            throw new BBTagRuntimeError('Author cannot edit roles');

        quiet ||= context.runtime.scopes.local.quiet ?? false;
        const role = await this.#roles.querySingle(context.runtime, roleStr, { noLookup: quiet });
        const color = this.#converter.color(colorStr !== '' ? colorStr : 0);

        if (role === undefined)
            throw new BBTagRuntimeError('Role not found'); //TODO RoleNotFoundError instead

        if (role.position >= topRole)
            throw new BBTagRuntimeError('Role above author');

        const result = await this.#roles.edit(context.runtime, role.id, { color });

        if (result === undefined || quiet)
            return;

        throw new BBTagRuntimeError('Failed to edit role: no perms', result.error);
    }
}

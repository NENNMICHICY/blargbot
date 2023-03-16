import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { BBTagRuntimeError, NotAnArrayError, RoleNotFoundError, UserNotFoundError } from '../../errors/index.js';
import type { BBTagLogger } from '../../services/BBTagLogger.js';
import type { RoleService } from '../../services/RoleService.js';
import type { UserService } from '../../services/UserService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import type { BBTagArrayTools } from '../../utils/index.js';
import { SubtagType } from '../../utils/index.js';
import type { BBTagValueConverter } from '../../utils/valueConverter.js';

const tag = textTemplates.subtags.userSetRoles;

@Subtag.id('userSetRoles', 'setRoles')
@Subtag.ctorArgs('arrayTools', 'converter', 'users', 'roles', 'logger')
export class UserSetRolesSubtag extends CompiledSubtag {
    readonly #arrayTools: BBTagArrayTools;
    readonly #converter: BBTagValueConverter;
    readonly #users: UserService;
    readonly #roles: RoleService;
    readonly #logger: BBTagLogger;

    public constructor(arrayTools: BBTagArrayTools, converter: BBTagValueConverter, users: UserService, roles: RoleService, logger: BBTagLogger) {
        super({
            category: SubtagType.USER,
            description: tag.description,
            definition: [
                {
                    parameters: ['roleArray?'],
                    description: tag.target.description,
                    exampleCode: tag.target.exampleCode,
                    exampleOut: tag.target.exampleOut,
                    returns: 'boolean',
                    execute: (ctx, [roles]) => this.userSetRole(ctx, roles.value, ctx.runtime.user.id, false)
                },
                {
                    parameters: ['roleArray', 'user', 'quiet?'],
                    description: tag.user.description,
                    exampleCode: tag.user.exampleCode,
                    exampleOut: tag.user.exampleOut,
                    returns: 'boolean',
                    execute: (ctx, [roles, user, quiet]) => this.userSetRole(ctx, roles.value, user.value, quiet.value !== '')
                }
            ]
        });

        this.#arrayTools = arrayTools;
        this.#converter = converter;
        this.#users = users;
        this.#roles = roles;
        this.#logger = logger;
    }

    public async userSetRole(
        context: BBTagScript,
        rolesStr: string,
        userStr: string,
        quiet: boolean
    ): Promise<boolean> {
        const topRole = context.runtime.roleEditPosition(context.runtime.authorizer);
        if (topRole <= 0)
            throw new BBTagRuntimeError('Author cannot remove roles');

        /*
         * Quiet suppresses all errors here instead of just the user errors
         * I feel like that is how it *should* work
        */
        quiet ||= context.runtime.scopes.local.quiet ?? false;
        const user = await this.#users.querySingle(context.runtime, userStr, { noLookup: quiet });
        if (user?.member === undefined) {
            throw new UserNotFoundError(userStr)
                .withDisplay(quiet ? 'false' : undefined);
        }

        const roleArr = await this.#arrayTools.deserializeOrGetArray(context.runtime, rolesStr !== '' ? rolesStr : '[]');
        if (roleArr === undefined) {
            throw new NotAnArrayError(rolesStr)
                .withDisplay(quiet ? 'false' : undefined);
        }

        const parsedRoles: string[] = [];

        for (const roleStr of roleArr.v.map(v => this.#converter.string(v))) {
            const role = await this.#roles.querySingle(context.runtime, roleStr, { noLookup: quiet });
            if (role === undefined) {
                throw new RoleNotFoundError(roleStr)
                    .withDisplay(quiet ? 'false' : undefined);
            }
            parsedRoles.push(role.id);
        }

        try {
            await this.#users.edit(context.runtime, user.id, { roles: parsedRoles });
            return true;
        } catch (err: unknown) {
            this.#logger.error(err);
            return false;
        }

    }
}

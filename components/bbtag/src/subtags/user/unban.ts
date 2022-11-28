import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { BBTagRuntimeError, UserNotFoundError } from '../../errors';
import templates from '../../text';
import { SubtagType } from '../../utils';

const tag = templates.subtags.unban;

export class UnbanSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'unban',
            category: SubtagType.USER,
            definition: [
                {
                    parameters: ['user'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'boolean',
                    execute: (ctx, [user]) => this.unbanUser(ctx, user.value, '', false)
                },
                {
                    parameters: ['user', 'reason', 'noPerms?'],
                    description: tag.withReason.description,
                    exampleCode: tag.withReason.exampleCode,
                    exampleOut: tag.withReason.exampleOut,
                    returns: 'boolean',
                    execute: (ctx, [user, reason, noPerms]) => this.unbanUser(ctx, user.value, reason.value, noPerms.value !== '')
                }
            ]
        });
    }

    public async unbanUser(
        context: BBTagContext,
        userStr: string,
        reason: string,
        noPerms: boolean
    ): Promise<boolean> {
        const user = await context.queryUser(userStr, { noErrors: context.scopes.local.noLookupErrors });

        if (user === undefined)
            throw new UserNotFoundError(userStr);

        if (reason === '')
            reason = 'Tag Unban';

        const authorizer = noPerms ? context.authorizer?.user ?? context.user : context.user;
        const result = await context.util.unban(context.guild, user, context.user, authorizer, reason);

        switch (result) {
            case 'success': return true;
            case 'moderatorNoPerms': throw new BBTagRuntimeError('User has no permissions');
            case 'noPerms': throw new BBTagRuntimeError('Bot has no permissions');
            case 'notBanned': return false;
        }
    }
}

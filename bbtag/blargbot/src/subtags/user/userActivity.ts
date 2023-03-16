import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { UserNotFoundError } from '../../errors/index.js';
import type { UserService } from '../../services/UserService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.userActivity;

@Subtag.id('userActivity', 'userGame')
@Subtag.ctorArgs('users')
export class UserActivitySubtag extends CompiledSubtag {
    readonly #users: UserService;

    public constructor(users: UserService) {
        super({
            category: SubtagType.USER,
            description: tag.description,
            definition: [
                {
                    parameters: [],
                    description: tag.target.description,
                    exampleCode: tag.target.exampleCode,
                    exampleOut: tag.target.exampleOut,
                    returns: 'string',
                    execute: (ctx) => this.getUserActivity(ctx, '', true)
                },
                {
                    parameters: ['user', 'quiet?'],
                    description: tag.user.description,
                    exampleCode: tag.user.exampleCode,
                    exampleOut: tag.user.exampleOut,
                    returns: 'string',
                    execute: (ctx, [userId, quiet]) => this.getUserActivity(ctx, userId.value, quiet.value !== '')
                }
            ]
        });

        this.#users = users;
    }

    public async getUserActivity(
        context: BBTagScript,
        userId: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.runtime.scopes.local.quiet ?? false;
        const user = await this.#users.querySingle(context.runtime, userId, { noLookup: quiet });

        if (user?.member === undefined) {
            throw new UserNotFoundError(userId)
                .withDisplay(quiet ? '' : undefined);
        }

        return user.member.activities[0]?.name ?? 'nothing';
    }
}

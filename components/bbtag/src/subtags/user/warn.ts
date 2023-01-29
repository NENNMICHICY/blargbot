import type { BBTagContext } from '../../BBTagContext.js';
import type { BBTagUtilities, BBTagValueConverter } from '../../BBTagUtilities.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { NotANumberError, UserNotFoundError } from '../../errors/index.js';
import type { UserService } from '../../services/UserService.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.warn;

@Subtag.names('warn')
@Subtag.ctorArgs(Subtag.converter(), Subtag.util(), Subtag.service('user'))
export class WarnSubtag extends CompiledSubtag {
    readonly #converter: BBTagValueConverter;
    readonly #util: BBTagUtilities;
    readonly #users: UserService;

    public constructor(converter: BBTagValueConverter, util: BBTagUtilities, users: UserService) {
        super({
            category: SubtagType.USER,
            description: tag.description,
            definition: [
                {
                    parameters: ['user?'],
                    description: tag.default.description,
                    exampleCode: tag.default.exampleCode,
                    exampleOut: tag.default.exampleOut,
                    returns: 'number',
                    execute: (ctx, [user]) => this.warnUser(ctx, user.value, '1', '')
                },
                {
                    parameters: ['user', 'count:1', 'reason?'],
                    description: tag.withReason.description,
                    exampleCode: tag.withReason.exampleCode,
                    exampleOut: tag.withReason.exampleOut,
                    returns: 'number',
                    execute: (ctx, [user, count, reason]) => this.warnUser(ctx, user.value, count.value, reason.value)
                }
            ]
        });

        this.#converter = converter;
        this.#util = util;
        this.#users = users;
    }

    public async warnUser(
        context: BBTagContext,
        userStr: string,
        countStr: string,
        reason: string
    ): Promise<number> {
        const count = this.#converter.int(countStr);

        const user = await this.#users.querySingle(context, userStr);

        if (user === undefined)
            throw new UserNotFoundError(userStr);

        if (count === undefined)
            throw new NotANumberError(countStr);

        return await this.#util.warn(user, context.user, count, reason !== '' ? reason : 'Tag Warning');
    }
}

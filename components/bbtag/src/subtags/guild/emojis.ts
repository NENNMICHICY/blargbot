import type { BBTagContext } from '../../BBTagContext.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { Subtag } from '../../Subtag.js';
import templates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = templates.subtags.emojis;

//TODO IMO this should return an array of emoji IDs instead of an array of emojis
@Subtag.id('emojis')
@Subtag.ctorArgs()
export class EmojisSubtag extends CompiledSubtag {
    public constructor() {
        super({
            category: SubtagType.GUILD,
            description: tag.description,
            definition: [
                {
                    parameters: [],
                    description: tag.all.description,
                    exampleCode: tag.all.exampleCode,
                    exampleOut: tag.all.exampleOut,
                    returns: 'string[]',
                    execute: (context) => this.getAllEmojis(context)
                },
                {
                    parameters: ['role'],
                    description: tag.forRole.description,
                    exampleCode: tag.forRole.exampleCode,
                    exampleOut: tag.forRole.exampleOut,
                    returns: 'string[]',
                    execute: (ctx, [role]) => this.getEmojisForRole(ctx, role.value)
                }
            ]
        });
    }

    public getAllEmojis(context: BBTagContext): string[] {
        return context.guild.emojis.map(e => `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`);
    }

    public async getEmojisForRole(context: BBTagContext, roleStr: string): Promise<string[]> {
        const role = await context.queryRole(roleStr, { noErrors: true, noLookup: true });

        // if (role === undefined)
        //     throw new RoleNotFoundError(roleStr) //TODO add this to other role subtags too, but when versioning is a thing to avoid incompatibilities

        const roleId = role?.id ?? roleStr;

        const emojis = context.guild.emojis.filter(e => (e.roles as string[] | undefined)?.includes(roleId) === true)
            .map(e => `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`);
        return emojis;
    }
}

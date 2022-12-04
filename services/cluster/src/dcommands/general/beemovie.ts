import { CommandType, randChoose } from '@blargbot/cluster/utils/index.js';
import { util } from '@blargbot/formatting';
import res from '@blargbot/res';

import { CommandContext, GlobalCommand } from '../../command/index.js';
import templates from '../../text.js';
import { CommandResult } from '../../types.js';

const cmd = templates.commands.beeMovie;

const script = await res.beeMovie.load();
const scriptMap = script.reduce<{ characterLines: typeof script; allLines: typeof script; }>((a, l) => {
    if (l.type !== 2)
        a.allLines.push(l);
    if (l.type === 0)
        a.characterLines.push(l);
    return a;
}, { characterLines: [], allLines: [] });

export class BeemovieCommand extends GlobalCommand {
    public constructor() {
        super({
            name: 'beemovie',
            category: CommandType.GENERAL,
            flags: [
                { flag: 'n', word: 'name', description: cmd.flags.name },
                { flag: 'c', word: 'characters', description: cmd.flags.characters }
            ],
            definitions: [
                {
                    parameters: '',
                    description: cmd.default.description,
                    execute: (ctx, _, flags) => this.getQuote(ctx, flags.n !== undefined, flags.c !== undefined)
                }
            ]
        });
    }

    public getQuote(context: CommandContext, showName: boolean, charactersOnly: boolean): CommandResult {
        const lines = scriptMap[charactersOnly ? 'characterLines' : 'allLines'];
        const line = randChoose(lines);

        if (showName && line.actor !== undefined)
            return util.literal(`${context.config.discord.emotes.beemovie} **${line.actor}**\n${line.content}`);
        return util.literal(`${context.config.discord.emotes.beemovie} ${line.content}`);
    }
}

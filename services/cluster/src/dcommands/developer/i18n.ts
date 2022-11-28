import { FormatString } from '@blargbot/formatting';

import { CommandContext } from '../../command/CommandContext';
import { GlobalCommand } from '../../command/GlobalCommand';
import templates from '../../text';
import { CommandResult } from '../../types';
import { CommandType } from '../../utils/index';

const cmd = templates.commands.i18n;

export class I18nCommand extends GlobalCommand {
    public constructor() {
        super({
            name: 'i18n',
            category: CommandType.DEVELOPER,
            definitions: [
                {
                    parameters: 'export {withValue:literal(keys|values)=values}',
                    description: cmd.export.description,
                    execute: (_, [full]) => this.export(full.asString === 'values')
                },
                {
                    parameters: 'reload',
                    description: cmd.reload.description,
                    execute: (ctx) => this.reload(ctx)
                }
            ]
        });
    }

    public reload(context: CommandContext): CommandResult {
        context.cluster.worker.send('reloadTranslations', undefined);
        return cmd.reload.success;
    }

    public export(includeValues: boolean): CommandResult {
        const result: I18nExport = {};
        for (const entry of FormatString.list()) {
            const path = entry.id.split('.');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const name = path.pop()!;
            let current = result;
            for (const key of path) {
                const val = current[key] ??= {};
                if (typeof val === 'string')
                    throw new Error(`Key conflict - ${entry.id} conflicts with another key`);
                current = val;
            }
            if (current[name] !== undefined)
                throw new Error(`Key conflict - ${entry.id} conflicts with another key`);

            current[name] = includeValues ? entry.template : null;
        }

        return {
            file: Object.entries(result)
                .map(([key, data]) => ({
                    file: JSON.stringify(data),
                    name: `${key}.json`
                }))
        };
    }

}

interface I18nExport {
    [key: string]: string | I18nExport | undefined | null;
}

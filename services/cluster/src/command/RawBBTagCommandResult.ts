import { SendContent } from '@blargbot/core/types.js';
import { format, IFormattable, IFormatter } from '@blargbot/formatting';

import { discord } from '../utils/index.js';

export class RawBBTagCommandResult implements IFormattable<string | SendContent<string>> {
    readonly #inline: IFormattable<string>;
    readonly #attached: IFormattable<string>;
    readonly #content: string;
    readonly #fileName: string;

    public constructor(inline: IFormattable<string>, attached: IFormattable<string>, content: string, fileName: string) {
        this.#inline = inline;
        this.#attached = attached;
        this.#content = content;
        this.#fileName = fileName;
    }

    public [format](formatter: IFormatter): string | SendContent<string> {
        if (this.#content.includes('```'))
            return this.#attach(formatter);

        const inlineRaw = this.#inline[format](formatter);
        if (discord.getLimit('content') < inlineRaw.length)
            return this.#attach(formatter);

        return inlineRaw;
    }

    #attach(formatter: IFormatter): SendContent<string> {
        return {
            content: this.#attached[format](formatter),
            file: [
                {
                    name: this.#fileName,
                    file: this.#content
                }
            ]
        };
    }
}

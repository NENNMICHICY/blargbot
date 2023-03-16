import type { BBTagScript } from '../../BBTagScript.js';
import { CompiledSubtag } from '../../compilation/index.js';
import { ChannelNotFoundError } from '../../errors/index.js';
import type { ChannelService } from '../../services/ChannelService.js';
import { Subtag } from '../../Subtag.js';
import textTemplates from '../../text.js';
import { SubtagType } from '../../utils/index.js';

const tag = textTemplates.subtags.channels;

@Subtag.id('channels')
@Subtag.ctorArgs('channels')
export class ChannelsSubtag extends CompiledSubtag {
    readonly #channels: ChannelService;

    public constructor(channels: ChannelService) {
        super({
            category: SubtagType.CHANNEL,
            definition: [
                {
                    parameters: [],
                    description: tag.current.description,
                    exampleCode: tag.current.exampleCode,
                    exampleOut: tag.current.exampleOut,
                    returns: 'id[]',
                    execute: (ctx) => this.getChannels(ctx)
                },
                {
                    parameters: ['category', 'quiet?'],
                    description: tag.channel.description,
                    exampleCode: tag.channel.exampleCode,
                    exampleOut: tag.channel.exampleOut,
                    returns: 'id[]',
                    execute: (ctx, [category, quiet]) => this.getChannelsInCategory(ctx, category.value, quiet.value !== '')
                }
            ]
        });

        this.#channels = channels;
    }

    public async getChannels(context: BBTagScript): Promise<string[]> {
        const channels = await this.#channels.getAll(context.runtime);
        return channels.map(c => c.id);
    }

    public async getChannelsInCategory(context: BBTagScript, channelStr: string, quiet: boolean): Promise<string[]> {
        quiet ||= context.runtime.scopes.local.quiet ?? false;
        const channel = await this.#channels.querySingle(context.runtime, channelStr, { noLookup: quiet });
        if (channel === undefined) {
            throw new ChannelNotFoundError(channelStr)
                .withDisplay(quiet ? '' : undefined);
        }

        const channels = await this.#channels.getAll(context.runtime);
        return channels.filter(c => c.parent_id === channel.id).map(c => c.id);
    }
}

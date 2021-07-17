import { Cluster } from '@cluster';
import { DiscordEventService } from '@core/serviceTypes';
import { Guild, Member } from 'eris';

export class DiscordGuildMemeberRemoveHandler extends DiscordEventService<'guildMemberRemove'> {
    public constructor(protected readonly cluster: Cluster) {
        super(cluster.discord, 'guildMemberRemove', cluster.logger);
    }

    protected async execute(_guild: Guild, member: Member): Promise<void> {
        await Promise.all([
            this.cluster.moderation.bans.userLeft(member),
            this.cluster.moderation.eventLog.userLeft(member),
            this.cluster.greetings.farewell(member)
        ]);
    }
}

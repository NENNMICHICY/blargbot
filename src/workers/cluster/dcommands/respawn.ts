import { BaseGlobalCommand, CommandContext } from '@cluster/command';
import { ClusterRespawnRequest } from '@cluster/types';
import { CommandType, humanize } from '@cluster/utils';

export class RespawnCommand extends BaseGlobalCommand {
    public constructor() {
        super({
            name: 'respawn',
            category: CommandType.STAFF,
            description: 'Cluster respawning only for staff.',
            definitions: [
                {
                    parameters: '{clusterId:integer}',
                    execute: (ctx, [clusterId]) => this.respawn(ctx, clusterId),
                    description: 'Respawns the cluster specified'
                }
            ]
        });
    }

    public async respawn(context: CommandContext, clusterId: number): Promise<void> {
        await context.send(context.config.discord.channels.shardlog, `**${humanize.fullName(context.author)}** has called for a respawn of cluster ${clusterId}.`);
        context.cluster.worker.send('respawn', <ClusterRespawnRequest>{ id: clusterId, channel: context.channel.id });
        await context.send(context, `ok cluster ${clusterId} is being respawned and stuff now`);
    }
}

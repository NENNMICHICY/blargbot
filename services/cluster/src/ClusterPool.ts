import { ClusterWorkerConfiguration } from '@blargbot/config';
import { ProcessMessageHandler } from '@blargbot/core/types';
import { WorkerPool } from '@blargbot/core/worker';
import { Logger } from '@blargbot/logger';

import { ClusterConnection } from './ClusterConnection';

export class ClusterPool extends WorkerPool<ClusterConnection> {
    public constructor(
        public readonly config: ClusterWorkerConfiguration,
        logger: Logger
    ) {
        super({
            type: 'Cluster',
            workerCount: Math.ceil(config.max / config.perCluster),
            defaultTimeout: config.spawnTime + 5000 * config.perCluster,
            logger,
            maxConcurrentSpawning: config.concurrency ?? 1
        });
    }

    public getForGuild(guildId: string): ClusterConnection {
        const shardId = Number(BigInt(guildId) >> 22n) % this.config.max;
        return this.getForShard(shardId);
    }

    public getForShard(shardId: number): ClusterConnection {
        if (shardId > this.config.max)
            throw new Error(`Shard ${shardId} doesnt exist!`);

        const clusterId = Math.floor(shardId / this.config.perCluster);
        if (clusterId > this.workerCount)
            throw new Error(`Cluster ${clusterId} doesnt exist!`);

        return this.get(clusterId);
    }

    protected createWorker(id: number): ClusterConnection {
        const cluster = new ClusterConnection(
            id,
            this.shardRange(id),
            this.config.max,
            this.config.maxMemory,
            this.logger
        );

        const currentCluster = this.tryGet(id);
        if (currentCluster !== undefined) {
            const shardReady: ProcessMessageHandler<number, never> = ({ data: shardId }) => {
                try {
                    currentCluster.send('killshard', shardId);
                } catch (err: unknown) {
                    this.logger.error('Wasn\'t able to send killShard', shardId, 'message to cluster', id, err);
                }
            };

            cluster.on('shardReady', shardReady);
            cluster.once('ready', () => cluster.off('shardReady', shardReady));
        }

        return cluster;
    }

    public shardRange(clusterId: number): [firstShard: number, lastShard: number] {
        if (clusterId >= this.workerCount)
            throw new Error(`Cluster ${clusterId} doesnt exist`);

        const perCluster = this.config.perCluster;
        const firstShard = clusterId * perCluster;
        const lastShard = Math.min(firstShard + perCluster, this.config.max) - 1;
        return [firstShard, lastShard];
    }
}

import { Logger } from '@core/Logger';
import { ProcessMessageHandler } from '@core/types';
import { WorkerPool } from '@core/worker';

import { ClusterConnection } from './ClusterConnection';

export class ClusterPool extends WorkerPool<ClusterConnection> {
    public constructor(
        public readonly config: Configuration['discord']['shards'],
        logger: Logger
    ) {
        super('Cluster',
            Math.ceil(config.max / config.perCluster),
            config.spawnTime,
            logger);
    }

    protected createWorker(id: number): ClusterConnection {
        const cluster = new ClusterConnection(
            id,
            this.shardRange(id),
            this.config.max,
            this.logger
        );

        const currentCluster = this.tryGet(id);
        if (currentCluster !== undefined) {
            const shardReady: ProcessMessageHandler = shardId => {
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

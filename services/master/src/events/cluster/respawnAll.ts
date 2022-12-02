import { ClusterConnection } from '@blargbot/cluster';
import { FormattableMessageContent } from '@blargbot/core/FormattableMessageContent.js';
import { WorkerPoolEventService } from '@blargbot/core/serviceTypes/index.js';
import { Timer } from '@blargbot/core/Timer.js';
import { util } from '@blargbot/formatting';
import { Master } from '@blargbot/master';

export class ClusterRespawnAllHandler extends WorkerPoolEventService<ClusterConnection, 'respawnAll'> {
    readonly #master: Master;

    public constructor(master: Master) {
        super(
            master.clusters,
            'respawnAll',
            async ({ data }) => {
                await this.respawnAll(data.channelId);
            });
        this.#master = master;
    }

    public async respawnAll(channelId: string): Promise<void> {
        this.#master.logger.log('Respawning all clusters');
        const timer = new Timer().start();
        await this.#master.clusters.spawnAll();
        timer.end();
        await this.#master.util.send(channelId, new FormattableMessageContent({
            content: util.literal(`I'm back! It only took me ${timer.format()}.`)
        }));
        this.#master.logger.log('Respawn complete');
    }
}

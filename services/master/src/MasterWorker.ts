import { Configuration } from '@blargbot/config/Configuration';
import { BaseWorker } from '@blargbot/core/worker';
import { Logger } from '@blargbot/logger';
import { MasterIPCContract, MasterOptions } from '@blargbot/master/types';

import { Master } from './Master';

export class MasterWorker extends BaseWorker<MasterIPCContract> {
    public readonly master: Master;

    public constructor(
        logger: Logger,
        config: Configuration,
        options: Omit<MasterOptions, 'worker'>
    ) {
        super(logger);

        logger.info(`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

MAIN PROCESS INITIALIZED

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);

        this.master = new Master(logger, config, { ...options, worker: this });
    }

    public async start(): Promise<void> {
        await this.master.start();
        super.start();
    }
}

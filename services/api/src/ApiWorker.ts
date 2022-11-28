import { Configuration } from '@blargbot/config';
import { BaseWorker } from '@blargbot/core/worker';
import { Logger } from '@blargbot/logger';

import { Api } from './Api';
import { ApiIPCContracts } from './types';

export class ApiWorker extends BaseWorker<ApiIPCContracts> {
    public readonly webServer: Api;

    public constructor(
        public readonly config: Configuration,
        logger: Logger
    ) {
        super(logger);
        this.logger.init(`API (pid ${this.id}) PROCESS INITIALIZED`);

        this.webServer = new Api(logger, config, { worker: this });
    }

    public async start(): Promise<void> {
        await this.webServer.start();
        super.start();
    }

    public async stop(): Promise<void> {
        await this.webServer.stop();
        await super.stop();
    }
}

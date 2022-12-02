import { Cluster } from '@blargbot/cluster';
import { TimeoutEventService } from '@blargbot/cluster/serviceTypes/index.js';
import { FormattableMessageContent } from '@blargbot/core/FormattableMessageContent.js';
import { StoredEvent } from '@blargbot/domain/models/index.js';
import moment from 'moment-timezone';

import templates from '../../text.js';

export class TimeoutRemindEventService extends TimeoutEventService<'remind'> {
    public constructor(protected readonly cluster: Cluster) {
        super(cluster.timeouts, 'remind', cluster.logger);
    }
    public async execute(event: StoredEvent<'remind'>): Promise<void> {
        await this.cluster.util.send(event.channel, new FormattableMessageContent({
            content: templates.commands.remind.default.event({
                userId: event.user,
                start: moment(event.starttime),
                content: event.content
            }),
            allowedMentions: { users: [event.user] }
        }));
    }
}

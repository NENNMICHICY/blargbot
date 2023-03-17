import { inspect } from 'node:util';

import type { AnalysisResults, ExecutionResult, Subtag } from '@bbtag/blargbot';
// import { BBTagRunner, createBBTagArrayTools, createBBTagJsonTools, createBBTagOperators, createValueConverter, DefaultLockService, InProcessCooldownService, smartStringCompare, subtags, tagVariableScopeProviders } from '@bbtag/blargbot';
import type { ClusterOptions } from '@blargbot/cluster/types.js';
import type { Configuration } from '@blargbot/config';
import { BaseClient } from '@blargbot/core/BaseClient.js';
// import { metrics } from '@blargbot/core/Metrics.js';
import { BaseService } from '@blargbot/core/serviceTypes/index.js';
import type { EvalResult } from '@blargbot/core/types.js';
// import { createSafeRegExp } from '@blargbot/core/utils/createSafeRegExp.js';
import Discord from '@blargbot/discord-types';
import type { Logger } from '@blargbot/logger';
import { ModuleLoader } from '@blargbot/modules';
// import { Timer } from '@blargbot/timer';
import moment from 'moment-timezone';

// import ReadWriteLock from 'rwlock';
import { ClusterUtilities } from './ClusterUtilities.js';
import type { ClusterWorker } from './ClusterWorker.js';
import { CommandDocumentationManager } from './managers/documentation/CommandDocumentationManager.js';
import { AggregateCommandManager, AnnouncementManager, AutoresponseManager, AwaiterManager, BotStaffManager, ContributorManager, CustomCommandManager, DefaultCommandManager, DomainManager, GreetingManager, GuildManager, IntervalManager, ModerationManager, PollManager, PrefixManager, RolemeManager, TimeoutManager, VersionStateManager } from './managers/index.js';
// import { ClusterDeferredExecutionService } from './utils/bbtag/ClusterDeferredExecutionService.js';
// import { ClusterDomainFilterService } from './utils/bbtag/ClusterDomainFilterService.js';
// import { ClusterDumpService } from './utils/bbtag/ClusterDumpService.js';
// import { ClusterModlogService } from './utils/bbtag/ClusterModlogService.js';
// import { ClusterStaffService } from './utils/bbtag/ClusterStaffService.js';
// import { ClusterWarningService } from './utils/bbtag/ClusterWarningService.js';
// import { ErisBBTagChannelService } from './utils/bbtag/ErisBBTagChannelService.js';
// import { ErisBBTagGuildService } from './utils/bbtag/ErisBBTagGuildService.js';
// import { ErisBBTagMessageService } from './utils/bbtag/ErisBBTagMessageService.js';
// import { ErisBBTagRoleService } from './utils/bbtag/ErisBBTagRoleService.js';
// import { ErisBBTagUserService } from './utils/bbtag/ErisBBTagUserService.js';

export class Cluster extends BaseClient {
    public readonly id: number;
    public readonly createdAt: moment.Moment;
    public readonly worker: ClusterWorker;
    public readonly services: ModuleLoader<BaseService>;
    public readonly util: ClusterUtilities;
    public readonly timeouts: TimeoutManager;
    public readonly autoresponses: AutoresponseManager;
    public readonly contributors: ContributorManager;
    public readonly events: ModuleLoader<BaseService>;
    public readonly botStaff: BotStaffManager;
    public readonly moderation: ModerationManager;
    public readonly prefixes: PrefixManager;
    public readonly commands: AggregateCommandManager;
    public readonly domains: DomainManager;
    public readonly greetings: GreetingManager;
    public readonly polls: PollManager;
    public readonly intervals: IntervalManager;
    public readonly rolemes: RolemeManager;
    public readonly help: CommandDocumentationManager;
    public readonly awaiter: AwaiterManager;
    public readonly version: VersionStateManager;
    public readonly guilds: GuildManager;
    public readonly announcements: AnnouncementManager;

    public readonly bbtag: {
        execute(...args: unknown[]): Promise<ExecutionResult>;
        check(content: string): AnalysisResults;
        subtags: Map<string, Subtag>;
    };

    public constructor(
        worker: ClusterWorker,
        logger: Logger,
        config: Configuration,
        options: ClusterOptions
    ) {
        super({
            logger,
            config,
            discordConfig: {
                autoreconnect: true,
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                },
                getAllUsers: false,
                disableEvents: {
                    ['TYPING_START']: true,
                    ['VOICE_STATE_UPDATE']: true
                },
                maxShards: options.shardCount,
                firstShardID: options.firstShardId,
                lastShardID: options.lastShardId,
                restMode: true,
                defaultImageFormat: 'png',
                defaultImageSize: 512,
                messageLimit: 5,
                intents: Discord.GatewayIntentBits.Guilds
                    | Discord.GatewayIntentBits.GuildMembers
                    | Discord.GatewayIntentBits.GuildBans
                    | Discord.GatewayIntentBits.GuildPresences
                    | Discord.GatewayIntentBits.GuildMessages
                    | Discord.GatewayIntentBits.GuildMessageReactions
                    | Discord.GatewayIntentBits.GuildEmojisAndStickers
                    | Discord.GatewayIntentBits.DirectMessages
                    | Discord.GatewayIntentBits.DirectMessageReactions
            }
        });

        this.bbtag = {
            execute() {
                throw null;
            },
            check() {
                throw null;
            },
            subtags: new Map()
        };
        this.id = options.id;
        this.worker = worker;
        this.createdAt = Object.freeze(moment());
        this.guilds = new GuildManager(this);
        this.domains = new DomainManager(this.database.vars);
        this.prefixes = new PrefixManager(this.config.discord.defaultPrefix, this.database.guilds, this.database.users, this.discord);
        this.commands = new AggregateCommandManager(this, {
            custom: new CustomCommandManager(this),
            default: new DefaultCommandManager(import.meta, 'dcommands', this)
        });
        this.events = new ModuleLoader(import.meta, 'events', BaseService, [this], this.logger, e => e.name);
        this.services = new ModuleLoader(import.meta, 'services', BaseService, [this, options], this.logger, e => e.name);
        this.util = new ClusterUtilities(this);
        this.timeouts = new TimeoutManager(this);
        this.autoresponses = new AutoresponseManager(this);
        this.contributors = new ContributorManager(this);
        this.polls = new PollManager(this);
        this.botStaff = new BotStaffManager(this);
        this.moderation = new ModerationManager(this);
        this.greetings = new GreetingManager(this);
        // const converter = createValueConverter({
        //     regex: createSafeRegExp,
        //     colors: {}
        // });
        // const bbtagArrayTools = createBBTagArrayTools({
        //     convertToInt: converter.int
        // });
        // const bbtag = new BBTagRunner({
        //     subtags: Object.values(subtags).map(Subtag.getDescriptor),
        //     defer: new ClusterDeferredExecutionService(this),
        //     domains: new ClusterDomainFilterService(this),
        //     dump: new ClusterDumpService(this),
        //     modLog: new ClusterModlogService(this),
        //     staff: new ClusterStaffService(this),
        //     warnings: new ClusterWarningService(this),
        //     lock: new DefaultLockService({
        //         createLock() {
        //             const lock = new ReadWriteLock();
        //             return {
        //                 acquire(exclusive) {
        //                     return new Promise(res => exclusive
        //                         ? lock.writeLock(res)
        //                         : lock.readLock(res));
        //                 }
        //             };
        //         }
        //     }),
        //     cooldowns: new InProcessCooldownService(),
        //     sources: {
        //         get: async (ctx, type, name) => {
        //             if (type === 'cc') {
        //                 const ccommand = await this.database.guilds.getCommand(ctx.guild.id, name);
        //                 if (ccommand === undefined)
        //                     return undefined;

        //                 if (!('alias' in ccommand)) {
        //                     return {
        //                         content: ccommand.content,
        //                         cooldown: ccommand.cooldown ?? 0
        //                     };
        //                 }

        //                 name = ccommand.alias;
        //             }

        //             const tag = await this.database.tags.get(name);
        //             if (tag === undefined)
        //                 return undefined;

        //             return {
        //                 content: tag.content,
        //                 cooldown: tag.cooldown ?? 0
        //             };
        //         }
        //     },
        //     timezones: {
        //         get: (_ctx, userId) => this.database.users.getProp(userId, 'timezone')
        //     },
        //     variables: {
        //         get: (scope, name) => this.database.tagVariables.get(name, scope),
        //         set: (entries) => this.database.tagVariables.upsert(entries)
        //     },
        //     variableScopes: tagVariableScopeProviders,
        //     variableMiddleware: [],
        //     logger: {
        //         error: (...args) => this.logger.error(...args),
        //         info: (...args) => this.logger.bbtag(...args)
        //     },
        //     // subtags: Object.values(Subtags)
        //     //     .map(Subtag.getDescriptor),
        //     arrayTools: bbtagArrayTools,
        //     jsonTools: createBBTagJsonTools({
        //         convertToInt: converter.int,
        //         isTagArray: bbtagArrayTools.isTagArray
        //     }),
        //     operators: createBBTagOperators({
        //         compare: smartStringCompare,
        //         convertToString: converter.string,
        //         parseArray: v => bbtagArrayTools.deserialize(v)?.v
        //     }),
        //     converter: createValueConverter({
        //         regex: createSafeRegExp,
        //         colors: {}
        //     }),
        //     channels: new ErisBBTagChannelService(this),
        //     users: new ErisBBTagUserService(this),
        //     roles: new ErisBBTagRoleService(this),
        //     guild: new ErisBBTagGuildService(this),
        //     messages: new ErisBBTagMessageService(this),
        //     subtagMiddleware: [
        //         async ({ subtag }, next) => {
        //             const timer = new Timer().start();
        //             try {
        //                 return await next();
        //             } finally {
        //                 timer.end();
        //                 metrics.subtagLatency.labels(subtag.id).observe(timer.elapsed);
        //                 metrics.subtagCounter.labels(subtag.id).inc();
        //             }
        //         }
        //     ]
        // });
        // bbtag;
        this.intervals = new IntervalManager(this, moment.duration(10, 's'));
        this.rolemes = new RolemeManager(this);
        this.help = new CommandDocumentationManager(this);
        this.awaiter = new AwaiterManager(this.logger);
        this.version = new VersionStateManager(this.database.vars);
        this.announcements = new AnnouncementManager(this.database.guilds, this.util, this.commands.default);

        this.services.on('add', module => void module.start());
        this.services.on('remove', module => void module.stop());
        this.events.on('add', module => void module.start());
        this.events.on('remove', module => void module.stop());
        this.discord.on('interactionCreate', i => this.help.handleInteraction(i));
    }

    public async start(): Promise<void> {
        await this.events.init();

        await Promise.all([
            super.start(),
            this.connectDiscordGateway(),
            this.commands.load()
        ]);

        await this.services.init();
    }

    public async eval(this: Cluster, author: string, text: string): Promise<EvalResult> {
        if (this.util.isBotOwner(author) === false)
            throw new Error(`User ${author} does not have permission to run eval`);

        try {
            const code = text.split('\n').length === 1
                ? `async () => (${text})`
                : `async () => { ${text} }`;
            const func = eval(code) as () => Promise<unknown>;
            return { success: true, result: await func.call(this) };
        } catch (err: unknown) {
            return { success: false, error: inspect(err) };
        }
    }
}

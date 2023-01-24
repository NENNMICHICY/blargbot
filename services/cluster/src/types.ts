import type { SubtagOptions } from '@blargbot/bbtag';
import type { CommandType, ModerationType } from '@blargbot/cluster/utils/index.js';
import type { EvalRequest, EvalResult, GlobalEvalResult, IMiddleware, MasterEvalRequest, SendContent } from '@blargbot/core/types.js';
import type { CommandPermissions, GuildSettingDocs, GuildSourceCommandTag, NamedGuildCommandTag } from '@blargbot/domain/models/index.js';
import type { FlagDefinition, FlagResult } from '@blargbot/flags';
import type { IFormattable } from '@blargbot/formatting';
import type * as Eris from 'eris';
import type moment from 'moment-timezone';
import type { metric } from 'prom-client';

import type { ClusterUtilities } from './ClusterUtilities.js';
import type { Command, CommandContext, ScopedCommand } from './command/index.js';

export type ClusterIPCContract = {
    shardReady: { masterGets: number; workerGets: never; };
    meval: { masterGets: MasterEvalRequest; workerGets: GlobalEvalResult | EvalResult; };
    killshard: { masterGets: never; workerGets: number; };
    ceval: { masterGets: EvalResult; workerGets: EvalRequest; };
    getSubtagList: { masterGets: SubtagListResult; workerGets: undefined; };
    getSubtag: { masterGets: SubtagDetails | undefined; workerGets: string; };
    getGuildPermissionList: { masterGets: GuildPermissionDetails[]; workerGets: { userId: string; }; };
    getGuildPermission: { masterGets: GuildPermissionDetails | undefined; workerGets: { userId: string; guildId: string; }; };
    respawn: { masterGets: { id?: number; channel: string; }; workerGets: boolean; };
    respawnApi: { masterGets: undefined; workerGets: boolean; };
    respawnAll: { masterGets: { channelId: string; }; workerGets: boolean; };
    killAll: { masterGets: undefined; workerGets: undefined; };
    clusterStats: { masterGets: ClusterStats; workerGets: never; };
    getClusterStats: { masterGets: undefined; workerGets: Record<number, ClusterStats | undefined>; };
    getCommandList: { masterGets: CommandListResult; workerGets: undefined; };
    getGuildSettings: { masterGets: GuildSettingDocs; workerGets: undefined; };
    getCommand: { masterGets: CommandListResultItem | undefined; workerGets: string; };
    metrics: { masterGets: metric[]; workerGets: undefined; };
    reloadTranslations: { masterGets: undefined; workerGets: undefined; };
}

export interface ICommandManager<T = unknown> {
    readonly size: number;
    get(name: string, location?: Eris.Guild | Eris.KnownTextableChannel, user?: Eris.User): Promise<CommandGetResult<T>>;
    list(location?: Eris.Guild | Eris.KnownTextableChannel, user?: Eris.User): AsyncIterable<CommandGetResult<T>>;
    configure(user: Eris.User, names: readonly string[], guild: Eris.Guild, permissions: Partial<CommandPermissions>): Promise<readonly string[]>;
    load(commands?: Iterable<string> | boolean): Promise<void>;
}

export interface ICommandDetails<TString> extends Required<CommandPermissions> {
    readonly name: string;
    readonly aliases: readonly string[];
    readonly category: CommandProperties;
    readonly description: TString | undefined;
    readonly flags: ReadonlyArray<FlagDefinition<string | TString>>;
    readonly signatures: ReadonlyArray<CommandSignature<TString>>;
}

export interface ICommand<T = unknown> extends ICommandDetails<IFormattable<string>>, IMiddleware<CommandContext, CommandResult> {
    readonly id: string;
    readonly name: string;
    readonly implementation: T;
    readonly isOnWebsite: boolean;
}

export type Result<State, Detail = undefined, Optional extends boolean = Detail extends undefined ? true : false> = Optional extends false
    ? { readonly state: State; readonly detail: Detail; }
    : { readonly state: State; readonly detail?: Detail; };

export type PermissionCheckResult =
    | Result<'ALLOWED'>
    | Result<'BLACKLISTED', string>
    | Result<'DISABLED'>
    | Result<'NOT_IN_GUILD'>
    | Result<'MISSING_ROLE', readonly string[]>
    | Result<'MISSING_PERMISSIONS', bigint>;

export type CommandGetResult<T = unknown> =
    | Result<'NOT_FOUND'>
    | {
        [P in PermissionCheckResult['state']]: Extract<PermissionCheckResult, { state: P; }> extends Result<infer State, infer Detail>
        ? Result<State, { readonly command: ICommand<T>; readonly reason: Detail; }>
        : never
    }[PermissionCheckResult['state']]

export type CommandGetCoreResult<T = unknown> =
    | CommandGetResult<T>
    | Result<'FOUND', ICommand<T>>;

export type CommandManagerTypeMap = {
    custom: NamedGuildCommandTag;
    default: Command;
};

export type CommandManagers = { [P in keyof CommandManagerTypeMap]: ICommandManager<CommandManagerTypeMap[P]> }

export interface CommandOptionsBase {
    readonly name: string;
    readonly aliases?: readonly string[];
    readonly category: CommandType;
    readonly cannotDisable?: boolean;
    readonly description?: IFormattable<string>;
    readonly flags?: ReadonlyArray<FlagDefinition<IFormattable<string>>>;
    readonly hidden?: boolean;
}

export interface CommandBaseOptions extends CommandOptionsBase {
    readonly signatures: ReadonlyArray<CommandSignature<IFormattable<string>>>;
}

export interface CommandOptions<TContext extends CommandContext> extends CommandOptionsBase {
    readonly definitions: ReadonlyArray<CommandDefinition<TContext>>;
}

export type CommandResult =
    | SendContent<IFormattable<string>>
    | IFormattable<string | SendContent<string>>
    | undefined;

export type CommandDefinition<TContext extends CommandContext> =
    | CommandHandlerDefinition<TContext>
    | SubcommandDefinitionHolder<TContext>
    | CommandHandlerDefinition<TContext> & SubcommandDefinitionHolder<TContext>;

export type CommandParameter =
    | CommandSingleParameter<keyof CommandVariableTypeMap, boolean>
    | CommandGreedyParameter<keyof CommandVariableTypeMap>
    | CommandLiteralParameter;

export interface CommandHandlerDefinition<TContext extends CommandContext> {
    readonly description: IFormattable<string>;
    readonly parameters: string;
    readonly hidden?: boolean;
    readonly execute: (context: TContext, args: readonly CommandArgument[], flags: FlagResult) => Promise<CommandResult> | CommandResult;
}

export type CommandSingleArgument = {
    readonly [P in keyof CommandVariableTypeMap as `as${UppercaseFirst<P>}`]: CommandVariableTypeMap[P];
}

export type CommandOptionalArgument = {
    readonly [P in keyof CommandVariableTypeMap as `asOptional${UppercaseFirst<P>}`]: CommandVariableTypeMap[P] | undefined;
}

export type CommandArrayArgument = {
    readonly [P in keyof CommandVariableTypeMap as `as${UppercaseFirst<P>}s`]: ReadonlyArray<CommandVariableTypeMap[P]>;
}

export interface CommandArgument extends CommandSingleArgument, CommandArrayArgument, CommandOptionalArgument {
}

export interface SubcommandDefinitionHolder<TContext extends CommandContext> {
    readonly parameters: string;
    readonly hidden?: boolean;
    readonly subcommands: ReadonlyArray<CommandDefinition<TContext>>;
}

export type CommandVariableTypeMap = {
    literal: string;
    bigint: bigint;
    integer: number;
    number: number;
    role: Eris.Role;
    channel: Eris.KnownChannel;
    user: Eris.User;
    sender: Eris.User | Eris.Webhook;
    member: Eris.Member;
    duration: moment.Duration;
    boolean: boolean;
    string: string;
}

export type CommandVariableTypeName = keyof CommandVariableTypeMap;

export type CommandVariableParser = <TContext extends CommandContext>(this: void, value: string, state: CommandBinderState<TContext>) => Awaitable<CommandBinderParseResult>

export interface CommandVariableTypeBase<Name extends CommandVariableTypeName> {
    readonly name: Name;
    readonly type: Exclude<CommandVariableTypeName, 'literal'> | string[];
    readonly priority: number;
    parse: CommandVariableParser;
}

export interface LiteralCommandVariableType<T extends string> extends CommandVariableTypeBase<'literal'> {
    readonly choices: readonly T[];
}

export type UnmappedCommandVariableTypes = Exclude<CommandVariableTypeName, MappedCommandVariableTypes['name']>;
export type MappedCommandVariableTypes =
    | LiteralCommandVariableType<string>;

export type CommandVariableTypes =
    | MappedCommandVariableTypes
    | { [Name in UnmappedCommandVariableTypes]: CommandVariableTypeBase<Name> }[UnmappedCommandVariableTypes]

export type CommandVariableType<TName extends CommandVariableTypeName> = Extract<CommandVariableTypes, CommandVariableTypeBase<TName>>

export interface CommandSingleParameter<T extends CommandVariableTypeName, Concat extends boolean> {
    readonly kind: Concat extends false ? 'singleVar' : 'concatVar';
    readonly name: string;
    readonly raw: boolean;
    readonly type: CommandVariableType<T>;
    readonly required: boolean;
    readonly fallback: undefined | string;
}

export interface CommandGreedyParameter<T extends CommandVariableTypeName> {
    readonly kind: 'greedyVar';
    readonly name: string;
    readonly raw: boolean;
    readonly type: CommandVariableType<T>;
    readonly minLength: number;
}

export interface CommandLiteralParameter {
    readonly kind: 'literal';
    readonly name: string;
    readonly alias: string[];
}

export interface CommandHandler<TContext extends CommandContext> {
    get debugView(): string;
    readonly execute: (context: TContext) => Promise<CommandResult> | CommandResult;
}

export interface CommandSignature<TString, TParameter = CommandParameter> {
    readonly description: TString;
    readonly parameters: readonly TParameter[];
    readonly hidden: boolean;
}

export interface CommandSignatureHandler<TContext extends CommandContext> extends CommandSignature<IFormattable<string>> {
    readonly execute: (context: TContext, args: readonly CommandArgument[], flags: FlagResult) => Promise<CommandResult> | CommandResult;
}

export type CustomCommandShrinkwrap = {
    readonly [P in Exclude<keyof GuildSourceCommandTag, 'author' | 'authorizer' | 'id'>]: GuildSourceCommandTag[P]
}

export interface GuildShrinkwrap {
    readonly cc: Record<string, CustomCommandShrinkwrap | undefined>;
}

export interface SignedGuildShrinkwrap {
    readonly signature?: string;
    readonly payload: GuildShrinkwrap;
}

export interface LookupChannelResult {
    channel: string;
    guild: string;
}

export interface GetStaffGuildsRequest {
    user: string;
    guilds: string[];
}

export interface ClusterRespawnRequest {
    id?: number;
    channel: string;
}

export interface SubtagListResult {
    [tagName: string]: SubtagDetails | undefined;
}

export interface SubtagDetails extends SubtagOptions<string> {
    readonly name: string;
    readonly aliases: string[];
}

export interface GuildDetails {
    readonly id: string;
    readonly name: string;
    readonly iconUrl?: string;
}

export interface GuildPermissionDetails {
    readonly userId: string;
    readonly guild: GuildDetails;
    readonly ccommands: boolean;
    readonly censors: boolean;
    readonly autoresponses: boolean;
    readonly rolemes: boolean;
    readonly interval: boolean;
    readonly greeting: boolean;
    readonly farewell: boolean;
}

export interface CommandListResult {
    [commandName: string]: CommandListResultItem | undefined;
}

export interface CommandListResultItem extends Omit<ICommandDetails<string>, 'category'> {
    readonly category: string;
}

export interface ClusterStats {
    readonly id: number;
    readonly time: number;
    readonly readyTime: number;
    readonly guilds: number;
    readonly users: number;
    readonly channels: number;
    readonly rss: number;
    readonly userCpu: number;
    readonly systemCpu: number;
    readonly shardCount: number;
    readonly shards: readonly ShardStats[];
}

export interface ShardStats {
    readonly id: number;
    readonly status: Eris.Shard['status'];
    readonly latency: number;
    readonly guilds: number;
    readonly cluster: number;
    readonly time: number;
}
export interface ClusterOptions {
    readonly id: number;
    readonly shardCount: number;
    readonly firstShardId: number;
    readonly lastShardId: number;
    readonly holidays: Record<string, string>;
}

export interface ClusterPoolOptions {
    worker?: string;
}

export interface BanDetails {
    mod: Eris.User;
    reason: string;
}

export interface MassBanDetails {
    mod: Eris.User;
    type: string;
    users: Eris.User[];
    newUsers: Eris.User[];
    reason: string;
}

export type GuildCommandContext<TChannel extends Eris.KnownGuildTextableChannel = Eris.KnownGuildTextableChannel> = CommandContext<TChannel>;
export type PrivateCommandContext<TChannel extends Eris.KnownPrivateChannel = Eris.KnownPrivateChannel> = CommandContext<TChannel>;

export type CommandPropertiesSet = { [P in CommandType]: CommandProperties; }
export interface CommandProperties {
    readonly id: string;
    readonly name: IFormattable<string>;
    readonly description: IFormattable<string>;
    readonly defaultPerms: bigint;
    readonly isVisible: (util: ClusterUtilities, location?: Eris.Guild | Eris.KnownTextableChannel, user?: Eris.User) => boolean | Promise<boolean>;
    readonly color: number;
}

export interface SubtagVariableProperties {
    table: string;
}

export type WhitelistResponse = 'approved' | 'rejected' | 'requested' | 'alreadyApproved' | 'alreadyRejected';

export type PollResponse = BasePollResponse<'OPTIONS_EMPTY' | 'TOO_SHORT' | 'FAILED_SEND' | 'NO_ANNOUNCE_PERMS' | 'ANNOUNCE_INVALID'> | PollSuccess | PollInvalidOption;

export interface BasePollResponse<T extends string> {
    readonly state: T;
}

export interface PollInvalidOption<T extends string = 'OPTIONS_INVALID'> extends BasePollResponse<T> {
    readonly failedReactions: string[];
}

export interface PollSuccess extends PollInvalidOption<'SUCCESS'> {
    readonly message: Eris.KnownMessage;
}

export type EnsureMutedRoleResult = 'success' | 'unconfigured' | 'noPerms';
export type MuteResult = 'success' | 'alreadyMuted' | 'noPerms' | 'roleMissing' | 'roleTooHigh' | 'moderatorNoPerms' | 'moderatorTooLow';
export type UnmuteResult = 'success' | 'notMuted' | 'noPerms' | 'roleTooHigh' | 'moderatorNoPerms' | 'moderatorTooLow';
export type BanResult = 'success' | 'alreadyBanned' | 'noPerms' | 'memberTooHigh' | 'moderatorNoPerms' | 'moderatorTooLow';
export type MassBanResult = Eris.User[] | Exclude<BanResult, 'success'> | 'noUsers';
export type KickResult = 'success' | 'noPerms' | 'memberTooHigh' | 'moderatorNoPerms' | 'moderatorTooLow';
export type UnbanResult = 'success' | 'notBanned' | 'noPerms' | 'moderatorNoPerms';
export type TimeoutResult = 'success' | 'alreadyTimedOut' | 'noPerms' | 'moderatorNoPerms' | 'memberTooHigh' | 'moderatorTooLow';
export type TimeoutClearResult = 'success' | 'notTimedOut' | 'noPerms' | 'moderatorNoPerms';

export interface WarnDetails {
    readonly count: number;
    readonly banAt?: number;
    readonly kickAt?: number;
    readonly timeoutAt?: number;
}

export interface WarnResultBase<ModType extends ModerationType, TResult extends string> {
    readonly type: ModType;
    readonly warnings: number;
    readonly state: TResult;
}

export type WarnResult =
    | WarnResultBase<ModerationType.BAN, BanResult>
    | WarnResultBase<ModerationType.KICK, KickResult>
    | WarnResultBase<ModerationType.TIMEOUT, TimeoutResult>
    | WarnResultBase<ModerationType.WARN, 'success' | 'countNaN' | 'countNegative' | 'countZero'>;

export interface PardonResult {
    readonly warnings: number;
    readonly state: 'success' | 'countNaN' | 'countNegative' | 'countZero';

}

export type CommandBinderParseResult =
    | CommandBinderValue
    | CommandBinderDeferred;

export type CommandBinderValue =
    | CommandBinderSuccess
    | CommandBinderFailure

export interface CommandBinderSuccess {
    success: true;
    value: CommandArgument;
}

export interface CommandBinderFailure {
    success: false;
    error: CommandBinderStateFailureReason;
}

export interface CommandBinderDeferred {
    success: 'deferred';
    getValue(): CommandBinderValue | Promise<CommandBinderValue>;
}

export interface CommandBinderStateLookupCache {
    findUser(userString: string): Awaitable<CommandBinderParseResult>;
    findSender(userString: string): Awaitable<CommandBinderParseResult>;
    findMember(memberString: string): Awaitable<CommandBinderParseResult>;
    findRole(roleString: string): Awaitable<CommandBinderParseResult>;
    findChannel(channelString: string): Awaitable<CommandBinderParseResult>;
}

export interface CommandBinderState<TContext extends CommandContext> {
    readonly context: TContext;
    readonly command: ScopedCommand<TContext>;
    readonly arguments: ReadonlyArray<CommandBinderDeferred | CommandBinderSuccess>;
    readonly flags: FlagResult;
    readonly argIndex: number;
    readonly bindIndex: number;
    readonly handler?: CommandSignatureHandler<TContext>;
    readonly lookupCache: CommandBinderStateLookupCache;
    addFailure(index: number, reason: CommandBinderStateFailureReason): void;
}

export interface CommandBinderStateFailureReason {
    notEnoughArgs?: string[];
    tooManyArgs?: boolean;
    parseFailed?: {
        value: string;
        types: string[];
    };
}

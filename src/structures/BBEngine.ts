import { Message } from 'eris';
import { Cluster } from '../cluster';
import { FlagDefinition } from '../newbu';

export interface BBEngineCommand {
    context: Message;
    source: string;
    input: string;
    isCC: boolean;
    tagVars?: boolean;
    name: string;
    limits: string;//{ readonly [key: string]: BBTagLimit | undefined };
    flags?: FlagDefinition[];
    cooldown?: number;
    author?: string;
    authorizer?: string;
    silent?: boolean;
}

export interface BBTagLimit {
    readonly disabled?: boolean;
    readonly count?: number;
    readonly loops?: number;
    readonly requests?: number;
    readonly staff?: boolean;
    readonly max?: number;
}

export class BBEngine {
    public constructor(
        public readonly cluster: Cluster
    ) {
    }

    public execute(command: BBEngineCommand): Promise<void> {
        this.cluster.logger.bbtag(command.source);
        throw new Error('Not implemented');
    }
}
import { Message, MessageFile } from 'eris';
import { CommandType, FlagDefinition, FlagResult } from '../../utils';
import { SendPayload } from '../BaseUtilities';

export interface CommandOptions {
    readonly name: string;
    readonly aliases?: readonly string[];
    readonly category: CommandType;
    readonly cannotDisable?: boolean;
    readonly hidden?: boolean;
    readonly info?: string;
    readonly flags?: readonly FlagDefinition[];
    readonly onlyOn?: string | null;
    readonly cooldown?: number;
    readonly definition: CommandDefinition;
}

export type CommandResult =
    | SendPayload
    | MessageFile
    | MessageFile[]
    | { content: SendPayload, files: MessageFile | MessageFile[] }
    | string
    | void;

export type CommandDefinition =
    | CommandHandlerDefinition
    | SubcommandDefinitionHolder
    | CommandHandlerDefinition & SubcommandDefinitionHolder;


export type CommandParameter =
    | CommandVariableParameter
    | CommandLiteralParameter;

export interface CommandHandlerDefinition {
    readonly description: string;
    readonly parameters?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly execute: (message: Message, args: any[], flags: FlagResult, raw: string) => Promise<CommandResult> | CommandResult
    readonly allowOverflow?: boolean;
    readonly dontBind?: boolean;
    readonly useFlags?: boolean;
    readonly strictFlags?: boolean;
}

export interface SubcommandDefinitionHolder {
    readonly subcommands: { readonly [name: string]: CommandDefinition }
}

export interface CommandVariableParameter {
    readonly type: 'variable';
    readonly name: string;
    readonly valueType: string;
    readonly required: boolean;
    readonly rest: boolean;
    readonly display: string;
    readonly parse: (value: string) => unknown;
}

export interface CommandLiteralParameter {
    readonly type: 'literal';
    readonly name: string;
    readonly alias: string[];
    readonly required: boolean;
    readonly display: string;
    readonly parse: (value: string) => unknown;
}

export interface CommandHandler {
    readonly signatures: ReadonlyArray<readonly CommandParameter[]>;
    readonly execute: (message: Message, args: string[], raw: string) => Promise<CommandResult> | CommandResult;
}

export interface CommandSignatureHandler {
    readonly description: string;
    readonly parameters: readonly CommandParameter[];
    readonly execute: (message: Message, args: string[], raw: string) => Promise<CommandResult> | CommandResult;
}
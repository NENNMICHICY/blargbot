import EventEmitter from 'events';

import { ConnectionOptions as TLSConnectionOptions } from 'tls';

export function connect(opts: ConnectionOptions, cb: (err: ReqlDriverError, conn: Connection) => void): void;
export function connect(host: string, cb: (err: ReqlDriverError, conn: Connection) => void): void;
export function connect(opts: ConnectionOptions): Promise<Connection>;
export function connect(host: string): Promise<Connection>;

export function dbCreate(name: string): Operation<CreateResult>;
export function dbDrop(name: string): Operation<DropResult>;
export function dbList(): Operation<string[]>;

export function db(name: string): Db;
export function table<T>(name: string, options?: { useOutdated: boolean; }): Table<T>;

export function asc(property: string): Sort;
export function desc(property: string): Sort;

export function point(lng: number, lat: number): Point;
export function polygon(...point: Point[]): Polygon;
export function circle(point: Point, radius: number, options?: CircleOptions): Geometry;

export const count: Aggregator;
export function sum(prop: string): Aggregator;
export function avg(prop: string): Aggregator;

export const row: Row<unknown>;
export function expr<T>(stuff: T): Expression<T>;

export function now(): Expression<Time>;
export function epochTime(): Expression<Time>;
export function epochTime(time: number): Expression<Time>;
export function literal(): Expression<undefined>;
export function literal<T>(value: T): Expression<T>;

export function branch<Then, Else>(test: Expression<boolean>, trueBranch: Expression<Then>, falseBranch: Expression<Else>): Expression<Then> | Expression<Else>;
export function js<T>(jsString: string, opts?: { timeout: number; }): Operation<T>;
export function uuid(input?: string): Operation<string>;

export class Cursor<T> {
    public hasNext(): boolean;
    public each(cb: (err: Error, row: T) => void, done?: () => void): void;
    public each(cb: (err: Error, row: T) => boolean, done?: () => void): void; // returning false stops iteration
    public next(cb: (err: Error, row: T) => void): void;
    public next(): Promise<T>;
    public toArray(cb: (err: Error, rows: T[]) => void): void;
    public toArray(): Promise<T[]>;
    public close(cb: (err: Error) => void): void;
    public close(): Promise<void>;
}

export interface Row<T> extends Expression<T> {
    <K extends keyof T>(name: K): Expression<T[K]>;
}

export interface ConnectionOptions {
    host?: string;
    port?: number;
    db?: string;
    user?: string;
    password?: string;
    timeout?: number;
    ssl?: TLSConnectionOptions;
}

export interface WaitOptions {
    waitFor?: 'ready_for_outdated_reads' | 'ready_for_reads' | 'ready_for_writes';
    timeout?: number;
}

export interface WaitResult {
    ready: number;
}

export interface NoReplyWait {
    noreplyWait: boolean;
}

export interface ServerResult {
    id: string;
    proxy: boolean;
    name?: string;
}

export interface Connection extends EventEmitter {
    open: boolean;

    close(cb: (err: Error) => void): void;
    close(opts: NoReplyWait, cb: (err: Error) => void): void;
    close(): Promise<void>;
    close(opts: NoReplyWait): Promise<void>;

    reconnect(cb: (err: Error, conn: Connection) => void): void;
    reconnect(opts: NoReplyWait, cb: (err: Error, conn: Connection) => void): void;
    reconnect(opts?: NoReplyWait): Promise<Connection>;

    server(cb: (err: Error, conn: ServerResult) => void): void;
    server(): Promise<ServerResult>;

    use(dbName: string): void;
}

export interface Db {
    tableCreate(name: string, options?: TableOptions): Operation<CreateResult>;
    tableDrop(name: string): Operation<DropResult>;
    tableList(): Operation<string[]>;
    table<T>(name: string, options?: GetTableOptions): Table<T>;
    wait(waitOptions?: WaitOptions): Operation<WaitResult>;
}

export interface TableOptions {
    primary_key?: string;
    durability?: string;
    cache_size?: number;
    datacenter?: string;
}

export interface GetTableOptions {
    useOutdated: boolean;
}

export interface Writeable<T> {
    update(obj: UpdateData<T>, options?: UpdateOptions): Operation<WriteResult<T>>;
    update(obj: (r: Expression<T>) => UpdateData<T>, options?: UpdateOptions): Operation<WriteResult<T>>;
    replace(obj: T, options?: UpdateOptions): Operation<WriteResult<T>>;
    replace(expr: ExpressionFunction<T, T>): Operation<WriteResult<T>>;
    delete(options?: UpdateOptions): Operation<WriteResult<T>>;
}

export interface ChangesOptions {
    squash: boolean | number;
    changefeedQueueSize: number;
    includeInitial: boolean;
    includeStates: boolean;
    includeOffsets: boolean;
    includeTypes: boolean;
}

export interface HasFields<T, R> {
    hasFields(selector: BooleanMap<T>): R;
    hasFields(...fields: Array<string & keyof T>): R;
}

export interface Geometry { }

export interface Point { }

export interface Polygon extends Geometry { }

export interface Table<T> extends Sequence<T>, HasFields<T, Sequence<T>> {
    indexCreate(name: string, index?: IndexFunction<T, unknown>): Operation<CreateResult>;
    indexDrop(name: string): Operation<DropResult>;
    indexList(): Operation<string[]>;
    indexWait(name?: string): Operation<Array<{ index: string; ready: true; function: number; multi: boolean; geo: boolean; outdated: boolean; }>>;

    insert(obj: T[], options?: InsertOptions<T>): Operation<WriteResult<T>>;
    insert(obj: T, options?: InsertOptions<T>): Operation<WriteResult<T>>;

    get(key: string): Operation<T | null> & Writeable<T>;

    getAll(...args: Array<string | number | boolean>): Sequence<T>;
    getAll(...args: [...Array<string | number | boolean>, Index]): Sequence<T>;
    getAll(...args: Array<Array<string | number | boolean>>): Sequence<T>;
    getAll(...args: [...Array<Array<string | number | boolean>>, Index]): Sequence<T>;
    getAll(key: Expression<T>, index?: Index): Sequence<T>;
    getAll(keys: Expression<T[]>, index: Index): Sequence<T>;

    getIntersecting(geometry: Geometry, index: Index): Sequence<T>;
    wait(WaitOptions?: WaitOptions): Operation<WaitResult>;
}

export interface Sequence<T> extends Operation<Cursor<T>>, Writeable<T> {
    between(lower: T, upper: T): Sequence<T>;
    between<R>(lower: R, upper: R, index: Index): Sequence<T>;
    coerceTo(key: 'array'): Expression<T[]>;

    merge<R>(object: R): Sequence<T & R>;
    merge<R>(cb: ExpressionFunction<T, R>): Sequence<T & R>;

    filter(rql: ExpressionFunction<T, boolean>): Sequence<T>;
    filter(rql: Expression<boolean>): Sequence<T>;
    filter(obj: FilterMap<T>): Sequence<T>;

    changes(opts?: Partial<ChangesOptions>): Sequence<WriteChange<T>>;

    innerJoin<R>(sequence: Sequence<R>, join: JoinFunction<T, R, boolean>): Sequence<{ left: T; right: R; }>;
    outerJoin<R>(sequence: Sequence<R>, join: JoinFunction<T, R, boolean>): Sequence<{ left: T; right: R; }>;
    eqJoin<R, LK extends string & keyof T>(leftAttribute: LK, rightSequence: Sequence<R>, index?: Index): Sequence<{ left: T; right: R; }>;
    eqJoin<R, LK extends string & keyof T>(leftAttribute: ExpressionFunction<T, LK>, rightSequence: Sequence<R>, index?: Index): Sequence<{ left: T; right: R; }>;
    zip<L, R>(this: Sequence<{ left: L; right: R; }>): Sequence<L & R>;

    map<R>(transform: ExpressionFunction<T, R>): Sequence<R>;
    withFields<K extends string & keyof T>(...selectors: K[]): Sequence<{ [P in K]-?: Exclude<T[P], undefined | null> } & Omit<T, K>>;
    concatMap<R>(transform: ExpressionFunction<T, Sequence<R> | R[]>): Sequence<R>;
    orderBy<K extends string & keyof T>(...keys: K[]): Sequence<T>;
    orderBy(...sorts: Sort[]): Sequence<T>;
    skip(n: number): Sequence<T>;
    limit(n: number): Sequence<T>;
    slice(start: number, end?: number): Sequence<T>;
    nth(n: number): Expression<T>;
    indexesOf(obj: T): Sequence<number>;
    isEmpty(): Expression<boolean>;
    union(sequence: Sequence<T>): Sequence<T>;
    sample(n: number): Sequence<T>;
    getField<K extends string & keyof T>(prop: K): Sequence<T[K]>;

    reduce(r: ReduceFunction<T, T>): Expression<T>;
    reduce<R>(r: ReduceFunction<T, R>, base: R): Expression<R>;
    count(): Expression<number>;
    distinct(opts?: { index: string; }): Sequence<T>;
    contains(prop: T): Expression<boolean>;

    pluck<K extends string & keyof T>(...props: K[]): Sequence<Pick<T, K>>;
    without<K extends string & keyof T>(...props: K[]): Sequence<Omit<T, K>>;
}

export type IndexFunction<T, U> = (doc: Expression<T>) => Expression<U> | Array<Expression<U>>;

export interface ExpressionFunction<T, R> {
    (doc: Expression<T>): Expression<R>;
}

export interface JoinFunction<L, R, T> {
    (left: Expression<L>, right: Expression<R>): Expression<T>;
}

export interface ReduceFunction<T, R> {
    (acc: Expression<R>, val: Expression<T>): Expression<R>;
}

export interface InsertOptions<T> {
    conflict?: 'error' | 'replace' | 'update' | ((id: string, oldDoc: T, newDoc: T) => T);
    durability?: 'hard' | 'soft';
    returnChanges?: boolean | 'always';
}

export interface UpdateOptions {
    nonAtomic?: boolean;
    durability?: 'hard' | 'soft';
    returnChanges?: boolean;
}

export interface DistanceOptions {
    unit?: 'm' | 'km' | 'mi' | 'nm' | 'ft';
    geoSystem?: 'WGS84' | 'unit_sphere';
}

export interface CircleOptions extends DistanceOptions {
    numVertices?: number;
    fill?: boolean;
}

export interface WriteResult<T> {
    inserted: number;
    replaced: number;
    unchanged: number;
    errors: number;
    deleted: number;
    skipped: number;
    first_error: Error;
    generated_keys?: string[];
    changes?: Array<WriteChange<T>>;
}

export type WriteChange<T> = DeleteChange<T> | InsertChange<T> | UpdateChange<T>;

export interface DeleteChange<T> {
    new_val: undefined;
    old_val: T;
}

export interface InsertChange<T> {
    new_val: T;
    old_val: undefined;
}

export interface UpdateChange<T> {
    new_val: T;
    old_val: T;
}

export interface JoinResult<L, R> {
    left: L;
    right: R;
}

export interface CreateResult {
    created: number;
}

export interface DropResult {
    dropped: number;
}

export interface Index {
    index: string;
    left_bound?: string;
    right_bound?: string;
}

export type BooleanMap<T> = {
    [K in string & keyof T]: boolean | BooleanMap<T[K]>;
}

export type FilterMap<T> = {
    [K in string & keyof T]?: T[K] | FilterMap<T[K]>;
}

export interface Expression<T> extends Writeable<T>, Operation<T>, HasFields<T, Expression<boolean>> {
    <K extends string & keyof T>(prop: K): Expression<T[K]>;
    <R extends readonly unknown[], K extends string & keyof R[number]>(this: Expression<R>, prop: K): Expression<Array<R[number][K]>>;
    merge<R>(query: R | Expression<R>): Expression<T & R>;
    append(this: Expression<string>, prop: string | Expression<string>): Expression<string>;
    append<R extends readonly unknown[]>(this: Expression<R>, prop: R[number] | Expression<R[number]>): Expression<R>;
    setInsert<R extends readonly unknown[]>(this: Expression<R>, prop: R[number]): Expression<R>;
    setUnion<R extends readonly unknown[]>(this: Expression<R>, prop: readonly R[number][] | Expression<R>): Expression<R>;
    setIntersection<R extends readonly unknown[]>(this: Expression<R>, prop: readonly R[number][] | Expression<readonly R[number][]>): Expression<R>;
    setDifference<R extends readonly unknown[]>(this: Expression<R>, prop: readonly R[number][] | Expression<readonly R[number][]>): Expression<R>;
    contains(this: Expression<string>, prop: string): Expression<boolean>;
    contains<R extends readonly unknown[]>(this: Expression<R>, prop: R[number] | Expression<R[number]>): Expression<boolean>;

    filter<R extends readonly unknown[]>(this: Expression<R>, rql: ExpressionFunction<R[number], boolean>): Expression<T>;
    filter<R extends readonly unknown[]>(this: Expression<R>, rql: Expression<boolean>): Expression<T>;
    filter<R extends readonly unknown[]>(this: Expression<R>, obj: FilterMap<R[number]>): Expression<T>;
    map<R extends readonly unknown[], P>(this: Expression<R>, mapexpr: ExpressionFunction<R[number], P>): Expression<P[]>;

    and(this: Expression<boolean>, b: boolean | Expression<boolean>): Expression<boolean>;
    or(this: Expression<boolean>, b: boolean | Expression<boolean>): Expression<boolean>;
    eq(v: T | Expression<T>): Expression<boolean>;
    ne(v: T | Expression<T>): Expression<boolean>;
    not(this: Expression<boolean>,): Expression<boolean>;

    gt(this: Expression<number>, value: T): Expression<boolean>;
    ge(this: Expression<number>, value: T): Expression<boolean>;
    lt(this: Expression<number>, value: T): Expression<boolean>;
    le(this: Expression<number>, value: T): Expression<boolean>;

    add(this: Expression<number>, n: number): Expression<number>;
    add(this: Expression<number>, n: Expression<number>): Expression<number>;

    sub(this: Expression<number>, n: number, ...numbers: number[]): Expression<number>;
    sub(this: Expression<Time>, date: Time): Expression<number>;

    mul(this: Expression<number>, n: number): Expression<number>;
    div(this: Expression<number>, n: number): Expression<number>;
    mod(this: Expression<number>, n: number): Expression<number>;

    max(this: Expression<readonly number[]>): Expression<number>;
    max<R extends readonly unknown[], K extends PropertyNamesOfType<R[number], number>>(this: Expression<R>, name: K): Expression<R[number]>;

    distance(this: Expression<Geometry>, geometry: Geometry, options?: DistanceOptions): Expression<number>;

    default(value: Exclude<T, null | undefined>): Expression<Exclude<T, null | undefined>>;
    default(value: Expression<Exclude<T, null | undefined>>): Expression<Exclude<T, null | undefined>>;
    getField<K extends string & keyof T>(name: K): Expression<T[K]>;
    getField<R extends readonly unknown[], K extends string & keyof R[number]>(this: Expression<R>, name: K): Expression<Array<R[number][K]>>;
    match(this: Expression<string>, re2: string): Expression<MatchResult | null>;
    spliceAt<R extends readonly unknown[]>(this: Expression<R>, index: number, replacement: R): Expression<T>;
    deleteAt<R extends readonly unknown[]>(this: Expression<R>, index: number): Expression<T>;

    values(): Expression<Array<Exclude<T[keyof T], undefined>>>;
}

export interface MatchResult {
    readonly str: string;
    readonly start: number;
    readonly end: number;
    readonly groups: Array<Omit<MatchResult, 'groups'>>;
}

export interface OperationOptions {
    readMode: 'single' | 'majority' | 'outdated';
    timeFormat: 'native' | 'raw';
    profile: boolean;
    durability: 'hard' | 'soft';
    groupFormat: 'native' | 'raw';
    noreply: boolean;
    db: string;
    arrayLimit: number;
    binaryFormat: 'native' | 'raw';
    minBatchRows: number;
    maxBatchRows: number;
    maxBatchBytes: number;
    maxBatchSeconds: number;
    firstBatchScaledownFactor: number;
}

export interface Operation<T> {
    run(conn: Connection, opts: OperationOptions, cb: (err: Error, result: T) => void): void;
    run(conn: Connection, cb: (err: Error, result: T) => void): void;
    run(conn: Connection, opts: OperationOptions): Promise<T>;
    run(conn: Connection): Promise<T>;
}

export interface Aggregator { }

export interface Sort { }

export interface ReqlType {
    $reql_type$: string;
}

export interface Time extends ReqlType {
    $reql_type$: 'TIME';
    epoch_time: number;
    timezone: string;
}

export interface Binary extends ReqlType {
    $reql_type$: 'BINARY';
    data: string;
}

export interface ReqlError extends Error { }

export interface ReqlDriverError extends ReqlError { }

export type Query<T> = (rethink: typeof import('rethinkdb')) => Operation<T>;
export type TableQuery<T, R> = (table: Table<R>, rethink: typeof import('rethinkdb')) => Operation<T>;
export type UpdateData<T> = { [P in keyof T]?: T[P] | UpdateData<T[P]> | Expression<T[P]> };
export type UpdateRequest<T> = UpdateData<T> | ((r: Expression<T>) => UpdateData<T> | Expression<T>);

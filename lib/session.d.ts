declare module 'telegraf-session-redis' {
    import { RedisClient } from 'redis';
    import { Context } from 'telegraf';
  
    export interface RetryStrategyOptions {
        error: NodeJS.ErrnoException;
        total_retry_time: number;
        times_connected: number;
        attempt: number;
    }

    export type RetryStrategy = (options: RetryStrategyOptions) => number | Error | undefined;
  
    interface StoreOptions {
        readonly host?: string;
        readonly port?: number;
        readonly path?: string;
        readonly url?: string;
        readonly parser?: string;
        readonly string_numbers?: boolean;
        readonly return_buffers?: boolean;
        readonly detect_buffers?: boolean;
        readonly socket_keepalive?: boolean;
        readonly socket_initial_delay?: number;
        readonly no_ready_check?: boolean;
        readonly enable_offline_queue?: boolean;
        readonly retry_max_delay?: number;
        readonly connect_timeout?: number;
        readonly max_attempts?: number;
        readonly retry_unfulfilled_commands?: boolean;
        readonly auth_pass?: string;
        readonly password?: string;
        readonly db?: string | number;
        readonly family?: string;
        readonly rename_commands?: { [command: string]: string } | null;
        readonly tls?: any;
        readonly prefix?: string;
        readonly retry_strategy?: RetryStrategy;
    }

    interface RedisOptions {
        readonly ttl?: number;
        readonly property?: string;
        readonly store: StoreOptions;
        readonly getSessionKey?: (ctx: any) => any;
    }

    type ContextUpdate = (ctx: any, next?: (() => any) | undefined) => any;

    class RedisSession {
        client: RedisClient;
        middleware(): ContextUpdate;
        getSession(key: Context): string;
        clearSession(key: string): void;
        constructor(options: RedisOptions);
        saveSession(key: string, session: object): object;
    }

    export default RedisSession;
}

declare module 'telegraf-session-redis' {
    import { RedisClient } from 'redis';
    import { Context } from 'telegraf';

    interface StoreOptions {
        readonly db?: any;
        readonly url?: string;
        readonly tls?: object;
        readonly host: string;
        readonly path?: string;
        readonly family?: 'IPv6';
        readonly prefix?: string;
        readonly password?: string;
        readonly port: string | number;
        readonly string_numbers?: boolean;
        readonly return_buffers?: boolean;
        readonly detect_buffers?: boolean;
        readonly no_ready_check?: boolean;
        readonly rename_commands?: object;
        readonly retry_strategy?: Function;
        readonly socket_keepalive?: boolean;
        readonly enable_offline_queue?: boolean;
        readonly disable_resubscribing?: boolean;
        readonly retry_unfulfilled_commands?: boolean;
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

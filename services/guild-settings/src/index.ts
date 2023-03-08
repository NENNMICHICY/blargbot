import { connectionToService, hostIfEntrypoint, ServiceHost, webService } from '@blargbot/application';
import { fullContainerId } from '@blargbot/container-id';
import env from '@blargbot/env';
import express from '@blargbot/express';
import type { GuildSettings } from '@blargbot/guild-settings-contract';
import guildSettings from '@blargbot/guild-settings-contract';
import { MetricsClient } from '@blargbot/metrics-client';
import { RedisKVCache } from '@blargbot/redis-cache';
import { Sequelize, sequelizeToService } from '@blargbot/sequelize';
import type { RedisClientType } from 'redis';
import { createClient as createRedisClient } from 'redis';

import { createGuildSettingsRequestHandler } from './createGuildSettingsRequestHandler.js';
import GuildSettingsSequelizeDatabase from './GuildSettingsSequelizeDatabase.js';
import { GuildSettingsService } from './GuildSettingsService.js';

@hostIfEntrypoint(() => [{
    port: env.appPort,
    redis: {
        url: env.redisUrl,
        password: env.redisPassword,
        username: env.redisUsername,
        ttl: env.redisTTL
    },
    postgres: {
        user: env.postgresUser,
        pass: env.postgresPassword,
        database: env.postgresDatabase,
        sequelize: {
            host: env.postgresHost
        }
    }
}])
export class GuildSettingsApplication extends ServiceHost {
    public constructor(options: GuildSettingsApplicationOptions) {
        const serviceName = 'guild-settings';
        const metrics = new MetricsClient({ serviceName, instanceId: fullContainerId });
        const database = new Sequelize(
            options.postgres.database,
            options.postgres.user,
            options.postgres.pass,
            {
                ...options.postgres.sequelize,
                dialect: 'postgres'
            }
        );
        const redis: RedisClientType = createRedisClient({
            url: options.redis.url,
            username: options.redis.username,
            password: options.redis.password
        });

        super([
            connectionToService(redis, 'redis'),
            metrics,
            sequelizeToService(database, {
                syncOptions: { alter: true }
            }),
            webService(
                express()
                    .use(express.urlencoded({ extended: true }))
                    .use(express.json())
                    .all('/*', createGuildSettingsRequestHandler(new GuildSettingsService(
                        new GuildSettingsSequelizeDatabase(database),
                        new RedisKVCache<bigint, GuildSettings>(redis, {
                            ttlS: options.redis.ttl,
                            keyspace: 'guild_settings',
                            serializer: guildSettings
                        })))),
                options.port
            )
        ]);
    }
}

export interface GuildSettingsApplicationOptions {
    readonly port: number;
    readonly redis: {
        readonly url: string;
        readonly password: string;
        readonly username: string;
        readonly ttl: number;
    };
    readonly postgres: {
        readonly user: string;
        readonly pass: string;
        readonly database: string;
        readonly sequelize: {
            readonly host?: string;
            readonly pool?: {
                readonly max: number;
                readonly min: number;
                readonly acquire: number;
                readonly idle: number;
            };
        };
    };
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import entities from './typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { FriendshipModule } from './friendship/friendship.module';
import { GatewayModule } from './gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessageModule } from './message/message.module';
import { __prod__ } from './utils/constants';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: __prod__ ? '.env' : '.env.development',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      ...(__prod__
        ? { url: process.env.DATABASE_URL }
        : {
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      ...(__prod__
        ? {
            extra: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
            ssl: true,
          }
        : {}),
      entities,
      migrationsRun: true,
      ...(__prod__ ? {} : { synchronize: true }),
      migrations: [path.join(__dirname, '/migrations/*')],
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    AuthModule,
    UsersModule,
    FriendshipModule,
    GatewayModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}

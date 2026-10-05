import { type DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { AppConfig } from '../config/configuration';
import { InMemoryUsersRepository } from '../modules/users/infrastructure/in-memory/in-memory-users.repository';
import { MongooseUsersRepository } from '../modules/users/infrastructure/mongoose/mongoose-users.repository';
import {
  UserDocumentModel,
  UserSchema,
} from '../modules/users/infrastructure/mongoose/user.schema';
import { UsersRepository } from '../modules/users/users.repository';

export type DbDriver = AppConfig['db']['driver'];

/**
 * Binds repository ports to adapters. Switching databases = one new adapter + one branch here;
 * no service, controller or DTO changes.
 */
@Global()
@Module({})
export class PersistenceModule {
  static forRoot(driver: DbDriver): DynamicModule {
    if (driver === 'memory') {
      return {
        module: PersistenceModule,
        providers: [{ provide: UsersRepository, useClass: InMemoryUsersRepository }],
        exports: [UsersRepository],
      };
    }

    return {
      module: PersistenceModule,
      imports: [
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) => ({
            uri: config.get('db', { infer: true }).uri,
            serverSelectionTimeoutMS: 5000,
          }),
        }),
        MongooseModule.forFeature([{ name: UserDocumentModel.name, schema: UserSchema }]),
      ],
      providers: [{ provide: UsersRepository, useClass: MongooseUsersRepository }],
      exports: [UsersRepository, MongooseModule],
    };
  }
}

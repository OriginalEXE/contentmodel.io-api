import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { ContentModelModule } from './entities/content-model/content-model.module';
import { LoginModule } from './entities/login/login.module';
import { UserModule } from './entities/user/user.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    LoginModule,
    ContentModelModule,
    GraphQLModule.forRootAsync({
      useFactory: async () => ({
        autoSchemaFile: join(process.cwd(), './src/schema.graphql'),
        context: ({ req }) => ({ req }),
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

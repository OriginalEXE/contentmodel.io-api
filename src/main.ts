import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions:
      (process.env.LOCAL_SSL_KEY_PATH as string) &&
      (process.env.LOCAL_SSL_CERT_PATH as string)
        ? {
            key: fs.readFileSync(
              path.join(__dirname, process.env.LOCAL_SSL_KEY_PATH as string),
            ),
            cert: fs.readFileSync(
              path.join(__dirname, process.env.LOCAL_SSL_CERT_PATH as string),
            ),
          }
        : undefined,
  });

  app.enableCors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(
    configService.get<number>('app.port'),
    configService.get<string>('app.host'),
  );

  console.info(
    `Backend started on port ${configService.get<number>('app.port')}`,
  );
}
bootstrap();

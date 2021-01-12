import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

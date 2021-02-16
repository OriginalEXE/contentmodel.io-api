import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../../config/app.config';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryAssetService } from '../cloudinary-asset/cloudinary-asset.service';
import { UserModule } from '../user/user.module';
import { ContentModelResolver } from './content-model.resolver';
import { ContentModelService } from './content-model.service';

@Module({
  providers: [
    ContentModelResolver,
    ContentModelService,
    CloudinaryAssetService,
  ],
  imports: [ConfigModule.forFeature(appConfig), UserModule, PrismaModule],
})
export class ContentModelModule {}

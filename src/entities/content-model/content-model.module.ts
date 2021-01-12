import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ContentModelResolver } from './content-model.resolver';

@Module({
  providers: [ContentModelResolver],
  imports: [UserModule, PrismaModule],
})
export class ContentModelModule {}

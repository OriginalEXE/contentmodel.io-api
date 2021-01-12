import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserResolver, UserService],
  imports: [PrismaModule],
  exports: [UserService],
})
export class UserModule {}

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserByAuth0Id({ auth0Id }: { auth0Id: string }): Promise<User> {
    return this.prisma.login.findUnique({ where: { auth0Id } }).user();
  }
}

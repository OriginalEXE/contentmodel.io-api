import {
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import catchify from 'catchify';
import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

import {
  AccessToken,
  AccessTokenEntity,
} from '../../auth/access-token.decorator';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { Login } from '../login/login.model';
import { CreateUserInput } from './inputs/create-user-input';
import { UpdateUserInput } from './inputs/update-user-input';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async me(
    @AccessTokenEntity() accessToken: AccessToken,
  ): Promise<User | null> {
    const user = await this.userService.getUserByAuth0Id({
      auth0Id: accessToken.sub,
    });

    return user;
  }

  @Mutation(() => Login)
  @UseGuards(GqlAuthGuard)
  async createUser(
    @AccessTokenEntity() accessToken: AccessToken,
    @Args('createUser') createUser: CreateUserInput,
  ): Promise<Login> {
    const { email, name = '', picture = '' } = createUser;

    const maybeUpdateUserPicture = async (user: User): Promise<void> => {
      if (user.picture !== '' || picture === '') {
        return;
      }

      // Also, let's update the picture if it's not present
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          picture,
        },
      });
    };

    if (isEmail(email) === false) {
      throw new BadRequestException('Invalid email');
    }

    if (isURL(picture) === false) {
      throw new BadRequestException('Invalid picture');
    }

    // We first check if user exists already
    const [userInDbError, userInDb] = await catchify(
      this.prisma.user.findUnique({ where: { email } }),
    );

    if (userInDbError !== null) {
      throw userInDbError;
    }

    if (userInDb !== null) {
      // User is already saved, but let's check if this exact login is in the db
      const [loginInDbError, loginInDb] = await catchify(
        this.prisma.login.findMany({
          where: {
            auth0Id: accessToken.sub,
            user: {
              id: userInDb.id,
            },
          },
        }),
      );

      if (loginInDbError !== null) {
        throw new InternalServerErrorException('Something went wrong');
      }

      if (loginInDb === null || loginInDb.length === 0) {
        // This login is not in the db for this user, let's create it, and then proceed
        const [newLoginError, newLogin] = await catchify(
          this.prisma.login.create({
            data: {
              auth0Id: accessToken.sub,
              user: {
                connect: {
                  id: userInDb.id,
                },
              },
            },
          }),
        );

        if (newLoginError !== null) {
          throw new InternalServerErrorException('Something went wrong');
        }

        await maybeUpdateUserPicture(userInDb);

        return {
          ...newLogin,
          fresh: false,
        };
      }

      await maybeUpdateUserPicture(userInDb);

      // This login is already present, and the user exists. Proceed
      return {
        ...loginInDb[0],
        fresh: false,
      };
    }

    const [createdLoginError, createdLogin] = await catchify(
      this.prisma.login.create({
        data: {
          auth0Id: accessToken.sub,
          user: {
            create: {
              name: name.trim(),
              email,
              picture,
            },
          },
        },
      }),
    );

    if (createdLoginError !== null) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return {
      ...createdLogin,
      fresh: true,
    };
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @AccessTokenEntity() accessToken: AccessToken,
    @Args('updateUser') updateUser: UpdateUserInput,
  ): Promise<User> {
    const user = await this.userService.getUserByAuth0Id({
      auth0Id: accessToken.sub,
    });

    const { id, contentful_token_read } = updateUser;

    if (user.id !== id) {
      throw new BadRequestException('Could not find the user');
    }

    const [updatedUserError, updatedUser] = await catchify(
      this.prisma.user.update({
        where: { id },
        data: {
          contentful_token_read,
        },
      }),
    );

    if (updatedUserError !== null) {
      console.error(updatedUserError);
      throw new InternalServerErrorException('Something went wrong');
    }

    return updatedUser;
  }
}

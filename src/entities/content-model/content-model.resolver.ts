import {
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  Query,
  Mutation,
  Resolver,
  Args,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import catchify from 'catchify';
import { isEqual } from 'lodash';
import { customAlphabet } from 'nanoid';

import {
  AccessToken,
  AccessTokenEntity,
} from '../../auth/access-token.decorator';
import { GqlAuthNotRequiredGuard } from '../../auth/gql-auth-not-required.guard';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryAssetService } from '../cloudinary-asset/cloudinary-asset.service';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { ContentModel } from './content-model.model';
import { ContentModelService } from './content-model.service';
import normalizeContentModelPosition from './helpers/normalizeContentModelPosition';
import { CreateContentModelInput } from './inputs/create-content-model.input';
import { DeleteContentModelInput } from './inputs/delete-content-model.input';
import { UpdateContentModelInput } from './inputs/update-content-model.input';
import { PaginatedContentModel } from './paginated-content-model.model';
import parseContentModel from './parsers/parseContentModel';
import parseContentModelPosition from './parsers/parseContentModelPosition';

let DEV_GENERATING_DATA = false;

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz',
  11,
);

@Resolver(() => ContentModel)
export class ContentModelResolver {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private contentModelService: ContentModelService,
    private cloudinaryAssetService: CloudinaryAssetService,
  ) {}

  @Query(() => PaginatedContentModel)
  @UseGuards(GqlAuthNotRequiredGuard)
  async contentModels(
    @Args('count', { type: () => Int, nullable: true, defaultValue: 20 })
    count: number,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args('user', { type: () => String, nullable: true, defaultValue: '' })
    user: string,
    @Args('search', { type: () => String, nullable: true, defaultValue: '' })
    search: string,
  ): Promise<PaginatedContentModel> {
    if (DEV_GENERATING_DATA === false) {
      DEV_GENERATING_DATA = true;

      const [, contentModels] = await catchify(
        this.prisma.contentModel.findMany({
          orderBy: {
            createdAt: 'desc' as const,
          },
          skip: 0,
          take: 100,
          include: {
            versions: {
              orderBy: {
                version: 'desc' as const,
              },
              take: 1,
              include: {
                image: true,
                imageNoConnections: true,
              },
            },
            user: true,
            ogMetaImage: true,
          },
        }),
      );

      contentModels.forEach((contentModel) => {
        this.contentModelService.generateContentModelScreenshots({
          ...contentModel,
          model: JSON.stringify(contentModel.versions[0].model),
          position: JSON.stringify(contentModel.versions[0].position),
          ogMetaImage: contentModel.ogMetaImage
            ? {
                width: contentModel.ogMetaImage.width,
                height: contentModel.ogMetaImage.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.ogMetaImage,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.ogMetaImage,
                ),
              }
            : null,
          image: contentModel.versions[0].image
            ? {
                width: contentModel.versions[0].image.width,
                height: contentModel.versions[0].image.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.versions[0].image,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.versions[0].image,
                ),
              }
            : null,
          imageNoConnections: contentModel.versions[0].imageNoConnections
            ? {
                width: contentModel.versions[0].imageNoConnections.width,
                height: contentModel.versions[0].imageNoConnections.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.versions[0].imageNoConnections,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.versions[0].imageNoConnections,
                ),
              }
            : null,
        });
      });
    }

    const paginationCount = Math.min(1000, Math.max(1, count));
    const paginationPage = Math.max(1, page);

    const queryArgs = {
      orderBy: {
        createdAt: 'desc' as const,
      },
      skip: paginationPage * paginationCount - paginationCount,
      take: paginationCount,
      include: {
        versions: {
          orderBy: {
            version: 'desc' as const,
          },
          take: 1,
          include: {
            image: true,
            imageNoConnections: true,
          },
        },
        user: true,
        ogMetaImage: true,
      },
      where: {},
    };

    if (search.trim() !== '') {
      queryArgs.where = {
        OR: [
          {
            title: {
              contains: search.trim(),
              mode: 'insensitive',
            },
            description: {
              contains: search.trim(),
              mode: 'insensitive',
            },
          },
        ],
        ...queryArgs.where,
      };
    }

    if (user !== '') {
      queryArgs.where = {
        ...queryArgs.where,
        AND: [{ userId: user }],
      };
    }

    const [contentModelsError, contentModels] = await catchify(
      this.prisma.contentModel.findMany(queryArgs),
    );

    if (contentModelsError !== null) {
      console.error(contentModelsError);
      throw new InternalServerErrorException('Something went wrong');
    }

    const [contentModelsCountError, contentModelsCount] = await catchify(
      this.prisma.contentModel.count({
        where: queryArgs.where,
      }),
    );

    if (contentModelsCountError !== null) {
      console.error(contentModelsCountError);
      throw new InternalServerErrorException('Something went wrong');
    }

    const hasPrev = queryArgs.skip !== 0;
    const hasNext = contentModelsCount > queryArgs.take * paginationPage;

    return {
      items: contentModels.map((contentModel) => {
        const contentModelWithVersion = {
          ...contentModel,
          model: JSON.stringify(contentModel.versions[0].model),
          position: JSON.stringify(contentModel.versions[0].position),
          ogMetaImage: contentModel.ogMetaImage
            ? {
                width: contentModel.ogMetaImage.width,
                height: contentModel.ogMetaImage.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.ogMetaImage,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.ogMetaImage,
                ),
              }
            : null,
          image: contentModel.versions[0].image
            ? {
                width: contentModel.versions[0].image.width,
                height: contentModel.versions[0].image.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.versions[0].image,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.versions[0].image,
                ),
              }
            : null,
          imageNoConnections: contentModel.versions[0].imageNoConnections
            ? {
                width: contentModel.versions[0].imageNoConnections.width,
                height: contentModel.versions[0].imageNoConnections.height,
                src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
                  contentModel.versions[0].imageNoConnections,
                ),
                path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
                  contentModel.versions[0].imageNoConnections,
                ),
              }
            : null,
        };

        return contentModelWithVersion;
      }),
      pagination: {
        hasNext,
        hasPrev,
        total: contentModelsCount,
      },
    };
  }

  @Query(() => ContentModel, { nullable: true })
  @UseGuards(GqlAuthNotRequiredGuard)
  async contentModelBySlug(
    @Args('slug', { type: () => String })
    slug: string,
  ): Promise<ContentModel> {
    const [contentModelsError, contentModels] = await catchify(
      this.prisma.contentModel.findMany({
        where: {
          slug,
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
            include: {
              image: true,
              imageNoConnections: true,
            },
          },
          user: true,
          ogMetaImage: true,
        },
      }),
    );

    if (contentModelsError !== null) {
      console.error(contentModelsError);
      throw new InternalServerErrorException('Something went wrong');
    }

    if (contentModels.length === 0) {
      return null;
    }

    return {
      ...contentModels[0],
      model: JSON.stringify(contentModels[0].versions[0].model),
      position: JSON.stringify(contentModels[0].versions[0].position),
      ogMetaImage: contentModels[0].ogMetaImage
        ? {
            width: contentModels[0].ogMetaImage.width,
            height: contentModels[0].ogMetaImage.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModels[0].ogMetaImage,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModels[0].ogMetaImage,
            ),
          }
        : null,
      image: contentModels[0].versions[0].image
        ? {
            width: contentModels[0].versions[0].image.width,
            height: contentModels[0].versions[0].image.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModels[0].versions[0].image,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModels[0].versions[0].image,
            ),
          }
        : null,
      imageNoConnections: contentModels[0].versions[0].imageNoConnections
        ? {
            width: contentModels[0].versions[0].imageNoConnections.width,
            height: contentModels[0].versions[0].imageNoConnections.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModels[0].versions[0].imageNoConnections,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModels[0].versions[0].imageNoConnections,
            ),
          }
        : null,
    };
  }

  @ResolveField(() => User)
  async user(
    @AccessTokenEntity() accessToken: AccessToken | false,
    @Parent() contentModel: ContentModel,
  ): Promise<User> {
    const user =
      accessToken === false
        ? null
        : await this.userService.getUserByAuth0Id({
            auth0Id: accessToken.sub,
          });

    const { userId } = contentModel;

    const [contentModelUserError, contentModelUser] = await catchify(
      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      }),
    );

    if (contentModelUserError !== null) {
      console.error(contentModelUserError);
      throw new InternalServerErrorException('Something went wrong');
    }

    if (user === null || contentModelUser.id !== user.id) {
      Object.keys(contentModelUser).forEach((key) => {
        if (['id', 'name', 'picture'].includes(key) === true) {
          return;
        }

        contentModelUser[key] = null;
      });
    }

    return contentModelUser;
  }

  @Mutation(() => ContentModel)
  @UseGuards(GqlAuthGuard)
  async createContentModel(
    @AccessTokenEntity() accessToken: AccessToken,
    @Args('createContentModel') createContentModel: CreateContentModelInput,
  ): Promise<ContentModel> {
    const user = await this.userService.getUserByAuth0Id({
      auth0Id: accessToken.sub,
    });

    const { title, description, version } = createContentModel;

    if (title.length === 0) {
      throw new BadRequestException('Title is required');
    }

    if (description.length === 0) {
      throw new BadRequestException('Description is required');
    }

    const parsedContentModel = parseContentModel(version.model);

    if (parsedContentModel.success === false) {
      throw new BadRequestException(parsedContentModel.error);
    }

    const parsedContentModelPosition = parseContentModelPosition(
      version.position,
    );

    if (parsedContentModelPosition.success === false) {
      throw new BadRequestException(parsedContentModelPosition.error);
    }

    const [createdContentModelError, createdContentModel] = await catchify(
      this.prisma.contentModel.create({
        data: {
          slug: nanoid(),
          title: title.trim(),
          description: description.trim(),
          cms: 'contentful',
          versions: {
            create: {
              name: title.trim(),
              version: 1,
              model: parsedContentModel.data,
              position: normalizeContentModelPosition(
                parsedContentModelPosition.data,
              ),
              author: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
          },
          user: true,
        },
      }),
    );

    if (createdContentModelError !== null) {
      console.error(createdContentModelError);
      throw new InternalServerErrorException('Something went wrong');
    }

    const newContentModel = {
      ...createdContentModel,
      model: JSON.stringify(createdContentModel.versions[0].model),
      position: JSON.stringify(createdContentModel.versions[0].position),
      ogMetaImage: null,
      image: null,
      imageNoConnections: null,
    };

    // Generate content model screenshots
    this.contentModelService.generateContentModelScreenshots(newContentModel);

    return newContentModel;
  }

  @Mutation(() => ContentModel)
  @UseGuards(GqlAuthGuard)
  async updateContentModel(
    @AccessTokenEntity() accessToken: AccessToken,
    @Args('updateContentModel') updateContentModel: UpdateContentModelInput,
  ): Promise<ContentModel> {
    const user = await this.userService.getUserByAuth0Id({
      auth0Id: accessToken.sub,
    });

    const { id, title, description, version } = updateContentModel;

    const [contentModelInDbError, contentModelInDb] = await catchify(
      this.prisma.contentModel.findUnique({
        where: { id },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
          },
          user: true,
        },
      }),
    );

    if (contentModelInDbError !== null) {
      console.error(contentModelInDbError);
      throw new InternalServerErrorException('Something went wrong');
    }

    if (contentModelInDb === null) {
      throw new BadRequestException('Could not find the content model');
    }

    if (contentModelInDb.userId !== user.id) {
      throw new BadRequestException('Could not find the content model');
    }

    let parsedContentModel: ReturnType<typeof parseContentModel> | undefined;
    let parsedContentModelPosition:
      | ReturnType<typeof parseContentModelPosition>
      | undefined;

    if (version !== undefined) {
      if (version.model !== undefined) {
        parsedContentModel = parseContentModel(version.model);

        if (parsedContentModel.success === false) {
          throw new BadRequestException(parsedContentModel.error);
        }
      }

      if (version.position !== undefined) {
        parsedContentModelPosition = parseContentModelPosition(
          version.position,
        );

        if (parsedContentModelPosition.success === false) {
          throw new BadRequestException(parsedContentModelPosition.error);
        }
      }
    }

    const isNewContentModel =
      version === undefined || version.model === undefined
        ? false
        : parsedContentModel.success === true &&
          isEqual(
            parsedContentModel.data,
            contentModelInDb.versions[0].model,
          ) === false
        ? true
        : false;
    const isNewPosition =
      version === undefined || version.position === undefined
        ? false
        : parsedContentModelPosition.success === true &&
          isEqual(
            normalizeContentModelPosition(parsedContentModelPosition.data),
            contentModelInDb.versions[0].position,
          ) === false
        ? true
        : false;
    const isNewTitle =
      title !== undefined && title.trim() !== contentModelInDb.title;

    const [updatedContentModelError, updatedContentModel] = await catchify(
      this.prisma.contentModel.update({
        where: { id },
        data: {
          title: title === undefined ? undefined : title.trim(),
          description:
            description === undefined ? undefined : description.trim(),
          versions:
            version === undefined
              ? undefined
              : version.model === undefined && version.position === undefined
              ? undefined
              : (version.model === undefined || isNewContentModel === false) &&
                isNewPosition === true
              ? // Update only positioning
                {
                  update: {
                    where: { id: contentModelInDb.versions[0].id },
                    data: {
                      position:
                        parsedContentModelPosition.success === true
                          ? normalizeContentModelPosition(
                              parsedContentModelPosition.data,
                            )
                          : undefined,
                    },
                  },
                }
              : (version.position === undefined || isNewPosition === false) &&
                isNewContentModel === true
              ? // Update only content model (we do so by creating a new version)
                {
                  create: {
                    name:
                      title === undefined
                        ? contentModelInDb.title
                        : title.trim(),
                    version: contentModelInDb.versions[0].version + 1,
                    model:
                      parsedContentModel.success === true
                        ? parsedContentModel.data
                        : {},
                    position: contentModelInDb.versions[0].position,
                    author: {
                      connect: {
                        id: user.id,
                      },
                    },
                  },
                }
              : isNewPosition && isNewContentModel
              ? // Update both (we do so by creating a new version)
                {
                  create: {
                    name:
                      title === undefined
                        ? contentModelInDb.title
                        : title.trim(),
                    version: contentModelInDb.versions[0].version + 1,
                    model:
                      parsedContentModel.success === true
                        ? parsedContentModel.data
                        : {},
                    position:
                      parsedContentModelPosition.success === true
                        ? normalizeContentModelPosition(
                            parsedContentModelPosition.data,
                          )
                        : {},
                    author: {
                      connect: {
                        id: user.id,
                      },
                    },
                  },
                }
              : {},
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
            include: {
              image: true,
              imageNoConnections: true,
            },
          },
          user: true,
          ogMetaImage: true,
        },
      }),
    );

    if (updatedContentModelError !== null) {
      console.error(updatedContentModelError);
      throw new InternalServerErrorException('Something went wrong');
    }

    const newContentModel = {
      ...updatedContentModel,
      model: JSON.stringify(updatedContentModel.versions[0].model),
      position: JSON.stringify(updatedContentModel.versions[0].position),
      ogMetaImage: updatedContentModel.ogMetaImage
        ? {
            width: updatedContentModel.ogMetaImage.width,
            height: updatedContentModel.ogMetaImage.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              updatedContentModel.ogMetaImage,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              updatedContentModel.ogMetaImage,
            ),
          }
        : null,
      image: updatedContentModel.versions[0].image
        ? {
            width: updatedContentModel.versions[0].image.width,
            height: updatedContentModel.versions[0].image.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              updatedContentModel.versions[0].image,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              updatedContentModel.versions[0].image,
            ),
          }
        : null,
      imageNoConnections: updatedContentModel.versions[0].imageNoConnections
        ? {
            width: updatedContentModel.versions[0].imageNoConnections.width,
            height: updatedContentModel.versions[0].imageNoConnections.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              updatedContentModel.versions[0].imageNoConnections,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              updatedContentModel.versions[0].imageNoConnections,
            ),
          }
        : null,
    };

    if (isNewContentModel === true) {
      // Generate content model screenshots
      this.contentModelService.generateContentModelScreenshots(
        newContentModel,
        {
          metaImagePublicId: updatedContentModel.ogMetaImage
            ? updatedContentModel.ogMetaImage.public_id
            : undefined,
        },
      );
    } else if (isNewPosition === true) {
      // Generate content model screenshots, replace old versions
      this.contentModelService.generateContentModelScreenshots(
        newContentModel,
        {
          metaImagePublicId: updatedContentModel.ogMetaImage
            ? updatedContentModel.ogMetaImage.public_id
            : undefined,
          contentModelImagePublicId: updatedContentModel.versions[0].image
            ? updatedContentModel.versions[0].image.public_id
            : undefined,
          contentModelNoConnectionsImagePublicId: updatedContentModel
            .versions[0].imageNoConnections
            ? updatedContentModel.versions[0].imageNoConnections.public_id
            : undefined,
        },
      );
    } else if (isNewTitle === true) {
      // Title changed, generate only meta image
      this.contentModelService.generateContentModelScreenshots(
        newContentModel,
        {
          metaImagePublicId: updatedContentModel.ogMetaImage
            ? updatedContentModel.ogMetaImage.public_id
            : undefined,
          generateContentModelScreenshots: false,
        },
      );
    }

    return newContentModel;
  }

  @Mutation(() => ContentModel)
  @UseGuards(GqlAuthGuard)
  async deleteContentModel(
    @AccessTokenEntity() accessToken: AccessToken,
    @Args('deleteContentModel') deleteContentModel: DeleteContentModelInput,
  ): Promise<ContentModel> {
    const user = await this.userService.getUserByAuth0Id({
      auth0Id: accessToken.sub,
    });

    const { id } = deleteContentModel;

    const [contentModelInDbError, contentModelInDb] = await catchify(
      this.prisma.contentModel.findUnique({
        where: { id },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
            include: {
              image: true,
              imageNoConnections: true,
            },
          },
          user: true,
          ogMetaImage: true,
        },
      }),
    );

    if (contentModelInDbError !== null) {
      console.error(contentModelInDbError);
      throw new InternalServerErrorException('Something went wrong');
    }

    if (contentModelInDb === null) {
      throw new BadRequestException('Could not find the content model');
    }

    if (contentModelInDb.userId !== user.id) {
      throw new BadRequestException('Could not find the content model');
    }

    // We delete all content model versions as well
    await catchify(
      this.prisma.contentModelVersion.deleteMany({
        where: {
          contentModelId: id,
        },
      }),
    );

    const [deletedContentModelError] = await catchify(
      this.prisma.contentModel.delete({
        where: { id },
      }),
    );

    if (deletedContentModelError !== null) {
      console.error(deletedContentModelError);
      throw new InternalServerErrorException('Something went wrong');
    }

    return {
      ...contentModelInDb,
      model: JSON.stringify(contentModelInDb.versions[0].model),
      position: JSON.stringify(contentModelInDb.versions[0].position),
      ogMetaImage: contentModelInDb.ogMetaImage
        ? {
            width: contentModelInDb.ogMetaImage.width,
            height: contentModelInDb.ogMetaImage.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModelInDb.ogMetaImage,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModelInDb.ogMetaImage,
            ),
          }
        : null,
      image: contentModelInDb.versions[0].image
        ? {
            width: contentModelInDb.versions[0].image.width,
            height: contentModelInDb.versions[0].image.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModelInDb.versions[0].image,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModelInDb.versions[0].image,
            ),
          }
        : null,
      imageNoConnections: contentModelInDb.versions[0].imageNoConnections
        ? {
            width: contentModelInDb.versions[0].imageNoConnections.width,
            height: contentModelInDb.versions[0].imageNoConnections.height,
            src: this.cloudinaryAssetService.generateCloudinaryAssetUrl(
              contentModelInDb.versions[0].imageNoConnections,
            ),
            path: this.cloudinaryAssetService.generateCloudinaryAssetPath(
              contentModelInDb.versions[0].imageNoConnections,
            ),
          }
        : null,
    };
  }
}

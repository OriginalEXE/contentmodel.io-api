import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import catchify from 'catchify';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';

import { ContentModel } from './content-model.model';

interface ContentModelDimensions {
  scale: number;
  position: { x: number; y: number };
  totalContentTypesWidth: number;
  totalContentTypesHeight: number;
}

const DIAGRAM_INITIAL_DRAW_PADDING = 40;

interface GenerateContentModelScreenshotsOptions {
  generateMetaImage: boolean;
  metaImagePublicId: string;
  generateContentModelScreenshots: boolean;
  contentModelImagePublicId;
  contentModelNoConnectionsImagePublicId;
}

@Injectable()
export class ContentModelService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateContentModelScreenshots(
    contentModel: ContentModel,
    options: Partial<GenerateContentModelScreenshotsOptions> = {},
  ): Promise<void> {
    const defaultOptions: GenerateContentModelScreenshotsOptions = {
      generateMetaImage: true,
      generateContentModelScreenshots: true,
      metaImagePublicId: undefined,
      contentModelImagePublicId: undefined,
      contentModelNoConnectionsImagePublicId: undefined,
    };

    const screenshotOptions = {
      ...defaultOptions,
      ...options,
    };

    const [
      contentModelWithVersionError,
      contentModelWithVersion,
    ] = await catchify(
      this.prisma.contentModel.findUnique({
        where: {
          slug: contentModel.slug,
        },
        include: {
          versions: {
            orderBy: {
              version: 'desc' as const,
            },
            take: 1,
          },
        },
      }),
    );

    if (contentModelWithVersionError !== null) {
      console.error(contentModelWithVersionError);
      return;
    }

    const puppeteerRemote = this.configService.get<null | string>(
      'app.puppeteer',
    );
    const frontendUrl = this.configService.get<string>('app.frontendUrl');

    let browser: puppeteer.Browser;

    try {
      browser =
        puppeteerRemote === null
          ? await puppeteer.launch()
          : await puppeteer.connect({
              browserWSEndpoint: puppeteerRemote,
            });

      let page = await browser.newPage();

      const cloudinaryScreenshotsFolderBase = this.configService.get<string>(
        'app.cloudinaryScreenshotsFolderBase',
      );

      // OG Meta screenshot
      if (screenshotOptions.generateMetaImage === true) {
        await page.setViewport({
          width: 1200,
          height: 627,
        });

        await page.goto(
          `${frontendUrl}/content-models/${contentModel.slug}/preview-image`,
        );
        await page.waitForSelector('.is-fully-drawn');
        const ogMetaScreenshotBuffer = await page.screenshot();

        const ogMetaScreenshotUpload = await new Promise<UploadApiResponse>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder:
                    screenshotOptions.metaImagePublicId === undefined
                      ? `${cloudinaryScreenshotsFolderBase}/${contentModel.slug}`
                      : undefined,
                  public_id: screenshotOptions.metaImagePublicId,
                  overwrite: screenshotOptions.metaImagePublicId !== undefined,
                },
                (error, response) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(response);
                },
              )
              .end(ogMetaScreenshotBuffer);
          },
        );

        const [updatedContentModelError] = await catchify(
          this.prisma.contentModel.update({
            where: {
              slug: contentModel.slug,
            },
            data: {
              ogMetaImage: {
                create:
                  screenshotOptions.metaImagePublicId === undefined
                    ? {
                        public_id: ogMetaScreenshotUpload.public_id,
                        version: ogMetaScreenshotUpload.version,
                        signature: ogMetaScreenshotUpload.signature,
                        width: ogMetaScreenshotUpload.width,
                        height: ogMetaScreenshotUpload.height,
                        resource_type: ogMetaScreenshotUpload.resource_type,
                        type: ogMetaScreenshotUpload.type,
                      }
                    : undefined,
                update:
                  screenshotOptions.metaImagePublicId !== undefined
                    ? {
                        public_id: ogMetaScreenshotUpload.public_id,
                        version: ogMetaScreenshotUpload.version,
                        signature: ogMetaScreenshotUpload.signature,
                        width: ogMetaScreenshotUpload.width,
                        height: ogMetaScreenshotUpload.height,
                        resource_type: ogMetaScreenshotUpload.resource_type,
                        type: ogMetaScreenshotUpload.type,
                      }
                    : undefined,
              },
            },
          }),
        );

        if (updatedContentModelError !== null) {
          console.error(updatedContentModelError);
          return;
        }
      }

      // Content model screenshots
      if (screenshotOptions.generateContentModelScreenshots === true) {
        await page.goto(
          `${frontendUrl}/content-models/${contentModel.slug}/embed`,
        );

        // First we calculate the ideal viewport size
        const contentmodelio = await page.waitForFunction(
          () => {
            return typeof (window as any).contentmodelio !== undefined
              ? (window as any).contentmodelio
              : undefined;
          },
          undefined,
          {
            polling: 200,
          },
        );
        const { dimensions } = await contentmodelio.jsonValue<{
          dimensions: ContentModelDimensions;
        }>();

        await page.close();

        page = await browser.newPage();
        page.setViewport({
          width:
            dimensions.totalContentTypesWidth +
            DIAGRAM_INITIAL_DRAW_PADDING * 2,
          height:
            dimensions.totalContentTypesHeight +
            DIAGRAM_INITIAL_DRAW_PADDING * 2,
          deviceScaleFactor: 2,
        });

        // Screenshot with connections
        await page.goto(
          `${frontendUrl}/content-models/${contentModel.slug}/embed?animatedAppearance=0&showControls=0`,
        );
        await page.waitForSelector('.is-fully-drawn');

        const contentModelScreenshotBuffer = await page.screenshot();
        const contentModelScreenshotUpload = await new Promise<UploadApiResponse>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder:
                    screenshotOptions.contentModelImagePublicId === undefined
                      ? `${cloudinaryScreenshotsFolderBase}/${contentModel.slug}`
                      : undefined,
                  public_id: screenshotOptions.contentModelImagePublicId,
                  overwrite:
                    screenshotOptions.contentModelImagePublicId !== undefined,
                },
                (error, response) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(response);
                },
              )
              .end(contentModelScreenshotBuffer);
          },
        );

        // Screenshot without connections
        await page.goto(
          `${frontendUrl}/content-models/${contentModel.slug}/embed?animatedAppearance=0&showControls=0&drawConnections=0`,
        );
        await page.waitForSelector('.is-fully-drawn');

        const contentModelNoConnectionsScreenshotBuffer = await page.screenshot();
        const contentModelNoConnectionsScreenshotUpload = await new Promise<UploadApiResponse>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder:
                    screenshotOptions.contentModelNoConnectionsImagePublicId ===
                    undefined
                      ? `${cloudinaryScreenshotsFolderBase}/${contentModel.slug}`
                      : undefined,
                  public_id:
                    screenshotOptions.contentModelNoConnectionsImagePublicId,
                  overwrite:
                    screenshotOptions.contentModelNoConnectionsImagePublicId !==
                    undefined,
                },
                (error, response) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(response);
                },
              )
              .end(contentModelNoConnectionsScreenshotBuffer);
          },
        );

        await catchify(
          this.prisma.contentModelVersion.update({
            where: {
              id: contentModelWithVersion.versions[0].id,
            },
            data: {
              image: {
                create:
                  screenshotOptions.contentModelImagePublicId === undefined
                    ? {
                        public_id: contentModelScreenshotUpload.public_id,
                        version: contentModelScreenshotUpload.version,
                        signature: contentModelScreenshotUpload.signature,
                        width: contentModelScreenshotUpload.width,
                        height: contentModelScreenshotUpload.height,
                        resource_type:
                          contentModelScreenshotUpload.resource_type,
                        type: contentModelScreenshotUpload.type,
                      }
                    : undefined,
                update:
                  screenshotOptions.contentModelImagePublicId !== undefined
                    ? {
                        public_id: contentModelScreenshotUpload.public_id,
                        version: contentModelScreenshotUpload.version,
                        signature: contentModelScreenshotUpload.signature,
                        width: contentModelScreenshotUpload.width,
                        height: contentModelScreenshotUpload.height,
                        resource_type:
                          contentModelScreenshotUpload.resource_type,
                        type: contentModelScreenshotUpload.type,
                      }
                    : undefined,
              },
              imageNoConnections: {
                create:
                  screenshotOptions.contentModelNoConnectionsImagePublicId ===
                  undefined
                    ? {
                        public_id:
                          contentModelNoConnectionsScreenshotUpload.public_id,
                        version:
                          contentModelNoConnectionsScreenshotUpload.version,
                        signature:
                          contentModelNoConnectionsScreenshotUpload.signature,
                        width: contentModelNoConnectionsScreenshotUpload.width,
                        height:
                          contentModelNoConnectionsScreenshotUpload.height,
                        resource_type:
                          contentModelNoConnectionsScreenshotUpload.resource_type,
                        type: contentModelNoConnectionsScreenshotUpload.type,
                      }
                    : undefined,
                update:
                  screenshotOptions.contentModelNoConnectionsImagePublicId !==
                  undefined
                    ? {
                        public_id:
                          contentModelNoConnectionsScreenshotUpload.public_id,
                        version:
                          contentModelNoConnectionsScreenshotUpload.version,
                        signature:
                          contentModelNoConnectionsScreenshotUpload.signature,
                        width: contentModelNoConnectionsScreenshotUpload.width,
                        height:
                          contentModelNoConnectionsScreenshotUpload.height,
                        resource_type:
                          contentModelNoConnectionsScreenshotUpload.resource_type,
                        type: contentModelNoConnectionsScreenshotUpload.type,
                      }
                    : undefined,
              },
            },
          }),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      browser.close();
    }

    return;
  }
}

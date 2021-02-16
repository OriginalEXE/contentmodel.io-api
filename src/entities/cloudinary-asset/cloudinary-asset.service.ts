import { Injectable } from '@nestjs/common';
import { ImageTransformationOptions, v2 as cloudinary } from 'cloudinary';

import { CloudinaryAsset } from './cloudinary-asset.model';

@Injectable()
export class CloudinaryAssetService {
  generateCloudinaryAssetUrl(
    asset: CloudinaryAsset,
    transformations: ImageTransformationOptions = {},
  ): string {
    return cloudinary.url(asset.public_id, {
      version: asset.version,
      resource_type: asset.resource_type,
      sign_url: false,
      ...transformations,
    });
  }

  generateCloudinaryAssetPath(
    asset: CloudinaryAsset,
    transformations: ImageTransformationOptions = {},
  ): string {
    const url = new URL(
      cloudinary.url(asset.public_id, {
        version: asset.version,
        resource_type: asset.resource_type,
        sign_url: false,
        ...transformations,
      }),
    );

    return url.pathname.split('image/upload/')[1];
  }
}

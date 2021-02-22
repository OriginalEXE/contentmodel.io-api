import { registerAs } from '@nestjs/config';
import { nanoid } from 'nanoid';

export default registerAs('app', () => ({
  port: process.env.PORT ?? 5000,
  host: process.env.HOST ?? 'localhost',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  playwright: process.env.REMOTE_PLAYWRIGHT ?? null,
  puppeteer: process.env.REMOTE_PUPPETEER ?? null,
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? null,
  cloudinaryScreenshotsFolderBase:
    process.env.NODE_ENV === 'production'
      ? 'app/public/production'
      : 'app/public/staging',
  privateContentModelScreenshotSecret:
    process.env.PRIVATE_CONTENT_MODEL_SCREENSHOT_SECRET ?? nanoid,
}));

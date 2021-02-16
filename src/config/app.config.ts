import { registerAs } from '@nestjs/config';

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
}));

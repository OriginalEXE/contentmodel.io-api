-- AlterTable
ALTER TABLE "ContentModel" ADD COLUMN     "ogMetaImage" TEXT;

-- AlterTable
ALTER TABLE "ContentModelVersion" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "imageNoConnectionsUrl" TEXT;

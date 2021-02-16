/*
  Warnings:

  - You are about to drop the column `ogMetaImage` on the `ContentModel` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ContentModelVersion` table. All the data in the column will be lost.
  - You are about to drop the column `imageNoConnectionsUrl` on the `ContentModelVersion` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[imageId]` on the table `ContentModelVersion`. If there are existing duplicate values, the migration will fail.
  - The migration will add a unique constraint covering the columns `[imageNoConnectionsId]` on the table `ContentModelVersion`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "ContentModel" DROP COLUMN "ogMetaImage",
ADD COLUMN     "ogMetaImageId" TEXT;

-- AlterTable
ALTER TABLE "ContentModelVersion" DROP COLUMN "imageUrl",
DROP COLUMN "imageNoConnectionsUrl",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageNoConnectionsId" TEXT;

-- CreateTable
CREATE TABLE "CloudinaryAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "public_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "resource_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentModelVersion_imageId_unique" ON "ContentModelVersion"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentModelVersion_imageNoConnectionsId_unique" ON "ContentModelVersion"("imageNoConnectionsId");

-- AddForeignKey
ALTER TABLE "ContentModel" ADD FOREIGN KEY ("ogMetaImageId") REFERENCES "CloudinaryAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModelVersion" ADD FOREIGN KEY ("imageId") REFERENCES "CloudinaryAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModelVersion" ADD FOREIGN KEY ("imageNoConnectionsId") REFERENCES "CloudinaryAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

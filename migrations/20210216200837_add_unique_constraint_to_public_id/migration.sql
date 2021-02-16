/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[public_id]` on the table `CloudinaryAsset`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CloudinaryAsset.public_id_unique" ON "CloudinaryAsset"("public_id");

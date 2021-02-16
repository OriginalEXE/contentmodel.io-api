/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[slug]` on the table `ContentModel`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ContentModel.slug_unique" ON "ContentModel"("slug");

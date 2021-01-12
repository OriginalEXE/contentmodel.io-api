/*
  Warnings:

  - Made the column `userId` on table `ContentModel` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContentModel" ALTER COLUMN "userId" SET NOT NULL;

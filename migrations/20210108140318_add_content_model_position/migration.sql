/*
  Warnings:

  - Added the required column `position` to the `ContentModelVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContentModelVersion" ADD COLUMN     "position" JSONB NOT NULL;

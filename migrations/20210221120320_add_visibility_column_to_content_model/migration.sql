-- CreateEnum
CREATE TYPE "ContentModelVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- AlterTable
ALTER TABLE "ContentModel" ADD COLUMN     "visibility" "ContentModelVisibility" NOT NULL DEFAULT E'PUBLIC';

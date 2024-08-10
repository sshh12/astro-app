-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "astrometryJobId" INT8;
ALTER TABLE "Image" ADD COLUMN     "astrometryObjectsInField" STRING[];

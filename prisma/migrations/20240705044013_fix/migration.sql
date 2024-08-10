/*
  Warnings:

  - You are about to drop the column `astrometryObjectsInField` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "astrometryObjectsInField";
ALTER TABLE "Image" ADD COLUMN     "objsInField" STRING;

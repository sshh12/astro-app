/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SpaceObject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timezone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "commonTemplate" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lat" DECIMAL(65,30);
ALTER TABLE "User" ADD COLUMN     "lon" DECIMAL(65,30);
ALTER TABLE "User" ADD COLUMN     "timezone" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SpaceObject_name_key" ON "SpaceObject"("name");

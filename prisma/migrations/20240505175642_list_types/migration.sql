/*
  Warnings:

  - You are about to drop the column `commonTemplate` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `elevation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('PERSONAL_COLLECTION', 'CURATED_LIST', 'CONSTELLATION_GROUP');

-- AlterTable
ALTER TABLE "List" DROP COLUMN "commonTemplate";
ALTER TABLE "List" ADD COLUMN     "type" "ListType" NOT NULL DEFAULT 'PERSONAL_COLLECTION';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "elevation";
ALTER TABLE "User" DROP COLUMN "lat";
ALTER TABLE "User" DROP COLUMN "lon";
ALTER TABLE "User" DROP COLUMN "timezone";

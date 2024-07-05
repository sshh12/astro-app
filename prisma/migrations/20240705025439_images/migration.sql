-- CreateEnum
CREATE TYPE "AstrometryStatus" AS ENUM ('PENDING', 'DONE', 'ERROR');

-- CreateTable
CREATE TABLE "Image" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "astrometrySid" INT8 NOT NULL,
    "astrometryStatus" "AstrometryStatus" NOT NULL,
    "ra" DECIMAL(65,30),
    "dec" DECIMAL(65,30),
    "widthArcSec" DECIMAL(65,30),
    "heightArcSec" DECIMAL(65,30),
    "radius" DECIMAL(65,30),
    "pixelScale" DECIMAL(65,30),
    "orientation" DECIMAL(65,30),
    "parity" DECIMAL(65,30),
    "mainImageId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INT8,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

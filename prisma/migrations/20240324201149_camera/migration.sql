-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('VISUAL', 'CAMERA', 'BINOCULARS');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "type" "EquipmentType" NOT NULL,
    "active" BOOL NOT NULL DEFAULT false,
    "teleFocalLength" DECIMAL(65,30),
    "teleAperture" DECIMAL(65,30),
    "camWidth" INT4,
    "camHeight" INT4,
    "camPixelWidth" DECIMAL(65,30),
    "camPixelHeight" DECIMAL(65,30),
    "barlow" DECIMAL(65,30),
    "binning" INT4,
    "eyeFocalLength" DECIMAL(65,30),
    "eyeFOV" DECIMAL(65,30),
    "binoAperture" DECIMAL(65,30),
    "binoMagnification" DECIMAL(65,30),
    "binoActualFOV" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INT8,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

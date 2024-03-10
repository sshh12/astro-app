-- AlterEnum
ALTER TYPE "SpaceObjectType" ADD VALUE 'COMET';

-- AlterTable
ALTER TABLE "SpaceObject" ADD COLUMN     "cometKey" STRING;
ALTER TABLE "SpaceObject" ADD COLUMN     "fluxV" DECIMAL(65,30);
ALTER TABLE "SpaceObject" ADD COLUMN     "sizeAngle" DECIMAL(65,30);
ALTER TABLE "SpaceObject" ADD COLUMN     "sizeMajor" DECIMAL(65,30);
ALTER TABLE "SpaceObject" ADD COLUMN     "sizeMinor" DECIMAL(65,30);

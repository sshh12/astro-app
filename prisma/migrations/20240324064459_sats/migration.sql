-- AlterEnum
ALTER TYPE "SpaceObjectType" ADD VALUE 'EARTH_SATELLITE';

-- AlterTable
ALTER TABLE "SpaceObject" ADD COLUMN     "celestrakKey" STRING;

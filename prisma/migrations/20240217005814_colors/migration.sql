-- CreateEnum
CREATE TYPE "Color" AS ENUM ('SLATE', 'GRAY', 'ZINC', 'NEUTRAL', 'STONE', 'RED', 'ORANGE', 'AMBER', 'YELLOW', 'LIME', 'GREEN', 'EMERALD', 'TEAL', 'CYAN', 'SKY', 'BLUE', 'INDIGO', 'VIOLET', 'PURPLE', 'FUCHSIA', 'PINK', 'ROSE');

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "color" "Color" NOT NULL DEFAULT 'SLATE';

-- AlterTable
ALTER TABLE "SpaceObject" ADD COLUMN     "color" "Color" NOT NULL DEFAULT 'SLATE';
ALTER TABLE "SpaceObject" ADD COLUMN     "simbadName" STRING;

-- AlterTable
ALTER TABLE "SpaceObjectsOnUsers" ADD COLUMN     "color" "Color" NOT NULL DEFAULT 'SLATE';

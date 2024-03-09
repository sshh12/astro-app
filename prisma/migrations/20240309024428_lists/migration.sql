-- AlterTable
ALTER TABLE "List" ADD COLUMN     "credit" STRING;
ALTER TABLE "List" ADD COLUMN     "imgURL" STRING;
ALTER TABLE "List" ADD COLUMN     "publicTemplate" BOOL NOT NULL DEFAULT false;

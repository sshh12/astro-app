-- CreateEnum
CREATE TYPE "SpaceObjectType" AS ENUM ('SOLAR_SYSTEM_OBJECT', 'STAR_OBJECT');

-- CreateTable
CREATE TABLE "User" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "name" STRING NOT NULL,
    "apiKey" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceObject" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "name" STRING NOT NULL,
    "searchKey" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ra" DECIMAL(65,30),
    "dec" DECIMAL(65,30),
    "solarSystemKey" STRING,
    "type" "SpaceObjectType" NOT NULL,

    CONSTRAINT "SpaceObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "title" STRING NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListsOnUsers" (
    "listId" INT8 NOT NULL,
    "userId" INT8 NOT NULL,
    "canEdit" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "ListsOnUsers_pkey" PRIMARY KEY ("listId","userId")
);

-- CreateTable
CREATE TABLE "SpaceObjectsOnLists" (
    "listId" INT8 NOT NULL,
    "spaceObjectId" INT8 NOT NULL,

    CONSTRAINT "SpaceObjectsOnLists_pkey" PRIMARY KEY ("listId","spaceObjectId")
);

-- CreateTable
CREATE TABLE "SpaceObjectsOnUsers" (
    "userId" INT8 NOT NULL,
    "spaceObjectId" INT8 NOT NULL,
    "nickname" STRING,

    CONSTRAINT "SpaceObjectsOnUsers_pkey" PRIMARY KEY ("userId","spaceObjectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "ListsOnUsers" ADD CONSTRAINT "ListsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListsOnUsers" ADD CONSTRAINT "ListsOnUsers_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceObjectsOnLists" ADD CONSTRAINT "SpaceObjectsOnLists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceObjectsOnLists" ADD CONSTRAINT "SpaceObjectsOnLists_spaceObjectId_fkey" FOREIGN KEY ("spaceObjectId") REFERENCES "SpaceObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceObjectsOnUsers" ADD CONSTRAINT "SpaceObjectsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceObjectsOnUsers" ADD CONSTRAINT "SpaceObjectsOnUsers_spaceObjectId_fkey" FOREIGN KEY ("spaceObjectId") REFERENCES "SpaceObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

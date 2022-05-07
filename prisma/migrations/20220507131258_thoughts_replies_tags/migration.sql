-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blacklisted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "triggerWarning" BOOLEAN NOT NULL DEFAULT false,
    "repliedToId" INTEGER,

    CONSTRAINT "thoughts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToThought" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToThought_AB_unique" ON "_TagToThought"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToThought_B_index" ON "_TagToThought"("B");

-- AddForeignKey
ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_repliedToId_fkey" FOREIGN KEY ("repliedToId") REFERENCES "thoughts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToThought" ADD CONSTRAINT "_TagToThought_A_fkey" FOREIGN KEY ("A") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToThought" ADD CONSTRAINT "_TagToThought_B_fkey" FOREIGN KEY ("B") REFERENCES "thoughts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

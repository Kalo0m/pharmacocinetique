/*
  Warnings:

  - A unique constraint covering the columns `[questionAskedId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "questionAskedId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionAskedId_key" ON "Answer"("questionAskedId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionAskedId_fkey" FOREIGN KEY ("questionAskedId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `DocumentSnapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `DocumentSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DocumentSnapshot_roomId_createdAt_idx";

-- AlterTable
ALTER TABLE "DocumentSnapshot" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSnapshot_roomId_key" ON "DocumentSnapshot"("roomId");

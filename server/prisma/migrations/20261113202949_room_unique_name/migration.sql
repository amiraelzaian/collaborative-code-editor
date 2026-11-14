/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room_workspaceId_name_key" ON "Room"("workspaceId", "name");

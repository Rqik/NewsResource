/*
  Warnings:

  - A unique constraint covering the columns `[fk_user_id]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "authors_fk_user_id_key" ON "authors"("fk_user_id");

/*
  Warnings:

  - A unique constraint covering the columns `[fk_user_id]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tokens_fk_user_id_key" ON "tokens"("fk_user_id");

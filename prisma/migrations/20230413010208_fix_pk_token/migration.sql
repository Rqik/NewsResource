/*
  Warnings:

  - Made the column `fk_user_id` on table `tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "fk_tokens_user_id";

-- AlterTable
ALTER TABLE "tokens" RENAME CONSTRAINT "pk_pk_refresh_token" TO "pk_refresh_token";
ALTER TABLE "tokens" ALTER COLUMN "fk_user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "fk_tokens_user_id" FOREIGN KEY ("fk_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

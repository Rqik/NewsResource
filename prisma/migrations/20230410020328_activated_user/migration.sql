/*
  Warnings:

  - You are about to drop the column `is_publicate` on the `posts` table. All the data in the column will be lost.
  - Made the column `activate_link` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "is_publicate";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "activate_link" SET NOT NULL;

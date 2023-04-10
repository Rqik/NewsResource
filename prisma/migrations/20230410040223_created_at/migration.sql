/*
  Warnings:

  - Made the column `created_at` on table `comments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `drafts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "drafts" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;

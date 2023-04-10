/*
  Warnings:

  - Made the column `body` on table `comments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "body" SET NOT NULL;
